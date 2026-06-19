<template>
  <div class="adminproducts-container">
    <h2 class="adminproducts-title">Product List</h2>

    <div v-if="error" class="adminproducts-alert adminproducts-alert-error" role="alert">
      <strong class="adminproducts-alert-text">Error:</strong>
      <span>{{ error }}</span>
      <button 
        @click="fetchProducts" 
        class="adminproducts-retry-btn"
      >
        Retry
      </button>
    </div>

    <!-- Search Controls -->
    <div class="adminproducts-search-controls">
      <div class="adminproducts-search-wrapper">
        <Package class="adminproducts-search-icon" />
        <select v-model="searchCategory" class="adminproducts-select">
          <option value="">Select category</option>
          <option v-for="category in uniqueCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <div class="adminproducts-search-wrapper">
        <Search class="adminproducts-search-icon" />
        <input 
          v-model="searchProduct" 
          type="text" 
          placeholder="Search by product name" 
          class="adminproducts-search-input"
        >
      </div>
      <button @click="applyFilters" class="adminproducts-btn adminproducts-btn-primary">
        <Filter class="adminproducts-btn-icon" />
        Search
      </button>
      <button @click="resetFilters" class="adminproducts-btn adminproducts-btn-secondary">
        <RotateCcw class="adminproducts-btn-icon" />
        Reset
      </button>
    </div>

    <!-- Product Stats -->
    <div class="adminproducts-stats-grid">
      <div v-for="stat in productStats" :key="stat.label" class="adminproducts-stat-card">
        <div class="adminproducts-stat-icon-wrapper">
          <Package v-if="stat.label === 'Total Products'" class="adminproducts-stat-icon" />
          <Tags v-if="stat.label === 'Categories'" class="adminproducts-stat-icon" />
          <DollarSign v-if="stat.label === 'Total Value'" class="adminproducts-stat-icon" />
        </div>
        <div class="adminproducts-stat-content">
          <p class="adminproducts-stat-value">{{ stat.value }}</p>
          <h3 class="adminproducts-stat-label">{{ stat.label }}</h3>
        </div>
      </div>
    </div>

    <!-- Product List -->
    <div class="adminproducts-table-container">
      <h3 class="adminproducts-section-title">Product List</h3>
      <div class="adminproducts-table-responsive">
        <table v-if="!loading && filteredProducts.length > 0" class="adminproducts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>
                <div class="adminproducts-item-info">
                  <Package class="adminproducts-item-icon" />
                  <span>{{ product.name }}</span>
                </div>
              </td>
              <td class="adminproducts-price-cell">₱{{ product.price.toFixed(2) }}</td>
              <td>{{ product.category }}</td>
              <td>
                <button 
                  @click="openProductModal(product)"
                  class="adminproducts-view-btn"
                >
                  <Eye class="adminproducts-btn-icon" />
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="!loading && filteredProducts.length === 0" class="adminproducts-empty-state">
          <Package class="adminproducts-empty-icon" />
          <p>No products found</p>
        </div>
        <div v-else class="adminproducts-loading-state">
          <Loader class="adminproducts-loading-icon adminproducts-spin" />
          <p>Loading products...</p>
        </div>
      </div>
    </div>

    <!-- Product Details Modal -->
    <div v-if="selectedProduct" class="adminproducts-modal-overlay" @click="closeProductModal">
      <div class="adminproducts-modal" @click.stop>
        <div class="adminproducts-modal-header">
          <div class="adminproducts-modal-header-content">
            <h3 class="adminproducts-modal-title">Product Details</h3>
            <span class="adminproducts-modal-subtitle">View detailed information about this product</span>
          </div>
          <button @click="closeProductModal" class="adminproducts-modal-close" aria-label="Close modal">
            <X class="adminproducts-modal-close-icon" />
          </button>
        </div>

        <div class="adminproducts-modal-content">
          <div class="adminproducts-modal-grid">
            <!-- Product Icon and Name Section -->
            <div class="adminproducts-modal-hero">
              <div class="adminproducts-modal-icon-wrapper">
                <Package class="adminproducts-modal-icon" />
              </div>
              <h4 class="adminproducts-modal-product-name">{{ selectedProduct.name }}</h4>
            </div>

            <!-- Quick Stats Section -->
            <div class="adminproducts-modal-stats">
              <div class="adminproducts-modal-stat">
                <span class="adminproducts-modal-stat-label">Price</span>
                <span class="adminproducts-modal-stat-value adminproducts-modal-price">
                  ₱{{ selectedProduct.price.toFixed(2) }}
                </span>
              </div>
              <div class="adminproducts-modal-stat">
                <span class="adminproducts-modal-stat-label">Category</span>
                <span class="adminproducts-modal-stat-value adminproducts-modal-category">
                  {{ selectedProduct.category }}
                </span>
              </div>
              <div class="adminproducts-modal-stat">
                <span class="adminproducts-modal-stat-label">Stock Status</span>
                <span 
                  class="adminproducts-modal-stat-value adminproducts-modal-stock"
                  :class="{'adminproducts-modal-stock-unavailable': selectedProduct.quantity === 0}"
                >
                  {{ selectedProduct.quantity === 0 ? 'Out of Stock' : `${selectedProduct.quantity} in stock` }}
                </span>
              </div>
            </div>

            <!-- Description Section -->
            <div class="adminproducts-modal-description">
              <h5 class="adminproducts-modal-section-title">Description</h5>
              <p class="adminproducts-modal-description-text">
                {{ selectedProduct.description || 'No description available for this product.' }}
              </p>
            </div>

            <!-- Additional Details Section -->
            <div class="adminproducts-modal-additional">
              <h5 class="adminproducts-modal-section-title">Additional Details</h5>
              <div class="adminproducts-modal-details-grid">
                <div class="adminproducts-modal-detail-item">
                  <span class="adminproducts-modal-detail-label">Product ID</span>
                  <span class="adminproducts-modal-detail-value">{{ selectedProduct.id }}</span>
                </div>
                <!-- Add more details as needed -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Package, Tags, DollarSign, Loader, Eye, X, Search, Filter, RotateCcw 
} from 'lucide-vue-next';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedProduct = ref(null);
let retryTimeout = null;

