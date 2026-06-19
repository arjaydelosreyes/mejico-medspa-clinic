<template>
  <div class="error-page">
    <h1>Oops! Something went wrong.</h1>
    <p>We're sorry, but we encountered an error while loading the page.</p>
    <router-link to="/" class="home-link">Go back to home</router-link>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage'
}
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 2rem;
  color: #e53e3e;
  margin-bottom: 1rem;
}

p {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.home-link {
  padding: 0.5rem 1rem;
  background-color: #4299e1;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
  transition: background-color 0.3s ease;
}

.home-link:hover {
  background-color: #3182ce;
}
</style>