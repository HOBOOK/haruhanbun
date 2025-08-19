<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card width="100%" height="240" color="#70707010">
          <v-row align="center" justify="start" class="fill-height pa-8">
            <h1 class="mx-3">{{ $store.state.auth?.user?.name }}</h1>
            {{ userPoint?.totalPoint }}
            <v-btn rounded x-large @click="recordPoint" color="indigo" class="white--text text-h5">Check!</v-btn>
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
              { text: '점수', value: 'point', sortable: false },
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
              <v-pagination  v-model="page" :length="totalPages" @input="onPageChange" />
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
              { text: '누적점수', value: 'point', sortable: false },
              { text: '이전점수', value: 'prevPoint', sortable: false },
              { text: '기록점수', value: 'savePoint', sortable: false },
              { text: '기록일', value: 'createdAt', sortable: false },
            ]" :items="userPointHistory" dense :items-per-page="-1" :mobile-breakpoint="0" :loading="loading"
              class="elevation-1" hide-default-footer>
              <template v-slot:item.savePoint="{item}">
                +
                {{ item.savePoint }}

              </template>

              <template v-slot:item.createdAt="{item}">
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
      userPoint: null
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

    console.log(this.$store.state.auth)

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
    init() {
      if (this.$store.state.auth?.user) {
        this.$axios.get('/point/users/' + this.$store.state.auth.user._id).then(res => {

          const { point, history } = res?.data
          this.userPointHistory = history || []
          this.userPoint = point
        })
      } else {
        this.userPointHistory = []
      }

    },

    onPageChange(p) {
      this.$router.push({ query: { ...this.$route.query, page: p, limit: this.limit } });
    },

    async recordPoint() {
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
    }
  }

};
</script>

<style lang="scss"></style>
