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
            <div v-if="seat === 0" class="spacer"></div>
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
import {axiosInstance} from "@/axios.js";

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
      const response = await axiosInstance.get(`v1/seat-grades?roundId=${roundId}`);
      return response.data.data;
    },
    async main() {
      const seatRes = await this.fetchSeatInfo();
      console.log(seatRes);
      const seatGradeList = seatRes.seatGradeList;

      const layout = [];

      seatGradeList.forEach(seat => {
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
    confirmSelection() {
      if (this.selectedSeats.length > 0) {
        alert(`선택된 좌석: ${this.selectedSeats.join(', ')}\n예매를 진행합니다.`);
        this.$router.push({name: 'CheckOut'});
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

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.seating-chart {
  border: 1px solid #ddd;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}

.row {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}

.seat {
  width: 20px;
  height: 20px;
  background-color: #c0a080;
  margin: 2px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 8px;
  color: #333;
  transition: background-color 0.3s;
}

.seat.selected {
  background-color: #4CAF50;
  color: white;
}

.seat.unavailable {
  background-color: gray;
  color: white;
  cursor: not-allowed;
}

.console {
  text-align: center;
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  margin-top: 10px;
}

.info {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.legend {
  display: flex;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.legend-color {
  width: 15px;
  height: 15px;
  margin-right: 5px;
}

#selectedSeats {
  margin-top: 40px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-seats-info {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

.selected-seats-info h3 {
  margin: 0 0 10px 0;
}

.total-price {
  margin-top: 10px;
  font-weight: bold;
  text-align: right;
}

.button {
  background-color: #f0f0f0;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 20px;
}

.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
}

.zoom-controls button {
  width: 30px;
  height: 30px;
  font-size: 18px;
  margin-left: 5px;
  cursor: pointer;
}
</style>
