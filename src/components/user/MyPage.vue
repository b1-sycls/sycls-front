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
      <!-- 예매 내역 섹션 -->
      <div class="reservation-history">
        <h2>예매 내역</h2>
        <table>
          <thead>
          <tr>
            <th>공연명</th>
            <th>회차</th>
            <th>좌석</th>
            <th>날짜 및 시간</th>
            <th>가격</th>
            <th>상태</th>
            <th>상세조회</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="ticket in tickets" :key="ticket.ticketId">
            <td>{{ ticket.contentTitle }}</td>
            <td>{{ ticket.sequence }}회차</td>
            <td>{{ ticket.seatGradeCode.join(", ") }}</td>
            <td>{{ formatDate(ticket.startDate) }} {{ formatTime(ticket.startTime) }} ~
              {{ formatTime(ticket.endTime) }}
            </td>
            <td>{{ formatPrice(ticket.price) }}원</td>
            <td>{{ ticket.ticketStatus === 'RESERVED' ? '예매 완료' : '사용 완료' }}</td>
            <td>
              <button @click="showTicketDetail(ticket.ticketId)">상세조회</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button :disabled="currentPage === 1" @click="prevPageSet">&lt;</button>
        <button v-for="page in pageSet" :key="page" :class="{ active: currentPage === page }"
                @click="changePage(page)">{{ page }}
        </button>
        <button :disabled="currentPage === totalPages" @click="nextPageSet">&gt;</button>
      </div>
    </main>
    <!-- 회원탈퇴 모달 -->
    <div v-if="showResignModal" class="modal" @click.self="showResignModal = false">
      <div class="modal-content">
        <span class="close-button" @click="showResignModal = false">&times;</span>
        <h2>회원탈퇴</h2>
        <p>비밀번호를 입력하세요</p>
        <input v-model="resignPassword" placeholder="비밀번호를 입력하세요" type="password">
        <button @click="resignUser">탈퇴</button>
      </div>
    </div>
    <!-- 비밀번호 변경 모달 -->
    <div v-if="showPasswordModal" class="modal" @click.self="showPasswordModal = false">
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
    <!-- 티켓 상세 정보 모달 -->
    <div v-if="showTicketModal" class="modal" @click.self="showTicketModal = false">
      <div class="modal-content scrollable">
        <span class="close-button" @click="showTicketModal = false">&times;</span>
        <h2>티켓 상세 정보</h2>
        <div v-if="ticketDetail">
          <p><strong>공연명:</strong> {{ ticketDetail.contentTitle }}</p>
          <img :src="ticketDetail.mainImagePath" alt="Ticket Main Image" class="ticket-image"/>
          <p><strong>회차:</strong> {{ ticketDetail.sequence }}회차</p>
          <p><strong>좌석:</strong> {{ ticketDetail.seatGradeCode.join(", ") }}</p>
          <p><strong>날짜 및 시간:</strong> {{ formatDate(ticketDetail.startDate) }} {{
              formatTime(ticketDetail.startTime)
            }} ~ {{ formatTime(ticketDetail.endTime) }}</p>
          <p><strong>가격:</strong> {{ formatPrice(ticketDetail.price) }}원</p>
          <p><strong>상태:</strong> {{ ticketDetail.ticketStatus === 'RESERVED' ? '예매 완료' : '사용 완료' }}
          </p>
          <p><strong>장소:</strong> {{ ticketDetail.placeName }} ({{ ticketDetail.location }})</p>
          <p><strong>출연진:</strong></p>
          <div class="cast-slider">
            <button class="slider-button prev-button" @click="prevCastSlide">&#10094;</button>
            <div class="slider-cast">
              <div :style="{ transform: `translateX(-${castIndex * 100}%)` }" class="cast-images">
                <div v-for="cast in ticketDetail.castResponseDtos" :key="cast.castId"
                     class="cast-slide">
                  <img :src="cast.imagePath" alt="Cast Image" class="cast-image"/>
                  <p>{{ cast.name }}</p>
                </div>
              </div>
            </div>
            <button class="slider-button next-button" @click="nextCastSlide">&#10095;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosInstance} from "@/axios.js";
