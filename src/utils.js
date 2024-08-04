// src/utils.js
import {axiosAdminInstance, axiosInstance} from "@/axios.js";

export async function logoutUser(showAlert = true) {
    try {
        const refreshToken = localStorage.getItem('RefreshToken');
        await axiosInstance.post('/v1/auth/logout', null, {
            headers: {
                'RefreshToken': `${refreshToken}`
            }
        });
        localStorage.removeItem('Authorization');
        localStorage.removeItem('RefreshToken');
        if (showAlert) {
            alert('로그아웃 하셨습니다.');
        }
        return true;
    } catch (error) {
        console.error('Logout failed', error);
        if (showAlert) {
            alert('로그아웃에 실패했습니다.');
        }
        return false;
    }
}

export async function logoutAdminUser(showAlert = true) {
    try {
        const refreshToken = localStorage.getItem('RefreshToken');
        await axiosAdminInstance.post('/v1/auth/logout', null, {
            headers: {
                'RefreshToken': `${refreshToken}`
            }
        });
        localStorage.removeItem('Authorization');
        localStorage.removeItem('RefreshToken');
        if (showAlert) {
            alert('로그아웃 하셨습니다.');
        }
        return true;
    } catch (error) {
        console.error('Logout failed', error);
        if (showAlert) {
            alert('로그아웃에 실패했습니다.');
        }
        return false;
    }
}
