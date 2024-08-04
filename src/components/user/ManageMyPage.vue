<template>
  <div>
    <header>
      <div class="logo">MyPage</div>
      <div class="user-actions">
        <button @click="confirmResign">회원탈퇴</button>
        <button @click="showPasswordChangeModal">비밀번호 변경</button>
        <button @click="goToMain">메인 화면으로</button>
      </div>
    </header>
    <main>
      <h1>마이 페이지</h1>
      <div class="user-profile">
        <p><strong>아이디:</strong> {{ userProfile.username }}</p>
        <p><strong>닉네임:</strong> {{ userProfile.nickname }}</p>
        <p><strong>이메일:</strong> {{ userProfile.email }}</p>
        <p><strong>전화번호:</strong> {{ userProfile.phoneNumber }}</p>
      </div>
    </main>
    <!-- 회원탈퇴 모달 -->
    <div v-if="showResignModal" class="modal">
      <div class="modal-content">
        <span class="close-button" @click="showResignModal = false">&times;</span>
        <h2>회원탈퇴</h2>
        <p>비밀번호를 입력하세요</p>
        <input v-model="resignPassword" placeholder="비밀번호를 입력하세요" type="password">
        <button @click="resignUser">탈퇴</button>
      </div>
    </div>
    <!-- 비밀번호 변경 모달 -->
    <div v-if="showPasswordModal" class="modal">
      <div class="modal-content">
        <span class="close-button" @click="showPasswordModal = false">&times;</span>
        <h2>비밀번호 변경</h2>
        <label for="email">이메일(로그인시 사용하는 이메일)</label>
        <input v-model="email" placeholder="이메일을 입력하세요" type="email">
        <button @click="sendEmailVerification">인증 코드 발송</button>
        <div v-if="emailCodeVisible">
          <label for="emailCode">인증 코드</label>
          <input v-model="emailCode" placeholder="인증 코드를 입력하세요" type="text">
          <label for="newPassword">새 비밀번호</label>
          <input v-model="newPassword" placeholder="새 비밀번호를 입력하세요" type="password">
          <button @click="changePassword">비밀번호 변경</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";
import {logoutAdminUser} from "@/utils.js"; // 로그아웃 유틸리티 함수 임포트

export default {
  data() {
    return {
      userProfile: {
        username: '',
        nickname: '',
        email: '',
        phoneNumber: ''
      },
      showResignModal: false,
      resignPassword: '',
      showPasswordModal: false,
      email: '',
      emailCode: '',
      newPassword: '',
      emailCodeVisible: false,
      reservations: [] // 예매 내역을 저장할 배열
    };
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await axiosAdminInstance.get('/v1/users/me');
        this.userProfile = response.data.data;
        // 예매 내역도 가져오기
        const reservationResponse = await axiosAdminInstance.get('/v1/users/me/reservations');
        this.reservations = reservationResponse.data.data;
      } catch (error) {
        console.error('사용자 프로필 가져오기 오류:', error);
      }
    },
    confirmResign() {
      this.showResignModal = true;
    },
    async resignUser() {
      if (!this.resignPassword) {
        alert('비밀번호를 입력하세요.');
        return;
      }

      if (!confirm('정말로 탈퇴하시겠습니까?')) {
        return;
      }

      try {
        await axiosAdminInstance.patch('/v1/users/resign', {password: this.resignPassword});
        alert('성공적으로 탈퇴되었습니다.');
        await logoutAdminUser(false); // 로그아웃 함수 호출
        this.$router.push({name: 'Login'}); // 탈퇴 후 로그인 페이지로 리다이렉트
      } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        alert(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
      }
    },
    goToMain() {
      this.$router.push({name: 'ManageMainPage'})
    },
    showPasswordChangeModal() {
      this.showPasswordModal = true;
    },
    async sendEmailVerification() {
      try {
        await axiosAdminInstance.post('/v1/auth/send-verification-code', {email: this.email});
        this.emailCodeVisible = true;
        alert('인증 코드가 발송되었습니다.');
      } catch (error) {
        console.error('인증 코드 발송 오류:', error);
        alert('인증 코드 발송에 실패했습니다.');
      }
    },
    async changePassword() {
      try {
        await axiosAdminInstance.patch('/v1/auth/forget-password', {
          email: this.email,
          newPassword: this.newPassword,
          code: this.emailCode
        });
        alert('비밀번호가 성공적으로 변경되었습니다.');
        this.showPasswordModal = false;
      } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        alert(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
      }
    }
  },
  mounted() {
    this.fetchUserProfile();
  }
};
</script>

<style scoped src="../../assets/css/mypage.css"></style>
