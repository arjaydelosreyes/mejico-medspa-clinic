<template>
  <div class="landing-container">
    <Navbar />

    <main>
      <LandingAbout />
    </main>

    <FooterComponent />
  </div>
</template>

<script>
import { ref } from 'vue';
import FooterComponent from './Footer.vue';
import LandingAbout from './LandingAbout.vue'; 
import Navbar from './Navbar.vue';

export default {
  name: 'LandingPage',
  components: {
    FooterComponent,
    LandingAbout,
    Navbar,
  },
  setup() {
    const isDropdownOpen = ref(false);

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    return { isDropdownOpen, toggleDropdown };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.landing-container {
  font-family: 'Poppins', sans-serif;
  color: #ffffff;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

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
  margin-left: 20px;
  text-decoration: none;
  font-weight: 500;
  position: relative;
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
  cursor: pointer;
}

.dropdown-toggle {
  color: #333;
  font-weight: 500;
}

.dropdown-toggle:hover {
  color: #6a4fb3;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  min-width: 150px;
  z-index: 1000;
}

.dropdown-item {
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  display: block;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
  color: #6a4fb3;
}

main {
  padding-top: 100px;
}

/* Welcome Section Styles */

.welcome-section {
  position: relative;
  height: calc(100vh - 100px);
  background-image: url('/src/images/MEJICO-bg-2.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center; 
}

.blur-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.5); 
  z-index: 0;
}

.welcome-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  border-radius: 5px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto; 
}

.welcome-logo {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome-logo img {
  max-width: 100%;
  height: auto;
}

.welcome-text {
  flex: 1;
  padding-right: 40px;
}

.welcome-text h1 {
  font-size: 36px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 20px;
}

.welcome-text h1 span {
  font-weight: 900;
  color: #8573df;
}

.welcome-text p {
  font-size: 16px;
  color: #fff;
  margin: 15px 0;
}

.cta-button {
  background-color: #8573df;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  margin-top: 30px;
}

.cta-button:hover {
  background-color: #6658ac;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    padding: 15px;
  }

  nav {
    margin-top: 15px;
  }

  .welcome-content {
    flex-direction: column;
    text-align: center;
    padding: 30px;
  }

  .welcome-text {
    padding-right: 0;
    padding-left: 0;
    margin-bottom: 30px;
  }
}
</style>
