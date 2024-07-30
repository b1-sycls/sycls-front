import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 기본 URL 설정
});

export const axiosAdminInstance = axios.create({
  baseURL: 'http://localhost:8081', // 관리자용 기본 URL 설정
});

export default axiosInstance;