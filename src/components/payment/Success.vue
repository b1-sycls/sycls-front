<template>
  <div>
    <div class="box_section" style="width: 600px">
      <img width="100px" src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"/>
      <h2>결제를 완료했어요</h2>
      <!--    TODO-->
      <!--      <div class="p-grid typography&#45;&#45;p" style="margin-top: 10px">-->
      <!--        <div class="p-grid-col text&#45;&#45;left"><b>paymentKey</b></div>-->
      <!--        <div class="p-grid-col text&#45;&#45;right" id="paymentKey" style="white-space: initial; width: 250px">{{-->
      <!--            paymentKey-->
      <!--          }}-->
      <!--        </div>-->
      <!--    </div>-->
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
        총 결제 금액: {{ amount }}원
      </div>

      <div class="buttons">
        <a href="https://websim.creativeengine.ai/everyTicket/" class="button">홈으로</a>
        <a href="https://websim.creativeengine.ai/everyTicket/mytickets" class="button">내 티켓 보기</a>
      </div>
    </div>
<!--    TODO-->
    <!--  <div class="box_section" style="width: 600px; text-align: left">-->
    <!--    <b>Response Data :</b>-->
    <!--    <div id="response" style="white-space: initial">-->
    <!--      <pre>{{ responseData }}</pre>-->
    <!--    </div>-->
    <!--  </div>-->
  </div>
</template>

<script>
import {axiosInstance} from '@/axios.js';

export default {
  data() {
    return {
      contentId: '',
      contentTitle: '',
      location: '',
      startDate: '',
      startTime: '',
      endTime: '',
      seatInfos: [],
      totalPrice: 0
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
      // sessionStorage에서 데이터 삭제
      sessionStorage.removeItem('contentData');
    } else {
      console.error("No data found in session storage");
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    this.paymentKey = urlParams.get("paymentKey");
    this.orderId = urlParams.get("orderId");
    this.amount = urlParams.get("amount");

    this.confirm();
  },
  methods: {
    async confirm() {
      const requestData = {
        paymentKey: this.paymentKey,
        orderId: this.orderId,
        amount: this.amount,
      };

      try {
        const response = await axiosInstance.post("/v1/payment/confirm", requestData);
        const json = response.data;

        if (response.status !== 200) {
          // 결제 실패 비즈니스 로직
          console.log(json);
          window.location.href = `/payment/fail?message=${json.message}&code=${json.code}`;
        } else {
          // 결제 성공 비즈니스 로직
          this.responseData = JSON.stringify(json, null, 4);
        }
      } catch (error) {
        console.error("Error during confirmation:", error);
        if (error.response) {
          const {data} = error.response;
          window.location.href = `/payment/fail?message=${data.message}&code=${data.code}`;
        }
      }
    }
    ,
    navigateTo(url) {
      window.location.href = url;
    }
  }
};
</script>

<style src="../../assets/css/success.css" scoped></style>

