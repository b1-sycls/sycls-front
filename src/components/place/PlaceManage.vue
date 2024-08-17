<template>
  <div class="nav-bar">
    <!--    <router-link class="nav-button" to="/member-manage">회원관리</router-link>-->
    <!--    <router-link class="nav-button" to="/manage">공연장관리</router-link>-->
    <router-link class="nav-button" to="/manage">공연관리</router-link>
    <router-link class="nav-button" to="/manage/category">카테고리관리</router-link>
    <button class="nav-button" @click="logout">로그아웃</button>
  </div>
  <div id="app" class="container">
    <div class="header">
      <h1 class="title">공연장 조회</h1>
    </div>

    <div class="search-bar">
      <label class="status-label" for="searchStatus">상태 선택:</label>
      <select id="searchStatus" v-model="searchStatus" class="search-status">
        <option value="">전체</option>
        <option value="ENABLE">활성화</option>
        <option value="DISABLE">비활성화</option>
      </select>
      <select v-model="searchCategory" class="search-category">
        <option value="name">이름</option>
        <option value="location">장소</option>
      </select>
      <input v-model="searchQuery" class="search-input" placeholder="검색" type="text"
             @keyup.enter="searchVenues">
      <button class="search-button" @click="searchVenues">검색</button>
    </div>

    <div class="venue-grid">
      <div v-for="venue in paginatedVenues" :key="venue.placeId" class="venue-item"
           @click="editVenue(venue)">
        <div class="venue-name">{{ venue.name }}</div>
        <div class="venue-address">{{ venue.location }}</div>
        <div class="venue-status">
          <span
              :class="{'status-enabled': venue.status === 'ENABLE', 'status-disabled': venue.status === 'DISABLE'}">
            {{ venue.status === 'ENABLE' ? '활성화' : '비활성화' }}
          </span>
        </div>
        <button class="delete-button" @click.stop="deleteVenue(venue.placeId)">삭제</button>
      </div>
    </div>

    <div v-if="totalPages > 0" class="pagination">
      <button v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }"
              class="page-button" @click="changePage(page)">
        {{ page }}
      </button>
    </div>

    <button class="register-button" @click="showRegisterModal">공연장 등록</button>

    <!-- 공연장 등록/수정 모달 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>{{ isEditing ? '공연장 수정' : '공연장 등록' }}</h2>
        <form @submit.prevent="submitVenue">
          <div class="form-group">
            <label for="venueName">공연장 이름</label>
            <input id="venueName" v-model="editingVenue.name" required>
          </div>
          <div class="form-group">
            <label for="venueLocation">위치</label>
            <input id="venueLocation" v-model="editingVenue.location" required>
          </div>
          <div class="form-group">
            <label for="venueMaxSeat">최대 좌석 수</label>
            <input id="venueMaxSeat" v-model="editingVenue.maxSeat" required type="number">
          </div>
          <div v-if="isEditing" class="form-group">
            <label for="venueStatus">상태</label>
            <select id="venueStatus" v-model="editingVenue.status" required>
              <option value="ENABLE">사용 가능</option>
              <option value="DISABLE">사용 불가능</option>
            </select>
          </div>
          <div class="button-group">
            <button class="submit-button" type="submit">{{ isEditing ? '수정' : '등록' }}</button>
            <button class="seat-button" type="button"
                    @click="editSeats(editingVenue.placeId, editingVenue.name, editingVenue.maxSeat)">
              좌석 수정
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";
import {logoutAdminUser} from "@/utils.js";

export default {
  name: 'PlaceManage',
  data() {
    return {
      searchQuery: '',
      searchCategory: 'name',
      searchStatus: '',
      venues: [],
      currentPage: 1,
      totalPage: 1,
      totalElements: 0,
      hasNextPage: false,
      itemsPerPage: 8,
      showModal: false,
      editingVenue: {id: null, name: '', location: '', maxSeat: 0, status: 'ENABLE'},
      isEditing: false
    }
  },
  computed: {
    paginatedVenues() {
      const start = 0;
      const end = 8;
      return this.venues.slice(start, end);
    },
    totalPages() {
      return this.totalElements > 0 ? Math.ceil(this.totalElements / this.itemsPerPage) : 1;
    }
  },
  methods: {
    async getVenues() {
      try {
        let params = {
          pageNum: this.currentPage,
        };
        if (this.searchCategory === "name") {
          params.name = this.searchQuery;
        } else if (this.searchCategory === "location") {
          params.location = this.searchQuery;
        }
        if (this.searchStatus) {
          params.status = this.searchStatus;
        }

        const response = await axiosAdminInstance.get(`v1/places`, {params});
        const {currentPage, totalPage, totalElements, hasNextPage, data} = response.data.data;
        this.venues = data.map(venue => ({
          placeId: venue.placeId,
          location: venue.location,
          name: venue.name,
          maxSeat: venue.maxSeat,
          status: venue.status,
          createdAt: venue.createdAt
        }));
        this.currentPage = currentPage;
        this.totalPage = totalPage;
        this.totalElements = totalElements;
        this.hasNextPage = hasNextPage;
      } catch (error) {
        console.error('Error fetching venues:', error);
        alert('공연장 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    },
    searchVenues() {
      this.currentPage = 1;
      this.getVenues();
    },
    editVenue(venue) {
      this.isEditing = true;
      this.editingVenue = {...venue};
      this.showModal = true;
    },
    changePage(page) {
      this.currentPage = page;
      this.getVenues();
    },
    showRegisterModal() {
      this.isEditing = false;
      this.editingVenue = {id: null, name: '', location: '', maxSeat: 0, status: 'ENABLE'};
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.editingVenue = {id: null, name: '', location: '', maxSeat: 0, status: 'ENABLE'};
    },
    async submitVenue() {
      try {
        if (this.isEditing) {
          if (confirm("수정하시겠습니까?")) {
            await axiosAdminInstance.patch(`/v1/places/${this.editingVenue.placeId}`, {
              location: this.editingVenue.location,
              name: this.editingVenue.name,
              maxSeat: this.editingVenue.maxSeat,
              status: this.editingVenue.status
            });
            alert("수정되었습니다.");
            await this.getVenues();
          }
        } else {
          const newVenue = {
            location: this.editingVenue.location,
            name: this.editingVenue.name,
            maxSeat: this.editingVenue.maxSeat,
          };
          await axiosAdminInstance.post(`/v1/places`, newVenue);
          alert('공연장이 성공적으로 등록되었습니다.');
          await this.getVenues()
        }
        this.closeModal();
      } catch (error) {
        console.error('Error submitting venue:', error);
        alert(error.response.data.message);
      }
    },
    async deleteVenue(id) {
      if (confirm('정말로 이 공연장을 삭제하시겠습니까?')) {
        try {
          await axiosAdminInstance.delete(`/v1/places/${id}`);
          await this.getVenues();
          alert('공연장이 삭제되었습니다.');
        } catch (error) {
          console.error('Error deleting venue:', error);
          alert(error.response?.data?.message || '공연장 삭제에 실패했습니다.');
        }
      }
    },
    async logout() {
      const success = await logoutAdminUser(true);
      if (success) {
        this.isLoggedIn = false;
        this.$router.push({name: 'ManageLogin'});
      }
    },
    editSeats(placeId, name, maxSeat) {
      this.$router.push(
          {name: 'SeatManage', query: {placeId: placeId, placeName: name, maxSeat: maxSeat}});
    }
  },
  created() {
    this.getVenues();
  }
}
</script>

<style scoped src="../../assets/css/placeManage.css"></style>