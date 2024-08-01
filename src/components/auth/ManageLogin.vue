<template>
  <div class="container">
    <div class="login-container">
      <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#4CAF50"/>
        <path d="M50 25 L50 75 M25 50 L75 50" stroke="white" stroke-width="8"/>
      </svg>
      <h2>매니저용</h2>
      <h1>에티켓(everyTicket) 로그인</h1>
      <form id="login-form" @submit="handleSubmit">
        <input type="text" v-model="email" placeholder="Email" required>
        <input type="password" v-model="password" placeholder="Password" required>
        <button type="submit">Log In</button>
      </form>
      <div class="additional-links">
        <p><a @click="showFindIdModal">아이디 찾기</a></p>
        <p><a @click="showFindPasswordModal">비밀번호 찾기</a></p>
        <p><a @click="goToSignup">회원가입</a></p>
      </div>
    </div>

    <!-- 아이디 찾기 모달 -->
    <div v-if="showFindId" class="modal">
      <div class="modal-content">
        <h3>아이디 찾기</h3>
        <form @submit.prevent="findEmail">
          <label for="username">사용자 이름</label>
          <input type="text" v-model="findIdForm.username" placeholder="사용자 이름을 입력하세요" required>

          <label for="phoneNumber">전화번호</label>
          <input type="tel" v-model="findIdForm.phoneNumber" placeholder="전화번호를 입력하세요" required>

          <button type="submit">아이디 찾기</button>
          <button type="button" @click="closeFindIdModal">취소</button>
        </form>
      </div>
    </div>

    <!-- 비밀번호 찾기 모달 -->
    <div v-if="showFindPassword" class="modal">
      <div class="modal-content">
        <h3>비밀번호 찾기</h3>
        <form @submit.prevent="resetPassword">
          <label for="email">이메일</label>
          <input type="email" v-model="findPasswordForm.email" placeholder="이메일을 입력하세요" required>

          <button type="button" @click="sendEmailVerificationForPassword">인증 코드 전송</button>

          <div v-if="emailCodeVisible">
            <label for="emailCode">인증 코드</label>
            <input type="text" v-model="findPasswordForm.emailCode" placeholder="인증 코드를 입력하세요" required>
          </div>

          <label for="newPassword">새 비밀번호</label>
          <input type="password" v-model="findPasswordForm.newPassword" placeholder="새 비밀번호를 입력하세요" required>

          <button type="submit">비밀번호 변경</button>
          <button type="button" @click="closeFindPasswordModal">취소</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";

export default {
  name: 'AdminLogin',
  data() {
    return {
      email: '',
      password: '',
      showFindId: false,
      showFindPassword: false,
      emailCodeVisible: false,
      findIdForm: {
        username: '',
        phoneNumber: ''
      },
      findPasswordForm: {
        email: '',
        emailCode: '',
        newPassword: ''
      }
    };
  },
  methods: {
    async handleSubmit(event) {
      event.preventDefault(); // 기본 폼 제출 동작 방지
      try {
        // Axios 요청
        const response = await axiosAdminInstance.post('/v1/auth/login', {
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
      this.$router.push({name: 'ManageMainPage'});
    },
    showFindIdModal() {
      this.showFindId = true;
    },
    closeFindIdModal() {
      this.showFindId = false;
    },
    showFindPasswordModal() {
      this.showFindPassword = true;
    },
    closeFindPasswordModal() {
      this.showFindPassword = false;
    },
    findEmail() {
      axiosAdminInstance.get('/v1/auth/forget-email', {
        params: {
          username: this.findIdForm.username,
          phoneNumber: this.findIdForm.phoneNumber
        }
      })
      .then(response => {
        alert('이메일: ' + response.data.data);
        this.closeFindIdModal();
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '이메일 찾기에 실패했습니다.');
      });
    },
    sendEmailVerificationForPassword() {
      if (this.findPasswordForm.email.trim() === '') {
        alert('이메일을 입력해주세요.');
        return;
      }

      axiosAdminInstance.post('/v1/auth/send-verification-code',
          {email: this.findPasswordForm.email})
      .then(response => {
        this.emailCodeVisible = true;
        alert(response.data.message);
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '인증 코드 전송에 실패했습니다.');
      });
    },
    resetPassword() {
      axiosAdminInstance.patch('/v1/auth/forget-password', {
        email: this.findPasswordForm.email,
        newPassword: this.findPasswordForm.newPassword,
        code: this.findPasswordForm.emailCode
      })
      .then(response => {
        alert(response.data.message);
        this.closeFindPasswordModal();
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
      });
    },
    goToSignup() {
      this.$router.push({name: 'ManageSignup'});
    }
  }
};
</script>

<style src="../../assets/css/login.css" scoped></style>
