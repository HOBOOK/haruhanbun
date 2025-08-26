<template>
  <v-app class="default-layout-container">

    <v-app-bar fixed color="transparent" :clipped-left="true" clipped-right app :height="60">
      <v-container>
        <v-row no-gutters align="center">
          <div class="pointer" @click="$router.push('/')">
            <img src="/logo-light.png" width="64" contain />
          </div>
          <v-spacer/>

          <client-only>
            <div  v-if="isLoggedIn">
              <v-row no-gutters align="center">
                  <v-btn class="mx-2" text @click="logout">로그아웃</v-btn>

                <v-avatar :size="26" class="mr-2">
                  <img :src="$store.state.auth.user.picture" width="32" contain/>
                </v-avatar>
                {{ $store.state.auth.user.name }}
              </v-row>
            </div>

            <v-btn v-else text to="/login">로그인</v-btn>
          </client-only>

        </v-row>
      </v-container>

    </v-app-bar>

    <v-navigation-drawer app v-if="drawer" clipped background-color="transparent" :width="240">
      <v-list dense color="transparent" nav>
        <v-list-item style="height:120px !important;" v-for="item, index in navMenuList" :key="index" link
          :to="item.router" @click="drawer = false" class="mb-6">
          <v-col cols="12">
            <v-icon large color="grey">{{ item.icon }}</v-icon>
            <div style="font-size:21px !important;" class="mt-3">{{ item.title }}</div>
          </v-col>

        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <vue-snotify></vue-snotify>
        <Nuxt :style="`max-height: calc(100vh - ${60}px); overflow-y: auto; height: calc(100vh - ${60}px);`" />
      </v-container>
    </v-main>
    <GoogleAd />

  </v-app>
</template>

<script>

const packageJson = require("~/package.json");

export default {

  components: {
  },

  computed: {
    isLoggedIn() {
      return this.$store.state.auth.user !== null
    }
  },
  data() {
    return {
      drawer: false,
      user: {},
      navMenuList: [
        {
          title: "스테이션 모니터링",
          router: "/",
          header: '스테이션 모니터링',
          icon: "mdi-monitor-dashboard",
          roles: []
        },
        {
          title: "요청 알림",
          router: "/request",
          header: '실시간 투입/배출 요청',
          icon: "mdi-whistle-outline",
          roles: []
        },
      ],
      secondInterval: null,
      currentTime: Date.now(),
    };
  },
  methods: {
    logout() {
      this.$store.commit('auth/logout')
      this.$router.replace('/')
       window.location.reload()
    }
  },

  created() {
   
  },
  mounted() {
      const token = localStorage.getItem('accessToken')

      if (token) {
        this.$axios.setToken(token, 'Bearer');
      } else {
        this.$store.commit('auth/setAccessToken', null)
      }

      if (token && !this.$store.state.auth.user) {
        this.$axios
          .$get('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(user => {
            this.$store.commit('auth/setUser', user)
            this.$store.commit('auth/setAccessToken', token)
          })
          .catch(() => {
            this.$store.commit('auth/logout')
          })
      }
  },

  watch: {
    async $route(to, from) {
      window.scrollTo(0, 0);
    },

  },

  beforeDestroy() {
  },
};
</script>

<style lang="scss">
.default-layout-container {
  overflow-x: hidden;
  overflow-y: hidden;

  .v-app-bar {
    transition-property: transform, left, right, box-shadow, max-width, width !important;
    min-width: 320px;
    border-bottom: 1px solid $default-border-color !important;

    .nav-menu-item {
      opacity: 0.6;
      cursor: pointer;
      padding: 0 18px;
      position: relative;

      &.selected {
        opacity: 1;
        text-shadow: 0px 0px 32px #1e88e580, 0px 0px 12px #ffffff30 !important;
        font-weight: bold !important;
      }

      &:not(.selected) {
        &:hover {
          opacity: 1;
          // text-shadow: 0px 0px 24px #ffffffa0, 0px 0px 8px #ffffff30;
        }
      }
    }

    &.theme--dark {
      background-color: $dark-primary-header-color !important;
      // box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15) !important;
    }

    &.transparent {
      background-color: transparent !important;
      background: transparent !important;
      border-bottom: 1px solid transparent !important;
    }
  }

  .v-navigation-drawer {
    font-family: "Pretendard-Medium", sans-serif !important;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    overflow-x: hidden;

    i {
      transition: none !important;
    }

    &.v-navigation-drawer--right {
      border-left: 1px solid $default-border-color !important;
    }

    .v-navigation-drawer__border {
      display: none;
    }

    &.theme--dark {
      background-color: transparent !important;

      .v-navigation-drawer__append {
        position: relative;

        &::after {
          pointer-events: none;
          content: "";
          position: absolute;
          width: 100%;
          height: 30%;
          top: -30%;
          z-index: 10;
        }
      }
    }

    &.theme--light {
      .v-navigation-drawer__append {
        position: relative;

        &::after {
          pointer-events: none;
          content: "";
          position: absolute;
          width: 100%;
          height: 30%;
          top: -30%;
          z-index: 10;
        }
      }
    }

    .v-list {
      width: 100%;
      padding-top: 6px !important;
      padding-bottom: 6px !important;
      overflow-y: auto !important;
      animation-name: fade;
      animation-duration: 0.3s;
      animation-iteration-count: 1;
      animation-direction: alternate;
      animation-fill-mode: forwards;

      &.v-list--nav {
        padding: 4px 8px;
      }

      &.hide {
        left: -100%;
        animation-name: fade;
        animation-duration: 0.3s;
        animation-iteration-count: 1;
        animation-direction: alternate;
        animation-fill-mode: forwards;
      }
    }

    .v-list-item {
      padding: 0px 10px;
      justify-content: start !important;
      opacity: 0.9;
      transition: none !important;

      .v-ripple__container {
        display: none !important;
      }

      .v-list-item__icon {
        margin-left: 4px !important;

      }

      .v-list-item__title {
        letter-spacing: -0.03px !important;
      }

      &.active {
        opacity: 1;
        position: relative;

        * {
          transition: none !important;
        }

        &::after {
          content: "";
          position: absolute;
          top: calc(50% - 10px);
          left: 0;
          width: 3.5px;
          height: 20px;
          min-height: 20px !important;
          background-color: #1e88e5;
          color: #1e88e5;
          border-radius: 3px;
        }

        &.theme--dark {
          background-color: #1e88e550 !important;

          * {
            color: white;
          }

          .v-icon {
            color: white !important;
          }
        }

        &.theme--light {
          background-color: #f5f6f9 !important;

          * {
            color: #1e88e5 !important;
          }

          .v-icon {
            color: #1e88e5 !important;
          }
        }
      }

      &:hover {
        opacity: 1;

      }
    }
  }

  .system-title {
    font-family: Pretendard-SemiBold !important;
    font-size: 1.2rem;
    letter-spacing: 0.5px;

    @media screen and (max-width: 600px) {
      display: none;
    }

    position: relative;
  }

  .system-subtitle {
    position: absolute;
    right: 0px;
    top: -0.7rem;
    font-size: 0.8rem;
    letter-spacing: 0px;
    background: -webkit-linear-gradient(45deg, #1e88e5ff, #1e88e5a0);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-family: Pretendard-Bold !important;

    @media screen and (max-width: 600px) {
      display: none;
    }
  }

  .system-version {
    margin: 4px 4px 0 4px;
    font-size: 10px;
    color: grey;

    @media screen and (max-width: 600px) {
      display: none;
    }
  }
}
</style>
