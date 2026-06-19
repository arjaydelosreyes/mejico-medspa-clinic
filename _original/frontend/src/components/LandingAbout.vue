<template>
  <div class="about-us">
    <!-- Hero Section -->
    <header class="hero">
      <h1 class="hero-title">ABOUT US<span class="underline"></span></h1>
    </header>

    <!-- Our Story Section -->
    <section class="story">
      <div class="story-header">
        <h2>Our Story</h2>
      </div>
      <div class="content">
        <img src="/src/images/mejicobgimage.jpg" alt="Mejico Medical Spa Interior" class="story-image" />
        <div class="story-text">
          <div class="story-card">
            <div class="story-card-content">
              <p>
                Mejico Medical Spa was founded in 2010 with a vision to blend traditional Mexican healing practices with modern medical aesthetics.
                Our journey began in the heart of Mexico City, where we saw an opportunity to create a sanctuary of wellness and beauty that honors
                our rich cultural heritage while embracing cutting-edge technologies.
                <br><br>
                Mejico Medical Spa was founded in 2010 with a vision to blend traditional Mexican healing practices with modern medical aesthetics.
                Our journey began in the heart of Mexico City, where we saw an opportunity to create a sanctuary of wellness and beauty that honors
                our rich cultural heritage while embracing cutting-edge technologies.
              </p>
            </div>
            <div class="founder-card-gradient"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Founder Section -->
    <section class="founder">
      <div class="founder-header">
        <h2>Meet Our Founder</h2>
      </div>
      <div class="content">
        <img src="/src/images/mejicobgimage.jpg" alt="Mejico Medical Spa Interior" class="founder-image" />
        <div class="founder-text">
          <div class="founder-card">
            <div class="founder-card-content">
              <p>
                Mejico Medical Spa was founded in 2010 with a vision to blend traditional Mexican healing practices with modern medical aesthetics.
                Our journey began in the heart of Mexico City, where we saw an opportunity to create a sanctuary of wellness and beauty that honors
                our rich cultural heritage while embracing cutting-edge technologies.
                <br><br>
                Mejico Medical Spa was founded in 2010 with a vision to blend traditional Mexican healing practices with modern medical aesthetics.
                Our journey began in the heart of Mexico City, where we saw an opportunity to create a sanctuary of wellness and beauty that honors
                our rich cultural heritage while embracing cutting-edge technologies.
              </p>
            </div>
            <div class="founder-card-gradient"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission and Vision Section Replacement -->
    <section class="mission-vision">
        <div class="card-grid">
          <div 
            v-for="(item, index) in content" 
            :key="index"
            class="card"
          >
            <div class="card-content">
              <div class="icon-header">
                <component :is="item.icon" class="icon" />
                <h2 class="card-title">{{ item.title }}</h2>
              </div>
              <p class="card-description">{{ item.description }}</p>
            </div>
            <div class="card-gradient"></div>
          </div>
        </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { EyeIcon, TargetIcon } from 'lucide-vue-next';

const content = ref([
  {
    title: 'Vision',
    icon: EyeIcon,
    description: 'To be the leading medical spa in Mexico, recognized for our innovative treatments, exceptional patient care, and commitment to enhancing natural beauty while promoting overall wellness.'
  },
  {
    title: 'Mission',
    icon: TargetIcon,
    description: 'At Mejico Medical Spa Clinic, we are dedicated to providing personalized, state-of-the-art aesthetic and wellness treatments that blend traditional Mexican healing practices with modern medical technologies, ensuring our clients achieve their beauty and health goals in a nurturing, professional environment.'
  }
]);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

/* General Page Styling */
.about-us {
  font-family: 'Poppins', sans-serif;
  color: #333;
  padding: 20px;
  overflow-x: hidden; /* Prevents horizontal scrollbar */
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ff 100%);
}

/* Hero Section Styling */
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-title {
  font-size: 3rem;
  color: #382d6e;
  font-weight: 700;
  position: relative;
  display: inline-block;
  margin-top: 15px;
  margin-bottom: 2rem;
}

.underline {
  display: block;
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 3px;
  background-color: #6656b3;
  animation: snakeLine 3s ease-in-out infinite;
  margin-bottom: 5px;
}

