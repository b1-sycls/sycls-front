<template>
  <div>
    <header>
      <div class="logo">서윤조이스</div>
      <div class="user-actions">
        <router-link to="/signup">회원가입</router-link>
        <router-link to="/login">로그인</router-link>
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
          <img :src="concert.mainImagePath" :alt="concert.title" width="220" height="300" />
          <span :class="'genre-tag ' + concert.categoryName">{{ concert.categoryName }}</span>
          <h3>{{ concert.title }}</h3>
          <p>설명: {{ concert.description }}</p>
          <p>카테고리: {{ concert.categoryName }}</p>
          <button class="book-button" @click="bookTicket(concert)">예매 하기</button>
        </div>
      </div>
      <div class="pagination">
        <button v-for="page in totalPagesArray" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{ page }}</button>
      </div>
    </main>
  </div>
</template>

<script>
import axiosInstance from "@/axios.js";

export default {
  name: 'MainPage',
  data() {
    return {
      titleKeyword: '',
      currentPage: 1,
      totalPages: 1, // 초기값을 1로 설정합니다.
      selectedCategory: '전체',
      categories: [],
      concerts: []
    };
  },
  computed: {
    totalPagesArray() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
  },
  methods: {
    bookTicket(concert) {
      alert(`${concert.title} 예매를 하기위한 공연 상세 페이지로 이동(업데이트예정)`);
      // 여기에 실제 예매 로직이나 페이지 이동을 구현할 수 있습니다.
    },
    changePage(pageNumber) {
      this.currentPage = pageNumber;
      this.fetchContents();
    },
    search() {
      this.currentPage = 1; // 검색 시 페이지를 1로 초기화합니다.
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
        this.concerts = []; // 기존 콘서트 데이터를 초기화합니다.
        this.concerts = responseData.data; // 새로운 데이터를 할당합니다.
        this.currentPage = responseData.currentPage + 1; // API의 currentPage는 0부터 시작하므로 1을 더합니다.
        this.totalPages = responseData.totalPage;
      })
      .catch(error => {
        console.error("콘텐츠를 가져오는 중에 오류가 발생했습니다.", error);
      });
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchContents();
  }
};
</script>

<style src="../assets/css/content.css"></style>
