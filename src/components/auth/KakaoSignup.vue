<template>
  <div class="container">
    <div class="signup-container">
      <h1>추가 정보 입력</h1>
      <form @submit.prevent="handleSignup">
        <label for="nickname">닉네임</label>
        <div class="nickname-container">
          <input
              type="text"
              v-model="nickname"
              @input="resetNicknameCheck"
              placeholder="닉네임을 입력하세요"
              required
              :class="{ 'is-invalid': nicknameError }"
          >
          <span v-if="nicknameError" class="error">{{ nicknameError }}</span>
          <button type="button" @click="checkNicknameDuplication">중복 확인</button>
        </div>

        <label for="phone">전화번호</label>
        <input
            type="tel"
            v-model="phoneNumber"
            placeholder="전화번호를 입력하세요"
            required
            :class="{ 'is-invalid': phoneNumberError }"
        >
        <span v-if="phoneNumberError" class="error">{{ phoneNumberError }}</span>

        <button type="submit" :disabled="!isFormValid" :class="{ disabled: !isFormValid }">회원가입</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { API_URLS } from "@/config.js";
import {axiosInstance} from "@/axios.js";

export default {
  name: 'KakaoSignup',
  data() {
    return {
      nickname: '',
      phoneNumber: '',
      accessToken: '',
      isNicknameChecked: false, // 닉네임 중복 체크 성공 여부
      nicknameError: '', // 닉네임 오류 메시지
      phoneNumberError: '' // 전화번호 오류 메시지
    };
  },
  computed: {
    isFormValid() {
      // 전체 폼 유효성 검사
      return (
          this.nickname &&
          this.phoneNumber &&
          !this.nicknameError &&
          !this.phoneNumberError &&
          this.isNicknameChecked
      );
    }
  },
  watch: {
    nickname(value) {
      this.validateNickname(value);
    },
    phoneNumber(value) {
      this.validatePhoneNumber(value);
    }
  },
  created() {
    // URL에서 accessToken을 가져옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    this.accessToken = urlParams.get('accessToken');
  },
  methods: {
    validateNickname(value) {
      if (!value) {
        this.nicknameError = '닉네임은 필수 항목입니다.';
      } else if (value.length < 2 || value.length > 20) {
        this.nicknameError = '닉네임은 2자 이상 20자 이하로 입력해야 합니다.';
      } else {
        this.nicknameError = '';
      }
    },
    validatePhoneNumber(value) {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!value) {
        this.phoneNumberError = '전화번호는 필수 항목입니다.';
      } else if (!phoneRegex.test(value)) {
        this.phoneNumberError = '유효한 전화번호 형식이 아닙니다.';
      } else {
        this.phoneNumberError = '';
      }
    },
    resetNicknameCheck() {
      // 닉네임 입력이 변경되면 닉네임 중복 체크 상태를 초기화합니다.
      this.isNicknameChecked = false;
    },
    checkNicknameDuplication() {
      if (this.nickname.trim() === '') {
        alert('닉네임을 입력해주세요.');
        return;
      }
      axios.get(API_URLS.USER_BASE_URL + '/v1/nickname/check', { params: { nickname: this.nickname } })
      .then(response => {
        const isDuplicated = response.data.data;
        if (isDuplicated) {
          alert('닉네임이 이미 사용 중입니다.');
        } else {
          alert('닉네임을 사용할 수 있습니다.');
          this.isNicknameChecked = true; // 닉네임 중복 체크 성공
        }
      })
      .catch(error => {
        console.error(error);
        alert(error.response?.data?.message || '닉네임 중복 확인에 실패했습니다.');
      });
    },
    async handleSignup() {
      if (!this.isFormValid) {
        alert('폼을 올바르게 작성해주세요.');
        return;
      }

      try {
        // PATCH 요청의 본문에 데이터를 JSON 형식으로 담아서 전송
        await axios.patch(API_URLS.USER_BASE_URL + '/v1/user/kakao/signup', {
          accessToken: this.accessToken,
          nickname: this.nickname,
          phoneNumber: this.phoneNumber
        });

        alert('회원가입이 완료되었습니다!');
        // 리다이렉트 할 URL 설정
        window.location.href = API_URLS.FRONTEND_BASE_URL + '/kakao-callback?accessToken=' + this.accessToken;
      } catch (error) {
        console.error('Error during signup:', error);
        alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  }
};
</script>

<style src="../../assets/css/signup.css" scoped>
.is-invalid {
  border-color: red;
}

.error {
  color: red;
  font-size: 0.9em;
}
</style>
