<template>
  <div class="container">
    <h1>{{ concert.title }}</h1>
    <div class="concert-info">
      <img :src="concert.mainImage" :alt="concert.title + ' 메인 이미지'" class="main-image" width="600" height="400">

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
      <p><strong>장소:</strong> {{ concert.venue }}</p>
      <p><strong>기간:</strong> {{ concert.date }}</p>
    </div>
    <h2>공연 회차</h2>
    <div class="shows">
      <div v-for="show in concert.shows" :key="show.id"
           class="show"
           :class="{ selected: selectedShow === show }"
           @click="selectShow(show)">
        <h3>{{ show.date }} {{ show.time }}</h3>
        <div class="performers">
          <strong>출연진:</strong>
          <ul>
            <li v-for="performer in show.performers" :key="performer.name">
              <img :src="performer.image" :alt="performer.name" class="performer-image">
              {{ performer.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <button class="book-button"
            @click="bookTicket"
            :disabled="!selectedShow">
      예매하러 가기
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      concert: {
        id: 1,
        title: "K-POP 드림 콘서트 2023",
        mainImage: "https://concerttickets.com/images/kpop-dream-concert-2023-main.jpg",
        subImages: [
          "https://concerttickets.com/images/kpop-dream-concert-2023-sub1.jpg",
          "https://concerttickets.com/images/kpop-dream-concert-2023-sub2.jpg",
          "https://concerttickets.com/images/kpop-dream-concert-2023-sub3.jpg",
        ],
        description: "2023년 최고의 K-POP 아티스트들이 한자리에 모이는 드림 콘서트! 화려한 퍼포먼스와 감동적인 무대로 여러분을 찾아갑니다.",
        venue: "고척스카이돔",
        date: "2023년 8월 15일 - 2023년 8월 17일",
        shows: [
          {
            id: 1,
            date: "2023년 8월 15일",
            time: "오후 6시",
            performers: [
              { name: "BTS", image: "https://example.com/images/bts.jpg" },
              { name: "BLACKPINK", image: "https://example.com/images/blackpink.jpg" },
              { name: "EXO", image: "https://example.com/images/exo.jpg" }
            ]
          },
          {
            id: 2,
            date: "2023년 8월 16일",
            time: "오후 6시",
            performers: [
              { name: "TWICE", image: "https://example.com/images/twice.jpg" },
              { name: "NCT", image: "https://example.com/images/nct.jpg" },
              { name: "Red Velvet", image: "https://example.com/images/redvelvet.jpg" }
            ]
          },
          {
            id: 3,
            date: "2023년 8월 17일",
            time: "오후 5시",
            performers: [
              { name: "IVE", image: "https://example.com/images/ive.jpg" },
              { name: "SEVENTEEN", image: "https://example.com/images/seventeen.jpg" },
              { name: "ITZY", image: "https://example.com/images/itzy.jpg" }
            ]
          }
        ]
      },
      selectedShow: null,
      currentIndex: 0
    };
  },
  methods: {
    selectShow(show) {
      this.selectedShow = show;
    },
    bookTicket() {
      if (this.selectedShow) {
        window.location.href = `/book/${this.concert.id}/${this.selectedShow.id}`;
      }
    },
    prevSlide() {
      this.currentIndex = (this.currentIndex === 0) ? this.concert.subImages.length - 1
          : this.currentIndex - 1;
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex === this.concert.subImages.length - 1) ? 0
          : this.currentIndex + 1;
    }
  }
};
</script>

<style src="../../assets/css/concert.css"></style>
