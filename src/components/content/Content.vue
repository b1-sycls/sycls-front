<template>
  <div>
    <header>
      <div class="logo">서윤조이스</div>
      <div class="user-actions">
        <a href="/signup.html">회원가입</a>
        <a href="/login.html">로그인</a>
      </div>
    </header>
    <nav>
      <ul class="categories">
        <li v-for="category in categories" :key="category.id">
          <a :href="`#${category.name}`" @click="fetchContents(category.name)" :class="{ active: selectedCategory === category.name }">{{ category.name }}</a>
        </li>
      </ul>
    </nav>
    <main>
      <div class="search-bar">
        <input type="text" v-model="searchTerm" placeholder="검색할 콘서트 이름" />
        <button @click="search">검색</button>
      </div>
      <h2>다가오는 모든 장르 콘서트</h2>
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
        <button v-for="page in totalPages" :key="page" @click="changePage(page)" :class="{ active: currentPage === page }">{{ page }}</button>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import '/src/assets/css/content.css';  // 스타일시트를 import 합니다.

export default {
  data() {
    return {
      searchTerm: '',
      currentPage: 1,
      totalPages: 5,
      selectedCategory: '전체',
      categories: [],
      concerts: []
    };
  },
  methods: {
    bookTicket(concert) {
      alert(`${concert.title} 티켓 예매를 시작합니다. 좌석 선택 페이지로 이동합니다.`);
      // 여기에 실제 예매 로직이나 페이지 이동을 구현할 수 있습니다.
    },
    search() {
      alert(`'${this.searchTerm}'에 대한 모든 장르 콘서트 검색을 시작합니다.`);
      // 여기에 실제 검색 로직을 구현할 수 있습니다.
    },
    changePage(pageNumber) {
      this.currentPage = pageNumber;
      this.fetchContents(this.selectedCategory);
    },
    fetchCategories() {
      axios.get('http://localhost:8080/v1/categories')
      .then(response => {
        this.categories = response.data.data;
      })
      .catch(error => {
        console.error("There was an error fetching the categories!", error);
      });
    },
    fetchContents(category) {
      this.selectedCategory = category;
      axios.get(`http://localhost:8080/v1/contents`, {
        params: {
          category: category,
          page: this.currentPage
        }
      })
      .then(response => {
        this.concerts = response.data.data;
        this.totalPages = response.data.totalPages;
      })
      .catch(error => {
        console.error("There was an error fetching the contents!", error);
      });
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchContents('전체');

    const concertItems = document.querySelectorAll('.concert-item');
    concertItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 50);
      }, index * 200);
    });
  }
};
</script>
