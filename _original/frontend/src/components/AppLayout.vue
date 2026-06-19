<template>
  <div v-if="isAdmin" class="app-container">
    <div class="sidebar-wrapper">
      <div class="sidebar">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo-container">
            <img 
              src="/src/images/mejico-MDSpa-logo-ntext.png" 
              alt="Mejico MedSpa Logo" 
              class="logo-image"
            />
            <div class="logo-text">
              <h1>Mejico MedSpa</h1>
              <span>Admin Dashboard</span>
            </div>
          </div>
        </div>

        <!-- Main Menu Section -->
        <div class="menu-section">
          <span class="menu-label">ADMIN MENU</span>
          
          <nav class="nav-section">
            <div class="nav-container">
              <div v-for="(route, index) in routes" :key="index" class="nav-item">
                <div v-if="route.submenu">
                  <div
                    @click="toggleSubmenu(route.name)"
                    class="menu-item"
                    :class="{ 
                      'active': openSubmenus[route.name],
                      'parent-active': isSubmenuActive(route.submenu)
                    }"
                  >
                    <div class="menu-content">
                      <div class="icon-wrapper">
                        <component :is="route.icon" class="menu-icon" />
                      </div>
                      <span>{{ route.name }}</span>
                    </div>
                    <ChevronDownIcon 
                      v-if="!openSubmenus[route.name]" 
                      class="chevron"
                    />
                    <ChevronUpIcon 
                      v-else 
                      class="chevron"
                    />
                  </div>
                  <transition 
                    name="submenu"
                    @enter="el => el.style.height = el.scrollHeight + 'px'"
                    @leave="el => el.style.height = '0'"
                  >
                    <div 
                      v-if="openSubmenus[route.name]" 
                      class="submenu"
                    >
                      <div class="submenu-wrapper">
                        <a
                          v-for="(subItem, subIndex) in route.submenu"
                          :key="subIndex"
                          href="#"
                          @click.prevent="handleNavigation(subItem.path)"
                          class="submenu-item"
                          :class="{ 
                            'active': $route.path === subItem.path,
                            'parent-active': $route.path.includes(subItem.path)
                          }"
                        >
                          <div class="submenu-indicator">
                            <div class="submenu-dot"></div>
                          </div>
                          <span>{{ subItem.name }}</span>
                        </a>
                      </div>
                    </div>
                  </transition>
                </div>
                <a
                  v-else
                  href="#"
                  @click.prevent="handleNavigation(route.path)"
                  class="menu-item"
                  :class="{ 'active': $route.path === route.path }"
                >
                  <div class="menu-content">
                    <div class="icon-wrapper">
                      <component :is="route.icon" class="menu-icon" />
                    </div>
                    <span>{{ route.name }}</span>
                  </div>
                </a>
              </div>
            </div>
          </nav>
        </div>

        <!-- Logout Button -->
        <div class="logout-section">
          <button @click="logout" class="logout-button">
            <div class="icon-wrapper">
              <LogOutIcon class="menu-icon" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  LayoutDashboardIcon,
  UsersIcon,
  CalendarIcon,
  StethoscopeIcon,
  PackageIcon,
  LogOutIcon
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const openSubmenus = ref({});
const isAdmin = ref(false);

// Check admin status
const checkAdminStatus = async (user) => {
  if (!user) {
    isAdmin.value = false;
    router.push('/landing');
    return;
  }

  try {
    const userDoc = await getDoc(doc(database, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      isAdmin.value = false;
      router.push('/landing');
      return;
    }
    isAdmin.value = true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    isAdmin.value = false;
    router.push('/landing');
  }
};

// Setup auth listener
onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    await checkAdminStatus(user);
  });

  // Cleanup on component unmount
  return () => unsubscribe();
});

