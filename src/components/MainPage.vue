<template>
  <p>하윙fffffff</p>
</template>

<script>
import {axiosInstance} from "@/axios.js";

export default {
  name: 'MainPage',
  components: {},
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

<style>
.imageSize {
  height: 1000px;
  width: 1800px;
}
</style>
