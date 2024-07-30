// src/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseUserURL: 'http://localhost:8080',
  baseAdminURL: 'http://localhost:8081',
});

export default axiosInstance;