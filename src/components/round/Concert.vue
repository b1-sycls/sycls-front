<template>
  <div class="container">
    <h1>{{ concert.title }}</h1>
    <div class="concert-info">
      <div class="left-side">
        <img :alt="concert.title + ' 메인 이미지'" :src="concert.mainImage" class="main-image"
             height="533" width="800">

        <div class="custom-slider">
          <button class="slider-button prev-button" @click="prevSlide">&#10094;</button>
          <div class="slider-images">
            <img v-for="(image, index) in concert.subImages"
                 :key="index"
                 :alt="concert.title + ' 서브 이미지 ' + (index + 1)"
                 :class="{ active: currentIndex === index }"
                 :src="image"
                 class="slider-image">
          </div>
          <button class="slider-button next-button" @click="nextSlide">&#10095;</button>
        </div>

        <p>{{ concert.description }}</p>
      </div>
      <div class="center-side">
        <p><strong>카테고리:</strong> {{ concert.category }}</p>
        <p><strong>기간:</strong> {{ concert.date }}</p>
        <p><strong>회차:</strong> {{ selectedShow ? selectedShow.sequence + '회차' : '선택되지 않음' }}</p>
      </div>
      <div class="show-info">
        <div class="show-dates">
          <h2>공연 날짜 (회차를 선택해 주세요)</h2>
          <ul>
            <li v-for="show in concert.shows" :key="show.roundId"
                :class="{ selected: selectedShow === show }"
                @click="selectShow(show)">
              {{ show.startDate }} ({{ formatDay(new Date(show.startDate)) }})
            </li>
          </ul>
        </div>
        <div v-if="selectedShow" class="show-details">
          <h2>상세 정보</h2>
          <p><strong>시간:</strong> {{ selectedShow.startTime }} ~ {{ selectedShow.endTime }}</p>
          <p><strong>공연장:</strong> {{ selectedShow.placeName }} </p>
          <p><strong>위치:</strong> {{ selectedShow.placeLocation }}</p>
          <div class="performers-slider">
            <button class="performer-slider-button prev-button" @click="prevPerformerSlide">
              &#10094;
            </button>
            <div :style="{ transform: `translateX(-${performerIndex * 100}%)` }"
                 class="performers-images">
              <div v-for="(performer, index) in performers" :key="performer.castId"
                   class="performer-slide">
                <img :alt="performer.name" :src="performer.imagePath" class="performer-image">
                <p>{{ performer.name }}</p>
              </div>
            </div>
            <button class="performer-slider-button next-button" @click="nextPerformerSlide">
              &#10095;
            </button>
          </div>
          <button class="book-button" @click="bookTicket">
            예매하기
          </button>
        </div>
      </div>
    </div>
    <div class="reviews-section">
      <h2>리뷰</h2>
      <ul>
        <li v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-content">
            <p><strong>작성자</strong> : {{ review.nickName }}</p>
            <p><span><strong>평점</strong> : {{ review.rating }}/10</span></p>
            <p><strong>내용</strong> : {{ review.comment }}</p>
            <p class="review-date">{{ new Date(review.createdAt).toLocaleString() }}</p>
          </div>
          <div class="review-buttons">
            <button @click="editReview(review.id)">수정</button>
            <button @click="confirmDelete(review.id)">삭제</button>
          </div>
        </li>
      </ul>
      <div class="pagination">
        <button :disabled="currentPage === 1" @click="prevPage">&lt;</button>
        <button v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }"
                @click="changePage(page)">{{ page }}
        </button>
        <button :disabled="currentPage === totalPages" @click="nextPage">&gt;</button>
      </div>
      <div class="review-form">
        <h3 v-if="editMode">리뷰 수정</h3>
        <h3 v-else>리뷰 작성</h3>
        <br>
        <form @submit.prevent="editMode ? updateReview() : submitReview()">
          <div class="form-group">
            <label for="comment"><strong>댓글</strong></label>
            <textarea id="comment" v-model="newReview.comment" required></textarea>
          </div>
          <div class="form-group">
            <label for="rating"><strong>평점(1~10)</strong></label>
            <input id="rating" v-model="newReview.rating" max="10" min="0" required type="number">
          </div>
          <button type="submit">{{ editMode ? '리뷰 수정' : '리뷰 등록' }}</button>
        </form>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content">
        <span class="close-button" @click="closeDeleteConfirm">&times;</span>
        <h3 style="text-align: center;"><strong>정말 삭제하시겠습니까?</strong></h3>
        <button class="book-button" @click="deleteReview(confirmDeleteId)">예</button>
        <button class="book-button" @click="closeDeleteConfirm">아니오</button>
      </div>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <span class="close-button" @click="closeEditModal">&times;</span>
        <h3>리뷰 수정</h3>
        <form @submit.prevent="updateReview">
          <div class="form-group">
            <label for="editComment"><strong>댓글</strong></label>
            <textarea id="editComment" v-model="newReview.comment" required></textarea>
          </div>
          <div class="form-group">
            <label for="editRating"><strong>평점(1~10)</strong></label>
            <input id="editRating" v-model="newReview.rating" max="10" min="0" required
                   type="number">
          </div>
          <button class="book-button">리뷰 수정</button>
        </form>
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
      performerIndex: 0,
      reviews: [],
      newReview: {
        comment: '',
        rating: null,
      },
      currentPage: 1,
      totalPages: 1,
      editMode: false,
      editingReviewId: null,
      showDeleteConfirm: false,
      confirmDeleteId: null,
      showEditModal: false
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
        this.concert.date = `${data.roundList[0].startDate} - ${data.roundList[data.roundList.length
        - 1].startDate}`;
        this.concert.shows = data.roundList;
      })
      .catch(error => {
        console.error("콘서트 정보를 가져오는 중에 오류가 발생했습니다.", error);
      });
    },
    fetchPerformers(roundId) {
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
        this.performersCache = {...this.performersCache, [roundId]: response.data.data};
      })
      .catch(error => {
        console.error("출연진 정보를 가져오는 중에 오류가 발생했습니다.", error);
      });
    },
    fetchReviews() {
      const contentId = this.$route.params.id;
      axiosInstance.get(`/v1/contents/${contentId}/reviews`, {
        params: {
          pageNum: this.currentPage,
          pageSize: 4
        }
      })
      .then(response => {
        this.reviews = response.data.data.data;
        this.totalPages = response.data.data.totalPage;
      })
      .catch(error => {
        console.error("리뷰를 가져오는 중 오류가 발생했습니다.", error);
      });
    },
    submitReview() {
      const contentId = this.$route.params.id;
      axiosInstance.post(`/v1/contents/${contentId}/reviews`, this.newReview)
      .then(response => {
        alert("리뷰가 등록되었습니다.");
        this.fetchReviews();
        this.newReview.comment = '';
        this.newReview.rating = null;
      })
      .catch(error => {
        console.error("리뷰를 등록하는 중 오류가 발생했습니다.", error);
      });
    },
    confirmDelete(reviewId) {
      this.showDeleteConfirm = true;
      this.confirmDeleteId = reviewId;
    },
    closeDeleteConfirm() {
      this.showDeleteConfirm = false;
      this.confirmDeleteId = null;
    },
    deleteReview(reviewId) {
      axiosInstance.delete(`/v1/reviews/${reviewId}`)
      .then(response => {
        alert("리뷰가 삭제되었습니다.");
        this.fetchReviews();
        this.closeDeleteConfirm();
      })
      .catch(error => {
        console.error("리뷰를 삭제하는 중 오류가 발생했습니다.", error);
        alert(error.response?.data?.message || "리뷰 삭제 중 오류가 발생했습니다.")
      });
    },
    editReview(reviewId) {
      const review = this.reviews.find(r => r.id === reviewId);
      if (review) {
        this.newReview.comment = review.comment;
        this.newReview.rating = review.rating;
        this.editMode = true;
        this.editingReviewId = reviewId;
        this.showEditModal = true;
      }
    },
    closeEditModal() {
      this.showEditModal = false;
      this.newReview.comment = '';
      this.newReview.rating = null;
      this.editMode = false;
      this.editingReviewId = null;
    },
    updateReview() {
      axiosInstance.patch(`/v1/reviews/${this.editingReviewId}`, this.newReview)
      .then(response => {
        alert("리뷰가 수정되었습니다.");
        this.fetchReviews();
        this.closeEditModal();
      })
      .catch(error => {
        console.error("리뷰를 수정하는 중 오류가 발생했습니다.", error);
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
            startDate: `${this.selectedShow.startDate} (${this.formatDay(
                new Date(this.selectedShow.startDate))}) ${this.selectedShow.startTime}`
          }
        });
      }
    },
    prevSlide() {
      this.currentIndex = (this.currentIndex === 0) ? this.concert.subImages.length - 1
          : this.currentIndex - 1;
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex === this.concert.subImages.length - 1) ? 0
          : this.currentIndex + 1;
    },
    prevPerformerSlide() {
      this.performerIndex = (this.performerIndex === 0) ? this.performers.length - 1
          : this.performerIndex - 1;
    },
    nextPerformerSlide() {
      this.performerIndex = (this.performerIndex === this.performers.length - 1) ? 0
          : this.performerIndex + 1;
    },
    formatDay(date) {
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return dayNames[date.getDay()];
    },
    changePage(page) {
      this.currentPage = page;
      this.fetchReviews();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchReviews();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchReviews();
      }
    }
  },
  mounted() {
    this.fetchConcertDetails();
    this.fetchReviews();
  }
};
</script>

<style scoped src="../../assets/css/concert.css"></style>
