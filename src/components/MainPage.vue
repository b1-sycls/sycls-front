<template>
  <div>
    <header>
      <div class="logo">서윤조이스</div>
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
          <img :src="concert.mainImagePath" :alt="concert.title" width="220" height="300" />
          <span :class="'genre-tag ' + concert.categoryName">{{ concert.categoryName }}</span>
          <h3>{{ concert.title }}</h3>
          <p>설명: {{ concert.description }}</p>
          <p>카테고리: {{ concert.categoryName }}</p>
          <button class="book-button" @click="bookTicket(concert)">상세 조회</button>
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
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
  },
  methods: {
    bookTicket(concert) {
      alert(`${concert.title} 예매를 하기위한 공연 상세 페이지로 이동(업데이트예정)`);
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
        this.currentPage = responseData.currentPage + 1;
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
      try {
        await axiosInstance.post('/v1/auth/logout');
        localStorage.removeItem('Authorization');
        localStorage.removeItem('RefreshToken');
        this.isLoggedIn = false;
        this.$router.push({ name: 'MainPage' });
        alert('로그아웃 하셨습니다.');
      } catch (error) {
        console.error('Logout failed', error);
        alert('로그아웃에 실패했습니다.');
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
<!--프론트 CSS 가 충돌? 겹침? 문제 뒤로가기나 html 이동시 css 가 이전게 적용됨-->
<style src="@/assets/css/content.css"></style>
