<template>
  <div>
    <p>카카오 로그인 처리 중...</p>
  </div>
</template>

<script>
export default {
  name: 'KakaoCallback',
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (accessToken && refreshToken) {
      localStorage.setItem('Authorization', accessToken);
      localStorage.setItem('RefreshToken', refreshToken);
      this.$router.push({ name: 'MainPage' });
    } else {
      console.error('토큰이 전달되지 않았습니다.');
      this.$router.push({ name: 'Login' });
    }
  }
}
</script>
