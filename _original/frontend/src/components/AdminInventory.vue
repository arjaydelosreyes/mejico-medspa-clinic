<template>
  <div class="admininventory-container">
    <!-- Enhanced Header Section -->
    <div class="admininventory-header-section">
      <h2 class="admininventory-title">Inventory Management</h2>
      <p class="admininventory-subtitle">Track and manage your product inventory</p>
    </div>

    <div v-if="error" class="admininventory-error-alert">
      <AlertCircleIcon class="admininventory-error-icon" />
      <span>{{ error }}</span>
    </div>

    <!-- Redesigned Stats Grid -->
    <div class="admininventory-stats-grid">
      <div v-for="stat in inventoryStats" :key="stat.label" 
           class="admininventory-stat-card" :class="getStatCardClass(stat.label)">
        <div class="admininventory-stat-icon-wrapper" :class="getStatIconClass(stat.label)">
          <LayoutGrid v-if="stat.label === 'Total Items'" class="h-5 w-5" />
          <Package v-if="stat.label === 'Total Stock'" class="h-5 w-5" />
          <AlertTriangle v-if="stat.label === 'Low Stock Items'" class="h-5 w-5" />
          <DollarSign v-if="stat.label === 'Total Value'" class="h-5 w-5" />
        </div>
        <div class="admininventory-stat-content">
          <h3 class="admininventory-stat-label">{{ stat.label }}</h3>
          <p class="admininventory-stat-value" :class="getStatColor(stat.label)">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Enhanced Search Controls -->
    <div class="admininventory-search-section">
      <div class="admininventory-search-container">
        <div class="admininventory-search-group">
          <div class="admininventory-category-wrapper">
            <Package class="admininventory-search-icon" />
            <select v-model="searchCategory" class="admininventory-select-input">
              <option value="">All Categories</option>
              <option v-for="category in uniqueCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="admininventory-search-wrapper">
            <Search class="admininventory-search-icon" />
            <input 
              v-model="searchProduct" 
              type="text" 
              placeholder="Search products..." 
              class="admininventory-search-input"
            >
          </div>
        </div>
        <button @click="searchCategory = ''; searchProduct = ''" 
                class="admininventory-reset-button">
          <RotateCcw class="admininventory-reset-icon" />
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Enhanced Low Stock Alert -->
    <div v-if="lowStockItems.length > 0" class="admininventory-low-stock-alert">
      <div class="admininventory-alert-content">
        <AlertCircleIcon class="admininventory-alert-icon" />
        <div>
          <p class="admininventory-alert-title">Low Stock Alert</p>
          <p class="admininventory-alert-description">{{ lowStockItems.length }} items require attention</p>
        </div>
      </div>
      <button class="admininventory-alert-action">View Items</button>
    </div>

    <!-- Improved Inventory Table -->
    <div class="admininventory-inventory-table">
      <div class="admininventory-table-header">
        <div class="admininventory-table-title">
          <h3>Current Inventory</h3>
          <span class="admininventory-item-count">{{ filteredInventory.length }} items</span>
        </div>
      </div>

      <!-- Updated Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner-container">
          <div class="spinner">
            <div 
              class="spinner-line" 
              v-for="n in 8" 
              :key="n" 
              :style="{ transform: `rotate(${(n-1) * 45}deg)` }"
            ></div>
          </div>
        </div>
        <p class="loading-text">Loading inventory data...</p>
      </div>

      <div v-else-if="inventory.length === 0" class="admininventory-empty-state">
        <Package class="admininventory-empty-icon" />
        <p class="admininventory-empty-text">No products found in inventory</p>
        <p class="admininventory-empty-subtext">Add products to get started</p>
      </div>

      <div v-else class="admininventory-table-wrapper">
        <div class="admininventory-table-container">
          <table class="admininventory-table">
            <thead>
              <tr>
                <th>Product Information</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredInventory" :key="product.id"
                  class="admininventory-inventory-row">
                <td class="admininventory-table-cell">
                  <div class="admininventory-product-cell">
                    <div class="admininventory-product-icon">
                      <Package class="admininventory-product-icon-svg" />
                    </div>
                    <div class="admininventory-product-info">
                      <span class="admininventory-product-name">{{ product.name }}</span>
                      <span class="admininventory-product-id">ID: {{ product.id.slice(0, 8) }}</span>
                    </div>
                  </div>
                </td>
                <td class="admininventory-table-cell">
                  <span class="admininventory-category-tag" :class="getCategoryColor(product.category)">
                    {{ product.category }}
                  </span>
                </td>
                <td class="admininventory-table-cell">
                  <div class="admininventory-price-cell">
                    <span class="admininventory-currency">₱</span>
                    <span class="admininventory-amount">{{ product.price.toFixed(2) }}</span>
                  </div>
                </td>
                <td class="admininventory-table-cell">
                  <div class="admininventory-stock-level">
                    <div class="admininventory-stock-bar-wrapper">
                      <div class="admininventory-stock-bar">
                        <div class="admininventory-stock-fill" 
                             :class="getStockLevelClass(product.quantity)"
                             :style="{ width: getStockPercentage(product.quantity) + '%' }">
                        </div>
                      </div>
                      <span class="admininventory-stock-text" :class="getStockTextClass(product.quantity)">
                        {{ product.quantity }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  AlertCircleIcon, 
  PackageIcon, 
  Package, 
  Search, 
  RotateCcw, 
  Loader,
  LayoutGrid,
  DollarSign,
  AlertTriangle
} from 'lucide-vue-next';

