<template>
  <div>
    <header>
      <div class="logo">에티켓(everyTicket) 공연관리 페이지</div>
      <div class="user-actions">
        <router-link to="/member-manage" class="nav-button">회원관리</router-link>
        <router-link to="/place/placeManage" class="nav-button">공연장관리</router-link>
        <router-link to="/category/placeManage" class="nav-button">카테고리관리</router-link>
        <router-link v-if="!isLoggedIn" to="/manage/login">로그인</router-link>
        <router-link v-if="!isLoggedIn" to="/manage/signup">회원가입</router-link>
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
          <input type="text" v-model="titleKeyword" placeholder="검색할 콘서트 이름" />
          <button @click="search" class="book-button">검색</button>
        </div>
      </div>
    </nav>
    <main>
      <h2>콘서트 목록</h2>
      <div class="concert-list">
        <div v-for="concert in concerts" :key="concert.contentId" class="concert-item">
          <img :src="concert.mainImagePath" :alt="concert.title" class="concert-image" />
          <span :class="'genre-tag ' + concert.categoryName">{{ concert.categoryName }}</span>
          <h3>{{ concert.title }}</h3>
          <p>설명: {{ concert.description }}</p>
          <p>카테고리: {{ concert.categoryName }}</p>
          <p>상태: {{ concert.status }}</p>
          <button class="book-button" @click="viewConcert(concert)">상세 조회</button>
          <button class="book-button" @click="openStatusModal(concert)">상태 변경</button>
        </div>
      </div>
      <div class="pagination">
        <button v-for="page in totalPagesArray" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{ page }}</button>
      </div>
    </main>

    <!-- 상태 변경 모달 -->
    <div v-if="showStatusModal" class="modal">
      <div class="modal-content">
        <h3>상태 변경</h3>
        <label for="status">상태:</label>
        <select v-model="editConcertData.status" id="status">
          <option value="VISIBLE">보이기</option>
          <option value="HIDDEN">숨기기</option>
          <option value="DELETED">삭제</option>
        </select>
        <button class="book-button" @click="updateStatus">저장</button>
        <button class="book-button" @click="closeStatusModal">취소</button>
      </div>
    </div>
  </div>
</template>

<script>
import { axiosAdminInstance } from "@/axios.js";

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
      showStatusModal: false,
      editConcertData: {},
    };
  },
  computed: {
    totalPagesArray() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
  },
  methods: {
    viewConcert(concert) {
      this.$router.push({ name: 'Concert', params: { id: concert.contentId } });
    },
    changePage(pageNumber) {
      this.currentPage = pageNumber;
      this.fetchContents();
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
    fetchContents() {
      const categoryId = this.selectedCategory === '전체' ? null : this.selectedCategory;
      axiosAdminInstance.get(`/v1/contents`, {
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
      try {
        await axiosAdminInstance.post('/v1/auth/logout');
        localStorage.removeItem('Authorization');
        localStorage.removeItem('RefreshToken');
        this.isLoggedIn = false;
        this.$router.push({ name: 'AdminMainPage' });
        alert('로그아웃 하셨습니다.');
      } catch (error) {
        console.error('Logout failed', error);
        alert(error.response.data.message || '로그아웃에 실패했습니다.');
      }
    },
    openStatusModal(concert) {
      this.editConcertData = { ...concert };
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

<style src="@/assets/css/main.css"></style>
