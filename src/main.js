import { router } from "@/router";
import { createApp } from 'vue';
import App from './App.vue';
import { axiosInstance, axiosAdminInstance } from './axios';

const app = createApp(App);

app.use(router);

app.config.globalProperties.$axios = axiosInstance;
app.config.globalProperties.$axiosAdmin = axiosAdminInstance;

app.mount('#app');
