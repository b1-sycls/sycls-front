import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // 기본 URL 설정
    headers: {
        'Content-Type': 'application/json'
    }
});

export const axiosAdminInstance = axios.create({
    baseURL: 'http://localhost:8081', // 관리자용 기본 URL 설정
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
    (error) => {
        // 예: 토큰 만료 시 refresh token으로 새로운 access token을 얻기
        if (error.response && error.response.status === 401) {
            // refresh token으로 새로운 access token을 얻는 로직을 추가할 수 있습니다.
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;