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
<!--    <div class="p-grid">-->
    <!--      <button class="button p-grid-col5"-->
    <!--              onclick="location.href='https://docs.tosspayments.com/guides/v2/payment-widget/integration';">-->
    <!--        연동 문서-->
    <!--      </button>-->
    <!--      <button class="button p-grid-col5" onclick="location.href='https://discord.gg/A4fRFXQhRu';"-->
    <!--              style="background-color: #e8f3ff; color: #1b64da">실시간 문의-->
    <!--      </button>-->
    <!--    </div>-->
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

<style src="../../assets/css/payment.css"></style>