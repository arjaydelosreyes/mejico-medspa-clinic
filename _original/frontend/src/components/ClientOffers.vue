<template>
  <section class="medspa-products">

    <Navbar />

    <div class="container">
      <!-- Header Section -->
      <div class="header">
        <div class="header-content">
          <span class="badge">Exclusive Offers</span>
          <h1>Mejico MedSpa Products</h1>
          <p>
            Discover our curated selection of premium medical-grade skincare products and exclusive treatment packages
          </p>
        </div>
      </div>

      <!-- Tabs and Search Section -->
      <div class="products-section">
        <div class="tabs-search">
          <div class="tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.value"
              @click="activeTab = tab.value"
              :class="['tab', { active: activeTab === tab.value }]"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="search">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search products..." 
            />
            <button class="icon-button">
              <Search />
            </button>
            <button class="icon-button">
              <Filter />
            </button>
          </div>
        </div>

        <!-- Price Range Filter -->
        <div class="price-filter">
          <div class="price-filter-header">
            <h3>Refine Your Search</h3>
          </div>
          <div class="price-filter-content">
            <div class="price-range">
              <label>Price Range</label>
              <div class="price-inputs">
                <input
                  type="number"
                  v-model="priceRange[0]"
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  v-model="priceRange[1]"
                  placeholder="Max"
                />
              </div>
            </div>
            <input
              type="range"
              v-model="priceRange[1]"
              min="0"
              max="500"
              step="10"
            />
            <div class="price-range-footer">
              <span>Range: ${{ priceRange[0] }} - ${{ priceRange[1] }}</span>
              <button @click="resetPriceRange" class="reset-button">
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="product-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="product-card"
          >
            <div class="product-image">
              <img
                :src="product.image"
                :alt="product.name"
              />
              <span class="product-badge">
                {{ product.badge }}
              </span>
              <button
                @click="toggleFavorite(product.id)"
                class="favorite-button"
                :class="{ active: favorites.includes(product.id) }"
              >
                <Heart />
              </button>
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <div class="product-rating">
                <Star 
                  v-for="n in product.rating"
                  :key="n"
                />
                <span>({{ product.rating }}.0)</span>
              </div>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-price-status">
                <div class="product-price">
                  <span class="current-price">${{ product.price }}</span>
                  <span class="original-price">${{ product.originalPrice }}</span>
                </div>
                <div class="product-status">
                  <Clock />
                  {{ product.status }}
                </div>
              </div>
            </div>
            <div class="product-actions">
              <button class="learn-more">
                Learn More
              </button>
              <button class="book-now">
                Book Now
                <Calendar />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <FooterComponent />
</template>

<script setup>
import { ref, computed } from 'vue'
import Navbar from './Navbar.vue';
import FooterComponent from './Footer.vue';  
import { Heart, Star, Clock, Search, Filter, Calendar } from 'lucide-vue-next'

const activeTab = ref('all')
const searchQuery = ref('')
const priceRange = ref([0, 500])
const favorites = ref([])

const tabs = [
  { label: 'All Products', value: 'all' },
  { label: 'Skincare', value: 'skincare' },
  { label: 'Treatments', value: 'treatments' },
  { label: 'Bundles', value: 'bundles' }
]

const products = [
  {
    id: '1',
    name: 'Premium Facial Kit',
    description: 'Complete skincare routine with medical-grade products for radiant, healthy skin',
    price: 199,
    originalPrice: 249,
    image: '/src/images/productimg6.png',
    badge: '20% OFF',
    rating: 5,
    status: 'Limited time'
  },
  {
    id: '2',
    name: 'Anti-Aging Bundle',
    description: 'Advanced treatment package designed to reduce signs of aging and restore youthful glow',
    price: 299,
    originalPrice: 359,
    image: '/src/images/productimg3.png',
    badge: 'NEW',
    rating: 5,
    status: 'Best seller'
  },
  {
    id: '3',
    name: 'Hydration Collection',
    description: 'Intensive moisturizing products for deep hydration and skin barrier protection',
    price: 159,
    originalPrice: 189,
    image: '/src/images/productimg7.png',
    badge: 'POPULAR',
    rating: 5,
    status: 'Trending'
  },
  {
    id: '4',
    name: 'Acne Control System',
    description: 'Comprehensive acne treatment system for clear, blemish-free skin',
    price: 129,
    originalPrice: 149,
    image: '/src/images/productimg5.png',
    badge: 'EFFECTIVE',
    rating: 4,
    status: 'Top rated'
  },
  {
    id: '5',
    name: 'Brightening Serum',
    description: 'Powerful serum to even skin tone and boost radiance',
    price: 89,
    originalPrice: 99,
    image: '/src/images/productimg4.png',
    badge: '10% OFF',
    rating: 5,
    status: 'Customer favorite'
  },
  {
    id: '6',
    name: 'Rejuvenating Eye Cream',
    description: 'Targeted treatment to reduce fine lines and dark circles around the eyes',
    price: 69,
    originalPrice: 79,
    image: '/src/images/productimg1.png',
    badge: 'ESSENTIAL',
    rating: 4,
    status: 'Dermatologist recommended'
  }
]

