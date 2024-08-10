<template>
  <div>
    <div class="box_section" style="width: 600px">
    </div>
    <div class="success-container">
      <div class="success-icon">✔</div>
      <h1>결제가 완료되었습니다!</h1>

      <div class="ticket-info">
        <p><strong>주문번호:</strong> {{ orderId }}</p>
        <p><strong>공연명:</strong> {{ contentTitle }}</p>
        <p><strong>장소:</strong> {{ location }}</p>
        <p><strong>일시:</strong> {{ startDate }}</p>
        <p><strong></strong> {{ startDate }} {{ startTime }} ~ {{ endTime }}</p>
        <p><strong>선택 좌석:</strong>
          <span v-for="(seatInfo, index) in seatInfos" :key="index">
            <template v-if="index > 0">, </template>
            <p><strong>    {{ seatInfo.seatGradeType }}</strong></p>
            <template v-if="seatInfo.seatCodes.length > 1">({{ seatInfo.seatCodes.join(', ') }})</template>
            <template v-else>({{ seatInfo.seatCodes[0] }})</template>
          </span>
        </p>
      </div>
      <div class="total">
        총 결제 금액: {{ totalPrice }}원
      </div>
      <div class="buttons">
        <router-link to="/" class="button">홈으로</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosInstance} from '@/axios.js';

export default {
  data() {
    return {
      contentId: '',
      roundId: 0,
      contentTitle: '',
      location: '',
      startDate: '',
      startTime: '',
      endTime: '',
      seatInfos: [],
      totalPrice: 0,
      orderId: '',
    };
  },
  mounted() {
    const data = JSON.parse(sessionStorage.getItem('contentData'));
    if (data) {
      this.contentId = data.contentId;
      this.contentTitle = data.contentTitle;
      this.location = data.location;
      this.startDate = data.startDate;
      this.startTime = data.startTime;
      this.endTime = data.endTime;
      this.seatInfos = data.seatInfos;
      this.totalPrice = data.totalPrice;
      this.roundId = data.roundId;
      // seatInfos 내부의 reservationIds 추출
      const reservationIds = this.seatInfos.reduce((acc, seatInfo) => {
        return acc.concat(seatInfo.reservationIds);
      }, []);
      axiosInstance.post('/v1/payment/success', {
        roundId: this.roundId,
        orderId: this.orderId,
        price: this.totalPrice,
        seatGradeIds: reservationIds
      })
    } else {
      console.error("No data found in session storage");
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    this.orderId = urlParams.get("orderId");
  },
}
</script>

<style src="../../assets/css/success.css" scoped></style>

