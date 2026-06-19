<template>
  <div class="login-container">
    <button class="exit-button" @click="goToLandingPage">
      <ArrowLeft class="exit-icon" />
    </button>
    <div class="login-box">
      <div class="logo-header">
        <div class="logo-overlay"></div>
        <div class="logo-center">
          <img src="/src/images/mejico-MDSpa-logo-transparent2.png" alt="Mejico Medical MD Spa Clinic" class="logo-image" />
        </div>
      </div>
      <div class="login-content">
        <h2 class="login-title">Login</h2>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <Mail class="icon" />
              </span>
              <input 
                id="email"
                v-model="email"
                type="email"
                required
                class="form-input"
                placeholder="mejicomedspaclinic@email.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <Lock class="icon" />
              </span>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="form-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div class="forgot-password">
            <a @click.prevent="handleResetPassword" class="forgot-link">Forgot password?</a>
          </div>

          <div>
            <button type="submit" class="submit-button" :disabled="isLoading">
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
          </div>
        </form>

        <div class="register-link">
          <p>Don't have an account?
            <router-link to="/register" class="signup-link">Sign up</router-link>
          </p>
        </div>
      </div>

      <div class="footer">
        <p>© 2023 Mejico Medical MD Spa Clinic. All rights reserved.</p>
      </div>
    </div>
    <transition name="fade">
      <div v-if="showPopup" class="popup-message" :class="{ error: isError }">
        {{ popupMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, Lock, ArrowLeft } from 'lucide-vue-next';
import { login, resetPassword } from '../services/authService';
import { doc, getDoc } from 'firebase/firestore';
import { database } from '../firebase';

const email = ref('');
const password = ref('');
const popupMessage = ref('');
const isError = ref(false);
const showPopup = ref(false);
const isLoading = ref(false);
const router = useRouter();

const displayPopup = (msg, error = false, duration = 3000) => {
  popupMessage.value = msg;
  isError.value = error;
  showPopup.value = true;
  setTimeout(() => {
    showPopup.value = false;
  }, duration);
};

// Strict admin verification
const verifyAdminStatus = async (userId) => {
  try {
    const userDoc = await getDoc(doc(database, 'users', userId));
    
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    // Check if email matches admin email from env and role is admin
    return userData.email === 'mejicomdclinic@gmail.com' && userData.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
};

const handleLogin = async () => {
  try {
    isLoading.value = true;
    
    // First verify if this is the admin email
    const isAdminEmail = email.value === 'mejicomdclinic@gmail.com';
    
    const { user } = await login(email.value, password.value);
    
    if (!user.emailVerified) {
      displayPopup('Please verify your email before logging in.', true);
      return;
    }

    // If it's admin email, strictly verify admin status
    if (isAdminEmail) {
      const isAdmin = await verifyAdminStatus(user.uid);
      
      if (!isAdmin) {
        displayPopup('Unauthorized access.', true);
        return;
      }
      
      localStorage.setItem('userRole', 'admin');
      displayPopup('Admin login successful', false);
      await router.push('/admin-dashboard');
      return;
    }

    // For non-admin users
    localStorage.setItem('userRole', 'client');
    displayPopup('Login successful', false);
    await router.push('/home');
    
  } catch (err) {
    console.error('Login error:', err);
    displayPopup(err.message || 'Login failed. Please try again.', true);
  } finally {
    isLoading.value = false;
  }
};

// Keep other existing functions unchanged
const handleResetPassword = async () => {
  if (!email.value) {
    displayPopup('Please enter your email address to reset the password.', true);
    return;
  }

  try {
    await resetPassword(email.value);
    displayPopup('Password reset email sent. Please check your inbox.', false);
  } catch (err) {
    console.error('Password reset error:', err);
    displayPopup(err.message || 'Failed to send password reset email.', true);
  }
};

const goToLandingPage = () => {
  router.push('/').catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('Navigation error:', err);
    }
  });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.login-container {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/src/images/mejicobgimage.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(3px); 
  z-index: -1;
}

.exit-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #4a399c;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: heartbeat 1.5s infinite;
}

.exit-icon {
  height: 20px;
  width: 20px;
  color: #ffffff;
}

/* Heartbeat animation */
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
}

.exit-button:hover {
  background-color: #372a75;
}

.login-box {
  max-width: 450px;
  width: 100%;
  background: rgba(255, 255, 255, 0.9); 
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.logo-header {
  position: relative;
  height: 112px;
  background: linear-gradient(to right, #9b5de5, #00f5d4);
  padding: 8px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.logo-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  height: 90px; /* Increased fixed height */
  width: 90px; /* Added width to maintain aspect ratio */
  object-fit: contain;
  transform: scale(1.2); /* Added scale transform to make logo appear bigger */
  transition: transform 0.3s ease; /* Smooth transition for any hover effects */
}

.login-content {
  padding: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: 800;
  color: #6457a6;
  text-align: center;
  margin-bottom: 24px;
}

.login-form {
  display: grid;
  gap: 24px;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  pointer-events: none;
}

.icon {
  height: 20px;
  width: 20px;
  color: #b0b0b0;
}

.form-input {
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: #02bea5;
  box-shadow: 0 0 0 3px rgba(0, 245, 212, 0.2);
}

.forgot-password {
  display: flex;
  justify-content: flex-end;
  margin-top: -10px;
  margin-right: 10px;
}

.forgot-link {
  font-size: 14px;
  color: #4a399c;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #2e2365;
  cursor: pointer; 
}

.submit-button {
  width: 100%;
  background: #4a399c; /* Solid color */
  color: #fff;
  font-weight: 700;
  padding: 12px 16px;
  border-radius: 8px;
  outline: none;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-button:hover {
  background: #372a75; /* Optional: A slightly darker shade for hover effect */
}

.register-link {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #707070;
}

.signup-link {
  font-weight: 500;
  color: #06b69f;
  text-decoration: none;
  transition: color 0.2s;
}

.signup-link:hover {
  color: #008a8a;
}

.success-message {
  color: #28a745;
}

.error-message {
  color: #dc3545;
}

.footer {
  padding: 16px;
  background: #f8f8f8;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  font-size: 12px;
  color: #909090;
  border-bottom-left-radius: 20px; 
  border-bottom-right-radius: 20px;
}

.popup-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #02bea5;
  color: #333;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: opacity 0.3s ease;
  z-index: 1000;
}

.popup-message.error {
  background-color: #ff4d4f;
  color: #fff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>