// Search state
const searchCategory = ref('');
const searchProduct = ref('');

// Computed properties for filtering
const uniqueCategories = computed(() => {
  return [...new Set(products.value.map(p => p.category))];
});

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesCategory = !searchCategory.value || 
      product.category.toLowerCase() === searchCategory.value.toLowerCase();
    const matchesProduct = !searchProduct.value || 
      product.name.toLowerCase().includes(searchProduct.value.toLowerCase());
    return matchesCategory && matchesProduct;
  });
});

const productStats = computed(() => {
  const totalProducts = filteredProducts.value.length;
  const categories = [...new Set(filteredProducts.value.map(p => p.category))];
  const totalValue = filteredProducts.value.reduce((sum, product) => sum + Number(product.price), 0);

  return [
    { label: 'Total Products', value: totalProducts },
    { label: 'Categories', value: categories.length },
    { label: 'Total Value', value: `₱${totalValue.toFixed(2)}` },
  ];
});

// Filter functions
const applyFilters = () => {
  // Filtering is handled by computed properties
};

const resetFilters = () => {
  searchCategory.value = '';
  searchProduct.value = '';
};

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const querySnapshot = await getDocs(collection(database, 'products'));
    products.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    products.value.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error fetching products:', err);
    error.value = 'Error loading products. Please check your connection and try again.';
    
    retryTimeout = setTimeout(() => {
      if (error.value) fetchProducts();
    }, 5000);
  } finally {
    loading.value = false;
  }
};

const openProductModal = (product) => {
  selectedProduct.value = product;
};

const closeProductModal = () => {
  selectedProduct.value = null;
};

onMounted(() => {
  fetchProducts();
});

onUnmounted(() => {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
});
</script>

<style>
.adminproducts-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 650px;
  display: flex;
  flex-direction: column;
}

.adminproducts-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.adminproducts-alert {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.adminproducts-alert-error {
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
}

.adminproducts-search-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.adminproducts-search-wrapper {
  position: relative;
  flex: 1;
}

.adminproducts-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #718096;
}

.adminproducts-select,
.adminproducts-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4a5568;
  background-color: white;
  transition: all 0.2s;
}

.adminproducts-select:focus,
.adminproducts-search-input:focus {
  outline: none;
  border-color: #9f7aea;
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
}

.adminproducts-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.adminproducts-btn-primary {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.adminproducts-btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
}

.adminproducts-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.adminproducts-btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.adminproducts-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.adminproducts-stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.adminproducts-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.adminproducts-stat-icon-wrapper {
  background: rgba(159, 122, 234, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  margin-right: 0.75rem;
}

.adminproducts-stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #7c3aed;
}

.adminproducts-stat-content {
  flex: 1;
}

.adminproducts-stat-label {
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.adminproducts-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #9f7aea;
}

.adminproducts-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.adminproducts-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #32276e;
  margin-bottom: 1.5rem;
}

.adminproducts-table-responsive {
  overflow-y: auto;
  overflow-x: auto;
  margin: 0 -1rem;
  padding: 0 1rem;
  flex: 1;
  min-height: 0;
}

