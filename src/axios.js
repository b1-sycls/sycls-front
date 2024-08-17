// src/axios.js
import axios from 'axios';
import {API_URLS} from '/src/config.js';
import {router} from '/src/router'; // Vue 라우터를 사용하여 리다이렉트

const axiosInstance = axios.create({
    baseURL: API_URLS.USER_BASE_URL, // 기본 URL 설정
    headers: {
        'Content-Type': 'application/json'
    }
});

const axiosAdminInstance = axios.create({
    baseURL: API_URLS.ADMIN_BASE_URL, // 관리자용 기본 URL 설정
    headers: {
        'Content-Type': 'application/json'
    }
});

// 요청 인터셉터: 모든 요청에 토큰을 자동으로 추가합니다.
axiosInstance.interceptors.request.use(
        (config) => {
            const accessToken = localStorage.getItem('Authorization');
            if (accessToken) {
                config.headers['Authorization'] = `${accessToken}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
);

axiosAdminInstance.interceptors.request.use(
        (config) => {
            const accessToken = localStorage.getItem('Authorization');
            if (accessToken) {
                config.headers['Authorization'] = `${accessToken}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
);

// 응답 인터셉터: 응답에서 토큰을 갱신합니다.
axiosInstance.interceptors.response.use(
        (response) => {
            const accessToken = response.headers['authorization'];
            const refreshToken = response.headers['refreshtoken'];
            if (accessToken) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('RefreshToken', refreshToken);
            }
            return response;
        },
        async (error) => {
            if (error.response && error.response.status === 401) {
                try {
                    await refreshAccessToken(
                            API_URLS.USER_BASE_URL + '/v1/auth/token');
                    return axiosInstance.request(error.config);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }
            if (error.response && error.response.status === 403) {
                handleForbiddenErrorForUser();
            }
            if (error.response && error.response.data.message === 'valid') {
                const errorMessages = Object.values(error.response.data.data)
                .join('\n');
                alert(`유효성 검사 오류:\n${errorMessages}`);
                return Promise.reject(new Error('Validation error'));
            }
            return Promise.reject(error);
        }
);

axiosAdminInstance.interceptors.response.use(
        (response) => {
            const accessToken = response.headers['authorization'];
            const refreshToken = response.headers['refreshtoken'];
            if (accessToken) {
                localStorage.setItem('Authorization', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('RefreshToken', refreshToken);
            }
            return response;
        },
        async (error) => {
            if (error.response && error.response.status === 401) {
                try {
                    await refreshAccessToken(
                            API_URLS.ADMIN_BASE_URL + '/v1/auth/token');
                    return axiosAdminInstance.request(error.config);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }
            if (error.response && error.response.status === 403) {
                handleForbiddenErrorForAdmin();
            }
            if (error.response && error.response.data.message === 'valid') {
                const errorMessages = Object.values(error.response.data.data)
                .join('\n');
                alert(`유효성 검사 오류:\n${errorMessages}`);
                return Promise.reject(new Error('Validation error'));
            }
            return Promise.reject(error);
        }
);

// 새로운 access token을 얻기 위한 함수
async function refreshAccessToken(url) {
    const refreshToken = localStorage.getItem('RefreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await axios.post(url, null, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': '',
            'refreshToken': refreshToken
        }
    });

    const newAccessToken = response.headers['authorization'];
    const newRefreshToken = response.headers['refreshtoken'];
    if (newAccessToken) {
        localStorage.setItem('Authorization', newAccessToken);
    }
    if (newRefreshToken) {
        localStorage.setItem('RefreshToken', newRefreshToken);
    }
}

// 403 Forbidden 에러 처리 함수 (User용)
function handleForbiddenErrorForUser() {
    localStorage.removeItem('Authorization');
    localStorage.removeItem('RefreshToken');
    alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
    router.push('/login'); // User는 '/login' 경로로 리다이렉트
}

// 403 Forbidden 에러 처리 함수 (Admin용)
function handleForbiddenErrorForAdmin() {
    localStorage.removeItem('Authorization');
    localStorage.removeItem('RefreshToken');
    alert('접근 권한이 없습니다. 다시 로그인해 주세요.');
    router.push('/manage/login'); // Admin은 '/manage/login' 경로로 리다이렉트
}

export {axiosInstance, axiosAdminInstance};
