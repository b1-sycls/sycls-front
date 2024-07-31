<template>
  <div class="container">
    <h1>{{ concert.title }}</h1>
    <div class="concert-info">
      <img :src="concert.mainImage" :alt="concert.title + ' 메인 이미지'" class="main-image" width="800" height="533">

      <div class="custom-slider">
        <button @click="prevSlide" class="slider-button prev-button">&#10094;</button>
        <div class="slider-images">
          <img v-for="(image, index) in concert.subImages"
               :key="index"
               :src="image"
               :alt="concert.title + ' 서브 이미지 ' + (index + 1)"
               class="slider-image"
               :class="{ active: currentIndex === index }">
        </div>
        <button @click="nextSlide" class="slider-button next-button">&#10095;</button>
      </div>

      <p>{{ concert.description }}</p>
      <p><strong>카테고리:</strong> {{ concert.category }}</p>
      <p><strong>기간:</strong> {{ concert.date }}</p>
      <p><strong>회차:</strong> {{ selectedShow ? selectedShow.sequence + '회차' : '선택되지 않음' }}</p>
    </div>
    <div class="show-info">
      <div class="show-dates">
        <h2>공연 날짜</h2>
        <ul>
          <li v-for="show in concert.shows" :key="show.roundId"
              @click="selectShow(show)"
              :class="{ selected: selectedShow === show }">
            {{ show.startDate }} ({{ formatDay(new Date(show.startDate)) }})
          </li>
        </ul>
      </div>
      <div class="show-details" v-if="selectedShow">
        <h2>상세 정보</h2>
        <p><strong>시간:</strong> {{ selectedShow.startTime }} ~ {{ selectedShow.endTime }}</p>
        <div class="performers-slider">
          <button @click="prevPerformerSlide" class="performer-slider-button prev-button">&#10094;</button>
          <div class="performers-images" :style="{ transform: `translateX(-${performerIndex * 100}%)` }">
            <div v-for="(performer, index) in performers" :key="performer.castId" class="performer-slide">
              <img :src="performer.imagePath" :alt="performer.name" class="performer-image">
              <p>{{ performer.name }}</p>
            </div>
          </div>
          <button @click="nextPerformerSlide" class="performer-slider-button next-button">&#10095;</button>
        </div>
        <button class="book-button" @click="bookTicket">
          예매하기
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import {axiosInstance} from "@/axios.js";

export default {
  props: ['contentId'],
  data() {
    return {
      concert: {
        id: null,
        title: "",
        mainImage: "",
        subImages: [],
        description: "",
        category: "",
        date: "",
        shows: []
      },
      selectedShow: null,
      performers: [],
      performersCache: {},  // 캐시를 위한 객체
      currentIndex: 0,
      performerIndex: 0
    };
  },
  methods: {
    fetchConcertDetails() {
      const contentId = this.$route.params.id;
      axiosInstance.get(`/v1/contents/${contentId}`)
      .then(response => {
        const data = response.data.data;
        this.concert.id = data.contentId;
        this.concert.title = data.title;
        this.concert.mainImage = data.mainImagePath;
        this.concert.subImages = data.detailImageList.map(img => img.detailImagePath);
        this.concert.description = data.description;
        this.concert.category = data.categoryName;
        this.concert.date = `${data.roundList[0].startDate} - ${data.roundList[data.roundList.length - 1].startDate}`;
        this.concert.shows = data.roundList;
      })
      .catch(error => {
        console.error("콘서트 정보를 가져오는 중에 오류가 발생했습니다.", error);
      });
    },
    fetchPerformers(roundId) {
      // 이미 조회된 출연진 데이터가 있는지 확인
      if (this.performersCache[roundId]) {
        this.performers = this.performersCache[roundId];
        return;
      }
      axiosInstance.get('/v1/casts', {
        params: {
          roundId: roundId
        }
      })
      .then(response => {
        this.performers = response.data.data;
        // 캐시에 저장
        this.performersCache = { ...this.performersCache, [roundId]: response.data.data };
      })
      .catch(error => {
        console.error("출연진 정보를 가져오는 중에 오류가 발생했습니다.", error);
      });
    },
    selectShow(show) {
      this.selectedShow = show;
      this.performerIndex = 0;
      this.fetchPerformers(show.roundId);
    },
    bookTicket() {
      if (this.selectedShow) {
        this.$router.push({
          name: 'Seat',
          query: {
            roundId: this.selectedShow.roundId,
            contentTitle: this.concert.title,
            startDate: `${this.selectedShow.startDate} (${this.formatDay(new Date(this.selectedShow.startDate))}) ${this.selectedShow.startTime}`
          }
        });
      }
    },
    prevSlide() {
      this.currentIndex = (this.currentIndex === 0) ? this.concert.subImages.length - 1 : this.currentIndex - 1;
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex === this.concert.subImages.length - 1) ? 0 : this.currentIndex + 1;
    },
    prevPerformerSlide() {
      this.performerIndex = (this.performerIndex === 0) ? this.performers.length - 1 : this.performerIndex - 1;
    },
    nextPerformerSlide() {
      this.performerIndex = (this.performerIndex === this.performers.length - 1) ? 0 : this.performerIndex + 1;
    },
    formatDay(date) {
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return dayNames[date.getDay()];
    }
  },
  mounted() {
    this.fetchConcertDetails();
  }
};
</script>



<style src="../../assets/css/concert.css"></style>