const inventory = ref([]);
const loading = ref(true);
const error = ref(null);
const searchCategory = ref('');
const searchProduct = ref('');

const uniqueCategories = computed(() => {
  return [...new Set(inventory.value.map(item => item.category))];
});

// Stats computation
const inventoryStats = computed(() => {
  const totalItems = inventory.value.length;
  const totalStock = inventory.value.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = lowStockItems.value.length;
  const totalValue = inventory.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return [
    { label: 'Total Items', value: totalItems },
    { label: 'Total Stock', value: totalStock },
    { label: 'Low Stock Items', value: lowStockCount },
    { label: 'Total Value', value: `₱${totalValue.toFixed(2)}` },
  ];
});

const lowStockItems = computed(() => {
  return inventory.value.filter(item => item.quantity < 10);
});

const filteredInventory = computed(() => {
  return inventory.value.filter(product => {
    const matchesCategory = !searchCategory.value || 
      product.category.toLowerCase() === searchCategory.value.toLowerCase();
    const matchesProduct = !searchProduct.value || 
      product.name.toLowerCase().includes(searchProduct.value.toLowerCase());
    return matchesCategory && matchesProduct;
  });
});

// Utility functions for styling
const getStockLevelClass = (quantity) => {
  if (quantity >= 20) return 'admininventory-bg-green-500';
  if (quantity >= 10) return 'admininventory-bg-yellow-500';
  return 'admininventory-bg-red-500';
};

const getStockTextClass = (quantity) => {
  if (quantity >= 20) return 'admininventory-text-green-600';
  if (quantity >= 10) return 'admininventory-text-yellow-600';
  return 'admininventory-text-red-600 admininventory-font-semibold';
};

const getStockPercentage = (quantity) => {
  const initialStock = 40; // Base stock level
  return Math.min((quantity / initialStock) * 100, 100);
};

const getCategoryColor = (category) => {
  const colors = {
    'Hair Care': 'admininventory-bg-purple-100 admininventory-text-purple-800',
    'Skin Care': 'admininventory-bg-blue-100 admininventory-text-blue-800',
    'Body Care': 'admininventory-bg-green-100 admininventory-text-green-800',
    'default': 'admininventory-bg-gray-100 admininventory-text-gray-800'
  };
  return colors[category] || colors.default;
};

const getStatColor = (label) => {
  const colors = {
    'Total Items': 'admininventory-text-blue-600',
    'Total Stock': 'admininventory-text-green-600',
    'Low Stock Items': 'admininventory-text-red-600',
    'Total Value': 'admininventory-text-purple-600'
  };
  return colors[label] || 'admininventory-text-gray-600';
};

const getStatCardClass = (label) => {
  const classes = {
    'Total Items': 'admininventory-border-blue-100',
    'Total Stock': 'admininventory-border-green-100',
    'Low Stock Items': 'admininventory-border-red-100',
    'Total Value': 'admininventory-border-purple-100'
  };
  return classes[label] || '';
};

const getStatIconClass = (label) => {
  const classes = {
    'Total Items': 'admininventory-bg-blue-100 admininventory-text-blue-600',
    'Total Stock': 'admininventory-bg-green-100 admininventory-text-green-600',
    'Low Stock Items': 'admininventory-bg-red-100 admininventory-text-red-600',
    'Total Value': 'admininventory-bg-purple-100 admininventory-text-purple-600'
  };
  return classes[label] || '';
};

// Firebase fetch
const fetchInventory = async () => {
  loading.value = true;
  error.value = null;
  try {
    const querySnapshot = await getDocs(collection(database, 'products'));
    inventory.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    inventory.value.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    error.value = 'Error loading inventory: ' + err.message;
    console.error(error.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchInventory();
});
</script>

<style scoped>
/* Base Container */
.admininventory-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Enhanced Header Section */
.admininventory-header-section {
  margin-bottom: 2rem;
}

.admininventory-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: .25rem;
}

.admininventory-subtitle {
  color: #64748b;
  font-size: .75rem;
}

/* Improved Stats Grid */
.admininventory-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Reduced from 240px */
  gap: 1rem; /* Reduced from 1.5rem */
  margin-bottom: 1.5rem;
}

