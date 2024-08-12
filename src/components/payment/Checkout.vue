<template>
  <div class="wrapper">
    <div class="container">
      <h1>에티켓(everyTicket)</h1>
      <div class="event">
        <p><strong>공연명:</strong> {{ contentTitle }}</p>
        <p><strong>장소:</strong> {{ location }}</p>
        <p><strong>일시:</strong> {{ startDate }} {{ startTime }} ~ {{ endTime }}</p>
        <p><strong>선택 좌석:</strong>
          <span v-for="(seatInfo, index) in seatInfos" :key="index">
            <template v-if="index > 0">, </template>
            {{ seatInfo.seatGradeType }}
            <template v-if="seatInfo.seatCodes.length > 1">
              ({{ seatInfo.seatCodes.join(', ') }})
            </template>
            <template v-else>
              ({{ seatInfo.seatCodes[0] }})
            </template>
          </span>
        </p>
      </div>
      <div class="total-price">총 결제 금액: ₩{{ totalPrice }}</div>
    </div>
    <div class="box_section" style="padding: 40px 30px 50px 30px; margin-top: 30px; margin-bottom: 50px">
      <!-- 결제 UI -->
      <div id="payment-method"></div>
      <!-- 이용약관 UI -->
      <div id="agreement"></div>
      <!-- 결제하기 버튼 -->
      <div class="result wrapper">
        <button class="button" id="payment-button" style="margin-top: 30px">
          결제하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { axiosInstance } from "@/axios.js";

export default {
  name: 'CheckOut',
  data() {
    return {
      contentId: '',
      roundId: '',
      contentTitle: '',
      description: '',
      location: '',
      contentRoundId: '',
      startDate: '',
      startTime: '',
      endTime: '',
      seatInfos: [],
      totalPrice: 0
    };
  },
  methods: {
    async fetchClientKey() {
      try {
        const response = await axiosInstance.post('/v1/payment/client-key');
        return response.data.data;
      } catch (error) {
        console.error("클라이언트 키를 가져오는 데 실패했습니다:", error);
        alert("클라이언트 키를 가져오는 데 실패했습니다");
        location.href = "/";
        throw error;
      }
    },
    async fetchConcertAndRound() {
      try {
        const roundId = this.$route.query.roundId;
        const response = await axiosInstance.get(`/v1/rounds/${roundId}`);
        const data = response.data.data;
        this.roundId = roundId;
        this.contentId = data.contentId;
        this.contentTitle = `${data.contentTitle} 회차( ${data.sequence} )`;
        this.description = data.description;
        this.location = data.location;
        this.contentRoundId = data.roundId;
        this.startDate = data.startDate;
        this.startTime = data.startTime;
        this.endTime = data.endTime;

        // sessionStorage에 데이터 저장
        sessionStorage.setItem('contentData', JSON.stringify({
          roundId: this.roundId,
          contentId: this.contentId,
          contentTitle: this.contentTitle,
          location: this.location,
          startDate: this.startDate,
          startTime: this.startTime,
          endTime: this.endTime,
          seatInfos: this.seatInfos,
          totalPrice: this.totalPrice
        }));
      } catch (error) {
        console.error("공연 및 회차 정보를 가져오는 데 실패했습니다:", error);
      }
    },
    async fetchReservationInfo() {
      try {
        const roundId = this.$route.query.roundId;
        const response = await axiosInstance.get(`/v1/rounds/${roundId}/reservations/detail`);
        this.seatInfos = response.data.data.seatInfos;

        if (!this.seatInfos || this.seatInfos.length === 0) {
          alert("예약 정보가 없습니다.");
          history.go(-1);
        }

        // 총 결제 금액 계산
        this.totalPrice = this.seatInfos.reduce((total, seat) => total + (seat.price * seat.quantity), 0);
      } catch (error) {
        console.error("예약 정보를 가져오는 데 실패했습니다:", error.response?.data?.message || error.message);
      }
    },
    async main() {
      const userInfo = await this.fetchClientKey();
      await this.fetchReservationInfo();
      await this.fetchConcertAndRound();

      const button = document.getElementById("payment-button");
      const amount = {
        currency: "KRW",
        value: this.totalPrice,
      };

      const customerKey = this.generateRandomString();
      const tossPayments = TossPayments(userInfo.clientKey);

      const widgets = tossPayments.widgets({
        customerKey,
      });

      await widgets.setAmount(amount);

      await widgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });

      await widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" });

      button.addEventListener("click", async () => {
        await widgets.requestPayment({
          orderId: this.generateRandomString(),
          orderName: "에티켓(EveryTicket)",
          successUrl: `${window.location.origin}/payment/middle?roundId=${this.roundId}`,  // 수정된 부분
          failUrl: `${window.location.origin}/payment/fail`,
          customerEmail: userInfo.email,
          customerName: userInfo.username,
          customerMobilePhone: userInfo.phoneNumber,
        });
      });
    },
    generateRandomString() {
      return [...crypto.getRandomValues(new Uint8Array(10))]
          .map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 20);
    }
  },
  async mounted() {
    await this.main();
  }
};
</script>

<style src="../../assets/css/payment.css" scoped></style>
