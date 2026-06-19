import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../components/Landing.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Homepage from '../components/Homepage.vue';
import About from '../components/About.vue';
import CustomizeProfile from '../components/CustomizeProfile.vue';
import ContactUs from '../components/ContactUs.vue';
import ClientAppointment from '../components/ClientAppointment.vue';
import PersonalSecurity from '../components/PersonalSecurity.vue';
import ClientCanlendar from '../components/ClientCanlendar.vue';
import ClientOffers from '../components/ClientOffers.vue';

// Export the routes array separately
export const userRoutes = [
  { path: '/landing', name: 'Landing', component: Landing },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/home', name: 'Homepage', component: Homepage },
  { path: '/about', name: 'About', component: About },
  { path: '/customizeprofile', name: 'CustomizeProfile', component: CustomizeProfile },
  { path: '/contact', name: 'ContactUs', component: ContactUs },
  { path: '/clientappointment', name: 'ClientAppointment', component: ClientAppointment },
  { path: '/security', name: 'PersonalSecurity', component: PersonalSecurity },
  { path: '/calendar', name: 'ClientCalendar', component: ClientCanlendar },
  { path: '/clientoffers', name: 'ClientOffers', component: ClientOffers },
];

// You can still export the router if needed elsewhere
const router = createRouter({
  history: createWebHistory(),
  routes: userRoutes,
});

export default router;