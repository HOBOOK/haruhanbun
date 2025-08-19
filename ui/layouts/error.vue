<template>
  <div class="error-container">
    <div class="error-panel">
      <h1 class="error-code">{{ error.statusCode }}</h1>

      <div class="error-message">
        <span class="text opacity-7">
          {{ error.statusCode === 404 ? $t('error_404') : $t('error_default') }}
        </span>
      </div>

      <div class="error-home">

        <v-btn class="mx-1" @click="$router.go(-1)" outlined :max-width="120" :width="120" :height="42">
          {{ $t('error_prev') }}
        </v-btn>

        <v-btn class="mx-1" @click="$router.push('/')" color="primary" :max-width="120" :width="120" :height="42">
          <v-icon class="mr-1" small>mdi-home-roof</v-icon>
          {{ $t('error_home') }}
        </v-btn>
      </div>
    </div>

    <svg width="0" height="0" viewBox="0 0 400 300">
      <defs>
        <mask id="mask">
          <rect fill="#000000" x="0" y="0" width="400" height="300"></rect>
          <circle fill="#FFFFFF" cx="150" cy="150" r="100" />
          <circle fill="#FFFFFF" cx="50" cy="50" r="150" />
        </mask>
      </defs>
    </svg>

  </div>
</template>

<script>
export default {
  props: ['error'],
  layout: 'errorLayout'
}
</script>

<style lang="scss">

.error-container {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: url("/background.jpg") no-repeat center center fixed;
  background-size: cover;
  position: relative;
  z-index: 0;

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    inset: 0;
    background: linear-gradient(145deg,
        rgba(0, 0, 0, 0.7),
        rgba(10, 10, 20, 0.5));
    backdrop-filter: blur(10px) saturate(120%);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    z-index: -1;
  }

  .error-panel {
    padding: 0 24px 24px 24px;
    text-align: center;
    z-index: 10;
  }

  .error-code {
    font-size: 96px !important;
    font-family: Pretendard-Bold !important;
    margin: 0;
    padding: 0;
    color: transparent;
  }

  .error-message {
    font-size: 18px;
    align-items: center;
    display: flex;
    justify-content: center;

    .text {
      margin: 0 3px;

    }
  }

  .error-home {
    text-align: center;
    margin-top: 32px;
    font-size: 20px;

    >.v-btn {
      width: 120px !important;
    }
  }
}
</style>