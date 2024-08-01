<template>
  <div>
    <div class="box_section" style="width: 600px">
      <img width="100px" src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"/>
      <h2>결제를 완료했어요</h2>

      <div class="p-grid typography--p" style="margin-top: 50px">
        <div class="p-grid-col text--left"><b>결제금액</b></div>
        <div class="p-grid-col text--right" id="amount">{{ amount }}원</div>
      </div>
      <div class="p-grid typography--p" style="margin-top: 10px">
        <div class="p-grid-col text--left"><b>주문번호</b></div>
        <div class="p-grid-col text--right" id="orderId">{{ orderId }}</div>
      </div>
      <div class="p-grid typography--p" style="margin-top: 10px">
        <div class="p-grid-col text--left"><b>paymentKey</b></div>
        <div class="p-grid-col text--right" id="paymentKey" style="white-space: initial; width: 250px">{{
            paymentKey
          }}
        </div>
      </div>
    </div>

    <div class="box_section" style="width: 600px; text-align: left">
      <b>Response Data :</b>
      <div id="response" style="white-space: initial">
        <pre>{{ responseData }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosInstance} from '@/axios.js';

export default {
  data() {
    return {
      paymentKey: null,
      orderId: null,
      amount: null,
      responseData: ''
    };
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
    },
    navigateTo(url) {
      window.location.href = url;
    }
  }
};
</script>

<style src="../../assets/css/success.css" scoped></style>

