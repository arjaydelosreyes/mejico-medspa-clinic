<template>
  <div class="container">
    <Navbar />
    
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <h1 class="hero-title">Contact Us<span class="underline"></span></h1>
        <p class="hero-description">
          Mejico Medical Spa is ready to provide the right solution according to your needs
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="contact-main-content">
      <div class="content-wrapper">
        <div class="contact-card">
          <!-- Get in touch Section -->
          <div class="get-in-touch">
            <div class="get-in-touch-content">
              <h2>Get in touch</h2>
              <p>We're here to help you feel and look your best! For appointments, inquiries, 
                or any assistance, reach out to us through the details below. Our dedicated 
                team is ready to support your wellness journey at Mejico MedSpa Clinic</p>

              <div class="contact-info">
                <div class="contact-item">
                  <div class="icon-background">
                    <MapPinIcon class="icon" />
                  </div>
                  <div>
                    <h3>Location</h3>
                    <p>Leuterio Street, San Vicente West, Calapan City, <br> Oriental Mindoro, Philippines</p>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="icon-background">
                    <MailIcon class="icon" />
                  </div>
                  <div>
                    <h3>Email Us</h3>
                    <p>mejicomdclinic@gmail.com</p>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="icon-background">
                    <PhoneIcon class="icon" />
                  </div>
                  <div>
                    <h3>Call Us</h3>
                    <p>Phone: + 0933 869 7119</p>
                  </div>
                </div>
              </div>

              <div class="social-media">
                <h3>Follow our social media</h3>
                <div class="social-icons">
                  <a href="#" class="social-icon"><FacebookIcon /></a>
                  <a href="#" class="social-icon"><InstagramIcon /></a>
                  <a href="#" class="social-icon"><TwitterIcon /></a>
                  <a href="#" class="social-icon"><YoutubeIcon /></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-form">
            <h2>Send us a message</h2>
            <form @submit.prevent="submitForm">
              <div class="form-row">
                <div>
                  <label for="name">Name</label>
                  <input 
                    id="name" 
                    v-model="form.name" 
                    type="text" 
                    placeholder="Enter your name here"
                    required 
                  />
                </div>
                <div>
                  <label for="email">Email</label>
                  <input 
                    id="email" 
                    v-model="form.email" 
                    type="email" 
                    placeholder="Enter your email"
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label for="subject">Subject</label>
                <input 
                  id="subject" 
                  v-model="form.subject" 
                  type="text" 
                  placeholder="Enter your subject here"
                  required 
                />
              </div>
              <div>
                <label for="message">Message</label>
                <textarea 
                  id="message" 
                  v-model="form.message" 
                  rows="6" 
                  placeholder="Enter your message here"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                :disabled="loading"
              >
                {{ loading ? 'Sending...' : 'Send' }}
              </button>

              <div v-if="error" class="error-message">
                {{ error }}
              </div>
            </form>
          </div>
        </div>
        <div class="map-container">
          <div class="map-section">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3880.9868879585392!2d121.1649781749137!3d13.413138686944338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bcef49f520c8fb%3A0x67679060c7efb6ff!2sLeuterio%2C%20Calapan%2C%20Oriental%20Mindoro!5e0!3m2!1sen!2sph!4v1730622626202!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <FooterComponent />

    <!-- New Notification Component -->
    <Transition name="fade">
      <div v-if="showNotification" class="notification" @click="showNotification = false">
        <div class="notification-content" @click.stop>
          <div class="success-icon">
            <CheckIcon class="check" />
          </div>
          <h3>Success!</h3>
          <p>Your message has been sent successfully</p>
          <button class="close-button" @click="showNotification = false">
            <XIcon class="x-icon" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue';
import FooterComponent from './Footer.vue';
import { ref } from 'vue';
import emailjs from '@emailjs/browser';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  CheckIcon,
  XIcon
} from 'lucide-vue-next';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const loading = ref(false);
const success = ref(false);
const error = ref('');
const showNotification = ref(false);

