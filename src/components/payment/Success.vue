<template xmlns="http://www.w3.org/1999/html">
  <div class="box_section" style="width: 600px">
    <img width="100px" src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"/>
    <h2>결제를 완료했어요</h2>

    <div class="p-grid typography--p" style="margin-top: 50px">
      <div class="p-grid-col text--left"><b>결제금액</b></div>
      <div class="p-grid-col text--right" id="amount">
        {{ amount }}
      </div>
    </div>
    <div class="p-grid typography--p" style="margin-top: 10px">
      <div class="p-grid-col text--left"><b>주문번호</b></div>
      <div class="p-grid-col text--right" id="orderId">
        {{ orderId }}
      </div>
    </div>
    <div class="p-grid typography--p" style="margin-top: 10px">
      <div class="p-grid-col text--left"><b>paymentKey</b></div>
      <div class="p-grid-col text--right" id="paymentKey" style="white-space: initial; width: 250px">
        {{ paymentKey }}
      </div>
    </div>
  </div>

  <div class="box_section" style="width: 600px; text-align: left">
    <b>Response Data :</b>
    <div id="response" style="white-space: initial"></div>
  </div>

  <h1> ai</h1>

  <div class="ticket-info">
    <p><strong>공연명:</strong> title1</p>
    <p><strong>장소:</strong> locationPlace1</p>
    <p><strong>일시:</strong> 2024-07-31 14:23:22</p>
    <p><strong>선택 좌석:</strong> A_GRADE (A1), VIP (A3, A4)</p>
  </div>

  <div class="total">
    총 결제 금액: 25,000원
  </div>
  <div class="buttons">
    <router-link class="button" to="/">홈으로</router-link>
    <!--    <router-link class="button" to="/">내 티켓 보기</router-link>-->
  </div>
</template>


<script>
import {axiosInstance} from "@/axios.js";

export default {
  name: 'Success',
  data() {
    return {
      paymentKey: '',
      orderId: '',
      amount: ''
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);

    this.paymentKey = urlParams.get("paymentKey");
    this.orderId = urlParams.get("orderId");
    this.amount = urlParams.get("amount") + "원";

    try {
      const data = await this.confirm();
      this.$refs.response.innerHTML = `<pre>${JSON.stringify(data, null, 4)}</pre>`;
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    async confirm() {
      const urlParams = new URLSearchParams(window.location.search);
      const requestData = {
        paymentKey: urlParams.get("paymentKey"),
        orderId: urlParams.get("orderId"),
        amount: urlParams.get("amount"),
      };

      const response = await axiosInstance.post("/v1/payment/confirm", {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      console.log(response);
      // const json = await response.json();

      if (!response.ok) {
        // TODO: 결제 실패 비즈니스 로직을 구현하세요.
        console.log(json);
        window.location.href = `/v1/payment/fail?message=${json.message}&code=${json.code}`;
      }

      // TODO: 결제 성공 비즈니스 로직을 구현하세요.
      // console.log(json);
      return json;
    }
  }
};
</script>

<style src="../../assets/css/success.css" scoped></style>