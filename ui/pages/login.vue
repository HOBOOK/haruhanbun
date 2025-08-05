<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="5" class="text-center">
        <!-- 제목 -->
        <div class="text-h5 font-weight-bold mb-2">쉽게 가입하고</div>
        <div class="text-h5 font-weight-bold mb-4">간편하게 로그인하세요.</div>
        <div class="text-subtitle-2 mb-6 grey--text">하루에 한번</div>


        <!-- 소셜 버튼 -->
        <div style="min-height:400px;">


          <v-btn class="mb-16" block height="50" @click="loginWith('google')">
            <img src="/icons/google.png" alt="google" width="18" height="18" class="mr-2" />
              구글 계정으로 계속하기
          </v-btn>
        </div>


      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  methods: {
    async loginWith(provider) {

      switch (provider) {
        case 'google': {
          try {
            const clientId = '882327378871-mcf2sdkt29cm1sb68ipkgo9mt4l8iovd.apps.googleusercontent.com'
            const redirectUri = 'http://localhost:3000/auth/google'
            const scope = 'openid profile email'
            const responseType = 'token id_token'
             const nonce = Math.random().toString(36).substring(2) 
            const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&nonce=${nonce}&prompt=select_account`

            window.location.href = url
          } catch (e) {
            console.error('Google Login Failed:', e)
          }
          break
        }
      }
    },
  }
}
</script>

<style scoped></style>