const filteredProducts = computed(() => {
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesPrice = product.price >= priceRange.value[0] && product.price <= priceRange.value[1]
    return matchesSearch && matchesPrice
  })
})

const toggleFavorite = (id) => {
  const index = favorites.value.indexOf(id)
  if (index === -1) {
    favorites.value.push(id)
  } else {
    favorites.value.splice(index, 1)
  }
}

const resetPriceRange = () => {
  priceRange.value = [0, 500]
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.medspa-products {
  width: 100%;
  padding: 48px 0; 
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ff 100%);
  margin-top: 100px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 32px;
}

.header-content {
  max-width: 900px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: #6C5CE7;
  color: white;
  border-radius: 9999px;
}

h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 16px 0;
}

.header p {
  color: #6B7280;
  font-size: 16px;
  line-height: 1.5;
}

.tabs-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 4px;
}

.tab {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #4B5563;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.tab.active {
  background-color: #6C5CE7;
  color: white;
}

.search {
  display: flex;
  align-items: center;
}

.search input {
  padding: 8px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  margin-left: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.icon-button:hover {
  background-color: #F3F4F6;
}

.price-filter {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow: hidden;
}

.price-filter-header {
  background: linear-gradient(to right, #6C5CE7, #a29bfe);
  color: white;
  padding: 16px;
}

.price-filter-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.price-filter-content {
  padding: 24px;
}

.price-range label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4B5563;
  margin-bottom: 8px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.price-inputs input {
  width: 80px;
  padding: 8px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 14px;
}

.price-filter-content input[type="range"] {
  width: 100%;
  margin-bottom: 16px;
}

.price-range-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.reset-button {
  padding: 6px 12px;
  font-size: 14px;
  color: #6C5CE7;
  background: none;
  border: 1px solid #6C5CE7;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.reset-button:hover {
  background-color: #6C5CE7;
  color: white;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.product-image {
  position: relative;
  aspect-ratio: 1 / 1;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(108, 92, 231, 0.9);
  color: white;
  border-radius: 9999px;
}

.favorite-button {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .favorite-button {
  opacity: 1;
}

.favorite-button.active svg {
  fill: #EF4444;
  color: #EF4444;
}

.product-info {
  padding: 16px;
}

.product-info h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
}

.product-rating {
  display: flex;
  align-items: center;
  color: #6C5CE7;
  margin-bottom: 8px;
}

.product-rating span {
  margin-left: 4px;
  font-size: 14px;
  color: #6B7280;
}

.product-description {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 24px;
  font-weight: 700;
  color: #6C5CE7;
}

.original-price {
  font-size: 14px;
  color: #6B7280;
  text-decoration: line-through;
}

.product-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6B7280;
}

.product-status svg {
  margin-right: 4px;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid #E5E7EB;
}

.learn-more, .book-now {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.learn-more {
  color: #4B5563;
  background: none;
  border: 1px solid #D1D5DB;
}

.learn-more:hover {
  background-color: #F3F4F6;
}

.book-now {
  display: flex;
  align-items: center;
  color: white;
  background-color: #6C5CE7;
  border: none;
}

.book-now:hover {
  background-color: #5A4FCF;
}

.book-now svg {
  margin-left: 8px;
}

@media (max-width: 768px) {
  .tabs-search {
    flex-direction: column;
    align-items: stretch;
  }

  .tabs {
    margin-bottom: 16px;
  }

  .search {
    width: 100%;
  }

  .search input {
    flex-grow: 1;
  }
}
</style>