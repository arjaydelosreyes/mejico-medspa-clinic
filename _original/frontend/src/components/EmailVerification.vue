<template>
  <div class="email-verification-handler">
    <h1>Email Verification</h1>
    <p v-if="loading">Verifying your email...</p>
    <p v-else-if="verified">Your email has been successfully verified!</p>
    <p v-else>{{ errorMessage }}</p>
    <router-link to="/login" class="login-link">Go to Login</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { verifyEmail } from '../services/authService';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const verified = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  const actionCode = route.query.oobCode;
  if (!actionCode) {
    errorMessage.value = 'Invalid verification link.';
    loading.value = false;
    return;
  }

  try {
    const result = await verifyEmail(actionCode);
    verified.value = result;
    if (!result) {
      errorMessage.value = 'Email verification failed. Please try again.';
    }
  } catch (error) {
    console.error('Email verification error:', error);
    errorMessage.value = 'An error occurred during email verification. Please try again.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.email-verification-handler {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.login-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4a399c;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>