const toggleSubmenu = (routeName) => {
  if (!isAdmin.value) return;
  openSubmenus.value[routeName] = !openSubmenus.value[routeName];
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    router.push('/landing');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

// Guard navigation
const handleNavigation = (path) => {
  if (!isAdmin.value) {
    console.error('Unauthorized access attempt');
    return;
  }
  router.push(path);
};

const isSubmenuActive = (submenu) => {
  return submenu.some(item => route.path.includes(item.path));
};

const routes = [
  { 
    path: '/admin-dashboard', 
    name: 'Dashboard', 
    icon: LayoutDashboardIcon,
    adminOnly: true
  },
  { 
    name: 'Client Management',
    icon: UsersIcon,
    adminOnly: true,
    submenu: [
      { path: '/admin/profiles', name: 'Client Profiles' },
      { path: '/admin/clients', name: 'Treatment Records' },
    ]
  },
  { 
    name: 'Appointment Management',
    icon: CalendarIcon,
    adminOnly: true,
    submenu: [
      { path: '/admin/appointmentlists', name: 'Approved Appointments' },
      { path: '/admin/calendar', name: 'View Calendar' },
      { path: '/admin/appointments', name: 'Schedule Management' },
    ]
  },
  { 
    name: 'Services & Treatments',
    icon: StethoscopeIcon,
    adminOnly: true,
    submenu: [
      { path: '/admin/services', name: 'Service Management' },
      { path: '/admin/treatments', name: 'Treatment Management' },
      { path: '/admin/treatmentlists', name: 'Treatment Packages' },
    ]
  },
  { 
    name: 'Inventory & Products',
    icon: PackageIcon,
    adminOnly: true,
    submenu: [
      { path: '/admin/products', name: 'Product Lists' },
      { path: '/admin/productmanage', name: 'Product Management' },
      { path: '/admin/inventory', name: 'Inventory' },
    ]
  },
];
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 0.5rem;
  font-family: 'Poppins', sans-serif;
}

.sidebar-wrapper {
  flex-shrink: 0;
}

.sidebar {
  position: fixed;
  width: 320px;
  height: calc(100vh - 1rem);
  background-color: #382d6e;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-section {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text h1 {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.logo-text span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 400;
}

.menu-section {
  padding: 1.25rem 1rem;
  flex-grow: 1;
  overflow-y: auto;
}

.menu-label {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  padding-left: 1rem;
}

.nav-container {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  width: 100%;
  white-space: nowrap;
  gap: 8px;
}

.menu-item:hover,
.menu-item.active,
.menu-item.parent-active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.menu-content span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.menu-item:hover .icon-wrapper,
.menu-item.active .icon-wrapper,
.menu-item.parent-active .icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
}

.menu-icon {
  width: 18px;
  height: 18px;
  color: white;
  transition: all 0.3s ease;
}

.chevron {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 4px;
}

.menu-item:hover .chevron,
.menu-item.active .chevron,
.menu-item.parent-active .chevron {
  color: white;
}

.menu-item.active .chevron,
.menu-item.parent-active .chevron {
  transform: rotate(180deg);
}

.submenu {
  overflow: hidden;
  height: 0;
  transition: height 0.3s ease;
}

.submenu-wrapper {
  padding: 0.5rem 0 0.5rem 1rem;
  position: relative;
}

.submenu-wrapper::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 10%,
    rgba(255, 255, 255, 0.1) 90%,
    rgba(255, 255, 255, 0) 100%
  );
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.625rem 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin: 2px 0;
  white-space: nowrap;
  width: 100%;
  position: relative;
}

.submenu-item:hover,
.submenu-item.active,
.submenu-item.parent-active {
  color: white;
  background: rgba(255, 255, 255, 0.12);
  padding-left: 1.25rem;
}

.submenu-indicator {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
}

.submenu-dot {
  width: 6px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.submenu-item:hover .submenu-dot,
.submenu-item.active .submenu-dot,
.submenu-item.parent-active .submenu-dot {
  background-color: white;
  transform: scale(1.2);
}

.submenu-item.active::before,
.submenu-item.parent-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: white;
  border-radius: 0 4px 4px 0;
}

.logout-section {
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9375rem;
}

.logout-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.08);
}

.main-content {
  flex: 1;
  margin-left: 340px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  min-height: calc(100vh - 1rem);
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Animation classes */
.submenu-enter-active,
.submenu-leave-active {
  transition: height 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  height: 0 !important;
}
</style>