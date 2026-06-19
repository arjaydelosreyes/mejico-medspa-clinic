<template>
  <div class="landing-container">
    <header>
      <div class="logo">
        <img src="/src/images/mejico-MDSpa-logo-ntext.png" alt="Mejico Medical Spa Logo">
        <span class="clinic-name">Mejico MedSpa Clinic</span>
      </div>
      <nav>
        <router-link to="/login" class="nav-btn">Login</router-link>
        <router-link to="/register" class="nav-btn">Sign Up</router-link>
      </nav>
    </header>

    <main>
      <section class="welcome-section">
        <div class="blur-background"></div>
        <div class="welcome-content">
          <div class="welcome-text">
            <h3>Your Partner in Health & Beauty</h3>
            <h1>Expert Care for <span>Radiant Skin</span> and Lasting Wellness</h1>
            <p>Mejico MD Medical Spa Clinic offers a blend of advanced dermatological treatments and personalized skin care services designed to bring out your natural beauty. Whether you're seeking medical consultations or luxurious facials, trust us to enhance your skin's health and appearance.</p>
            <button class="cta-button" @click="handleAppointmentClick">Book an Appointment</button>
          </div>
          <div class="welcome-logo">
            <img src="/src/images/mejico-image5.png" alt="Mejico Logo">
          </div>
        </div>
      </section>

      <Carousel />
      <LandingAbout />
    </main>

    <FooterComponent />

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-icon">
          <UserCircle class="icon" />
        </div>
        <h3 class="modal-title">Authentication Required</h3>
        <p class="modal-message">You need to log in or register before booking an appointment.</p>
        <div class="modal-actions">
          <router-link to="/login" class="modal-button login">
            <LogIn class="button-icon" />
            Login
          </router-link>
          <router-link to="/register" class="modal-button register">
            <UserPlus class="button-icon" />
            Register
          </router-link>
          <button @click="closeModal" class="modal-button close">
            <X class="button-icon" />
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FooterComponent from './Footer.vue';
import Carousel from './Carousel.vue';
import LandingAbout from './LandingAbout.vue';
import { UserCircle, LogIn, UserPlus, X } from 'lucide-vue-next';

const showModal = ref(false);
const router = useRouter();

const handleAppointmentClick = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  // Clear any stored paths when landing on this page
  sessionStorage.removeItem('currentPath');
});
</script>

<style scoped>
:root {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Custom Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(133, 115, 223, 0.1);
}

::-webkit-scrollbar-thumb {
  background: #8573df;
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: #6658ac;
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* For Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #8573df rgba(133, 115, 223, 0.1);
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
}

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.landing-container {
  font-family: 'Poppins', sans-serif;
  color: #ffffff;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
  overflow-x: hidden;
  position: relative;
  left: 0;
  right: 0;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.98);
  padding: 1rem 5%;
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
  height: 3.5rem;
  transition: transform 0.3s ease;
}

.clinic-name {
  font-size: 1.5rem;
  color: #3d2f81;
  margin-left: 1rem;
  font-weight: 600;
}

.nav-btn {
  background-color: #4a3b94;
  color: #fff;
  padding: 0.75rem 1.5rem;
  margin-left: 1rem;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: #31256a;
  transform: translateY(-2px);
}

main {
  padding-top: 5rem;
}

.welcome-section {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 5rem);
  background-image: url('/src/images/MEJICO-bg-2.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  left: 0;
  right: 0;
}

.blur-background {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.4);
}

.welcome-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  width: 90%;
  margin: 0 auto;
  padding: 2rem;
  gap: 4rem;
}

.welcome-text {
  flex: 1;
  max-width: 600px;
}

.welcome-text h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #fff;
}

.welcome-text h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.welcome-text h1 span {
  color: #8573df;
}

.welcome-text p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.welcome-logo {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 600px;
}

.welcome-logo img {
  width: 100%;
  height: auto;
  object-fit: contain;
  animation: slowPulse 4s ease-in-out infinite;
}

.cta-button {
  background-color: #8573df;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button:hover {
  background-color: #6658ac;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(133, 115, 223, 0.3);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}


.modal-content {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  color: #333;
  padding: 2.5rem;
  border-radius: 1.5rem;
  text-align: center;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  animation: slideUp 0.3s ease;
}

.close-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: #4a3b94;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-icon {
  background: linear-gradient(135deg, #8573df, #6658ac);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.modal-icon .icon {
  width: 40px;
  height: 40px;
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d2d2d;
}

.modal-message {
  font-size: 1.1rem;
  line-height: 1.5;
  color: #666;
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.modal-button .button-icon {
  width: 18px;
  height: 18px;
}

.modal-button.login {
  background: #8573df;
  color: white;
}

.modal-button.login:hover {
  background: #6658ac;
  transform: translateY(-2px);
}

.modal-button.register {
  background: #f0edff;
  color: #8573df;
}

.modal-button.register:hover {
  background: #e5e0ff;
  transform: translateY(-2px);
}

.modal-button.close {
  background: #f5f5f5;
  color: #666;
}

.modal-button.close:hover {
  background: #eeeeee;
  color: #444;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Responsive Design */
@media (max-width: 1024px) {
  .welcome-content {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  header {
    padding: 1rem;
  }
  
  .clinic-name {
    font-size: 1.25rem;
  }
  
  .welcome-content {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .welcome-text {
    padding: 0;
  }

  .welcome-logo {
    margin-top: 2rem;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .logo img {
    height: 2.5rem;
  }

  .clinic-name {
    font-size: 1rem;
  }

  .welcome-text h1 {
    font-size: 1.75rem;
  }
}
</style>