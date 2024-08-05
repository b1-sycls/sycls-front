// src/config.js

// 필요할때마다 기존의 URL 주석후 접속할 URL 주석 풀고 프론트 서버 다시실행
export const API_URLS = {
    USER_BASE_URL: import.meta.env.VITE_USER_LOCAL_BASE_URL, // 로컬 유저 테스트용
    ADMIN_BASE_URL: import.meta.env.VITE_ADMIN_LOCAL_BASE_URL, // 로컬 어드민 테스트용
    // USER_BASE_URL: import.meta.env.VITE_USER_DEV_BASE_URL, // 배포 유저 테스트용(나중에 로드밸런서 주소)
    // ADMIN_BASE_URL: import.meta.env.VITE_ADMIN_DEV_BASE_URL // 배포 어드민 테스트용(나중에 로드밸런서 주소)
};
