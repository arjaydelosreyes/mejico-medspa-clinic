<template>
  <header>
    <div class="logo">
      <img src="/src/images/mejico-MDSpa-logo-ntext.png" alt="Mejico Medical Spa Logo" />
      <span class="clinic-name">Mejico MedSpa Clinic</span>
    </div>
    <nav>
      <router-link to="/home" class="nav-item" active-class="active">Home</router-link>
      <router-link to="/about" class="nav-item" active-class="active">About</router-link>
      <div class="nav-item dropdown">
        <button
          class="dropdown-toggle"
          @click="toggleDropdown"
          :class="{ active: isServicesActive }"
        >
          Services
          <ChevronDown
            :class="{ 'rotate-180': isDropdownOpen }"
            class="inline-block w-4 h-4 ml-1 transition-transform duration-200"
          />
        </button>
        <div 
          v-show="isDropdownOpen" 
          class="dropdown-menu"
          :class="{ 'dropdown-menu-active': isDropdownOpen }"
        >
          <router-link to="/clientappointment" class="dropdown-item" active-class="active" @click="closeDropdown">
            <Calendar size="16" class="icon" /> Appointments
          </router-link>
          <router-link to="/calendar" class="dropdown-item" active-class="active" @click="closeDropdown">
            <ClipboardList size="16" class="icon" /> View Calendar
          </router-link>
          <router-link to="/clientoffers" class="dropdown-item" active-class="active" @click="closeDropdown">
            <Tag size="16" class="icon" /> Offers
          </router-link>
        </div>
      </div>
      <router-link to="/contact" class="nav-item" active-class="active">Contact Us</router-link>
      
      <!-- User Profile Dropdown -->
      <div class="nav-item user-profile-dropdown" @click="toggleUserDropdown" v-click-outside="closeUserDropdown">
        <div class="profile-trigger">
          <div class="avatar-container">
            <img 
              v-if="userData.profileImage" 
              :src="userData.profileImage" 
              alt="Profile" 
              class="profile-avatar"
            />
            <UserCircle2 v-else class="default-avatar" />
          </div>
        </div>
        
        <!-- User Dropdown Menu -->
        <div v-if="userDropdownOpen" class="user-dropdown-menu">
          <div class="user-info">
            <div class="avatar-container large">
              <img 
                v-if="userData.profileImage" 
                :src="userData.profileImage" 
                alt="Profile" 
                class="profile-avatar"
              />
              <UserCircle2 v-else class="default-avatar" />
            </div>
            <div class="user-details">
              <span class="user-name purple-username">{{ userData.username || 'Guest User' }}</span>
              <span class="user-email">{{ userData.email || 'No email set' }}</span>
            </div>
          </div>
          
          <div class="dropdown-items">
            <router-link 
              to="/customizeprofile" 
              class="dropdown-item" 
              :class="{ 'active-link': $route.path === '/customizeprofile' }"
            >
              <UserCog2 class="item-icon" />
              <span>Customize Profile</span>
            </router-link>
            <router-link to="/security" class="dropdown-item">
              <Shield class="item-icon" />
              <span>Personal Security</span>
            </router-link>
            <button @click="logout" class="dropdown-item">
              <LogOut class="item-icon" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <!-- Logout notification -->
  <div v-if="logoutMessage" class="logout-notification">
    {{ logoutMessage }}
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { database } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { ChevronDown, UserCircle2, UserCog2, Shield, LogOut, Calendar, ClipboardList, Tag } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

// State
const isDropdownOpen = ref(false)
const userDropdownOpen = ref(false)
const userData = ref({
  username: '',
  fullName: '',
  email: '',
  profileImage: ''
})
const router = useRouter()
const route = useRoute()
const logoutMessage = ref('')

// Computed
const isServicesActive = computed(() => {
  const servicesRoutes = ['/clientappointment', '/calendar', '/clientoffers']
  return servicesRoutes.includes(route.path)
})

// Methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    userDropdownOpen.value = false
  }
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
  if (userDropdownOpen.value) {
    isDropdownOpen.value = false
  }
}

const closeUserDropdown = () => {
  userDropdownOpen.value = false
}

