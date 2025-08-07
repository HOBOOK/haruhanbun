
export default function ({ store, $axios, redirect, app, $storage, error }) {
    let trycount = 0

    $axios.onRequest((config) => {
        const token = store.state.auth.accessToken
        if (token) {
            config.headers.common.Authorization = `Bearer ${token}`
        }
        return config
    });

    $axios.onError(async (error) => {

        const originalRequest = error.config
        const status = error.response?.status
        const requestUrl = originalRequest?.url || ''

        // ✅ AccessToken 만료로 인한 401 처리
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const res = await $axios.$post('/auth/refresh')
                store.commit('auth/setAccessToken', res.token)
                originalRequest.headers.Authorization = `Bearer ${res.token}`
                return $axios(originalRequest)
            } catch (err) {
                // refresh 자체가 실패한 경우 → 로그인으로
                store.commit('auth/logout')
                redirect('/')
            }
        }

        // ✅ 403: 만약 요청이 refresh 자체였다면 → 로그인 페이지로
        // if (status === 403) {
        //     store.commit('auth/logout')
        // }

        return Promise.reject(error)
    });
}
