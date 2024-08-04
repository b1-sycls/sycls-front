<template>
  <div>
    <header>
      <div class="logo">에티켓(everyTicket) 공연관리 페이지</div>
      <div class="user-actions">
        <!--TODO 나중에 기능 구현되어있으면 그때 추가-->
        <!--<router-link to="/member-manage" class="nav-button">회원관리</router-link>-->
        <router-link class="nav-button" to="/place/placeManage">공연장관리</router-link>
        <router-link class="nav-button" to="/manage/category">카테고리관리</router-link>
        <button v-if="isLoggedIn" class="styled-button" @click="logout">로그아웃</button>
        <router-link v-if="isLoggedIn" to="/manage/mypage">마이페이지</router-link>
      </div>
    </header>
    <nav>
      <div class="nav-controls">
        <div class="categories-dropdown">
          <select v-model="selectedCategory">
            <option value="전체">전체</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="search-bar">
          <input v-model="titleKeyword" placeholder="검색할 콘서트 이름" type="text"/>
          <button class="book-button" @click="search">검색</button>
        </div>
      </div>
    </nav>
    <main>
      <h2>콘서트 목록</h2>
      <button class="book-button" @click="openAddConcertModal">공연 추가</button>
      <div class="concert-list">
        <div v-for="concert in concerts" :key="concert.contentId" class="concert-item">
          <img :alt="concert.title" :src="concert.mainImagePath" class="concert-image"/>
          <span :class="'genre-tag ' + concert.categoryName">{{ concert.categoryName }}</span>
          <h3>{{ concert.title }}</h3>
          <p>설명: {{ concert.description }}</p>
          <p>상태: {{ concert.status }}</p>
          <button class="book-button" @click="viewConcert(concert)">미리보기 & 공연수정</button>
          <button class="book-button" @click="viewRound(concert)">회차 추가 및 수정</button>
          <button class="book-button" @click="openStatusModal(concert)">공연 상태 변경</button>
        </div>
      </div>
      <div class="pagination">
        <button :disabled="currentPageSet === 1" @click="prevPageSet">&lt;</button>
        <button v-for="page in pageSet" :key="page" :class="{ active: currentPage === page }"
                @click="changePage(page)">{{ page }}
        </button>
        <button :disabled="currentPageSet * 10 >= totalPages" @click="nextPageSet">&gt;</button>
      </div>
    </main>

    <!-- 공연 추가 모달 -->
    <div v-if="showAddConcertModal" class="modal" @click.self="closeAddConcertModal">
      <div class="modal-content">
        <button class="close-button" @click="closeAddConcertModal">&times;</button>
        <h3>공연 추가</h3>
        <form @submit.prevent="addConcert">
          <label for="category">카테고리(필수):</label>
          <select id="category" v-model="newConcert.categoryId" required>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <label for="title">제목(필수):</label>
          <input id="title" v-model="newConcert.title" required type="text"/>
          <label for="description">설명(선택):</label>
          <textarea id="description" v-model="newConcert.description" required></textarea>
          <label for="mainImage">메인 이미지(필수) (다중 선택 불가능):</label>
          <input id="mainImage" required type="file" @change="handleMainImageUpload"/>
          <label for="detailImages">상세 이미지(선택) (다중 선택 가능):</label>
          <input id="detailImages" multiple type="file" @change="handleDetailImagesUpload"/>
          <button class="book-button" type="submit">추가</button>
        </form>
      </div>
    </div>

    <!-- 공연 상세 조회 모달 -->
    <div v-if="showDetailModal" class="modal" @click.self="closeDetailModal">
      <div class="modal-content">
        <button class="close-button" @click="closeDetailModal">&times;</button>
        <h3>공연 상세 조회</h3>
        <div v-if="selectedConcert">
          <img :alt="selectedConcert.title" :src="selectedConcert.mainImagePath"
               class="modal-image"/>
          <h3>{{ selectedConcert.title }}</h3>
          <p>설명: {{ selectedConcert.description }}</p>
          <p>카테고리: {{ selectedConcert.categoryName }}</p>
          <p>상태: {{ selectedConcert.status }}</p>
          <div v-if="selectedConcert.detailImageList && selectedConcert.detailImageList.length"
               class="slider-container">
            <h4>상세 이미지</h4>
            <div class="custom-slider">
              <button class="slider-button prev-button" @click="prevSlide">&#10094;</button>
              <div class="slider-images">
                <div v-for="(image, index) in selectedConcert.detailImageList"
                     :key="index"
                     :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
                     class="slider-image-wrapper">
                  <img :alt="'Detail image ' + (index + 1)"
                       :src="image.detailImagePath"
                       class="slider-image"/>
                  <div class="image-status">
                    <p>상태: {{ image.status }}</p>
                  </div>
                </div>
              </div>
              <button class="slider-button next-button" @click="nextSlide">&#10095;</button>
            </div>
          </div>
          <h4>라운드 정보</h4>
          <div v-if="selectedConcert.roundList && selectedConcert.roundList.length">
            <ul>
              <li v-for="round in selectedConcert.roundList" :key="round.roundId">
                {{ round.sequence }}: {{ round.startDate }} {{ round.startTime }} - {{
                  round.endTime
                }} ({{ round.status }})
              </li>
            </ul>
          </div>
          <h2>콘텐츠 수정</h2>
          <form @submit.prevent="updateConcert">
            <label for="editCategory">카테고리(필수):</label>
            <select id="editCategory" v-model="selectedConcert.categoryId" required>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <label for="editTitle">제목(필수):</label>
            <input id="editTitle" v-model="selectedConcert.title" required type="text"/>
            <label for="editDescription">설명(선택):</label>
            <textarea id="editDescription" v-model="selectedConcert.description"></textarea>
            <label for="editMainImage">메인 이미지(필수) (다중 선택 불가능):</label>
            <input id="editMainImage" type="file" @change="handleEditMainImageUpload"/>
            <label for="editDetailImages">상세 이미지 추가(선택) (다중 선택 가능):</label>
            <input id="editDetailImages" multiple type="file"
                   @change="handleEditDetailImagesUpload"/>
            <button class="book-button" type="submit">수정</button>
          </form>
        </div>
      </div>
    </div>

    <!-- 상태 변경 모달 -->
    <div v-if="showStatusModal" class="modal" @click.self="closeStatusModal">
      <div class="modal-content">
        <button class="close-button" @click="closeStatusModal">&times;</button>
        <h3>상태 변경</h3>
        <label for="status">상태:</label>
        <select id="status" v-model="editConcertData.status">
          <option value="VISIBLE">보이기</option>
          <option value="HIDDEN">숨기기</option>
          <option value="DELETED">삭제</option>
        </select>
        <button class="book-button" @click="updateStatus">저장</button>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";
