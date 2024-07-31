<template>
  <div class="signup-container">
    <h1>공연장 티케팅 회원가입</h1>
    <form @submit.prevent="submitForm">
      <div class="email-container">
        <input type="email" v-model="email" placeholder="이메일" required>
        <button type="button" @click="sendEmailVerification">인증</button>
      </div>

      <div v-if="emailCodeVisible">
        <label for="email-code">이메일 인증 코드</label>
        <input type="text" v-model="emailCode">
      </div>

      <label for="username">사용자 이름</label>
      <input type="text" v-model="username" required>

      <label for="nickname">닉네임</label>
      <input type="text" v-model="nickname" required>

      <label for="phone">전화번호</label>
      <input type="tel" v-model="phone" required>

      <label for="password">비밀번호</label>
      <input type="password" v-model="password" required>

      <label for="confirm-password">비밀번호 확인</label>
      <input type="password" v-model="confirmPassword" required>

      <button type="submit">가입하기</button>
    </form>
    <button class="main-button" @click="goToMain">메인 화면으로</button>
  </div>
</template>

<script>
import {axiosInstance} from "@/axios.js";

export default {
  name: 'Signup',
  data() {
    return {
      email: '',
      emailCode: '',
      emailCodeVisible: false,
      username: '',
      nickname: '',
      phone: '',
      password: '',
      confirmPassword: ''
    };
  },
  methods: {
    sendEmailVerification() {
      if (this.email.trim() === '') {
        alert('이메일을 입력해주세요.');
        return;
      }

      axiosInstance.post('/v1/auth/send-verification-code', { email: this.email })
      .then(response => {
        this.emailCodeVisible = true;
        alert(response.data.message);
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '인증 코드 전송에 실패했습니다.');
      });
    },
    submitForm() {
      if (this.password !== this.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      const signupData = {
        email: this.email,
        username: this.username,
        nickname: this.nickname,
        phoneNumber: this.phone,
        password: this.password,
        code: this.emailCode
      };

      axiosInstance.post('/v1/users/signup', signupData)
      .then(response => {
        alert(response.data.message);
        // 회원가입 완료 후 로그인 페이지로 이동
        // window.location.href = '/login';
        this.$router.push({name: 'Login'});
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '회원가입에 실패했습니다.');
      });
    },
    goToMain() {
      this.$router.push({name: 'MainPage'});
    }
  }
};
</script>

<style src="../../assets/css/signup.css"></style>