.adminproducts-table-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.adminproducts-table-responsive::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.adminproducts-table-responsive::-webkit-scrollbar-thumb {
  background: #8B5CF6;
  border-radius: 4px;
}

.adminproducts-table-responsive::-webkit-scrollbar-thumb:hover {
  background: #7C3AED;
}

.adminproducts-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.adminproducts-table th {
  background-color: #8b5cf6;
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid #edf2f7;
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 0.875rem;
}

.adminproducts-table tbody tr:hover {
  background-color: #f3e8ff;
}

.adminproducts-table th:first-child {
  border-top-left-radius: 8px;
}

.adminproducts-table th:last-child {
  border-top-right-radius: 8px;
}

.adminproducts-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #edf2f7;
  color: #2d3748;
  font-size: 0.75rem;
}

.adminproducts-item-info {
  display: flex;
  align-items: center;
}

.adminproducts-item-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.adminproducts-price-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.adminproducts-empty-state,
.adminproducts-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.adminproducts-empty-icon,
.adminproducts-loading-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #8b5cf6;
  margin-bottom: 0.75rem;
}

.adminproducts-spin {
  animation: adminproducts-spin 1s linear infinite;
}

@keyframes adminproducts-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.adminproducts-retry-btn {
  margin-left: 1rem;
  padding: 0.25rem 0.5rem;
  background-color: #c53030;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
}

.adminproducts-retry-btn:hover {
  background-color: #9b2c2c;
}

.adminproducts-view-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.adminproducts-view-btn:hover {
  background-color: #7c3aed;
}

.adminproducts-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 1rem;
  backdrop-filter: blur(4px);
  animation: adminproducts-fade-in 0.2s ease-out;
}

.adminproducts-modal {
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform-origin: center;
  animation: adminproducts-scale-in 0.3s ease-out;
  scrollbar-width: thin;
  scrollbar-color: #8b5cf6 #f1f5f9;
}

.adminproducts-modal::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.adminproducts-modal::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.adminproducts-modal::-webkit-scrollbar-thumb {
  background: #8B5CF6;
  border-radius: 4px;
}

.adminproducts-modal::-webkit-scrollbar-thumb:hover {
  background: #7C3AED;
}

.adminproducts-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  background: linear-gradient(to right, #8b5cf6, #7c3aed);
  border-radius: 16px 0 0 0;
}

.adminproducts-modal-header-content {
  flex: 1;
}

.adminproducts-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.adminproducts-modal-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.adminproducts-modal-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-left: 1rem;
}

.adminproducts-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.adminproducts-modal-close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.adminproducts-modal-content {
  padding: 1.5rem;
}

.adminproducts-modal-grid {
  display: grid;
  gap: 1.5rem;
}

.adminproducts-modal-hero {
  text-align: center;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.05);
  border-radius: 12px;
}

.adminproducts-modal-icon-wrapper {
  background: linear-gradient(145deg, #8b5cf6, #7c3aed);
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
}

.adminproducts-modal-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.adminproducts-modal-product-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
}

.adminproducts-modal-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.adminproducts-modal-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.adminproducts-modal-stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.adminproducts-modal-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.adminproducts-modal-price {
  color: #8b5cf6;
  font-family: 'Roboto Mono', monospace;
}

.adminproducts-modal-category {
  color: #7c3aed;
}

.adminproducts-modal-stock {
  color: #059669;
}

.adminproducts-modal-stock-unavailable {
  color: #dc2626;
}

.adminproducts-modal-description {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.adminproducts-modal-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.75rem;
}

.adminproducts-modal-description-text {
  color: #4a5568;
  line-height: 1.6;
  font-size: 0.875rem;
}

.adminproducts-modal-additional {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.adminproducts-modal-details-grid {
  display: grid;
  gap: 1rem;
}

.adminproducts-modal-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(139, 92, 246, 0.05);
  border-radius: 8px;
}

.adminproducts-modal-detail-label {
  font-size: 0.875rem;
  color: #718096;
}

.adminproducts-modal-detail-value {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 500;
}

@keyframes adminproducts-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes adminproducts-scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .adminproducts-modal {
    width: 95%;
    margin: 1rem;
  }

  .adminproducts-modal-stats {
    grid-template-columns: 1fr;
  }

  .adminproducts-modal-header {
    padding: 1rem;
  }

  .adminproducts-modal-content {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .adminproducts-container {
    padding: 0.75rem;
  }
  
  .adminproducts-stats-grid {
    grid-template-columns: 1fr;
  }

  .adminproducts-search-controls {
    flex-direction: column;
  }

  .adminproducts-search-wrapper {
    width: 100%;
  }

  .adminproducts-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>