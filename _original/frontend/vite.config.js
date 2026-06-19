import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'swiper/css/bundle': path.resolve(__dirname, 'node_modules/swiper/swiper-bundle.min.css')
    }
  },
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable', 'xlsx']
  },
  build: {
    commonjsOptions: {
      include: [/jspdf/, /xlsx/, /jspdf-autotable/]
    }
  }
});
