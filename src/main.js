import {router} from "@/router";
import {createApp} from 'vue'
import App from './App.vue'
import axiosInstance from "@/axios.js";

const app = createApp(App)
app.use(router)
app.config.globalProperties.$axios = axiosInstance;
app.mount('#app')