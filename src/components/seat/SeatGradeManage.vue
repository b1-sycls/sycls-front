<template>
  <div class="nav-bar">
    <router-link to="/member-manage" class="nav-button">회원관리</router-link>
    <router-link to="/place/placeManage" class="nav-button">공연장관리</router-link>
    <router-link to="/manage/category" class="nav-button">카테고리관리</router-link>
    <router-link to="/manage" class="nav-button">공연관리</router-link>
    <button @click="logout" class="nav-button">로그아웃</button>
  </div>
  <div id="app" class="container">
    <div class="header">
      <span class="title">{{ $route.query.contentTitle }}</span>
      <span class="date">공연일: {{ $route.query.startDate }}</span>
    </div>
    <div class="seating-chart">
      <div class="row">무대</div>
      <div id="seats">
        <div v-for="(row, rowIndex) in seatLayout" :key="rowIndex" class="row">
          <template v-for="(seat, seatIndex) in row" :key="seatIndex">
            <div v-if="seat === 0" class="spacer"></div>
            <div v-else
                 class="seat"
                 :class="{ selected: isSelected(seat.seatCode), unavailable: seat.seatGradeStatus && seat.seatGradeStatus !== 'ENABLE' }"
                 @click="toggleSeat(seat)">
              {{ seat.seatCode }}
            </div>
          </template>
        </div>
      </div>
      <div class="console">CONSOLE</div>
    </div>
    <div class="info">
      <div>
        <span>전체 {{ maxSeat }}석</span> / <span>현재 {{ seatCount }}석</span>
      </div>
      <div v-if="selectedSeat">
        <p>좌석 코드: {{ selectedSeat.code }}</p>
        <p v-if="selectedSeat.seatGradeType">좌석 등급: {{ selectedSeat.seatGradeType }}</p>
        <p v-if="selectedSeat.seatGradePrice">좌석 가격: {{ selectedSeat.seatGradePrice }}</p>
      </div>
    </div>
    <div id="selectedSeats">
      <div class="management-controls">
        <button class="button" :disabled="!selectedSeat" @click="showModal('추가')">좌석 등급 추가</button>
        <button class="button" :disabled="!selectedSeat || !selectedSeat.seatGradeType" @click="showModal('수정')">좌석 등급 수정</button>
        <button class="button" :disabled="!selectedSeat" @click="handleDelete">좌석 등급 삭제</button>
        <button class="button" @click="handleCompleteGrades">좌석 등급 설정 완료</button>
      </div>
    </div>

    <!-- 모달 창 -->
    <div v-if="showModalFlag" class="modal-overlay">
      <div class="modal-content">
        <h3>좌석 등급 {{ modalAction }}하기</h3>
        <label for="seatCode">좌석 코드:</label>
        <p id="seatCode">{{ modalSeatCode }}</p>
        <label for="seatGrade">좌석 등급:</label>
        <select id="seatGrade" v-model="modalSeatGrade">
          <option value="VIP">VIP</option>
          <option value="R">ROYAL</option>
          <option value="S">SUPERIOR</option>
          <option value="A">A_GRADE</option>
        </select>
        <label for="seatPrice">가격:</label>
        <input id="seatPrice" v-model="modalSeatPrice" placeholder="가격을 입력하세요" />
        <div class="modal-buttons">
          <button class="button" @click="handleModalAction">확인</button>
          <button class="button" @click="closeModal">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { axiosAdminInstance } from "@/axios.js";
import {logoutAdminUser} from "@/utils.js";

