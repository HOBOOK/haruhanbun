<template>
  <v-container >
      <v-row>
        <v-col cols="12">
          <v-card width="100%" height="240" color="#70707010">
            <v-row align="center" justify="center" class="fill-height pa-8">
              <v-spacer/>
                <h1 class="mx-3">20 Days</h1>
                <v-btn rounded x-large @click="" color="indigo" class="white--text text-h5">Check!</v-btn>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="6">
          <v-card width="100%" height="420" color="transparent">
            <v-card>
              <v-row no-gutters align="center" class="pa-6 text-h6">
                랭킹
              </v-row>    
              
              
      <v-data-table
        :headers="[
        { text: '순위', value: 'rank', sortable: false },
        { text: '이름', value: 'name' },
        { text: 'Point', value: 'point' },
        { text: '아바타', value: 'avatarUrl', sortable: false },
      ]"
        :items="users"
        :items-per-page="limit"
        :loading="loading"
        class="elevation-1"
        hide-default-footer
      >
        <template #item.avatarUrl="{ item }">
          <v-avatar size="32">
            <img :src="item.avatarUrl" alt="avatar" v-if="item.avatarUrl">
          </v-avatar>
        </template>
      </v-data-table>

      <v-divider />

      <v-card-actions class="justify-center">
        <v-pagination
          v-model="page"
          :length="totalPages"
          @input="onPageChange"
        />
      </v-card-actions>

            </v-card>
          </v-card>

        </v-col>
        <v-col cols="6">
          <v-card width="100%" height="420" color="transparent">
            <v-card>
              <v-row no-gutters align="center" class="pa-6 text-h6">
                내 포인트
              </v-row>              

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
    // 쿼리 변경 시 클라이언트 내비게이션에서도 SSR 재호출됨
    '$route.query': {
      immediate: false,
      handler() { this.loading = true; }
    }
  },
  data() {
    return {

    };
  },

  async asyncData({ $axios, query, error, $socket }) {
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const page  = Math.max(parseInt(query.page, 10) || 1, 1);

    try {
      const data = await $axios.$get('/rank', { params: { limit, page } });
      return {
        users: data.users,
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
        limit,
        loading: false
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
    this.loading = false;

  },


  methods: {
    onPageChange(p) {
      this.$router.push({ query: { ...this.$route.query, page: p, limit: this.limit } });
    }
  }

};
</script>

<style lang="scss"></style>
