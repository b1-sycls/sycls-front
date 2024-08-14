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
        path: '/kakao-callback', // 새로운 경로 추가
        name: 'KakaoCallback',
        component: () => import('@/components/auth/KakaoCallback.vue')
    },
    {
        path: '/kakao-signup',  // 경로 업데이트
        name: 'KakaoSignup',
        component: () => import('@/components/auth/KakaoSignup.vue')  // 이름 변경된 컴포넌트를 사용
    },
    {
        path: '/seat/select',
        name: 'Seat',
        component: () => import('@/components/seat/Seat.vue')
    },
    {
        path: '/seat/manage',
        name: 'SeatManage',
        component: () => import('@/components/seat/SeatManage.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/seatgrade/seatgradeManage',
        name: 'SeatGradeManage',
        component: () => import('@/components/seat/SeatGradeManage.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/payment/checkout',
        name: 'CheckOut',
        component: () => import('@/components/payment/Checkout.vue')
    },
    {
        path: '/payment/middle',
        name: 'Middle',
        component: () => import('@/components/payment/Middle.vue')
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
        component: () => import('@/components/place/PlaceManage.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/manage',
        name: 'ManageMainPage',
        component: () => import('@/components/ManageMainPage.vue'),
        meta: {requiresAuth: true}
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
        component: () => import('@/components/category/Category.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/manage/concert/:id',
        name: 'ManageConcert',
        component: () => import('@/components/round/ManageConcert.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/mypage',
        name: 'MyPage',
        component: () => import('@/components/user/MyPage.vue')
    },
    {
        path: '/manage/mypage',
        name: 'ManageMyPage',
        component: () => import('@/components/user/ManageMyPage.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/manage/dummy-data',
        name: 'Dummy',
        component: () => import('@/components/test/dummy.vue')
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('Authorization');

    if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
        next('/manage/login'); // 로그인되지 않았을 경우 로그인 페이지로 리디렉션
    } else {
        next(); // 인증이 필요하지 않거나, 이미 로그인된 경우
    }
});
