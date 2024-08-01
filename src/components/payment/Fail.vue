<template>
  <div id="info" class="box_section" style="width: 600px">
    <img width="100px" src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"/>
    <h2>결제를 실패했어요</h2>

    <div class="p-grid typography--p" style="margin-top: 50px">
      <div class="p-grid-col text--left"><b>에러메시지</b></div>
      <div class="p-grid-col text--right" id="message"></div>
    </div>
    <div class="p-grid typography--p" style="margin-top: 10px">
      <div class="p-grid-col text--left"><b>에러코드</b></div>
      <div class="p-grid-col text--right" id="code"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UrlParamsComponent',
  data() {
    return {
      code: '',
      message: ''
    };
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.code = urlParams.get("code");
    this.message = urlParams.get("message");
  }
};
</script>

<style src="../../assets/css/payment.css" scoped></style>