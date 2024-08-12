<template>
  <div class="nav-bar">
    <router-link class="nav-button" to="/place/placeManage">공연장관리</router-link>
    <router-link class="nav-button" to="/manage/category">카테고리관리</router-link>
    <router-link class="nav-button" to="/manage">공연관리</router-link>
    <button class="nav-button" @click="logout">로그아웃</button>
  </div>
  <div id="app" class="container">
    <div class="header">
      <span class="title">{{ $route.query.contentTitle }}</span>
      <span class="date">공연일: {{ $route.query.startDate }}</span>
    </div>
    <div class="seating-chart">
      <div class="row">무대</div>
      <div id="seats">
        <div v-for="(row, rowIndex) in seatLayout" :key="rowIndex" class="seat-row">
          <template v-for="(seat, seatIndex) in row" :key="seatIndex">
            <div v-if="seat === 0" class="spacer"></div>
            <div v-else-if="seat && seat.code"
                 :class="{ selected: isSelected(seat.code), unavailable: seat.seatGradeStatus && seat.seatGradeStatus !== 'ENABLE' }"
                 class="seat"
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
      <div v-if="selectedSeats.length">
        <p>선택된 좌석들:</p>
        <ul>
          <li v-for="seat in selectedSeats" :key="seat.code">
            {{ seat.code }} - {{ seat.seatGradeType || '등급 없음' }} / {{ seat.seatGradePrice || '가격 없음' }}
          </li>
        </ul>
      </div>
    </div>
    <div id="selectedSeats">
      <div class="management-controls">
        <button :disabled="isAddButtonDisabled" class="button" @click="showModal('추가')">좌석 등급 추가</button>
        <button :disabled="!selectedSeats.length || !selectedSeats.some(seat => seat.seatGradeId)" class="button"
                @click="showModal('수정')">좌석 등급 수정
        </button>
        <button :disabled="!selectedSeats.length || !selectedSeats.some(seat => seat.seatGradeId)" class="button" @click="handleDelete">좌석 등급 삭제</button>
      </div>
    </div>

    <!-- 모달 창 -->
    <div v-if="showModalFlag" class="modal-overlay">
      <div class="modal-content">
        <h3>좌석 등급 {{ modalAction }}하기</h3>
        <p>선택된 좌석들: {{ modalSeatCodes.join(', ') }}</p>
        <label for="seatGrade">좌석 등급:</label>
        <select id="seatGrade" v-model="modalSeatGrade">
          <option value="VIP">VIP</option>
          <option value="R">ROYAL</option>
          <option value="S">SUPERIOR</option>
          <option value="A">A_GRADE</option>
        </select>
        <label for="seatPrice">가격:</label>
        <input id="seatPrice" v-model="modalSeatPrice" placeholder="가격을 입력하세요"/>
        <div class="modal-buttons">
          <button class="button" @click="handleModalAction">확인</button>
          <button class="button" @click="closeModal">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";
import {logoutAdminUser} from "@/utils.js";

