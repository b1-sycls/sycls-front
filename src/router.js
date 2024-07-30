import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        path: '/',
        name: 'MainPage',
        component: () => import('@/components/MainPage.vue')
    },
    {
        path: '/Signup/signup',
        name: 'Signup',
        component: () => import('@/components/signup/Signup.vue')
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
