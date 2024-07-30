<template>
  <p>Main 페이지입니다.</p>
  <button @click="goToAbout">결제 페이지</button>
  <button @click="goToSeat">좌석 선택 페이지</button>
</template>


<script>
import axios from "axios";

export default {
  name: 'MainPage',
  methods: {
    goToAbout() {
      this.$router.push({name: 'CheckOut'});
      // window.location.href = '/checkout';
    },
    goToSeat() {
      this.$router.push({name: 'Seat', query:{roundId: '1',contentTitle: '오페라 하우스', startDate: '2024-08-05 (월)'}});
    }
  },
  components: {},

  data() {
    return {}
  },
}
</script>

<style>
.imageSize {
  height: 1000px;
  width: 1800px;
}
</style>