@keyframes snakeLine {
  0% { width: 0; transform: translateX(0); }
  25% { width: 20%; transform: translateX(-5%); }
  50% { width: 100%; transform: translateX(0); }
  75% { width: 50%; transform: translateX(5%); }
  100% { width: 100%; transform: translateX(0); }
}

/* Our Story Section Styling */
.story-header {
  background-color: #6656b3;
  padding: 10px;
  border-radius: 8px;
  color: white;
  display: inline-block;
  margin-bottom: 20px;
  width: 400px;
  margin-left: -40px;
  margin-top: 10px;
}

.story-header h2 {
  font-size: 1.8rem;
  margin-left: 100px;
  font-weight: 700;
}

.content {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-left: 30px;
  margin-top: 10px;
}

.story-image {
  width: 45%;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.278);
  position: relative;
  z-index: 1;
}

.story-text p {
  font-size: 18px;
  line-height: 1.6;
  text-align: justify;
  margin-left: 15px;
  color: #000000;
}

.story-card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin: 5px 15px 20px 0;
  width: 805px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  margin-top: 22px;
  margin-left: -50px;
  position: relative;
  z-index: 0; /* Keeps the card underneath the image */
}

/* Inner Content Styling */
.story-card-content {
  padding: 10px;
  color: #ffffff;
}

/* Founder Section Styling */
.founder-header {
  background-color: #6656b3;
  padding: 10px;
  border-radius: 8px;
  color: white;
  display: inline-block;
  margin-bottom: 20px;
  width: 400px;
  margin-right: 0;
  margin-top: 10px;
  margin-left: 1120px;
}

.founder-header h2 {
  font-size: 1.8rem;
  margin-left: 50px;
  font-weight: 700;
}

.founder-text p {
  font-size: 18px;
  line-height: 1.6;
  text-align: justify;
  color: #000000;
  margin-left: -10px;
}

.founder-card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin: 5px 15px 20px 0;
  width: 805px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  margin-top: 22px;
  margin-right: -45px;
  position: relative;
  z-index: 0;
}

.founder-card-content {
  padding: 10px;
  color: #000000;
}

.founder .content {
  display: flex;
  flex-direction: row-reverse; 
  align-items: center;
  gap: 2rem;
}

.founder-image {
  width: 45%;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.278);
  position: relative;
  z-index: 1;
}

.founder-info h3 {
  font-size: 1.8rem;
  color: #4a4a4a;
  margin-bottom: 1rem;
}

.founder-card-gradient {
  height: 0.5rem;
  background: linear-gradient(to right, #9b5de5, #00f5d4);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0 0 8px 8px;
}

.mission-vision {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  margin-top: 50px;
  margin-bottom: 60px;
}

.content-wrapper {
  width: 85%;
  max-width: 60rem; 
}

.title {
  font-size: 2.25rem; /* Slightly smaller title font */
  font-weight: 700;
  color: #075e54;
  margin-bottom: 2.5rem;
  text-align: center;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem; /* Consistent gap */
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr); /* Two-column layout */
  }
}

.card {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.486);
  overflow: hidden;
  transition: transform 0.5s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Ensure gradient stays aligned at the bottom */
}

.card:hover {
  transform: scale(1.05); /* Hover scaling effect */
}

.card-content {
  padding: 1.75rem; /* Slightly smaller padding */
}

.icon-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem; /* Reduced spacing */
}

.icon {
  width: 40px; /* Reduced icon size */
  height: 40px;
  color: #382d6e;
  margin-right: 0.5rem;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #382d6e;
}

.card-description {
  color: #4a5568;
  line-height: 1.75;
  text-align: justify;
}

.card-gradient {
  height: 0.5rem;
  background: linear-gradient(to right, #9b5de5, #00f5d4);
  margin-top: auto; /* Aligns gradient at the bottom */
}

/* Responsive Styling */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
    align-items: center;
  }

  .story-image, .founder-image {
    width: 100%;
    margin-bottom: 1rem;
  }

  .mission-vision {
    flex-direction: column;
  }
}
</style>
