// src/utils.js
import { axiosInstance } from "@/axios.js";

export async function logoutUser() {
  try {
    const refreshToken = localStorage.getItem('RefreshToken');
    await axiosInstance.post('/v1/auth/logout', null, {
      headers: {
        'RefreshToken': `${refreshToken}`
      }
    });
    localStorage.removeItem('Authorization');
    localStorage.removeItem('RefreshToken');
    alert('로그아웃 하셨습니다.');
    return true;
  } catch (error) {
    console.error('Logout failed', error);
    alert('로그아웃에 실패했습니다.');
    return false;
  }
}


import { axiosAdminInstance } from "@/axios.js";

export async function logoutAdminUser() {
  try {
    const refreshToken = localStorage.getItem('RefreshToken');
    await axiosAdminInstance.post('/v1/auth/logout', null, {
      headers: {
        'RefreshToken': `${refreshToken}`
      }
    });
    localStorage.removeItem('Authorization');
    localStorage.removeItem('RefreshToken');
    alert('로그아웃 하셨습니다.');
    return true;
  } catch (error) {
    console.error('Logout failed', error);
    alert('로그아웃에 실패했습니다.');
    return false;
  }
}
