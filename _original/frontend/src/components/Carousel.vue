<template>
  <section class="collection">
    <div class="header">
      <h2>WHY CHOOSE US?<span class="underline"></span></h2>
    </div>
    <Swiper
      class="mySwiper"
      :loop="true"
      :centeredSlides="true"
      :slidesPerView="3"
      :spaceBetween="20"
      effect="coverflow"
      :coverflowEffect="{
        rotate: 0,
        stretch: 0,
        depth: 200,
        modifier: 1,
        slideShadows: false,
      }"
      :autoplay="autoplayConfig"
      :pagination="{
        clickable: true,
        el: '.swiper-pagination'
      }"
      @swiper="onSwiper"
    >
      <SwiperSlide class="content" v-for="(image, index) in images" :key="index">
        <div class="slide-content" :class="{ 'expanded': expandedSlides[index] }">
          <div class="image-container">
            <img :src="image.src" :alt="image.title">
          </div>
          <div class="text-content">
            <h3>{{ image.title }}</h3>
            <div class="description-container" :class="{ 'scrollable': expandedSlides[index] }">
              <p>{{ image.description }}</p>
            </div>
            <button class="btn" @click="toggleExpand(index)">
              {{ expandedSlides[index] ? 'Read less' : 'Read more' }}
            </button>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
    <div class="swiper-pagination"></div>
  </section>
</template>

<script>
import { ref, reactive } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import SwiperCore, { Autoplay, Pagination, EffectCoverflow } from 'swiper';
import 'swiper/swiper-bundle.min.css';

SwiperCore.use([Autoplay, Pagination, EffectCoverflow]);

export default {
  name: 'SwiperCollection',
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const swiperInstance = ref(null);
    const autoplayConfig = ref({
      delay: 3000,
      disableOnInteraction: true,
    });
    const expandedSlides = reactive({});

    const onSwiper = (swiper) => {
      swiperInstance.value = swiper;
    };

    const toggleExpand = (index) => {
      expandedSlides[index] = !expandedSlides[index];
      if (expandedSlides[index]) {
        swiperInstance.value.autoplay.stop();
        swiperInstance.value.allowTouchMove = false;
        swiperInstance.value.params.autoplay.disableOnInteraction = true;
        // Removed the slideTo call to prevent slide change
      } else {
        swiperInstance.value.autoplay.start();
        swiperInstance.value.allowTouchMove = true;
        swiperInstance.value.params.autoplay.disableOnInteraction = false;
      }
    };

    return {
      swiperInstance,
      autoplayConfig,
      onSwiper,
      expandedSlides,
      toggleExpand,
    };
  },
  data() {
    return {
      images: [
        { src: '/src/images/mejicobgimage.jpg', title: 'Expertise in Medical Spa Services', description: 'At Mejico MD Medical Spa, we blend medical precision with spa luxury, offering services supervised by certified specialists and licensed practitioners. Our team is dedicated to achieving safe, effective, and transformative results for every client. We continuously update our knowledge and skills to bring you the latest and most effective treatments in the medical spa industry.' },
        { src: '/src/images/mejicobgimage.jpg', title: 'Customized Treatment Plans', description: 'Every individual is unique, and so are their skincare and wellness needs. We offer personalized consultations to design custom treatment plans that address your specific goals, ensuring results that feel and look natural. Our experts take the time to understand your concerns, lifestyle, and desired outcomes to create a tailored approach that works best for you.' },
        { src: '/src/images/mejicobgimage.jpg', title: 'Safe and Hygienic Environment', description: 'Your safety and comfort are our top priorities. We maintain strict cleanliness and sterilization protocols to ensure a safe, relaxing, and hygienic environment where you can unwind with peace of mind. Our state-of-the-art facility is equipped with the latest technology and adheres to the highest standards of safety and hygiene in the industry.' },
        { src: '/src/images/mejicobgimage.jpg', title: 'Holistic Approach to Wellness', description: 'Beyond beauty, we focus on holistic health, promoting overall well-being through a combination of medical and therapeutic services. Our treatments not only enhance your appearance but also foster relaxation, inner peace, and vitality. We believe in nurturing the connection between physical appearance and mental well-being for a truly transformative experience.' },
        { src: '/src/images/mejicobgimage.jpg', title: 'Exceptional Customer Care', description: 'We pride ourselves on our warm, welcoming atmosphere and attentive service. From the moment you arrive to the completion of your treatment, our team is dedicated to making your experience seamless and enjoyable. We listen to your concerns, answer your questions, and ensure you feel comfortable and confident throughout your journey with us.' },
        { src: '/src/images/mejicobgimage.jpg', title: 'Convenient Location and Flexible Scheduling', description: 'Located in a prime, accessible area, Mejico MD Medical Spa offers flexible scheduling options to fit your busy lifestyle. We strive to make quality care convenient and available to all who seek it. Our extended hours and efficient booking system ensure that you can receive the care you need at a time that works best for you.' },
      ],
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}

.collection {
  background-color: #ffffff;
  padding: 2rem 0;
  text-align: center;
}

.header h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #382d6e;
  margin-top: 15px;
  position: relative;
  display: inline-block;
}

.header h2 .underline {
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

.mySwiper {
  width: 100%;
  height: 70vh;
  margin: 0 auto;
}

.content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-content {
  background-color: #382d6e;
  border: 0.2rem solid rgba(255, 255, 255, 0.1);
  border-radius: 0.7rem;
  overflow: hidden;
  text-align: center;
  padding: 1rem;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.slide-content.expanded {
  position: relative;
  z-index: 10;
}

.image-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-bottom: 0.3rem solid #7964e4;
  border-radius: 0.6rem 0.6rem 0 0;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding-top: 1rem;
  flex-grow: 1;
  overflow: hidden;
}

.text-content h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0.8rem 0;
  color: #ffffff;
}

.description-container {
  max-height: 80px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.description-container.scrollable {
  max-height: 200px;
  overflow-y: auto;
}

.text-content p {
  font-size: 12px;
  font-weight: 400;
  color: #b5b5b5;
  text-align: left;
  margin-bottom: 1rem;
  padding-right: 10px;
}

.btn {
  background-color: #7964e4;
  padding: 0.5rem 1rem;
  border: none;
  color: white;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #5d4db0;
}

.swiper-pagination {
  position: relative;
  margin-top: 1rem;
}

.swiper-pagination-bullet {
  background-color: #5e4db5;
  opacity: 1;
}

.swiper-pagination-bullet-active {
  background-color: #5d4db0;
}

/* Scrollbar Styles */
.description-container::-webkit-scrollbar {
  width: 4px;
}

.description-container::-webkit-scrollbar-track {
  background: transparent;
}

.description-container::-webkit-scrollbar-thumb {
  background-color: rgba(121, 100, 228, 0.5);
  border-radius: 20px;
}

.description-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(121, 100, 228, 0.8);
}
</style>