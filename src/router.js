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
        component: () => import('@/components/user/Signup.vue')
    },
    {
        path: '/seat/select',
        name: 'Seat',
        component: () => import('@/components/seat/Seat.vue')
    },
    {
        path: '/seat/manage',
        name: 'SeatManage',
        component: () => import('@/components/seat/SeatManage.vue')
    },
    {
        path: '/payment/checkout',
        name: 'CheckOut',
        component: () => import('@/components/payment/Checkout.vue')
    },
    {
        path: '/payment/success',
        name: 'Success',
        component: () => import('@/components/payment/Success.vue')
    },
    {
        path: '/payment/fail',
        name: 'Fail',
        component: () => import('@/components/payment/Fail.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/components/auth/Login.vue')
    },
    {
        path: '/concert/:id',
        name: 'Concert',
        component: () => import('@/components/round/Concert.vue')
    },
    {
        path: '/place/placeManage',
        name: 'PlaceManage',
        component: () => import('@/components/place/PlaceManage.vue')
    },
    {
        path: '/manage',
        name: 'ManageMainPage',
        component: () => import('@/components/ManageMainPage.vue')
    },
    {
        path: '/manage/signup',
        name: 'ManageSignup',
        component: () => import('@/components/user/ManageSignup.vue')
    },
    {
        path: '/manage/login',
        name: 'ManageLogin',
        component: () => import('@/components/auth/ManageLogin.vue')
    },
    {
        path: '/manage/category',
        name: 'Category',
        component: () => import('@/components/category/Category.vue')
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
