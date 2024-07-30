import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        path: '/',
        name: 'MainPage',
        component: () => import('@/components/MainPage.vue')
    },
    {
        path: '/signup',
        name: 'Signup',
        component: () => import('@/components/signup/Signup.vue')
    },
    {
        path: '/seat/select',
        name: 'Seat',
        component: () => import('@/components/seat/Seat.vue')
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
