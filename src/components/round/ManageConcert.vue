<template>
  <div class="container">
    <h1>{{ concert.title }}</h1>
    <div class="concert-info">
      <img :alt="concert.title + ' 메인 이미지'" :src="concert.mainImage" class="main-image" height="533"
           width="800">

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
      <p><strong>카테고리:</strong> {{ concert.category }}</p>
      <p><strong>기간:</strong> {{ concert.date }}</p>
      <p><strong>회차:</strong> {{ selectedShow ? selectedShow.sequence + '회차' : '선택되지 않음' }}</p>
    </div>
    <div class="show-info">
      <div class="show-dates">
        <h2>공연 날짜</h2>
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
        <p><strong>회차상태:</strong> {{ selectedShow.status }}</p>
        <div class="performers-slider">
          <button class="performer-slider-button prev-button" @click="prevPerformerSlide">&#10094;
          </button>
          <div :style="{ transform: `translateX(-${performerIndex * 100}%)` }"
               class="performers-images">
            <div v-for="(performer, index) in performers" :key="performer.castId"
                 class="performer-slide">
              <img :alt="performer.name" :src="performer.imagePath" class="performer-image">
              <p>{{ performer.name }}</p>
              <p>상태: {{ performer.status }}</p>
              <button class="book-button" @click="openEditPerformerModal(performer)">출연진 수정</button>
            </div>
          </div>
          <button class="performer-slider-button next-button" @click="nextPerformerSlide">&#10095;
          </button>
        </div>
        <button class="book-button" @click="openEditRoundModal(selectedShow)">회차 수정</button>
        <button class="book-button" @click="openStatusModal(selectedShow)">회차 상태변경</button>
        <button class="book-button" @click="openAddSeatGrade">좌석 등급 설정</button>
        <button class="book-button" @click="openAddPerformerModal">출연진 추가</button>
      </div>
    </div>

    <button class="book-button" @click="openAddRoundModal">회차 추가</button>

    <!--TODO 시간창 00:00 ~ 24:00 으로 바꼈으면 좋겠음-->
    <!-- Add Round Modal -->
    <div v-if="showAddRoundModal" class="modal" @click.self="closeAddRoundModal">
      <div class="modal-content">
        <button class="close-button" @click="closeAddRoundModal">&times;</button>
        <h3>회차 추가</h3>
        <form @submit.prevent="addRound">
          <label for="place">공연장:</label>
          <select id="place" v-model="newRound.placeId" required>
            <option v-for="place in places" :key="place.placeId" :value="place.placeId">
              {{ place.name }} ({{ place.location }})
            </option>
          </select>
          <label for="sequence">회차:</label>
          <input id="sequence" v-model="newRound.sequence" required type="number"/>
          <label for="startDate">시작 날짜:</label>
          <input id="startDate" v-model="newRound.startDate" required type="date"/>
          <label for="startTime">시작 시간:</label>
          <input id="startTime" v-model="newRound.startTime" required type="time"/>
          <label for="endTime">종료 시간:</label>
          <input id="endTime" v-model="newRound.endTime" required type="time"/>
          <button class="book-button" type="submit">추가</button>
        </form>
      </div>
    </div>

    <!--TODO 시간창 00:00 ~ 24:00 으로 바꼈으면 좋겠음-->
    <!-- Edit Round Modal -->
    <div v-if="showEditRoundModal" class="modal" @click.self="closeEditRoundModal">
      <div class="modal-content">
        <button class="close-button" @click="closeEditRoundModal">&times;</button>
        <h3>회차 수정</h3>
        <form @submit.prevent="updateRound">
          <label for="editPlace">공연장:</label>
          <select id="editPlace" v-model="selectedShow.placeId" required>
            <option v-for="place in places" :key="place.placeId" :value="place.placeId">
              {{ place.name }} ({{ place.location }})
            </option>
          </select>
          <label for="editStartDate">시작 날짜:</label>
          <input id="editStartDate" v-model="selectedShow.startDate" required type="date"/>
          <label for="editStartTime">시작 시간:</label>
          <input id="editStartTime" v-model="selectedShow.startTime" required type="time"/>
          <label for="editEndTime">종료 시간:</label>
          <input id="editEndTime" v-model="selectedShow.endTime" required type="time"/>
          <button class="book-button" type="submit">수정</button>
        </form>
      </div>
    </div>

    <!-- Status Modal -->
    <div v-if="showStatusModal" class="modal" @click.self="closeStatusModal">
      <div class="modal-content">
        <button class="close-button" @click="closeStatusModal">&times;</button>
        <h3>회차 상태변경</h3>
        <form @submit.prevent="updateRoundStatus">
          <label for="status">상태:</label>
          <select id="status" v-model="selectedShow.status" required>
            <option value="WAITING">WAITING</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <button class="book-button" type="submit">변경</button>
        </form>
      </div>
    </div>

    <!-- Add Performer Modal -->
    <div v-if="showAddPerformerModal" class="modal" @click.self="closeAddPerformerModal">
      <div class="modal-content">
        <button class="close-button" @click="closeAddPerformerModal">&times;</button>
        <h3>출연진 추가</h3>
        <form @submit.prevent="addPerformer">
          <label for="performerName">출연진 이름:</label>
          <input id="performerName" v-model="newPerformer.name" required type="text"/>
          <label for="performerImage">출연진 이미지:</label>
          <input id="performerImage" required type="file" @change="handlePerformerImageUpload"/>
          <button class="book-button" type="submit">추가</button>
        </form>
      </div>
    </div>

    <!-- Edit Performer Modal -->
    <div v-if="showEditPerformerModal" class="modal" @click.self="closeEditPerformerModal">
      <div class="modal-content">
        <button class="close-button" @click="closeEditPerformerModal">&times;</button>
        <h3>출연진 수정</h3>
        <form @submit.prevent="updatePerformer">
          <label for="editPerformerName">출연진 이름:</label>
          <input id="editPerformerName" v-model="selectedPerformer.name" required type="text"/>
          <label for="editPerformerStatus">출연진 상태:</label>
          <select id="editPerformerStatus" v-model="selectedPerformer.status" required>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <label for="editPerformerImage">출연진 이미지:</label>
          <input id="editPerformerImage" type="file" @change="handleEditPerformerImageUpload"/>
          <button class="book-button" type="submit">수정</button>
        </form>
      </div>
    </div>

    <div class="reviews-section">
      <h2>리뷰</h2>
      <div class="search-filters">
        <label for="ratingFilter">평점:</label>
        <select id="ratingFilter" v-model="searchCriteria.rating">
          <option value="">전체</option>
          <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
        </select>

        <label for="nickNameFilter">닉네임:</label>
        <input id="nickNameFilter" v-model="searchCriteria.nickName" type="text"/>

        <label for="statusFilter">상태:</label>
        <select id="statusFilter" v-model="searchCriteria.reviewStatus">
          <option value="">전체</option>
          <option value="ENABLE">ENABLE</option>
          <option value="DISABLE">DISABLE</option>
        </select>

        <button @click="fetchReviews">검색</button>
      </div>
      <ul>
        <li v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-content">
            <p><strong>작성자</strong> : {{ review.nickName }}</p>
            <p><span><strong>평점</strong> : {{ review.rating }}/10</span></p>
            <p><strong>내용</strong> : {{ review.comment }}</p>
            <p><strong>상태</strong> : {{ review.status }}</p>
            <p class="review-date">{{ new Date(review.createdAt).toLocaleString() }}</p>
          </div>
          <div class="review-buttons">
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

      <!-- 삭제 확인 모달 -->
      <div v-if="showDeleteConfirm" class="modal">
        <div class="modal-content">
          <span class="close-button" @click="closeDeleteConfirm">&times;</span>
          <h3 style="text-align: center;"><strong>정말 삭제하시겠습니까?</strong></h3>
          <button class="book-button" @click="deleteReview(confirmDeleteId)">예</button>
          <button class="book-button" @click="closeDeleteConfirm">아니오</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";

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
      places: [],  // 공연장 데이터를 저장할 배열
      selectedShow: null,
      performers: [],
      performersCache: {},  // 캐시를 위한 객체
      selectedPerformer: null,
      currentIndex: 0,
      performerIndex: 0,
      showAddRoundModal: false,
      showEditRoundModal: false,
      showStatusModal: false,
      showAddPerformerModal: false,
      showEditPerformerModal: false,
      newRound: {
        contentId: this.$route.params.id,
        placeId: null,
        sequence: null,
        startDate: "",
        startTime: "",
        endTime: ""
      },
      newPerformer: {
        name: "",
        image: null
      },
      reviews: [],
      currentPage: 1,
      totalPages: 1,
      showDeleteConfirm: false,
      confirmDeleteId: null,
      searchCriteria: {
        rating: '',
        nickName: '',
        reviewStatus: '',
        orderBy: 'createdAt',
        isDesc: true
      }
    };
  },
  methods: {
    fetchConcertDetails() {
      const contentId = this.$route.params.id;
      axiosAdminInstance.get(`/v1/contents/${contentId}`)
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
    putPerformers(roundId) {
      axiosAdminInstance.get('/v1/casts', {
        params: {
          roundId: roundId
        }
      })
      .then(response => {
        this.performers = response.data.data;
        // 캐시에 저장
        this.performersCache = {...this.performersCache, [roundId]: response.data.data};
      })
      .catch(error => {
        console.error("출연진 정보를 가져오는 중에 오류가 발생했습니다.", error);
      });
    },
    fetchPerformers(roundId) {
      // 이미 조회된 출연진 데이터가 있는지 확인
      if (this.performersCache[roundId]) {
        this.performers = this.performersCache[roundId];
        return;
      }
      axiosAdminInstance.get('/v1/casts', {
        params: {
          roundId: roundId
        }
      })
      .then(response => {
        this.performers = response.data.data;
        // 캐시에 저장
        this.performersCache = {...this.performersCache, [roundId]: response.data.data};
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
    openAddRoundModal() {
      this.showAddRoundModal = true;
      this.fetchPlaces();
    },
    closeAddRoundModal() {
      this.showAddRoundModal = false;
    },
    addRound() {
      axiosAdminInstance.post('/v1/rounds', this.newRound)
      .then(response => {
        this.fetchConcertDetails();
        this.closeAddRoundModal();
        alert('회차가 성공적으로 추가되었습니다.');
      })
      .catch(error => {
        console.error("회차를 추가하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '회차를 추가하는 중 오류가 발생했습니다.');
      });
    },
    fetchPlaces() {
      axiosAdminInstance.get('/v1/places/enable')
      .then(response => {
        this.places = response.data.data;  // API의 "data" 필드 내 "data" 배열을 가져옵니다.
      })
      .catch(error => {
        console.error("공연장 정보를 가져오는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '공연장 정보를 가져오는 중 오류가 발생했습니다.');
      });
    },
    openEditRoundModal(show) {
      this.selectedShow = {...show};
      this.showEditRoundModal = true;
      this.fetchPlaces();
    },
    closeEditRoundModal() {
      this.showEditRoundModal = false;
    },
    updateRound() {
      // 시간 값을 초 단위 없이 포맷팅
      const startTimeFormatted = this.selectedShow.startTime.length === 5
          ? this.selectedShow.startTime : this.selectedShow.startTime.slice(0, 5);
      const endTimeFormatted = this.selectedShow.endTime.length === 5 ? this.selectedShow.endTime
          : this.selectedShow.endTime.slice(0, 5);

      axiosAdminInstance.patch(`/v1/rounds/${this.selectedShow.roundId}`, {
        placeId: this.selectedShow.placeId,
        startDate: this.selectedShow.startDate,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted
      })
      .then(response => {
        // TODO 이페이지에 들어올때 place 정보를 가져오는데 그걸 수정하면 이 수정 메서드를 하고나서 반영 했으면 좋겠음 현재는 공연장, 공연장 위치정보 말고는 다 새로고침됨
        this.fetchConcertDetails();
        this.closeEditRoundModal();
        this.closeStatusModal();
        alert('회차가 성공적으로 수정되었습니다.');
      })
      .catch(error => {
        console.error("회차를 수정하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '회차를 수정하는 중 오류가 발생했습니다.');
      });
    },
    openStatusModal(show) {
      this.selectedShow = {...show};
      this.showStatusModal = true;
    },
    openAddSeatGrade() {
      const roundId = this.selectedShow.roundId;
      const placeId = this.selectedShow.placeId;
      const maxSeat = this.selectedShow.placeMaxSeat; // 예: 최대 좌석 수가 concert 객체에 있다고 가정

      this.$router.push({
        name: 'SeatGradeManage',
        query: {
          roundId: roundId,
          placeId: placeId,
          maxSeat: maxSeat,
          contentTitle: this.concert.title, // 필요 시 추가적인 정보
          startDate: `${this.selectedShow.startDate} (${this.formatDay(
              new Date(this.selectedShow.startDate))}) ${this.selectedShow.startTime}`
        }
      });
    },
    closeStatusModal() {
      this.showStatusModal = false;
    },
    updateRoundStatus() {
      axiosAdminInstance.patch(`/v1/rounds/${this.selectedShow.roundId}/status`, {
        status: this.selectedShow.status
      })
      .then(response => {
        // TODO 모달창에서 스테이스터스를 선택하면 그 상태가 페이지에보여짐 근데 서버에서 error 를 보내면 새로고침해야 제대로 된 상태가 나옴
        this.fetchConcertDetails();
        this.selectShow(this.selectedShow);  // 상태 변경 후 해당 회차를 선택하여 최신화
        this.closeStatusModal();
        alert('회차 상태가 성공적으로 변경되었습니다.');
      })
      .catch(error => {
        console.error("회차 상태를 변경하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '회차 상태를 변경하는 중 오류가 발생했습니다.');
      });
    },
    openAddPerformerModal() {
      this.showAddPerformerModal = true;
    },
    closeAddPerformerModal() {
      this.showAddPerformerModal = false;
    },
    handlePerformerImageUpload(event) {
      this.newPerformer.image = event.target.files[0];
    },
    addPerformer() {
      const formData = new FormData();
      const dtoBlob = new Blob([JSON.stringify({
        name: this.newPerformer.name,
        roundId: this.selectedShow.roundId
      })], {type: 'application/json'});

      formData.append('dto', dtoBlob);
      formData.append('image', this.newPerformer.image);

      axiosAdminInstance.post('/v1/casts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        this.closeAddPerformerModal();
        this.putPerformers(this.selectedShow.roundId);
        alert('출연진이 성공적으로 추가되었습니다.');
      })
      .catch(error => {
        console.error("출연진을 추가하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '출연진을 추가하는 중 오류가 발생했습니다.');
      });
    },
    openEditPerformerModal(performer) {
      this.selectedPerformer = {...performer};
      this.showEditPerformerModal = true;
    },
    closeEditPerformerModal() {
      this.showEditPerformerModal = false;
    },
    handleEditPerformerImageUpload(event) {
      this.selectedPerformer.image = event.target.files[0];
    },
    updatePerformer() {
      const formData = new FormData();
      const dtoBlob = new Blob([JSON.stringify({
        name: this.selectedPerformer.name,
        roundId: this.selectedShow.roundId,
        status: this.selectedPerformer.status
      })], {type: 'application/json'});

      formData.append('dto', dtoBlob);
      if (this.selectedPerformer.image) {
        formData.append('image', this.selectedPerformer.image);
      }

      axiosAdminInstance.patch(`/v1/casts/${this.selectedPerformer.castId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        this.closeEditPerformerModal();
        this.putPerformers(this.selectedShow.roundId);
        alert('출연진이 성공적으로 수정되었습니다.');
      })
      .catch(error => {
        console.error("출연진을 수정하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '출연진을 수정하는 중 오류가 발생했습니다.');
      });
    },
    fetchReviews() {
      const contentId = this.$route.params.id;
      axiosAdminInstance.get(`/v1/contents/${contentId}/reviews`, {
        params: {
          ...this.searchCriteria,
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
    confirmDelete(reviewId) {
      this.showDeleteConfirm = true;
      this.confirmDeleteId = reviewId;
    },
    closeDeleteConfirm() {
      this.showDeleteConfirm = false;
      this.confirmDeleteId = null;
    },
    deleteReview(reviewId) {
      axiosAdminInstance.delete(`/v1/reviews/${reviewId}`)
      .then(response => {
        alert("리뷰가 삭제되었습니다.");
        this.fetchReviews();
        this.closeDeleteConfirm();
      })
      .catch(error => {
        console.error("리뷰를 삭제하는 중 오류가 발생했습니다.", error);
        alert(error.response?.data?.message || "리뷰 삭제 중 오류가 발생했습니다.");
      });
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
