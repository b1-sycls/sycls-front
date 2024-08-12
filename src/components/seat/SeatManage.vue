<template>
  <div class="nav-bar">
    <!--    <router-link class="nav-button" to="/member-manage">회원관리</router-link>-->
    <router-link class="nav-button" to="/place/placeManage">공연관리</router-link>
    <router-link class="nav-button" to="/manage/category">카테고리관리</router-link>
    <button class="nav-button" @click="logout">로그아웃</button>
  </div>
  <div id="app" class="container">
    <div class="header">
      <span class="title">{{ $route.query.placeName }}</span>
    </div>
    <div class="seating-chart">
      <div class="row">무대</div>
      <div id="seats">
        <div v-for="(row, rowIndex) in seatLayout" :key="rowIndex" class="row">
          <template v-for="(seat, seatIndex) in row" :key="seatIndex">
            <div v-if="seat"
                 :class="{ selected: isSelected(seat.code), unavailable: seat.status !== 'ENABLE' }"
                 class="seat"
                 @click="toggleSeat(seat)">
              {{ seat.code }}
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
    </div>
    <div id="selectedSeats">
      <div class="management-controls">
        <button class="button" @click="showModal('추가')">좌석 추가</button>
        <button class="button" @click="showModal('수정')">좌석 수정</button>
        <button class="button" @click="handleDelete">좌석 삭제</button>
      </div>
    </div>

    <!-- 모달 창 -->
    <div v-if="showModalFlag" class="modal-overlay">
      <div class="modal-content">
        <h3>좌석 {{ modalAction }}하기</h3>

        <!-- 행 선택 (A~Z) -->
        <label for="seatRow">행 선택:</label>
        <select v-model="modalSeatRow" id="seatRow">
          <option v-for="char in alphabet" :key="char" :value="char">{{ char }}</option>
        </select>

        <!-- 좌석 번호 입력 -->
        <label for="seatNumber">좌석 번호:</label>
        <input id="seatNumber" v-model="modalSeatNumber" type="number" min="1" placeholder="좌석 번호 입력"/>

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
import { logoutAdminUser } from "@/utils.js";

export default {
  name: 'Seat',
  data() {
    return {
      seatLayout: [],
      selectedSeat: null,
      maxSeat: 0,
      seatCount: 0,
      showModalFlag: false,
      modalAction: '',
      modalSeatRow: 'A',       // 선택된 행
      modalSeatNumber: 1,      // 입력된 좌석 번호
      alphabet: [...Array(26)].map((_, i) => String.fromCharCode(65 + i)) // A~Z까지 알파벳 생성
    };
  },
  methods: {
    async fetchSeatInfo() {
      const placeId = this.$route.query.placeId;
      const response = await axiosAdminInstance.get(`/v1/places/${placeId}/seats`);
      return response.data.data;
    },
    async main() {
      const seatRes = await this.fetchSeatInfo();
      const seatList = seatRes.seatList;

      const layout = [];

      seatList.forEach(seat => {
        const rowIndex = seat.code.charCodeAt(0) - 65;
        const seatIndex = parseInt(seat.code.slice(1)) - 1;

        if (!layout[rowIndex]) {
          layout[rowIndex] = [];
        }

        layout[rowIndex][seatIndex] = seat || {seatCode: 'N/A'};
      });

      this.seatLayout = layout.map(row => row.map(seat => seat || {seatCode: 'N/A'}));

      this.maxSeat = this.$route.query.maxSeat;
      this.seatCount = seatRes.totalSeats;
    },
    isSelected(code) {
      return this.selectedSeat && this.selectedSeat.code === (code || '').toString();
    },
    toggleSeat(seat) {
      if (seat && seat.status === 'ENABLE') {
        if (!this.selectedSeat || this.selectedSeat.code !== seat.code) {
          this.selectedSeat = seat;
        } else {
          this.selectedSeat = null;
        }
      }
    },
    showModal(action) {
      if (action !== '추가' && !this.selectedSeat) {
        alert(`수정할 좌석을 선택해 주세요.`);
        return;
      }

      this.modalAction = action;
      this.modalSeatRow = 'A';
      this.modalSeatNumber = 1;
      this.showModalFlag = true;

      if (action === '수정' && this.selectedSeat) {
        this.modalSeatRow = this.selectedSeat.code.charAt(0);  // 선택된 좌석 코드의 행을 가져옴
        this.modalSeatNumber = parseInt(this.selectedSeat.code.slice(1));  // 좌석 번호 부분을 가져옴
      }
    },
    closeModal() {
      this.showModalFlag = false;
    },
    async handleModalAction() {
      if (!this.modalSeatNumber || this.modalSeatNumber <= 0) {
        alert('유효한 좌석 번호를 입력해주세요.');
        return;
      }

      // 선택된 행과 좌석 번호를 결합하여 seatCode 생성
      const seatCode = `${this.modalSeatRow}${this.modalSeatNumber}`;

      switch (this.modalAction) {
        case '추가':
          await this.addSeat(seatCode);
          break;
        case '수정':
          if (this.selectedSeat) {
            await this.modifySeat(this.selectedSeat.seatId, seatCode);
          }
          break;
        case '삭제':
          if (this.selectedSeat) {
            await this.removeSeat(this.selectedSeat.seatId);
          }
          break;
      }
      this.closeModal();
    },
    async addSeat(seatCode) {
      try {
        if (this.seatCount >= this.maxSeat) {
          alert("공연장에 좌석이 이미 최대로 설정되었습니다.");
          return;
        }
        const placeId = this.$route.query.placeId;
        await axiosAdminInstance.post(`/v1/places/${placeId}/seats`, {code: seatCode});
        alert(`좌석 ${seatCode}가 추가되었습니다.`);
      } catch (error) {
        alert(error.response.data.message);
      }
      await this.main();
    },
    async modifySeat(seatId, seatCode) {
      try {
        await axiosAdminInstance.patch(`/v1/seats/${seatId}`,
            {placeId: this.$route.query.placeId, code: seatCode});
        alert(`좌석 ${seatCode}가 수정되었습니다.`);
      } catch (error) {
        alert(error.response.data.message);
      }
      await this.main();
    },
    async removeSeat(seatId) {
      try {
        const placeId = this.$route.query.placeId;
        await axiosAdminInstance.delete(`/v1/places/${placeId}/seats/${seatId}`);
        alert(`좌석이 삭제되었습니다.`);
      } catch (error) {
        alert(error.response.data.message);
      }
      await this.main();
    },
    async logout() {
      const success = await logoutAdminUser(true);
      if (success) {
        this.isLoggedIn = false;
        this.$router.push({name: 'ManageLogin'});
      }
    },
    handleDelete() {
      if (!this.selectedSeat) {
        alert('삭제할 좌석을 선택해 주세요.');
        return;
      }

      if (confirm('선택한 좌석을 삭제하시겠습니까?')) {
        this.removeSeat(this.selectedSeat.seatId);
      }
    }
  },
  async mounted() {
    await this.main();
  }
};
</script>

<style scoped src="../../assets/css/seatManage.css"></style>
