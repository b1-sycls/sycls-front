// src/axios.js
import axios from 'axios';
import { API_URLS } from '/src/config.js';

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
          await refreshAccessToken(API_URLS.USER_BASE_URL + '/v1/auth/token');
          return axiosInstance.request(error.config);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
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
          await refreshAccessToken(API_URLS.ADMIN_BASE_URL + '/v1/auth/token');
          return axiosAdminInstance.request(error.config);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
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

export { axiosInstance, axiosAdminInstance };
