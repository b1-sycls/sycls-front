<template>
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
            <div v-if="!seat" class="spacer"></div> <!-- seat가 undefined일 때 처리 -->
            <div v-else
                 class="seat"
                 :class="{ selected: isSelected(seat.seatCode), unavailable: !seat.seatStatusYn }"
                 @click="toggleSeat(seat.seatCode)">
              {{ seat.seatCode }}
            </div>
          </template>
        </div>
      </div>
      <div class="console">CONSOLE</div>
      <div class="zoom-controls">
        <button @click="zoomIn">+</button>
        <button @click="zoomOut">-</button>
      </div>
    </div>
    <div class="info">
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: #c0a080;"></div>
          <span>일반</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #4CAF50;"></div>
          <span>선택됨</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: gray;"></div>
          <span>선택 불가</span>
        </div>
        <div>선택된 좌석: {{ selectedSeats.length }}석</div>
      </div>
      <div>
        <span>전체 {{ totalCount }}석</span>
      </div>
    </div>
    <div id="selectedSeats">
      선택된 좌석: {{ selectedSeats.join(', ') }}
      <button class="button" @click="confirmSelection">좌석 선택 완료</button>
    </div>
    <div v-if="selectedSeatDetails.length > 0" class="selected-seats-info">
      <h3>선택된 좌석 정보</h3>
      <ul>
        <li v-for="(detail, index) in selectedSeatDetails" :key="index">
          좌석 코드: {{ detail.seatCode }}, 등급: {{ detail.seatGrade }}, 가격: {{ detail.seatPrice }}원
        </li>
      </ul>
      <div class="total-price">
        총 금액: {{ totalSelectedPrice.toLocaleString() }}원
      </div>
    </div>
  </div>
</template>

<script>
import { axiosInstance } from "@/axios.js";

export default {
  name: 'Seat',
  data() {
    return {
      seatLayout: [],
      totalCount: 0,
      selectedSeats: [],
      selectedSeatDetails: [],
      totalSelectedPrice: 0,
      currentZoom: 1,
      zoomStep: 0.1,
      maxSeats: 4 // 추가된 변수
    };
  },
  methods: {
    async fetchSeatInfo() {
      const roundId = this.$route.query.roundId;
      const response = await axiosInstance.get(`/v1/seat-grades?roundId=${roundId}`);
      return response.data.data;
    },
    async fetchReservationLog() {
      const roundId = this.$route.query.roundId;
      const response = await axiosInstance.get(`/v1/rounds/${roundId}/reservations/reserve`);
      return response.data.data;
    },
    async fetchOccupiedSeat() {
      const roundId = this.$route.query.roundId;
      const response = await axiosInstance.get(`/v1/rounds/${roundId}/reservations/occupied`);
      return response.data.data;
    },
    async main() {
      const roundId = this.$route.query.roundId;
      const seatRes = await this.fetchSeatInfo();
      const reservationRes = await this.fetchReservationLog();
      if(reservationRes.reservationIds.length !== 0){
        if(confirm("이전에 예매 진행 중이던 자리가 있습니다.\n계속하시겠습니까?")){
          this.$router.push({ name: 'CheckOut', query:{roundId: roundId}});
        }else{
          await axiosInstance.post(`/v1/reservations/release`, {
            reservationIds: reservationRes.reservationIds,
          });
        }
      }
      const seatGradeList = seatRes.seatGradeList;
      const occupied = await this.fetchOccupiedSeat();
      const layout = [];
      seatGradeList.forEach(seat => {
        occupied.seatGradeIds.forEach(id => {
          if(seat.seatGradeId === id){
            seat.seatStatusYn = false;
          }
        })
        const rowIndex = seat.seatCode.charCodeAt(0) - 65;
        const seatIndex = parseInt(seat.seatCode.slice(1)) - 1;

        if (!layout[rowIndex]) {
          layout[rowIndex] = [];
        }

        layout[rowIndex][seatIndex] = seat;
      });

      this.seatLayout = layout.map(row => row.map(seat => seat ? seat : 0));
      this.totalCount = seatRes.totalCount;
    },
    isSelected(seatCode) {
      return this.selectedSeats.includes(seatCode.toString());
    },
    toggleSeat(seatCode) {
      seatCode = seatCode.toString();
      const seat = this.findSeat(seatCode);
      if (seat && seat.seatStatusYn) {
        if (this.selectedSeats.includes(seatCode)) {
          this.selectedSeats = this.selectedSeats.filter(code => code !== seatCode);
          this.selectedSeatDetails = this.selectedSeatDetails.filter(detail => detail.seatCode !== seatCode);
          this.totalSelectedPrice -= seat.seatGradePrice;
        } else {
          if (this.selectedSeats.length < this.maxSeats) {
            this.selectedSeats.push(seatCode);
            this.selectedSeatDetails.push({
              seatId: seat.seatId, // seatId 추가
              seatCode: seat.seatCode,
              seatGrade: seat.seatGradeType,
              seatPrice: seat.seatGradePrice.toLocaleString()
            });
            this.totalSelectedPrice += seat.seatGradePrice;
          } else {
            alert(`최대 ${this.maxSeats}개의 좌석만 선택할 수 있습니다.`);
          }
        }
      }
    },
    findSeat(seatCode) {
      for (const row of this.seatLayout) {
        for (const seat of row) {
          if (seat && seat.seatCode === seatCode) {
            return seat;
          }
        }
      }
      return null;
    },
    zoomIn() {
      this.currentZoom += this.zoomStep;
      this.applyZoom();
    },
    zoomOut() {
      if (this.currentZoom > this.zoomStep) {
        this.currentZoom -= this.zoomStep;
        this.applyZoom();
      }
    },
    applyZoom() {
      document.getElementById('seats').style.transform = `scale(${this.currentZoom})`;
    },
    async confirmSelection() {
      if (this.selectedSeats.length > 0) {
        try {
          alert(`선택된 좌석: ${this.selectedSeats.join(', ')}\n예매를 진행합니다.`);
          const roundId = this.$route.query.roundId;
          const seatGradeIds = this.selectedSeatDetails.map(detail => detail.seatId); // seatId 사용
          await axiosInstance.post('/v1/reservations/reserve', {
            roundId: roundId,
            seatGradeIds: seatGradeIds
          });
          this.$router.push({ name: 'CheckOut', query:{roundId: roundId}});
        } catch (error) {
          console.error('요청 중 오류 발생:', error);
          if(error.response.data.message === "이미 취소 된 예매 정보입니다."){
            alert('이미 예매 중이거나 매진된 좌석입니다.\n새로고침 후 다시 시도해주세요.');
          }else{
            alert('예매에 실패했습니다.\n다시 시도해주세요.');
          }

        }
      } else {
        alert('좌석을 선택해주세요.');
      }
    }
  },
  async mounted() {
    await this.main();
  }
};
</script>

<style src="../../assets/css/seat.css" scoped></style>
