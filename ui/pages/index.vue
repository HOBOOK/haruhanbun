<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card width="100%" height="240" color="#70707010">
          <v-row align="center" justify="start" no-gutters>
            <h1 class="mx-3">{{ $store.state.auth?.user?.name }}</h1>
            {{ userPoint?.totalPoint }}
            <v-btn rounded x-large @click="recordPoint" color="indigo" class="white--text text-h5">Check!</v-btn>
          </v-row>

          <v-row no-gutters align="center" justify="center">
            <Heatmap :data="heatmapData"></Heatmap>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card width="100%" height="420" color="transparent">
          <v-card>
            <v-row no-gutters align="center" class="pa-6 text-h6">
              랭킹
            </v-row>


            <v-data-table :headers="[
              { text: '순위', value: 'rank', sortable: false },
              { text: '이름', value: 'name', sortable: false },
              { text: '점수', value: 'point', sortable: false, align: 'right' },
              { text: '아바타', value: 'avatarUrl', sortable: false },
            ]" :items="users" :items-per-page="50" :mobile-breakpoint="0" :loading="loading" class="elevation-1"
              hide-default-footer dense>
              <template #item.avatarUrl="{ item }">
                <v-avatar size="32">
                  <img :src="item.avatarUrl" alt="avatar" v-if="item.avatarUrl">
                </v-avatar>
              </template>
            </v-data-table>

            <v-card-actions class="justify-center" v-if="totalPages > 1">
              <v-pagination v-model="page" :length="totalPages" @input="onPageChange" />
            </v-card-actions>


            <v-divider />

          </v-card>
        </v-card>

      </v-col>
      <v-col cols="6">
        <v-card width="100%" height="420" color="transparent">
          <v-card>
            <v-row no-gutters align="center" class="pa-6 text-h6">
              내 포인트
            </v-row>

            <v-data-table :headers="[
              { text: '기록점수', value: 'point', sortable: false, align: 'right' },
              { text: '누적점수', value: 'savePoint', sortable: false, align: 'right' },
              { text: '기록일', value: 'createdAt', sortable: false, width:160 },
            ]" :sort-desc="true" sort-by="createdAt" :items="userPointHistory" dense :items-per-page="-1" :mobile-breakpoint="0" :loading="loading"
              class="elevation-1" hide-default-footer>

              <template v-slot:item.point="{ item }">
                +
                {{ item.point }}

              </template>

              <template v-slot:item.savePoint="{item}">
                {{ item.savePoint?.toFixed(2) }}
              </template> 

              <template v-slot:item.createdAt="{ item }">
                {{ $time.formatKoreanDate(item.createdAt) }}

              </template>
            </v-data-table>


          </v-card>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Multipane, MultipaneResizer } from "vue-multipane";

export default {
  components: {

    Multipane,
    MultipaneResizer,

  },
  watch: {
    '$route.query': {
      immediate: false,
      handler() { this.loading = true; }
    },

  },
  data() {
    return {
      isRecordLoading: false,
      userPointHistory: [],
      userPoint: null,
      heatmapData: [],
      loadingHeatmap: false
    };
  },

  async asyncData({ $axios, query, error, $socket, store }) {

    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const page = Math.max(parseInt(query.page, 10) || 1, 1);

    try {
      const data = await $axios.$get('/rank', { params: { limit, page } });
      return {
        users: data.users,
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        limit,
        loading: false,

      };
    } catch (e) {
      error({ statusCode: 500, message: '사용자 목록을 불러오지 못했습니다.' });
    }
  },

  mounted() {
    this.users = this.users.map((u, i) => ({
      ...u,
      rank: (this.page - 1) * this.limit + (i + 1)
    }));

    if (this.$store.state.auth?.user) {
      this.init()
    } else {
      // 로그인 감지
      this.$watch(
        () => this.$store.state.auth.user,
        (user) => {
          if (user) {
            this.init()
          }
        }
      )
    }



    this.loading = false;

  },


  methods: {
    async init() {
      if (this.$store.state.auth?.user) {
        await this.$axios.get('/point/users/' + this.$store.state.auth.user._id).then(res => {

          const { point, history } = res?.data
          this.userPointHistory = history || []
          this.userPoint = point
        })

        this.loadingHeatmap = true
        await this.$axios.get('/point/users/' + this.$store.state.auth.user._id + '/year').then(res => {

          const rawHistory = res?.data || []

          const year = new Date().getFullYear()
          const dates = this.getYearDates(year)

          rawHistory.forEach(h => {
            const key = `${h._id.year}-${String(h._id.month).padStart(2, "0")}-${String(h._id.day).padStart(2, "0")}`
            const target = dates.find(d => d.date === key)
            if (target) {
              target.value = h.count
            }
          })

          this.heatmapData = dates
        })

        this.loadingHeatmap = false




      } else {
        this.userPointHistory = []
      }

    },

    onPageChange(p) {
      this.$router.push({ query: { ...this.$route.query, page: p, limit: this.limit } });
    },

    async recordPoint() {
      if(!this.$store.auth || !this.$store.auth?.user) {
        this.$router.push('/login')
        return
      }

      if (this.isRecordLoading) return



      this.isRecordLoading = true

      let message = ''

      const response = await this.$axios.post('/point').catch(err => {
        const responseStatus = err?.response?.status || 500

        if (responseStatus == '429') {
          message = err.response?.data?.message || '알 수 없는 오류'
        } else if (responseStatus == '500') {
          message = '알 수 없는 오류'
        }
      })
      if (response?.data) {
        message = '성공'
      }

      if (message) {
        alert(message)
      }
      this.isRecordLoading = false
    },

    getYearDates(year) {
      const dates = [];

      // 1월 1일
      let jan1 = new Date(year, 0, 1);

      // 👉 해당 주의 월요일로 back
      let day = jan1.getDay();      // 0=일, 1=월, ...
      let diff = (day + 6) % 7;     // 월요일 기준
      let current = new Date(jan1);
      current.setDate(jan1.getDate() - diff); // e.g. 2024-12-30

      // 👉 끝 = 다음 해 1월 1일 직후의 일요일까지 forward
      let end = new Date(year + 1, 0, 1);
      let endDay = end.getDay();
      let forward = (7 - ((endDay + 6) % 7)) % 7;
      end.setDate(end.getDate() + forward); // e.g. 2026-01-04 (일요일)

      while (current <= end) {
        dates.push({
          date: current.toISOString().slice(0, 10),
          value: 0,   // 기본값 0으로 채움
        });
        current.setDate(current.getDate() + 1);
      }

      return dates;
    }


  }

};
</script>

<style lang="scss"></style>