import {logoutUser} from "@/utils.js"; // 로그아웃 유틸리티 함수 임포트

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
      tickets: [], // 예매 내역을 저장할 배열
      currentPage: 1,
      totalPages: 1,
      showTicketModal: false,
      ticketDetail: null,
      castIndex: 0,
    };
  },
  computed: {
    currentPageSet() {
      return Math.ceil(this.currentPage / 10);
    },
    pageSet() {
      const startPage = (this.currentPageSet - 1) * 10 + 1;
      const endPage = Math.min(startPage + 9, this.totalPages);
      return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
    }
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await axiosInstance.get('/v1/users/me');
        this.userProfile = response.data.data;
        this.fetchTickets(); // Fetch tickets after user profile
      } catch (error) {
        console.error('사용자 프로필 가져오기 오류:', error);
      }
    },
    async fetchTickets() {
      try {
        const ticketResponse = await axiosInstance.get('/v1/tickets', {
          params: {
            pageNum: this.currentPage,
          }
        });
        const responseData = ticketResponse.data.data;
        this.tickets = responseData.data;
        this.currentPage = responseData.currentPage;
        this.totalPages = responseData.totalPage;
      } catch (error) {
        console.error('티켓 내역 가져오기 오류:', error);
      }
    },
    async showTicketDetail(ticketId) {
      try {
        const response = await axiosInstance.get(`/v1/tickets/${ticketId}`);
        this.ticketDetail = response.data.data;
        this.showTicketModal = true;
      } catch (error) {
        console.error('티켓 상세 정보 가져오기 오류:', error);
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
        await axiosInstance.patch('/v1/users/resign', {password: this.resignPassword});
        alert('성공적으로 탈퇴되었습니다.');
        await logoutUser(false); // 로그아웃 함수 호출
        this.$router.push({name: 'Login'}); // 탈퇴 후 로그인 페이지로 리다이렉트
      } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        alert(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
      }
    },
    goToMain() {
      this.$router.push({name: 'MainPage'});
    },
    showPasswordChangeModal() {
      this.showPasswordModal = true;
    },
    async sendEmailVerification() {
      try {
        await axiosInstance.post('/v1/auth/send-verification-code', {email: this.email});
        this.emailCodeVisible = true;
        alert('인증 코드가 발송되었습니다.');
      } catch (error) {
        console.error('인증 코드 발송 오류:', error);
        alert('인증 코드 발송에 실패했습니다.');
      }
    },
    async changePassword() {
      try {
        await axiosInstance.patch('/v1/auth/forget-password', {
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
    },
    formatDate(date) {
      const options = {year: 'numeric', month: '2-digit', day: '2-digit'};
      return new Date(date).toLocaleDateString('ko-KR', options);
    },
    formatTime(time) {
      const options = {hour: '2-digit', minute: '2-digit'};
      return new Date(`1970-01-01T${time}`).toLocaleTimeString('ko-KR', options);
    },
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    changePage(pageNumber) {
      this.currentPage = pageNumber;
      this.fetchTickets();
    },
    prevPageSet() {
      if (this.currentPageSet > 1) {
        this.currentPage = (this.currentPageSet - 1) * 10;
        this.fetchTickets();
      }
    },
    nextPageSet() {
      if (this.currentPageSet * 10 < this.totalPages) {
        this.currentPage = this.currentPageSet * 10 + 1;
        this.fetchTickets();
      }
    },
    prevCastSlide() {
      this.castIndex = (this.castIndex === 0) ? this.ticketDetail.castResponseDtos.length - 1
          : this.castIndex - 1;
    },
    nextCastSlide() {
      this.castIndex = (this.castIndex === this.ticketDetail.castResponseDtos.length - 1) ? 0
          : this.castIndex + 1;
    }
  },
  mounted() {
    this.fetchUserProfile();
  }
};
</script>

<style scoped src="../../assets/css/mypage.css"></style>