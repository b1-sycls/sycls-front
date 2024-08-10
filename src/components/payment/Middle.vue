<template>
  <div class="loading-container">
    <div class="loader"></div>
    <p class="korean-text">결제 중...</p>
  </div>
</template>

<script>
import {axiosInstance} from '@/axios.js';

export default {
  name: 'Middle',
  data() {
    return {
      roundId: 0,
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
      console.log("asfadsfasdfsd" + data.roundId);
      this.contentId = data.contentId;
      this.contentTitle = data.contentTitle;
      this.location = data.location;
      this.startDate = data.startDate;
      this.startTime = data.startTime;
      this.endTime = data.endTime;
      this.seatInfos = data.seatInfos;
      this.totalPrice = data.totalPrice;
    } else {
      console.error("No data found in session storage");
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    this.roundId = urlParams.get("roundId");
    this.paymentKey = urlParams.get("paymentKey");
    this.orderId = urlParams.get("orderId");
    this.amount = urlParams.get("amount");

    this.confirm();
  },
  methods: {
    async confirm() {
      const requestData = {
        roundId: this.roundId,
        paymentKey: this.paymentKey,
        orderId: this.orderId,
        amount: this.amount,
      };
      try {
        const response = await axiosInstance.post("/v1/payment/confirm", requestData);
        const json = response.data;

        if (response.status !== 200) {
          // 결제 실패 비즈니스 로직
          window.location.href = `/payment/fail?message=${json.message}&code=${json.code}`;
        } else {
          this.$router.push({
            name: 'Success', query: {
              orderId: this.$route.query.orderId
            }
          });
        }
      } catch (error) {
        console.error("Error during confirmation:", error);
        if (error.response) {
          const {data} = error.response;
          window.location.href = `/payment/fail?message=${data.message}&code=${data.code}`;
        }
      }
    }
  }
};
</script>

<style src="../../assets/css/middle.css" scoped></style>

