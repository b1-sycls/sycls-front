import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        path: '/',
        name: 'MainPage',
        component: () => import('@/components/MainPage.vue')
    },
    {
        path: '/department/:id',
        // name: 'DepartmentInfo',
        // component: () => import('@/components/department/DepartmentInfo')
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
