<template>
  <div>
    <button @click="sendDataFakerRequest">들어가라 100만건</button>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";

export default {
  name: 'DataFakerButton',
  methods: {
    sendDataFakerRequest() {
      axiosAdminInstance.post('/v1/datafaker')
      .then(response => {
        console.log('Request successful:', response);
      })
      .catch(error => {
        console.error('Request failed:', error);
      });
    }
  }
};
</script>
<style scoped>
button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

</style>