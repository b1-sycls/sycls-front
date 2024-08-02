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
        <p><strong>공연장:</strong> {{ selectedShow.placeName }} </p>
        <p><strong>위치:</strong> {{ selectedShow.placeLocation }}</p>
        <p><strong>회차상태:</strong> {{ selectedShow.status }}</p>
        <div class="performers-slider">
          <button @click="prevPerformerSlide" class="performer-slider-button prev-button">&#10094;</button>
          <div class="performers-images" :style="{ transform: `translateX(-${performerIndex * 100}%)` }">
            <div v-for="(performer, index) in performers" :key="performer.castId" class="performer-slide">
              <img :src="performer.imagePath" :alt="performer.name" class="performer-image">
              <p>{{ performer.name }}</p>
              <p>상태: {{ performer.status }}</p>
              <button class="book-button" @click="openEditPerformerModal(performer)">출연진 수정</button>
            </div>
          </div>
          <button @click="nextPerformerSlide" class="performer-slider-button next-button">&#10095;</button>
        </div>
        <button class="book-button" @click="openEditRoundModal(selectedShow)">회차 수정</button>
        <button class="book-button" @click="openStatusModal(selectedShow)">회차 상태변경</button>
        <button class="book-button" @click="openAddPerformerModal">출연진 추가</button>
      </div>
    </div>

    <button @click="openAddRoundModal" class="book-button">회차 추가</button>

    <!-- Add Round Modal -->
    <div v-if="showAddRoundModal" class="modal" @click.self="closeAddRoundModal">
      <div class="modal-content">
        <button class="close-button" @click="closeAddRoundModal">&times;</button>
        <h3>회차 추가</h3>
        <form @submit.prevent="addRound">
          <label for="place">공연장:</label>
          <select v-model="newRound.placeId" id="place" required>
            <option v-for="place in places" :key="place.placeId" :value="place.placeId">
              {{ place.name }} ({{ place.location }})
            </option>
          </select>
          <label for="sequence">회차:</label>
          <input type="number" v-model="newRound.sequence" id="sequence" required />
          <label for="startDate">시작 날짜:</label>
          <input type="date" v-model="newRound.startDate" id="startDate" required />
          <label for="startTime">시작 시간:</label>
          <input type="time" v-model="newRound.startTime" id="startTime" required />
          <label for="endTime">종료 시간:</label>
          <input type="time" v-model="newRound.endTime" id="endTime" required />
          <button type="submit" class="book-button">추가</button>
        </form>
      </div>
    </div>

    <!-- Edit Round Modal -->
    <div v-if="showEditRoundModal" class="modal" @click.self="closeEditRoundModal">
      <div class="modal-content">
        <button class="close-button" @click="closeEditRoundModal">&times;</button>
        <h3>회차 수정</h3>
        <form @submit.prevent="updateRound">
          <label for="editPlace">공연장:</label>
          <select v-model="selectedShow.placeId" id="editPlace" required>
            <option v-for="place in places" :key="place.placeId" :value="place.placeId">
              {{ place.name }} ({{ place.location }})
            </option>
          </select>
          <label for="editStartDate">시작 날짜:</label>
          <input type="date" v-model="selectedShow.startDate" id="editStartDate" required />
          <label for="editStartTime">시작 시간:</label>
          <input type="time" v-model="selectedShow.startTime" id="editStartTime" required />
          <label for="editEndTime">종료 시간:</label>
          <input type="time" v-model="selectedShow.endTime" id="editEndTime" required />
          <button type="submit" class="book-button">수정</button>
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
          <select v-model="selectedShow.status" id="status" required>
            <option value="WAITING">WAITING</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <button type="submit" class="book-button">변경</button>
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
          <input type="text" v-model="newPerformer.name" id="performerName" required />
          <label for="performerImage">출연진 이미지:</label>
          <input type="file" @change="handlePerformerImageUpload" id="performerImage" required />
          <button type="submit" class="book-button">추가</button>
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
          <input type="text" v-model="selectedPerformer.name" id="editPerformerName" required />
          <label for="editPerformerStatus">출연진 상태:</label>
          <select v-model="selectedPerformer.status" id="editPerformerStatus" required>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <label for="editPerformerImage">출연진 이미지:</label>
          <input type="file" @change="handleEditPerformerImageUpload" id="editPerformerImage" />
          <button type="submit" class="book-button">수정</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { axiosAdminInstance } from "@/axios.js";

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
        this.concert.date = `${data.roundList[0].startDate} - ${data.roundList[data.roundList.length - 1].startDate}`;
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
        this.performersCache = { ...this.performersCache, [roundId]: response.data.data };
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
      axiosAdminInstance.get('/v1/places')
      .then(response => {
        this.places = response.data.data.data;  // API의 "data" 필드 내 "data" 배열을 가져옵니다.
      })
      .catch(error => {
        console.error("공연장 정보를 가져오는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '공연장 정보를 가져오는 중 오류가 발생했습니다.');
      });
    },
    openEditRoundModal(show) {
      this.selectedShow = { ...show };
      this.showEditRoundModal = true;
      this.fetchPlaces();
    },
    closeEditRoundModal() {
      this.showEditRoundModal = false;
    },
    updateRound() {
      axiosAdminInstance.patch(`/v1/rounds/${this.selectedShow.roundId}`, {
        placeId: this.selectedShow.placeId,
        startDate: this.selectedShow.startDate,
        startTime: this.selectedShow.startTime,
        endTime: this.selectedShow.endTime
      })
      .then(response => {
        this.fetchConcertDetails();
        this.selectShow(this.selectedShow);  // 회차 수정 후 해당 회차를 선택하여 최신화
        this.closeEditRoundModal();
        this.closeStatusModal();
        // TODO 회차 수정한다음에 공연장소가 업데이트가되야하는데 안됨 (캐싱되서)
        alert('회차가 성공적으로 수정되었습니다.');
      })
      .catch(error => {
        console.error("회차를 수정하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '회차를 수정하는 중 오류가 발생했습니다.');
      });
    },
    openStatusModal(show) {
      this.selectedShow = { ...show };
      this.showStatusModal = true;
    },
    closeStatusModal() {
      this.showStatusModal = false;
    },
    updateRoundStatus() {
      axiosAdminInstance.patch(`/v1/rounds/${this.selectedShow.roundId}/status`, {
        status: this.selectedShow.status
      })
      .then(response => {
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
      })], { type: 'application/json' });

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
      this.selectedPerformer = { ...performer };
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
    }
  },
  mounted() {
    this.fetchConcertDetails();
  }
};
</script>

<style src="../../assets/css/concert.css" scoped></style>