.admininventory-stat-card {
  background-color: white;
  padding: 1rem; /* Reduced from 1.5rem */
  border-radius: 0.75rem; /* Slightly reduced from 1rem */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Reduced from 1rem */
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.admininventory-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.admininventory-stat-icon-wrapper {
  padding: 0.5rem; /* Reduced from 0.75rem */
  border-radius: 0.5rem; /* Reduced from 0.75rem */
  display: flex;
  align-items: center;
  justify-content: center;
}

.admininventory-stat-content {
  flex: 1;
}

.admininventory-stat-label {
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.admininventory-stat-value {
  font-size: 1.25rem; /* Reduced from 1.5rem */
  font-weight: 700;
  line-height: 1.2;
}

/* Enhanced Search Section */
.admininventory-search-section {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.admininventory-search-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.admininventory-search-group {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.admininventory-category-wrapper,
.admininventory-search-wrapper {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  flex: 1;
  transition: all 0.2s ease;
}

.admininventory-category-wrapper:hover,
.admininventory-search-wrapper:hover {
  border-color: #cbd5e1;
}

.admininventory-category-wrapper:focus-within,
.admininventory-search-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.1);
}

.admininventory-search-icon {
  color: #64748b;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.admininventory-select-input,
.admininventory-search-input {
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #1e293b;
  width: 100%;
  outline: none;
}

.admininventory-select-input:focus,
.admininventory-search-input:focus {
  outline: none;
}

.admininventory-reset-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admininventory-reset-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

/* Enhanced Table Styles */
.admininventory-inventory-table {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.admininventory-table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.admininventory-table-title {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.admininventory-table-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.admininventory-item-count {
  color: #64748b;
  font-size: 0.875rem;
}

.admininventory-table-wrapper {
  max-height: 400px; /* Set a maximum height for the table */
  overflow-y: auto; /* Enable vertical scrolling */
  width: 100%;
  -webkit-overflow-scrolling: touch;
}

.admininventory-table-container {
  width: 100%;
  min-width: 700px; /* Ensure minimum width for smaller screens */
}

.admininventory-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.admininventory-table th {
  background-color: #f8fafc;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
  position: sticky;
  top: 0;
  background-color: #f8fafc;
  z-index: 10;
}

.admininventory-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

/* Enhanced Product Cell */
.admininventory-product-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admininventory-product-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #f1f5f9;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admininventory-product-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
}

.admininventory-product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.admininventory-product-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}

.admininventory-product-id {
  color: #64748b;
  font-size: 0.75rem;
}

/* Enhanced Category Tag */
.admininventory-category-tag {
  display: inline-flex;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Enhanced Price Cell */
.admininventory-price-cell {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: #1e293b;
}

/* Enhanced Stock Level */
.admininventory-stock-level {
  width: 100%;
}

.admininventory-stock-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admininventory-stock-bar {
  flex: 1;
  height: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
  max-width: 120px;
}

.admininventory-stock-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.admininventory-stock-text {
  font-weight: 500;
  min-width: 2rem;
  text-align: right;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admininventory-container {
    padding: 1rem;
  }

  .admininventory-search-container {
    flex-direction: column;
  }

  .admininventory-search-group {
    flex-direction: column;
    width: 100%;
  }

  .admininventory-category-wrapper,
  .admininventory-search-wrapper {
    width: 100%;
  }

  .admininventory-reset-button {
    width: 100%;
    justify-content: center;
  }

  .admininventory-table-container {
    min-width: 700px;
  }
}

/* Utility Classes */
.admininventory-bg-green-500 { background-color: #10b981; }
.admininventory-bg-yellow-500 { background-color: #f59e0b; }
.admininventory-bg-red-500 { background-color: #ef4444; }
.admininventory-text-green-600 { color: #059669; }
.admininventory-text-yellow-600 { color: #d97706; }
.admininventory-text-red-600 { color: #dc2626; }
.admininventory-bg-purple-100 { background-color: #f3e8ff; }
.admininventory-text-purple-800 { color: #6b21a8; }
.admininventory-bg-blue-100 { background-color: #dbeafe; }
.admininventory-text-blue-800 { color: #1e40af; }
.admininventory-bg-green-100 { background-color: #dcfce7; }
.admininventory-text-green-800 { color: #166534; }

/* Add these new loading state styles */
.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  gap: 1rem;
}

.spinner-container {
  width: 40px;
  height: 40px;
  position: relative;
}

.spinner {
  width: 100%;
  height: 100%;
  position: relative;
  animation: spin 1s linear infinite;
}

.spinner-line {
  position: absolute;
  width: 2px;
  height: 8px;
  background: #7c3aed;
  border-radius: 1px;
  left: 50%;
  top: 0;
  transform-origin: 50% 20px;
}

.loading-text {
  color: #7c3aed;
  font-size: 1rem;
  font-weight: 500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>