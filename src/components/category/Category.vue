<template>
  <div class="container">
    <header>
      <div class="logo">에티켓(everyTicket) 카테고리관리 페이지</div>
      <div class="user-actions">
        <!--        <router-link class="nav-button" to="/member-manage">회원관리</router-link>-->
        <router-link class="nav-button" to="/place/placeManage">공연장관리</router-link>
        <router-link class="nav-button" to="/manage/">공연 관리</router-link>
        <router-link v-if="isLoggedIn" class="nav-button" to="/manage/mypage">마이페이지</router-link>
        <button v-if="isLoggedIn" class="styled-button" @click="logout">로그아웃</button>
      </div>
    </header>

    <div class="category-container">
      <h1>카테고리 목록</h1>
      <button @click="toggleAddCategory">카테고리 추가</button>

      <div v-if="isAddingCategory" class="add-category">
        <input v-model="newCategory" placeholder="새 카테고리 이름을 입력하세요"/>
        <button @click="addCategory">추가</button>
        <button @click="toggleAddCategory">취소</button>
      </div>

      <ul>
        <li v-for="category in categories" :key="category.id" class="category-item">
          <div v-if="editingCategory !== category.id" class="category-content">
            <span>{{ category.name }} ({{ category.status }})</span>
            <div class="category-buttons">
              <button @click="editCategory(category.id, category.name)">수정</button>
              <button v-if="category.status === 'ENABLE'" @click="disableCategory(category.id)">
                비활성화
              </button>
              <button v-else @click="enableCategory(category.id)">활성화</button>
            </div>
          </div>
          <div v-else class="category-content">
            <input v-model="editingCategoryName"/>
            <div class="category-buttons">
              <button @click="updateCategory(category.id)">저장</button>
              <button @click="cancelEdit">취소</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {axiosAdminInstance} from "@/axios.js";
import {logoutAdminUser} from "@/utils.js";

export default {
  name: 'CategoryList',
  data() {
    return {
      categories: [],
      isAddingCategory: false,
      newCategory: '',
      editingCategory: null,
      editingCategoryName: '',
      isLoggedIn: false
    };
  },
  methods: {
    fetchCategories() {
      axiosAdminInstance.get('/v1/categories')
      .then(response => {
        this.categories = response.data.data;
      })
      .catch(error => {
        console.error('카테고리 조회 실패', error);
        alert(error.response?.data?.message || '카테고리 조회에 실패했습니다. 새로고침해주세요');
      });
    },
    toggleAddCategory() {
      this.isAddingCategory = !this.isAddingCategory;
    },
    addCategory() {
      if (this.newCategory.trim() === '') {
        alert('카테고리 이름을 입력해주세요.');
        return;
      }

      axiosAdminInstance.post('/v1/categories', {name: this.newCategory})
      .then(() => {
        this.fetchCategories();
        this.newCategory = '';
        this.isAddingCategory = false;
      })
      .catch(error => {
        console.error('카테고리 등록 실패', error);
        alert(error.response?.data?.message || '카테고리 등록에 실패했습니다.');
      });
    },
    editCategory(id, name) {
      this.editingCategory = id;
      this.editingCategoryName = name;
    },
    updateCategory(id) {
      if (this.editingCategoryName.trim() === '') {
        alert('카테고리 이름을 입력해주세요.');
        return;
      }

      axiosAdminInstance.patch(`/v1/categories/${id}`, {name: this.editingCategoryName})
      .then(() => {
        this.fetchCategories();
        this.cancelEdit();
      })
      .catch(error => {
        console.error('카테고리 수정 실패', error);
        alert(error.response?.data?.message || '카테고리 수정에 실패했습니다.');
      });
    },
    disableCategory(id) {
      if (confirm('정말로 이 카테고리를 비활성화하시겠습니까?')) {
        axiosAdminInstance.delete(`/v1/categories/${id}`)
        .then(() => {
          this.fetchCategories();
        })
        .catch(error => {
          console.error('비활성화 실패', error);
          alert(error.response?.data?.message || '비 활성화에 실패했습니다.');
        });
      }
    },
    enableCategory(id) {
      if (confirm('정말로 이 카테고리를 활성화하시겠습니까?')) {
        axiosAdminInstance.patch(`/v1/categories/${id}/reactivate`)
        .then(() => {
          this.fetchCategories();
        })
        .catch(error => {
          console.error('활성화로 하지못함', error);
          alert(error.response?.data?.message || '활성화에 실패했습니다.');
        });
      }
    },
    cancelEdit() {
      this.editingCategory = null;
      this.editingCategoryName = '';
    },
    async logout() {
      const success = await logoutAdminUser(true);
      if (success) {
        this.isLoggedIn = false;
        this.$router.push({name: 'ManageLogin'});
      }
    }
  },
  mounted() {
    this.isLoggedIn = !!localStorage.getItem('Authorization');
    this.fetchCategories();
  },
  watch: {
    '$route'() {
      this.isLoggedIn = !!localStorage.getItem('Authorization');
    }
  }
};
</script>

<style scoped src="../../assets/css/category.css"></style>