// Fetch user data with error handling
const fetchUserData = async (userId) => {
  try {
    const auth = getAuth()
    const idToken = await auth.currentUser?.getIdToken(true)
    
    if (!idToken) {
      console.error("No authentication token available")
      return
    }

    const userDocRef = doc(database, "users", userId)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      const data = userDoc.data()
      userData.value = {
        username: data.username || 'User',
        fullName: data.fullName || '',
        email: data.email || auth.currentUser?.email || '',
        profileImage: data.profileImage || ''
      }
    } else {
      // Create default user document if it doesn't exist
      const defaultUserData = {
        username: 'User',
        email: auth.currentUser?.email || '',
        createdAt: new Date().toISOString()
      }
      //await setDoc(userDocRef, defaultUserData) // Removed as setDoc is not imported
      userData.value = defaultUserData
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    // Set default values on error
    userData.value = {
      username: 'User',
      email: getAuth().currentUser?.email || '',
      fullName: '',
      profileImage: ''
    }
  }
}

// Logout handler
const logout = async () => {
  try {
    const auth = getAuth()
    await signOut(auth)
    logoutMessage.value = 'Successfully logged out!'
    setTimeout(() => {
      logoutMessage.value = ''
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error("Logout error:", error)
    logoutMessage.value = 'Error logging out. Please try again.'
    setTimeout(() => {
      logoutMessage.value = ''
    }, 2000)
  }
}

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Lifecycle
onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await fetchUserData(user.uid)
    } else {
      userData.value = {
        username: '',
        fullName: '',
        email: '',
        profileImage: ''
      }
      router.push('/login')
    }
  })
})
</script>

<style scoped>
/* Navbar styles */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px 30px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 70px;
}

.clinic-name {
  font-size: 24px;
  color: #3d2f81;
  margin-left: 15px;
  font-weight: 600;
}

nav {
  display: flex;
  align-items: center;
}

.nav-item {
  color: #333;
  margin-left: 15px;
  text-decoration: none;
  font-weight: 500;
  position: relative;
}

.nav-item:nth-child(4) {
  margin-left: 5px;
}

.nav-item:nth-child(2) {
  margin-left: 25px;
}

.username-link {
  color: #6a4fb3 !important;
  font-weight: 600;
  cursor: pointer;
}

.nav-item.active {
  color: #6a4fb3;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #6a4fb3;
}

.nav-item:hover {
  color: #6a4fb3;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  color: #333;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-toggle:hover {
  color: #6a4fb3;
  background-color: rgba(106, 79, 179, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0; /* Change from transform: translateX(-50%) to left: 0 */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 180px;
  z-index: 1000;
  display: none;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s, transform 0.3s;
}

.dropdown-menu-active {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.dropdown-item {
  padding: 12px 20px;
  color: #333;
  text-decoration: none;
  display: block;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
  color: #6a4fb3;
}

/* Enhanced User Profile Dropdown Styles */
.user-profile-dropdown {
  position: relative;
  margin-left: 20px;
}

.profile-trigger {
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.profile-trigger:hover {
  background-color: #f0f0f0;
}

.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #6a4fb3;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-container.large {
  width: 60px;
  height: 60px;
}

.default-avatar {
  width: 100%;
  height: 100%;
  color: #666;
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0;
  overflow: hidden;
}

.user-info {
  padding: 20px;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #eee;
}

.user-details {
  text-align: center;
}

.user-name {
  display: block;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1.1em;
  margin-bottom: 4px;
}

.user-email {
  display: block;
  color: #666;
  font-size: 0.9em;
}

.dropdown-items {
  padding: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #1a1a1a;
  text-decoration: none;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 0.95em;
}

.dropdown-item:hover {
  background-color: #6a4fb3;
  color: #fff;
}

.item-icon {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  color: #666;
}

.icon {
  margin-right: 8px;
  vertical-align: middle;
  color: #6a4fb3;
}

.dropdown-item:hover .icon {
  color: #ffffff;
}

.dropdown-item:hover .item-icon {
  color: #ffffff;
}

.purple-username {
  color: #6a4fb3;
}

.active-link {
  background-color: #6a4fb3;
  color: white;
}

.active-link .item-icon {
  color: white;
}

.logout-notification {
  position: fixed;
  top: 70px;
  right: 20px;
  background-color: #6a4fb3;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-weight: bold;
}
</style>

