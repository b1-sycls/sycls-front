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
import axiosInstance from "@/axios.js";

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
        // Axios 요청
        const response = await axiosInstance.post('/v1/auth/login', {
          email: this.email,
          password: this.password
        });
        const accessToken = response.headers['authorization']; // 헤더 이름을 소문자로 접근
        const refreshToken = response.headers['refreshtoken']; // 헤더 이름을 소문자로 접근

        if (accessToken) {
          localStorage.setItem('Authorization', accessToken);
          localStorage.setItem('RefreshToken', refreshToken);

          this.goToCheckOut();
        } else {
          console.error('Authorization header not found in response');
        }
      } catch (error) {
        console.error('Login failed', error);
        alert(error.response?.data?.message || '로그인에 실패했습니다.');
      }
    },
    goToCheckOut() {
      this.$router.push({name: 'MainPage'});
    }
  }
};
</script>

<style src="../../assets/css/login.css"></style>