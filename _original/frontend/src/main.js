import { createApp } from 'vue';
import App from './App.vue';
import router from './routes/index';
import { auth } from './firebase';
import { isAdmin } from './services/authService';
import './assets/tailwind.css';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);
app.use(router);
app.use(Toast);

let appMounted = false;

// Modified auth state observer
auth.onAuthStateChanged(async (user) => {
  try {
    if (user) {
      // Get fresh token on each auth state change
      await user.getIdToken(true);
      
      const adminStatus = await isAdmin();
      const route = adminStatus ? '/admin-dashboard' : '/home';
      
      if (!appMounted) {
        app.mount('#app');
        appMounted = true;
      }
      
      if (router.currentRoute.value.path === '/login' || 
          router.currentRoute.value.path === '/landing') {
        router.push(route);
      }
    } else {
      if (!appMounted) {
        app.mount('#app');
        appMounted = true;
      }
      if (router.currentRoute.value.path !== '/login' && 
          router.currentRoute.value.path !== '/landing') {
        router.push('/landing');
      }
    }
  } catch (error) {
    console.error('Auth state change error:', error);
    if (!appMounted) {
      app.mount('#app');
      appMounted = true;
    }
  }
});

