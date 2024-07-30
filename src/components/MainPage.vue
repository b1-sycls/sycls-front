<template>
  <p>Main 페이지입니다.</p>
  <button @click="goToAbout">공연 페이지</button>
</template>


<script>
import axios from "axios";

export default {
  name: 'MainPage',
  methods: {
    goToAbout() {
      this.$router.push({name: 'Content'});
      // window.location.href = '/checkout';
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