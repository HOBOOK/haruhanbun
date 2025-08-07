export const state = () => ({
    user: null,
    accessToken: null
})

export const mutations = {
    setUser(state, user) {
        state.user = user
    },
    setAccessToken(state, token) {
        state.accessToken = token
    },
    logout(state) {
        state.user = null
        state.accessToken = null
        localStorage.removeItem('accessToken')
    }
}

