<template>
  <div class="login-container">
    <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#4CAF50"/>
      <path d="M50 25 L50 75 M25 50 L75 50" stroke="white" stroke-width="8"/>
    </svg>
    <h1>Welcome to SecureAccess</h1>
    <form id="login-form" @submit="handleSubmit">
      <input type="text" v-model="email" placeholder="Email" required>
      <input type="password" v-model="password" placeholder="Password" required>
      <button type="submit">Log In</button>
    </form>
    <p class="forgot-password">
      <a href="forgot-password">Forgot Password?</a>
    </p>
  </div>
</template>

<script>
import axiosInstance from "@/axios.js";  // 적절히 구성된 Axios 인스턴스를 가져옵니다

import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      email: 'test1@gmail.com',
      password: 'p@ssW0rd@'
    };
  },
  methods: {
    async handleSubmit(event) {
      event.preventDefault(); // 기본 폼 제출 동작 방지

      try {
        // Axios 요청
        const response = await axios.post('http://localhost:8080/v1/auth/login', {
          email: this.email,
          password: this.password
        });

        // 응답 헤더에서 Authorization 헤더 조회
        const authHeader = response.headers['Authorization']; // 헤더 이름을 소문자로 접근
        console.log(authHeader)

        if (authHeader) {
          // 로컬 저장소에 저장
          localStorage.setItem('Authorization', authHeader);

          // 로그인 성공 후 CheckOut 페이지로 이동
          this.goToCheckOut();
        } else {
          console.error('Authorization header not found in response');
        }
      } catch (error) {
        console.error('Login failed', error);
        // 여기서 에러 처리 로직을 추가할 수 있습니다
      }
    },

    goToCheckOut() {
      this.$router.push({name: 'CheckOut'});
    }
  }
};
</script>

<style src="../assets/css/login.css"></style>
