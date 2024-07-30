<template>
  <!-- 주문서 영역 -->
  <div class="wrapper">
    <div class="container">
      <h1>서윤조이스</h1>
      <div class="event">
        <div class="round-name">{{ contentTitle }}</div>
        <div class="content-description">
          공연 설명 : {{ description }}
        </div>
        <div class="content-description">
          공연 장소 : {{ location }}
        </div>
        <div class="content-description">
          공연 회차 : {{ sequence }}
        </div>
        <div class="content-description">
          공연 날짜 : {{ startDate }}
        </div>
        <div class="content-description">
          공연 시간 : {{ startTime }} - {{ endTime }}
        </div>
      </div>
      <div class="ticket-info">
        <div class="ticket-type">입장권 등급: {{ ticketType }}</div>
        <div class="ticket-price">가격: {{ ticketPrice }} / 1매</div>
        <div class="ticket-quantity">수량: {{ ticketQuantity }}매</div>
        <div class="ticket-seat">좌석 정보: {{ seatInfo }}</div>
        <div class="seat-info">
          TossPay와 카카오페이로 결제 부탁드립니다.
        </div>
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
import axiosInstance from "@/axios.js";

export default {
  name: 'CheckOut',
  data() {
    return {
      contentId: '1',
      contentTitle: 'title22',
      description: '공연설명2',
      location: '공연장소',
      roundId: '1',
      sequence: '1',
      startDate: '2024-07-29',
      startTime: '16:52:13',
      endTime: '16:52:13',
      totalPrice: '0'
    };
  },
  methods: {
    async fetchClientKey() {
      const response = (await axiosInstance.post('/v1/payment/client-key', null, {})).data;
      return response.data.clientKey;
    },
    async fetchConcertAndRound() {
      const response = (await axiosInstance.get('/v1/rounds/1', {})).data.data;

      // 데이터 업데이트
      this.contentId = response.contentId;
      this.contentTitle = response.contentTitle;
      this.description = response.description;
      this.location = response.location;
      this.roundId = response.roundId;
      this.sequence = response.sequence;
      this.startDate = response.startDate;
      this.startTime = response.startTime;
      this.endTime = response.endTime;
    },

    async main() {
      const button = document.getElementById("payment-button");
      const amount = {
        currency: "KRW",
        // value: this.totalPrice, // 총 결제 금액 설정
        value: 500000,
      };

      // 클라이언트 키 요청
      const clientKey = await this.fetchClientKey();
      const customerKey = this.generateRandomString();
      const tossPayments = TossPayments(clientKey);

      // 공연 및 회차 정보 조회
      await this.fetchConcertAndRound();

      const widgets = tossPayments.widgets({
        customerKey,
      });

      // 주문서의 결제 금액 설정
      await widgets.setAmount(amount);

      // 결제 UI 렌더링
      await widgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });

      // 이용약관 UI 렌더링
      await widgets.renderAgreement({selector: "#agreement", variantKey: "AGREEMENT"});

      // '결제하기' 버튼 누르면 결제창 띄우기
      button.addEventListener("click", async () => {
        await widgets.requestPayment({
          orderId: this.generateRandomString(),
          orderName: "서윤조이스",
          successUrl: window.location.origin + "/payment/success",
          failUrl: window.location.origin + "/payment/fail",
          customerEmail: "customer123@gmail.com",
          customerName: "김토스",
          customerMobilePhone: "01012341234",
        });
      });
    },
    generateRandomString() {
      return window.btoa(Math.random()).slice(0, 20);
    }
  },
  async mounted() {
    await this.main();
  }
};
</script>

<style src="../../assets/css/payment.css"></style>
