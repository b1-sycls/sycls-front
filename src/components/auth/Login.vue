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
import {axiosInstance} from "@/axios.js";

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async handleSubmit(event) {
      event.preventDefault(); // 기본 폼 제출 동작 방지

      try {
        const response = await axiosInstance.post('/v1/auth/login', {
          email: this.email,
          password: this.password
        });

        if (response.status === 200) {
          console.log('Login successful');
          // 응답 데이터에서 토큰을 조회하여 로컬 저장소에 저장 (axios 인터셉터에서 자동으로 처리됨)
          location.href = '/';
        } else {
          console.error('Login failed');
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
    }
  }
};
</script>

<style src="../../assets/css/login.css"></style>
