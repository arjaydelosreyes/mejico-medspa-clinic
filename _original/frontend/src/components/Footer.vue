<template>
  <footer class="footer">
    <div class="footer-top">
      <span class="footer-text">Get connected with us on social networks:</span>
      <div class="social-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <Facebook class="icon" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <Twitter class="icon" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <Instagram class="icon" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <Linkedin class="icon" />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <Github class="icon" />
        </a>
      </div>
    </div>
    <div class="footer-middle">
      <div class="footer-grid">
        <div>
          <h3 class="footer-title">MEJICO MedSpa Clinic</h3>
          <p class="footer-description">
            Here you can use rows and columns to organize your footer content. Lorem ipsum dolor sit amet,
            consectetur adipisicing elit.
          </p>
        </div>
        <div>
          <h3 class="footer-title">SERVICES</h3>
          <ul class="footer-list">
            <li>Facial Treatments</li>
            <li>Body Treatments</li>
            <li>Massage Therapy</li>
            <li>Medical Aesthetics</li>
          </ul>
        </div>
        <div>
          <h3 class="footer-title">USEFUL LINKS</h3>
          <ul class="footer-list">
            <li>Your Account</li>
            <li>Become an Affiliate</li>
            <li>Booking Rates</li>
            <li>Help</li>
          </ul>
        </div>
        <div>
          <h3 class="footer-title">CONTACT</h3>
          <ul class="footer-contact">
            <li class="contact-item">
              <Mail class="icon-small" />
              mejicomdclinic@gmail.com
            </li>
            <li class="contact-item">
              <Phone class="icon-small" />
              + 0933 869 7119
            </li>
            <li class="contact-item">
              <MapPin class="icon-location" />
              Leuterio Street, San Vicente West,
              Calapan City, Oriental Mindoro, 
              Philippines
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      © {{ currentYear }} Mejico Medical Spa. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Facebook, Twitter, Instagram, Linkedin, Github, MapPin, Mail, Phone, Printer } from 'lucide-vue-next'

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped>
.footer {
  width: 100%;
  background-color: #382d6e; /* Use the same color for the entire footer */
  color: white;
}

.footer-top,
.footer-middle,
.footer-bottom {
  background-color: #382d6e; /* Same color for all sections */
  max-width: 90%; /* Adjust width as needed */
  margin: 0 auto;
}

.footer-top {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid white;
}

.footer-text {
  font-size: 0.875rem;
  margin-left: 15px;
}

.social-icons {
  display: flex;
  gap: 1rem;
  margin-right: 15px;
}

.icon {
  width: 1.75rem; /* Increase symbol size */
  height: 1.75rem;
  cursor: pointer;

  /* Center symbol inside circle */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Circle styling */
  background-color: #8573df;
  border-radius: 30%;
  padding: 0.3rem; /* Reduce padding to make symbol more prominent */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  /* Smooth transition with easing */
  transition: transform 0.4s ease, background-color 0.4s ease, box-shadow 0.4s ease;
}

/* Hover effect */
.icon:hover {
  background-color: #6a56c1; /* Slightly darker shade on hover */
  transform: scale(1.1) translateY(-2px); /* Scale up and move slightly up */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Increase shadow on hover */
}

.footer-middle {
  padding: 2rem;
  border-bottom: 1px solid white;
}

.footer-grid {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 1rem;
  padding-bottom: 0.3rem; /* Space between text and underline */
  display: inline-block; /* Allows control of underline width */
  border-bottom: 2px solid rgba(133, 115, 223, 0.7); /* Semi-transparent #8573df */
  width: fit-content; /* Sets underline width to text content only */
}

.footer-description,
.footer-list,
.footer-contact {
  font-size: 0.875rem;
}

.footer-list,
.footer-contact {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.footer-list li,
.footer-contact li {
  margin-bottom: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
}

.icon-small {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.icon-location {
  width: 2.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  margin-bottom: 35px;
}

.footer-bottom {
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
}
</style>
