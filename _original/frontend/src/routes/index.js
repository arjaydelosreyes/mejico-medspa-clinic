import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser, isAdmin } from '../services/authService';
import { userRoutes } from './userRoutes'; // Import user routes
import { adminRoutes } from './adminRoutes'; // Import admin routes

// Modify userRoutes to set Landing as the root route and Homepage as authenticated
const modifiedUserRoutes = userRoutes.map(route => {
  if (route.name === 'Landing') {
    return { ...route, path: '/' };
  }
  if (route.name === 'Homepage') {
    return { ...route, meta: { requiresAuth: true } };
  }
  return route;
});

// Combine routes
const routes = [...userRoutes, ...adminRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const currentUser = await getCurrentUser();

  if (to.path === '/' && currentUser) {
    // If user is already logged in and tries to access the landing page, redirect to homepage
    next('/home');
  } else if (requiresAuth && !currentUser) {
    // If route requires auth and user is not logged in, redirect to landing page
    next('/');
  } else if (requiresAuth && currentUser && !currentUser.emailVerified) {
    next('/verify-email');
  } else if (requiresAdmin && !(await isAdmin())) {
    next('/home');
  } else {
    next();
  }
});

export default router;