export default {
  name: 'SeatGradeManage',
  data() {
    return {
      seatLayout: [],
      selectedSeats: [],
      maxSeat: 0,
      seatCount: 0,
      showModalFlag: false,
      modalAction: '',
      modalSeatCodes: [],
      modalSeatGrade: '',
      modalSeatPrice: ''
    };
  },
  computed: {
    isAddButtonDisabled() {
      return !this.selectedSeats.length || this.selectedSeats.some(seat => seat.seatGradeId);
    }
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
        params: {roundId: roundId}
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
        const seatWithGrade = {...seat, ...seatGradeInfo};

        layout[rowIndex][seatIndex] = seatWithGrade || {code: 'N/A'}; // 빈 객체로 초기화
      });

      this.seatLayout = layout.map(row => row.map(seat => seat || {code: 'N/A'}));
      this.maxSeat = this.$route.query.maxSeat;
      this.seatCount = seatGradesList.filter(
          seatGrade => seatGrade.seatGradeStatus === 'ENABLE').length;
    },
    isSelected(code) {
      return this.selectedSeats.some(seat => seat.code === code);
    },
    toggleSeat(seat) {
      if (seat && seat.code) {
        const index = this.selectedSeats.findIndex(selectedSeat => selectedSeat.code === seat.code);
        if (index !== -1) {
          this.selectedSeats.splice(index, 1);
        } else {
          this.selectedSeats.push(seat);
        }
      }
    },
    showModal(action) {
      if (!this.selectedSeats.length) {
        alert('좌석을 선택해 주세요.');
        return;
      }

      this.modalAction = action;
      this.modalSeatCodes = this.selectedSeats.map(seat => seat.code);
      this.modalSeatGrade = '';
      this.modalSeatPrice = '';
      this.showModalFlag = true;

      if (action === '수정' && this.selectedSeats.length) {
        this.modalSeatGrade = this.selectedSeats[0].seatGradeType;
        this.modalSeatPrice = this.selectedSeats[0].seatGradePrice;
      }
    },
    closeModal() {
      this.showModalFlag = false;
    },
    async logout() {
      const success = await logoutAdminUser(true);
      if (success) {
        this.isLoggedIn = false;
        this.$router.push({name: 'ManageLogin'});
      }
    },
    async handleModalAction() {
      const seatGrade = this.modalSeatGrade;
      const seatPrice = this.modalSeatPrice;

      if (!seatGrade) {
        alert('좌석 등급을 선택해주세요.');
        return;
      }

      if (!seatPrice) {
        alert('좌석 가격을 입력해주세요.');
        return;
      }

      switch (this.modalAction) {
        case '추가':
          const seatIds = this.selectedSeats.map(seat => seat.seatId).filter(id => id);
          if(seatIds.length){
            await this.addSeat(seatIds, seatGrade, seatPrice);
          }
          break;
        case '수정':
          const seatGradeIds = this.selectedSeats.map(seat => seat.seatGradeId).filter(id => id);
          if (seatGradeIds.length) {
            await this.modifySeats(seatGradeIds, seatGrade, seatPrice);
          } else {
            alert('수정할 좌석의 등급이 없습니다.');
          }
          break;
      }
      this.closeModal();
      this.selectedSeats = [];  // 작업 완료 후 선택된 좌석 초기화
    },
    async addSeat(seatIds, seatGrade, seatPrice) {
      try {
        if (this.seatCount >= this.maxSeat) {
          alert("좌석등급이 이미 최대로 설정되었습니다.");
          return;
        }
        const roundId = this.$route.query.roundId;
        await axiosAdminInstance.post(`/v1/seat-grades`, {
          roundId: roundId,
          seatGradeType: seatGrade,
          seatIdList: seatIds,
          price: seatPrice
        });
        alert(`추가되었습니다.`);
      } catch (error) {
        alert(error.response.data.message);
      }
      await this.main();
    },
    async modifySeats(seatGradeIdList, seatGrade, seatPrice) {
      try {
        const roundId = this.$route.query.roundId;
        await axiosAdminInstance.patch(`/v1/seat-grades`, {
          roundId: roundId,
          seatGradeIdList: seatGradeIdList,
          seatGradeType: seatGrade,
          price: seatPrice
        });
        alert(`수정되었습니다.`);
      } catch (error) {
        alert(error.response.data.message);
      }
      await this.main();
    },
    async removeSeats(seatGradeIdList) {
      try {
        const roundId = this.$route.query.roundId;
        await axiosAdminInstance.patch(`/v1/seat-grades/delete`, {
          roundId: roundId,
          seatGradeIdList: seatGradeIdList
        });
        alert('삭제되었습니다.');
      } catch (error) {
        alert(error.response.data.message);
      }
      this.selectedSeats = [];  // 작업 완료 후 선택된 좌석 초기화
      await this.main();
    },
    async handleDelete() {
      if (!this.selectedSeats.length) {
        alert('삭제할 좌석을 선택해 주세요.');
        return;
      }

      const seatGradeIdsToDelete = this.selectedSeats.map(seat => seat.seatGradeId).filter(id => id);

      if (seatGradeIdsToDelete.length === 0) {
        alert('삭제할 좌석의 등급이 없습니다.');
        return;
      }

      if (confirm('선택한 좌석들을 삭제하시겠습니까?')) {
        await this.removeSeats(seatGradeIdsToDelete);
      }
    }
    ,
  },
  async mounted() {
    await this.main();
    console.log('Seat Layout:', this.seatLayout); // 데이터 구조를 확인합니다.
  }
};
</script>

<style scoped src="../../assets/css/seatGradeManage.css"></style>