export default {
  name: 'SeatGradeManage',
  data() {
    return {
      seatLayout: [],
      selectedSeat: null,
      maxSeat: 0,
      seatCount: 0,
      showModalFlag: false,
      modalAction: '',
      modalSeatCode: '',
      modalSeatGrade: '',
      modalSeatPrice: ''
    };
  },
  methods: {
    async fetchSeatInfo() {
      const placeId = this.$route.query.placeId;
      const response = await axiosAdminInstance.get(`/v1/places/${placeId}/seats`);
      return response.data.data;
    },
    async fetchSeatGrades() {
      const roundId = this.$route.query.roundId;
      const response = await axiosAdminInstance.get(`/v1/seat-grades`, {
        params: { roundId: roundId }
      });
      return response.data.data;
    },
    async main() {
      const seatRes = await this.fetchSeatInfo();
      const seatGradesRes = await this.fetchSeatGrades();
      const seatList = seatRes.seatList;
      const seatGradesList = seatGradesRes.seatGradeList;

      const layout = [];
      seatList.forEach(seat => {
        const rowIndex = seat.code.charCodeAt(0) - 65;
        const seatIndex = parseInt(seat.code.slice(1)) - 1;

        if (!layout[rowIndex]) {
          layout[rowIndex] = [];
        }

        const seatGradeInfo = seatGradesList.find(grade => grade.seatId === seat.seatId);
        const seatWithGrade = { ...seat, ...seatGradeInfo };

        layout[rowIndex][seatIndex] = seatWithGrade;
      });

      this.seatLayout = layout.map(row => row.map(seat => seat ? seat : 0));
      this.maxSeat = this.$route.query.maxSeat;
      this.seatCount = seatGradesList.filter(seatGrade => seatGrade.seatGradeStatus === 'ENABLE').length;
    },
    isSelected(code) {
      if (code === undefined || code === null) {
        return false;
      }
      return this.selectedSeat && this.selectedSeat.seatCode === code.toString();
    },
    toggleSeat(seat) {
      if (!this.selectedSeat || this.selectedSeat.seatCode !== seat.seatCode) {
        this.selectedSeat = seat;
      } else {
        this.selectedSeat = null;
      }
    },
    showModal(action) {
      if (!this.selectedSeat) {
        alert('좌석을 선택해 주세요.');
        return;
      }

      this.modalAction = action;
      this.modalSeatCode = this.selectedSeat.code;
      this.modalSeatGrade = '';
      this.modalSeatPrice = '';
      this.showModalFlag = true;

      if (action === '수정' && this.selectedSeat) {
        this.modalSeatGrade = this.selectedSeat.seatGradeType;
        this.modalSeatPrice = this.selectedSeat.seatGradePrice;
      }
    },
    closeModal() {
      this.showModalFlag = false;
    },
    async logout() {
      const success = await logoutAdminUser();
      if (success) {
        this.isLoggedIn = false;
        this.$router.push({ name: 'ManageLogin' });
      }
    },
    async handleModalAction() {
      // Ensure modalSeatGrade and modalSeatPrice are strings
      const seatGrade = this.modalSeatGrade;
      const seatPrice = this.modalSeatPrice;

      // Check if seatGrade is empty
      if (!seatGrade) {
        alert('좌석 등급을 선택해주세요.');
        return;
      }

      // Check if seatPrice is empty
      if (!seatPrice) {
        alert('좌석 가격을 입력해주세요.');
        return;
      }

      switch (this.modalAction) {
        case '추가':
          if (this.selectedSeat){
            await this.addSeat(this.selectedSeat.seatId ,seatGrade, seatPrice);
            break;
          }
          break;
        case '수정':
          if (this.selectedSeat) {
            await this.modifySeat(this.selectedSeat.seatGradeId, seatGrade, seatPrice);
          }
          break;
        case '삭제':
          if (this.selectedSeat) {
            await this.removeSeat(this.selectedSeat.seatGradeId);
          }
          break;
      }
      this.closeModal();
    },
    async addSeat(seatId, seatGrade, seatPrice) {
      try {
        if (this.seatCount >= this.maxSeat) {
          alert("좌석등급이 이미 최대로 설정되었습니다.");
          return;
        }
        const roundId = this.$route.query.roundId;
        await axiosAdminInstance.post(`/v1/seat-grades`, {
          roundId: roundId,
          seatGradeType: seatGrade,
          seatId: seatId,
          price: seatPrice
        });
        alert(`추가되었습니다.`);
      } catch (error) {
        alert(error.response.data.message);
      }
      await this.main();
    },
    async modifySeat(seatGradeId, seatGrade, seatPrice) {
      try {
        await axiosAdminInstance.patch(`/v1/seat-grades`, {
          roundId: this.$route.query.roundId,
          seatGradeId: seatGradeId,
          seatGradeType: seatGrade,
          price: seatPrice
        });
        alert(`수정되었습니다.`);
      } catch (error) {
        alert(error.response.data.message);
      }
      await this.main();
    },
    async removeSeat(seatGradeId) {
      try {
        const roundId = this.$route.query.roundId;
        await axiosAdminInstance.delete(`/v1/rounds/${roundId}/seat-grades/${seatGradeId}`);
        alert('삭제되었습니다.');
      } catch (error) {
        alert(error.response.data.message);
      }
      await this.main();
    },
    handleDelete() {
      if (!this.selectedSeat) {
        alert('삭제할 좌석을 선택해 주세요.');
        return;
      }

      if (confirm('선택한 좌석을 삭제하시겠습니까?')) {
        this.removeSeat(this.selectedSeat.seatId);
      }
    },
    async handleCompleteGrades() {
      try {
        // 좌석 등급 설정 완료 처리 로직
        await axiosAdminInstance.post('/v1/complete-seat-grades', { /* 필요한 데이터 */ });
        alert('좌석 등급 설정이 완료되었습니다.');
        await this.main();
      } catch (error) {
        alert(error.response.data.message);
      }
    }
  },
  async mounted() {
    await this.main();
  }
};
</script>

<style src="../../assets/css/seatGradeManage.css" scoped></style>
