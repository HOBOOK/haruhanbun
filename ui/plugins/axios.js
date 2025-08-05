
export default function ({ store, $axios, redirect, app, $storage, error }) {
    let trycount = 0

    $axios.onRequest((config) => {
        const token = store.state.auth.accessToken
        if (token) {
            config.headers.common.Authorization = `Bearer ${token}`
        }
    });

    $axios.onError(async (error) => {
        
        let response = null
        const code = parseInt(error.response && error.response.status);
        if(code == 401){
            console.log('error',error?.response?.data?.message)
            redirect('/login')
            return
        }

   
        if (response) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(error);
        }
    });
}