import {logoutAdminUser} from "@/utils.js";

export default {
  name: 'MainPage',
  data() {
    return {
      titleKeyword: '',
      currentPage: 1,
      totalPages: 1,
      selectedCategory: '전체',
      categories: [],
      concerts: [],
      isLoggedIn: false,
      showAddConcertModal: false,
      showStatusModal: false,
      showDetailModal: false,
      newConcert: {
        categoryId: '',
        title: '',
        description: '',
        mainImage: null,
        detailImages: []
      },
      selectedConcert: null,
      editConcertData: {},
      currentIndex: 0,
      editMainImage: null,
      editDetailImages: []
    };
  },
  computed: {
    currentPageSet() {
      return Math.ceil(this.currentPage / 10);
    },
    pageSet() {
      const startPage = (this.currentPageSet - 1) * 10 + 1;
      const endPage = Math.min(startPage + 9, this.totalPages);
      return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
    }
  },
  methods: {
    viewConcert(concert) {
      axiosAdminInstance.get(`/v1/contents/${concert.contentId}`)
      .then(response => {
        this.selectedConcert = response.data.data;
        this.showDetailModal = true;
        this.currentIndex = 0;
      })
      .catch(error => {
        console.error("콘서트 상세 정보를 가져오는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '콘서트 상세 정보를 가져오는 중 오류가 발생했습니다.');
      });
    },
    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedConcert = null;
    },
    changePage(pageNumber) {
      this.currentPage = pageNumber;
      this.fetchContents();
    },
    prevPageSet() {
      if (this.currentPageSet > 1) {
        this.currentPage = (this.currentPageSet - 2) * 10 + 1;
        this.fetchContents();
      }
    },
    nextPageSet() {
      if (this.currentPageSet * 10 < this.totalPages) {
        this.currentPage = this.currentPageSet * 10 + 1;
        this.fetchContents();
      }
    },
    search() {
      this.currentPage = 1;
      this.fetchContents();
    },
    fetchCategories() {
      axiosAdminInstance.get('/v1/categories')
      .then(response => {
        this.categories = response.data.data;
      })
      .catch(error => {
        console.error("카테고리를 가져오는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '카테고리를 가져오는 중 오류가 발생했습니다.');
      });
    },
    viewRound(concert) {
      this.$router.push({name: 'ManageConcert', params: {id: concert.contentId}});
    },
    fetchContents() {
      const categoryId = this.selectedCategory === '전체' ? null : this.selectedCategory;
      axiosAdminInstance.get('/v1/contents', {
        params: {
          categoryId: categoryId,
          titleKeyword: this.titleKeyword,
          page: this.currentPage
        }
      })
      .then(response => {
        const responseData = response.data.data;
        this.concerts = responseData.data;
        this.currentPage = responseData.currentPage;
        this.totalPages = responseData.totalPage;
      })
      .catch(error => {
        console.error("콘텐츠를 가져오는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '콘텐츠를 가져오는 중 오류가 발생했습니다.');
      });
    },
    checkLoginStatus() {
      const token = localStorage.getItem('Authorization');
      this.isLoggedIn = !!token;
    },
    async logout() {
      const success = await logoutAdminUser(true);
      if (success) {
        this.isLoggedIn = false;
        this.$router.push({name: 'ManageLogin'});
      }
    },
    openAddConcertModal() {
      this.showAddConcertModal = true;
    },
    closeAddConcertModal() {
      this.showAddConcertModal = false;
      this.newConcert = {
        categoryId: '',
        title: '',
        description: '',
        mainImage: null,
        detailImages: []
      };
    },
    handleMainImageUpload(event) {
      this.newConcert.mainImage = event.target.files[0];
    },
    handleDetailImagesUpload(event) {
      this.newConcert.detailImages = Array.from(event.target.files);
    },
    addConcert() {
      const formData = new FormData();
      const dtoBlob = new Blob([JSON.stringify({
        categoryId: this.newConcert.categoryId,
        title: this.newConcert.title,
        description: this.newConcert.description
      })], {type: 'application/json'});

      formData.append('dto', dtoBlob);
      formData.append('mainImage', this.newConcert.mainImage);
      this.newConcert.detailImages.forEach((image, index) => {
        formData.append('detailImages', image);
      });

      axiosAdminInstance.post('/v1/contents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        this.fetchContents();
        this.closeAddConcertModal();
        alert('콘서트가 성공적으로 추가되었습니다.');
      })
      .catch(error => {
        console.error("콘서트를 추가하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '콘서트를 추가하는 중 오류가 발생했습니다.');
      });
    },
    openStatusModal(concert) {
      this.editConcertData = {...concert};
      this.showStatusModal = true;
    },
    closeStatusModal() {
      this.showStatusModal = false;
      this.editConcertData = {};
    },
    updateStatus() {
      axiosAdminInstance.patch(`/v1/contents/${this.editConcertData.contentId}/status`, {
        status: this.editConcertData.status
      })
      .then(response => {
        this.fetchContents();
        this.closeStatusModal();
        alert('콘서트 상태가 변경되었습니다.');
      })
      .catch(error => {
        console.error("콘서트 상태를 변경하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '콘서트 상태를 변경하는 중 오류가 발생했습니다.');
      });
    },
    handleEditMainImageUpload(event) {
      this.editMainImage = event.target.files[0];
    },
    handleEditDetailImagesUpload(event) {
      this.editDetailImages = Array.from(event.target.files);
    },
    updateConcert() {
      const formData = new FormData();
      const dtoBlob = new Blob([JSON.stringify({
        categoryId: this.selectedConcert.categoryId,
        title: this.selectedConcert.title,
        description: this.selectedConcert.description,
        oldMainImagePath: this.selectedConcert.mainImagePath,
        detailImagePaths: this.selectedConcert.detailImageList.map(img => img.detailImagePath)
      })], {type: 'application/json'});

      formData.append('dto', dtoBlob);
      if (this.editMainImage) {
        formData.append('mainImage', this.editMainImage);
      }
      this.editDetailImages.forEach((image, index) => {
        formData.append('detailImages', image);
      });

      axiosAdminInstance.patch(`/v1/contents/${this.selectedConcert.contentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        this.fetchContents();
        this.closeDetailModal();
        alert('콘서트가 성공적으로 수정되었습니다.');
      })
      .catch(error => {
        console.error("콘서트를 수정하는 중에 오류가 발생했습니다.", error);
        alert(error.response.data.message || '콘서트를 수정하는 중 오류가 발생했습니다.');
      });
    },
    prevSlide() {
      this.currentIndex = (this.currentIndex === 0) ? this.selectedConcert.detailImageList.length
          - 1 : this.currentIndex - 1;
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex === this.selectedConcert.detailImageList.length - 1)
          ? 0 : this.currentIndex + 1;
    }
  },
  mounted() {
    this.checkLoginStatus();
    this.fetchCategories();
    this.fetchContents();
  },
  watch: {
    '$route'() {
      this.checkLoginStatus();
    }
  }
};
</script>

<style scoped src="@/assets/css/main.css"></style>
