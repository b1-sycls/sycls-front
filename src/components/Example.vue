<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <!-- Container wrapper -->
    <div class="container-fluid">
      <!-- Toggle button -->
      <button class="navbar-toggler px-0" type="button" data-mdb-toggle="collapse"
              data-mdb-target="#navbarExample2" aria-controls="navbarExample2" aria-expanded="false"
              aria-label="Toggle navigation">
        <i class="fas fa-bars"></i>
      </button>

      <!-- Collapsible wrapper -->
      <div class="collapse navbar-collapse" id="navbarExample2" style="background-color: skyblue">
        <!-- Left links -->
        <ul class="navbar-nav me-auto ps-lg-0" style="padding-left: 0.15rem">
          <li class="nav-item">
            <a href="/"><img src="https://www.inhatc.ac.kr/sites/kr/intro01/images/img-logo.png" alt="logo"></a>
          </li>
          <!-- Navbar dropdown -->
          <li class="nav-item dropdown position-static">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
               data-mdb-toggle="dropdown" aria-expanded="false">
              학과안내
            </a>
            <!-- Dropdown menu -->
            <div class="dropdown-menu w-100 mt-0" aria-labelledby="navbarDropdown" style="
                          border-top-left-radius: 0;
                          border-top-right-radius: 0;
                        ">
              <div class="container">
                <div class="row my-4">
                  <div class="col-md-6 col-lg-3 mb-3 mb-lg-0">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        기계공학부
                      </p>
                      <router-link :to="{path:'/department/mecheng'}"
                                   class="list-group-item list-group-item-action">
                        기계공학과
                      </router-link>
                      <router-link :to="{path:'/department/md'}"
                                   class="list-group-item list-group-item-action">
                        기계설계공학과
                      </router-link>
                      <router-link :to="{path:'/department/mecha'}"
                                   class="list-group-item list-group-item-action">
                        메카트로닉스공학과
                      </router-link>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-3 mb-3 mb-lg-0">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        수송기계학부
                      </p>
                      <router-link :to="{path:'/department/sos'}"
                                   class="list-group-item list-group-item-action">
                        조선기계공학과
                      </router-link>
                      <router-link :to="{path:'/department/ame'}"
                                   class="list-group-item list-group-item-action">
                        항공기계공학과
                      </router-link>
                      <router-link :to="{path:'/department/auto'}"
                                   class="list-group-item list-group-item-action">
                        자동차공학과
                      </router-link>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-3 mb-3 mb-md-0">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        정보산업공학부 </p>
                      <router-link :to="{path:'/department/ee'}"
                                   class="list-group-item list-group-item-action">
                        전기공학과
                      </router-link>
                      <router-link :to="{path:'/department/er'}"
                                   class="list-group-item list-group-item-action">
                        전자공학과
                      </router-link>
                      <router-link :to="{path:'/department/inc'}"
                                   class="list-group-item list-group-item-action">
                        정보통신공학과
                      </router-link>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-3">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        컴퓨터정보공학부
                      </p>
                      <router-link :to="{path:'/department/cs'}"
                                   class="list-group-item list-group-item-action">
                        컴퓨터정보과
                      </router-link>
                      <router-link :to="{path:'/department/cse'}"
                                   class="list-group-item list-group-item-action">
                        컴퓨터시스템과
                      </router-link>
                    </div>
                  </div>
                </div>
                <!--2행 시작-->
                <div class="row my-4">
                  <div class="col-md-6 col-lg-3 mb-3 mb-lg-0">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        지구환경공학부
                      </p>
                      <router-link :to="{path:'/department/civil'}"
                                   class="list-group-item list-group-item-action">
                        건설환경공학과
                      </router-link>
                      <router-link :to="{path:'/department/gisup'}"
                                   class="list-group-item list-group-item-action">
                        공간정보빅데이터과
                      </router-link>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-3 mb-3 mb-lg-0">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        건축학부
                      </p>
                      <router-link :to="{path:'/department/archi'}"
                                   class="list-group-item list-group-item-action">
                        건축학과
                      </router-link>
                      <router-link :to="{path:'/department/interior'}"
                                   class="list-group-item list-group-item-action">
                        실내건축과
                      </router-link>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-3 mb-3 mb-md-0">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        신소재공학부 </p>
                      <router-link :to="{path:'/department/chem'}"
                                   class="list-group-item list-group-item-action">
                        화학생명공학과
                      </router-link>
                      <router-link :to="{path:'/department/mse'}"
                                   class="list-group-item list-group-item-action">
                        재료공학과
                      </router-link>
                    </div>
                  </div>
                  <div class="col-md-6 col-lg-3">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        서비스학부
                      </p>
                      <router-link :to="{path:'/department/cbncrew'}"
                                   class="list-group-item list-group-item-action">
                        항공운항과
                      </router-link>
                      <router-link :to="{path:'/department/asm'}"
                                   class="list-group-item list-group-item-action">
                        항공경영학과
                      </router-link>
                      <router-link :to="{path:'/department/tour'}"
                                   class="list-group-item list-group-item-action">
                        관광경영학과
                      </router-link>
                      <router-link :to="{path:'/department/secretary'}"
                                   class="list-group-item list-group-item-action">
                        비서과
                      </router-link>
                      <router-link :to="{path:'/department/hotel'}"
                                   class="list-group-item list-group-item-action">
                        호텔경영학과
                      </router-link>
                    </div>
                  </div>
                </div>
                <!--                3행시작-->
                <div class="row my-4">
                  <div class="col-md-6 col-lg-3 mb-3 mb-lg-0">
                    <div class="list-group list-group-flush">
                      <p class="mb-0 list-group-item text-uppercase font-weight-bold">
                        디자인학부
                      </p>
                      <router-link :to="{path:'/department/industrydesign'}"
                                   class="list-group-item list-group-item-action">
                        산업디자인학과
                      </router-link>
                      <router-link :to="{path:'/department/fashion'}"
                                   class="list-group-item list-group-item-action">
                        패션디자인학과
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <!--공지사항-->
          <li class="nav-item dropdown position-static">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
               data-mdb-toggle="dropdown" aria-expanded="false">
              공지사항
            </a>
            <!-- Dropdown menu -->
            <div class="dropdown-menu w-100 mt-0" aria-labelledby="navbarDropdown" style="
                          border-top-left-radius: 0;
                          border-top-right-radius: 0;
                        ">
              <div class="container">
                <div class="row my-4">
                  <div class="col-md-6 col-lg-3 mb-3 mb-lg-0">
                    <div class="list-group list-group-flush">
                      <a class="list-group-item list-group-item-action" href="/board/list">공지사항</a>
                      <a class="list-group-item list-group-item-action" href="/board/list/affairs">학적</a>
                      <a class="list-group-item list-group-item-action" href="/board/list/sst">장학</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <div v-if="loggedIn">
            <li class="nav-item">
              {{ memberName }}
              <button @click="logout">로그아웃</button>
            </li>
          </div>
          <div v-else>
            <li class="nav-item">
              <router-link :to="{path:'/member/login'}" class="nav-link">로그인</router-link>
            </li>
          </div>
          <li class="nav-item" v-if="memberStatus === 'admin'">
            <router-link :to="{path:'/admin'}" class="nav-link">관리자</router-link>
          </li>
        </ul>
        <!-- Left links -->
      </div>
      <!-- Collapsible wrapper -->
    </div>
    <!-- Container wrapper -->
  </nav>

</template>

<script>
import axios from "axios";

export default {
  name: "DepartmentName",
  data() {
    return {
      loggedIn: false,
      memberName: '',
      memberStatus: '',
    };
  },
  created() {
    axios.get('/api/checkLoginStatus')
        .then(response => {
          if (response.data.loggedIn === true) {
            this.loggedIn = response.data.loggedIn;
            this.memberName = response.data.memberName;
            if (response.data.memberStatus === 1) {
              this.memberStatus = "admin"
            }
          } else {
            this.loggedIn = false;
          }
        })
        .catch(error => {
          console.error('Error checking login status:', error);
        });
  },
  methods: {
    logout() {
      axios.post('/logout')
          .then(response => {
            this.loggedIn = response.data;
          })
          .catch(error => {
            console.error('Error checking login status:', error);
          });
    }
  }
};
</script>
