<template>
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
</template>


<script>
import axios from "axios";

export default {
  name: 'Sucess',
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

      const response = await fetch("/v1/payment/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const json = await response.json();

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

<style src="../../assets/css/payment.css"></style>