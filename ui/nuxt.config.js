import colors from 'vuetify/es5/util/colors'
import i18nConfig from "./i18n/config";
import locales from "./i18n/locales";
import webpack from 'webpack'

require('dotenv').config()

export default {
  ssr: true,
  target: 'server',
  srcDir: '',
  head: {
    script: [
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1654715490901132",
        async: true,
        crossorigin: "anonymous"
      }
    ],
    titleTemplate: ('HAHA') + ' - %s',
    title: 'HAHA',
    htmlAttrs: {
      lang: 'ko'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no' },
      { hid: 'og:title', property: 'og:title', content: 'HAHA' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ]
  },

  devtools: {
    enabled: true
  },

  vue: {
    config: {
      devtools: true,
      performance: true
    }
  },

  components: true,

  loading: false,

  css: [
    "~/assets/scss/common.scss",
    "~/assets/scss/transition.scss",
    '~/assets/scss/lightTheme.scss',
    '~/assets/scss/darkTheme.scss',
    '~/assets/scss/custom.scss'
  ],

  plugins: [
    '~/plugins/axios.js',
    { src: '~/plugins/vuex-persis.js', ssr: false },
    '~/plugins/component.js',
    '~/plugins/global.js',
    '~/plugins/vue-snotify.js',
    { src: '~/plugins/vue-grid', ssr: false },
    { src: '~/plugins/socket.js', mode: 'client' },
    { src: '~/plugins/vue-draggable.js', mode: 'client' },
  ],

  components: true,

  buildModules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/dotenv',
    '@nuxt/components'
  ],

  modules: [
    // '@nuxtjs/auth',
    '@nuxtjs/proxy',
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    'nuxt-route-meta',
    ['cookie-universal-nuxt', { alias: 'cookiz' }],
    'nuxt-healthcheck',
    'nuxt-i18n',
    'nuxt-socket-io',
  ],
  dotenv: {
    filename: '.env'
  },
  i18n: {
    seo: true,
    locales,
    defaultLocale: 'ko',
    vueI18n: i18nConfig,
    skipSettingLocaleOnNavigate: true,
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    defaultAssets: {
      icons: false,
    },
    icons: {
      iconfont: 'mdi',
    },
    theme: {
      themes: {
        dark: {
          primary: colors.blue.darken1,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.blueGrey.darken3,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent4,
        },
        light: {
          primary: colors.blue.darken1
        }
      }
    }
  },

  build: {
    vendor: ['axios'],
    hotMiddleware: {
      client: {
        quiet: true
      }
    },
    html: {
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    },

    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        IScroll: 'iscroll',
      })
    ],
    // transpile: [
    //   "three"
    // ],
    extend(config, ctx) {
      config.module.rules.push({
        enforce: 'pre',
        test: /\.txt$/,
        loader: 'raw-loader',
        exclude: /(node_modules)/
      });

      if (ctx.isClient) {
        config.module.rules.push({
          test: /\.worker\.js$/, // 워커 파일 이름 패턴 (예: `editor.worker.js`)
          loader: 'worker-loader',
          options: { type: 'module' } // 모듈 타입으로 로드
        });
      }

      if (!ctx.isDev && ctx.isClient) {
        config.devtool = false
      }
    }
  },

  axios: {
    baseURL: process.server ? 'http://localhost:3000' : '/',
    timeout: 10000,
    credentials: true
  },
  publicRuntimeConfig: {
    axios: {
      baseURL: '/',
    },
    socketUrl: '/',
  },
  privateRuntimeConfig: {
    axios: {
      baseURL: 'http://localhost:3000', // SSR용
    }
  },
  healthCheck: {
    contentType: 'application/json',
    healthy: () => {
      return JSON.stringify({ result: 'ok' })
    }
  },

  router: {
    // middleware: ['loading'],
  },



  generate: {
    minify: {
      collapseWhitespace: false
    }
  },

  server: {
    port: 3000,
    host: '0.0.0.0'
  }
}


