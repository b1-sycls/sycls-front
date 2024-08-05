<template>
  <div class="container">
    <div class="signup-container">
      <h2>매니저용</h2>
      <h1>공연장 티케팅 회원가입</h1>
      <form @submit.prevent="submitForm">
        <label for="email">이메일</label>
        <div class="email-container">
          <input
              v-model="email"
              :disabled="isEmailChecked || isVerificationSent"
              placeholder="이메일을 입력하세요"
              required
              type="email"
              @input="resetEmailCheck"
          />
          <button
              v-if="isEmailChecked"
              :class="{ 'disabled-button': isVerificationSent }"
              :disabled="isVerificationSent"
              type="button"
              @click="resetEmailCheck"
          >재설정
          </button>
          <button
              v-else
              type="button"
              @click="checkEmailDuplication"
          >중복 확인
          </button>
          <button
              :class="{ 'disabled-button': !isEmailChecked || isVerificationSent }"
              :disabled="!isEmailChecked || isVerificationSent"
              type="button"
              @click="sendEmailVerification"
          >인증
          </button>
        </div>

        <div v-if="emailCodeVisible">
          <label for="email-code">이메일 인증 코드</label>
          <input v-model="emailCode" placeholder="인증 코드를 입력하세요" type="text">
        </div>

        <label for="username">사용자 이름</label>
        <input v-model="username" placeholder="사용자 이름을 입력하세요" required type="text">

        <label for="nickname">닉네임</label>
        <div class="nickname-container">
          <input v-model="nickname" placeholder="닉네임을 입력하세요" required type="text">
          <button type="button" @click="checkNicknameDuplication">중복 확인</button>
        </div>

        <label for="phone">전화번호</label>
        <input v-model="phone" placeholder="전화번호를 입력하세요" required type="tel">

        <label for="password">비밀번호</label>
        <input v-model="password" placeholder="비밀번호를 입력하세요" required type="password">

        <label for="confirm-password">비밀번호 확인</label>
        <input v-model="confirmPassword" placeholder="비밀번호를 다시 입력하세요" required type="password">

        <label for="admin-code">어드민 코드</label>
        <input v-model="adminCode" placeholder="어드민 코드를 입력하세요" required type="text">

        <button type="submit">가입하기</button>
      </form>
      <button class="main-button" @click="goToLogin">로그인 화면으로</button>
    </div>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";

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
      confirmPassword: '',
      adminCode: '',
      isEmailChecked: false,
      isVerificationSent: false
    };
  },
  methods: {
    checkEmailDuplication() {
      if (this.email.trim() === '') {
        alert('이메일을 입력해주세요.');
        return;
      }

      axiosAdminInstance.get('/v1/email/check', {params: {email: this.email}})
      .then(response => {
        const isDuplicated = response.data.data;
        if (isDuplicated) {
          alert('이메일이 이미 사용 중입니다.');
          this.isEmailChecked = false;
        } else {
          alert('이메일을 사용할 수 있습니다.');
          this.isEmailChecked = true;
        }
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '이메일 중복 확인에 실패했습니다.');
        this.isEmailChecked = false;
      });
    },
    sendEmailVerification() {
      if (this.email.trim() === '') {
        alert('이메일을 입력해주세요.');
        return;
      }

      axiosAdminInstance.post('/v1/auth/send-verification-code', {email: this.email})
      .then(response => {
        this.emailCodeVisible = true;
        this.isVerificationSent = true;
        alert(response.data.message);
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '인증 코드 전송에 실패했습니다.');
      });
    },
    checkNicknameDuplication() {
      if (this.nickname.trim() === '') {
        alert('닉네임을 입력해주세요.');
        return;
      }

      axiosAdminInstance.get('/v1/nickname/check', {params: {nickname: this.nickname}})
      .then(response => {
        const isDuplicated = response.data.data;
        if (isDuplicated) {
          alert('닉네임이 이미 사용 중입니다.');
        } else {
          alert('닉네임을 사용할 수 있습니다.');
        }
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '닉네임 중복 확인에 실패했습니다.');
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
        code: this.emailCode,
        adminKey: this.adminCode
      };

      axiosAdminInstance.post('/v1/users/signup', signupData)
      .then(response => {
        alert(response.data.message);
        // 회원가입 완료 후 로그인 페이지로 이동
        this.$router.push({name: 'ManageLogin'});
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '회원가입에 실패했습니다.');
      });
    },
    resetEmailCheck() {
      this.isEmailChecked = false;
      this.isVerificationSent = false;
      this.emailCodeVisible = false;
      this.emailCode = '';
    },
    goToLogin() {
      this.$router.push({name: 'ManageLogin'});
    }
  }
};
</script>

<style scoped src="../../assets/css/signup.css"></style>
