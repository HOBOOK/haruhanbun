<template>
  <div>로그인 처리 중...</div>
</template>

<script>

export default {
  async mounted() {
    const hash = window.location.hash.substr(1)

    const params = new URLSearchParams(hash)
    const idToken = params.get('id_token')

    if (!idToken) {
      console.error('ID 토큰 없음')
      return
    }

    try {
      const response = await this.$axios.post('/auth/google', { idToken })

      const { token, refreshToken, user } = response.data

      localStorage.setItem('accessToken', token)
      this.$store.commit('auth/setUser', user)
      this.$store.commit('auth/setAccessToken', token)

      this.$router.push('/')
    } catch (e) {
      console.error('백엔드 로그인 실패', e)
      this.$router.push('/')
    }
  }
}
</script>
