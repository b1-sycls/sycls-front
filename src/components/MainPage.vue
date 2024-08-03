<template>
  <div>
    <header>
      <div class="logo">에티켓(everyTicket)</div>
      <div class="user-actions">
        <router-link v-if="!isLoggedIn" to="/login">로그인</router-link>
        <router-link v-if="!isLoggedIn" to="/signup">회원가입</router-link>
        <button v-if="isLoggedIn" class="styled-button" @click="logout">로그아웃</button>
        <router-link v-if="isLoggedIn" to="/mypage">마이페이지</router-link>
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
          <button @click="search">검색</button>
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
          <button class="book-button" @click="viewConcert(concert)">상세 조회</button>
        </div>
      </div>
      <div class="pagination">
        <button v-for="page in totalPagesArray" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{ page }}</button>
      </div>
    </main>
  </div>
</template>
<script>
import {axiosInstance} from "@/axios.js";
import { logoutUser } from "@/utils.js";

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
      isLoggedIn: false
    };
  },
  computed: {
    totalPagesArray() {
      return Array.from({length: this.totalPages}, (_, i) => i + 1);
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
      axiosInstance.get('/v1/categories')
      .then(response => {
        this.categories = response.data.data;
      })
      .catch(error => {
        console.error("카테고리를 가져오는 중에 오류가 발생했습니다.", error);
      });
    },
    fetchContents() {
      const categoryId = this.selectedCategory === '전체' ? null : this.selectedCategory;
      axiosInstance.get(`/v1/contents`, {
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
      });
    },
    checkLoginStatus() {
      const token = localStorage.getItem('Authorization');
      this.isLoggedIn = !!token;
    },
    async logout() {
      const success = await logoutUser();
      if (success) {
        this.isLoggedIn = false;
      }
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

<style src="@/assets/css/main.css" scoped></style>
