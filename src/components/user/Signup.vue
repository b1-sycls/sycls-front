<template>
  <div class="container">
    <div class="signup-container">
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
          >
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
              :class="{
              'disabled-button': !isEmailChecked || isVerificationSent
            }"
              :disabled="!isEmailChecked || isVerificationSent"
              type="button"
              @click="sendEmailVerification"
          >인증
          </button>
        </div>
        <div v-if="emailError" class="error">{{ emailError }}</div>

        <div v-if="emailCodeVisible">
          <label for="email-code">이메일 인증 코드</label>
          <input v-model="emailCode" placeholder="인증 코드를 입력하세요" required type="text">
          <div v-if="codeError" class="error">{{ codeError }}</div>
        </div>

        <label for="username">사용자 이름</label>
        <input v-model="username" placeholder="사용자 이름을 입력하세요" required type="text">
        <div v-if="usernameError" class="error">{{ usernameError }}</div>

        <label for="nickname">닉네임</label>
        <div class="nickname-container">
          <input v-model="nickname" placeholder="닉네임을 입력하세요" required type="text">
          <button type="button" @click="checkNicknameDuplication">중복 확인</button>
        </div>
        <div v-if="nicknameError" class="error">{{ nicknameError }}</div>

        <label for="phone">전화번호</label>
        <input v-model="phone" placeholder="전화번호를 입력하세요" required type="tel">
        <div v-if="phoneError" class="error">{{ phoneError }}</div>

        <label for="password">비밀번호</label>
        <input v-model="password" placeholder="비밀번호를 입력하세요" required type="password">
        <div v-if="passwordError" class="error">{{ passwordError }}</div>

        <label for="confirm-password">비밀번호 확인</label>
        <input v-model="confirmPassword" placeholder="비밀번호를 다시 입력하세요" required type="password">
        <div v-if="confirmPasswordError" class="error">{{ confirmPasswordError }}</div>

        <button type="submit">가입하기</button>
      </form>
      <button class="main-button" @click="goToMain">메인 화면으로</button>
      <button class="secondary-button" @click="goToLogin">로그인 화면으로</button>
    </div>
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
      confirmPassword: '',
      isEmailChecked: false, // 이메일 중복 확인 상태
      isVerificationSent: false, // 인증 요청 상태
      emailError: '',
      usernameError: '',
      nicknameError: '',
      phoneError: '',
      passwordError: '',
      confirmPasswordError: '',
      codeError: ''
    };
  },
  methods: {
    validateEmail() {
      if (!this.email) {
        this.emailError = '이메일은 필수 항목입니다.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.emailError = '유효한 이메일 형식이 아닙니다.';
      } else if (this.email.length > 30) {
        this.emailError = '이메일은 최대 30자까지 입력 가능합니다.';
      } else {
        this.emailError = '';
      }
    },
    validateUsername() {
      if (!this.username) {
        this.usernameError = '사용자 이름은 필수 항목입니다.';
      } else if (this.username.length < 2 || this.username.length > 20) {
        this.usernameError = '사용자 이름은 2자 이상 20자 이하로 입력해야 합니다.';
      } else {
        this.usernameError = '';
      }
    },
    validateNickname() {
      if (!this.nickname) {
        this.nicknameError = '닉네임은 필수 항목입니다.';
      } else if (this.nickname.length < 2 || this.nickname.length > 20) {
        this.nicknameError = '닉네임은 2자 이상 20자 이하로 입력해야 합니다.';
      } else {
        this.nicknameError = '';
      }
    },
    validatePhone() {
      if (!this.phone) {
        this.phoneError = '전화번호는 필수 항목입니다.';
      } else if (!/^\+?[0-9]{10,15}$/.test(this.phone)) {
        this.phoneError = '유효한 전화번호 형식이 아닙니다.';
      } else {
        this.phoneError = '';
      }
    },
    validatePassword() {
      if (!this.password) {
        this.passwordError = '비밀번호는 필수 항목입니다.';
      } else if (this.password.length > 20) {
        this.passwordError = '비밀번호는 20자 이하로 입력해야 합니다.';
      } else if (!/^(?=.*[0-9])(?=.*[!@#$%^&*]).{1,20}$/.test(this.password)) {
        this.passwordError = '비밀번호는 숫자와 특수문자를 하나 이상 포함해야 합니다.';
      } else {
        this.passwordError = '';
      }
    },
    validateConfirmPassword() {
      if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = '비밀번호가 일치하지 않습니다.';
      } else {
        this.confirmPasswordError = '';
      }
    },
    validateCode() {
      if (!this.emailCode) {
        this.codeError = '인증 코드는 필수 항목입니다.';
      } else if (this.emailCode.length < 1 || this.emailCode.length > 6) {
        this.codeError = '코드는 최소 1자 이상, 최대 6자 이하로 입력해야 합니다.';
      } else {
        this.codeError = '';
      }
    },
    checkEmailDuplication() {
      this.validateEmail();
      if (this.emailError) {
        return;
      }

      axiosInstance.get('/v1/email/check', {params: {email: this.email}})
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
      this.validateEmail();
      if (this.emailError) {
        return;
      }

      axiosInstance.post('/v1/auth/send-verification-code', {email: this.email})
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
      this.validateNickname();
      if (this.nicknameError) {
        return;
      }

      axiosInstance.get('/v1/nickname/check', {params: {nickname: this.nickname}})
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
      this.validateEmail();
      this.validateUsername();
      this.validateNickname();
      this.validatePhone();
      this.validatePassword();
      this.validateConfirmPassword();
      this.validateCode();

      if (this.emailError || this.usernameError || this.nicknameError || this.phoneError
          || this.passwordError || this.confirmPasswordError || this.codeError) {
        alert('모든 필수 항목을 올바르게 입력해주세요.');
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
        this.$router.push({name: 'Login'});
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
    goToMain() {
      this.$router.push({name: 'MainPage'});
    },
    goToLogin() {
      this.$router.push({name: 'Login'});
    }
  }
};
</script>

<style scoped src="../../assets/css/signup.css"></style>