const submitForm = async () => {
  try {
    loading.value = true;
    error.value = '';
    success.value = false;
    
    const templateParams = {
      from_name: form.value.name,
      from_email: form.value.email,
      subject: form.value.subject,
      message: form.value.message,
      to_name: "Mejico MedSpa Clinic"
    };

    await emailjs.send(
      'service_tsc05jy', // Use your existing EmailJS service ID
      'template_hy8jr6n', // Use your existing EmailJS template ID
      templateParams,
      'wOA-rb4GlzrB2-5VT' // Use your existing EmailJS public key
    );

    success.value = true;
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false;
    }, 3000); // Hide after 3 seconds
  } catch (err) {
    error.value = 'Failed to send message. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.container {
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100%;
  margin-top: 80px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ff 100%);
}

.hero-section {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  font-weight: bold;
}

.hero-background {
  background-image: url('/placeholder.svg?height=800&width=1920');
  background-size: cover;
  background-position: center;
  position: absolute;
  inset: 0;
}

.hero-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: #382d6e;
}

.hero-content {
  position: relative;
  z-index: 10;
}

.hero-title {
  font-size: 3rem;
  color: #ffffff;
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
  background-color: #ffffff;
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

.hero-description {
  font-size: 14px;
  color: #f0f0f0;
  opacity: 0.85;
  line-height: 1.6;
  margin-top: 1rem;
  max-width: 600px;
  margin-bottom: 40px;
  margin-top: -5px;
}

.contact-main-content {
  background-color: white;
  padding: 4rem 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin: -8rem auto 0;
  position: relative;
  z-index: 20;
  display: flex;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
}

.get-in-touch {
  flex: 1;
  background: linear-gradient(135deg, rgba(102, 86, 179, 0.08) 0%, rgba(102, 86, 179, 0.12) 100%);
  position: relative;
  display: flex;
  flex-direction: column;
}

.get-in-touch::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 86, 179, 0.03);
  backdrop-filter: blur(10px);
}

.get-in-touch-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contact-form {
  flex: 1;
  padding: 2rem;
  background: white;
}

.get-in-touch h2,
.contact-form h2 {
  font-size: 30px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  flex-grow: 1;
}

.contact-item {
  display: flex;
  align-items: start;
}

.icon-background {
  background-color: #6656b3;
  border-radius: 50%;
  padding: 0.5rem;
  margin-right: 1rem;
}

.icon {
  color: white;
  width: 1.25rem;
  height: 1.25rem;
}

.contact-item h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.contact-item p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.social-media {
  margin-top: auto;
}

.social-media h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icon {
  width: 2rem;
  height: 2rem;
  background-color: #6656b3;
  color: white;
  padding: 0.4rem;
  border-radius: 50%;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-icon:hover {
  background-color: #524690;
}

.contact-form form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.contact-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

input,
textarea {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

input:focus,
textarea:focus {
  border-color: #6656b3;
  outline: none;
  box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.2);
}

textarea {
  min-height: 120px;
}

button {
  background-color: #6656b3;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #524690;
}

button:disabled {
  background-color: #a5a5a5;
  cursor: not-allowed;
}

.map-container {
  margin: 5rem auto 0;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.226);
  width: 100%;
  max-width: 1200px;
}

.map-section {
  height: 450px;
  width: 100%;
  position: relative;
}

.notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.notification-content {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 90%;
  width: 400px;
  position: relative;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background-color: #6656b3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.check {
  color: white;
  width: 2rem;
  height: 2rem;
  animation: scale-up 0.3s ease-out;
}

.notification-content h3 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.notification-content p {
  color: #6b7280;
  text-align: center;
  margin: 0;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-button:hover {
  color: #4b5563;
}

.x-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: 0.375rem;
  text-align: center;
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scale-up {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@media (max-width: 1200px) {
  .content-wrapper {
    max-width: 95%;
    padding: 0 2rem;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    max-width: 100%;
    padding: 0 1rem;
  }
  
  .contact-card {
    flex-direction: column;
    margin-top: -6rem;
    margin-left: 1rem;
    margin-right: 1rem;
  }
  
  .get-in-touch,
  .contact-form {
    width: 100%;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .contact-card {
    margin: -6rem 1rem 0;
  }
  
  .map-container {
    margin: 3rem 1rem;
  }
}
</style>