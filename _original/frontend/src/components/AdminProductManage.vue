<template>
  <div class="adminprodmanage-container">
    <h2 class="adminprodmanage-title">Product Management</h2>

    <div v-if="error" class="adminprodmanage-alert" role="alert">
      <AlertCircle class="adminprodmanage-alert-icon" />
      <span>{{ error }}</span>
    </div>

    <!-- Tab Navigation -->
    <div class="adminprodmanage-tabs">
      <button 
        @click="activeTab = 'active'"
        class="adminprodmanage-tab"
        :class="{ 'active': activeTab === 'active' }"
      >
        Active Products
      </button>
      <button 
        @click="activeTab = 'archived'"
        class="adminprodmanage-tab"
        :class="{ 'active': activeTab === 'archived' }"
      >
        Archived Products
      </button>
    </div>

    <!-- Active Products Tab -->
    <div v-if="activeTab === 'active'">
      <!-- Search Controls -->
      <div class="adminprodmanage-search-controls">
        <div class="adminprodmanage-search-wrapper">
          <Package class="adminprodmanage-search-icon" />
          <select v-model="searchCategory" class="adminprodmanage-select">
            <option value="">Select category</option>
            <option v-for="service in services" :key="service.id" :value="service.name">
              {{ service.name }}
            </option>
          </select>
        </div>
        <div class="adminprodmanage-search-wrapper">
          <Search class="adminprodmanage-search-icon" />
          <input 
            v-model="searchProduct" 
            type="text" 
            placeholder="Search by product name" 
            class="adminprodmanage-search-input"
          >
        </div>
        <button @click="applyFilters" class="adminprodmanage-btn adminprodmanage-btn-primary">
          <Filter class="adminprodmanage-btn-icon" />
          Search
        </button>
        <button @click="resetFilters" class="adminprodmanage-btn adminprodmanage-btn-secondary">
          <RotateCcw class="adminprodmanage-btn-icon" />
          Reset
        </button>
        <button v-if="isAdmin" @click="openAddModal" class="adminprodmanage-btn adminprodmanage-btn-add">
          <Plus class="adminprodmanage-btn-icon" />
          Add Product
        </button>
      </div>

      <!-- Product Stats -->
      <div class="adminprodmanage-stats-grid">
        <div class="adminprodmanage-stat-card">
          <div class="adminprodmanage-stat-icon-wrapper">
            <Package class="adminprodmanage-stat-icon" />
          </div>
          <div class="adminprodmanage-stat-content">
            <p class="adminprodmanage-stat-value">{{ totalProducts }}</p>
            <h3 class="adminprodmanage-stat-label">Total Products</h3>
          </div>
        </div>
        <div class="adminprodmanage-stat-card">
          <div class="adminprodmanage-stat-icon-wrapper">
            <Tags class="adminprodmanage-stat-icon" />
          </div>
          <div class="adminprodmanage-stat-content">
            <p class="adminprodmanage-stat-value">{{ totalCategories }}</p>
            <h3 class="adminprodmanage-stat-label">Categories</h3>
          </div>
        </div>
        <div class="adminprodmanage-stat-card">
          <div class="adminprodmanage-stat-icon-wrapper">
            <DollarSign class="adminprodmanage-stat-icon" />
          </div>
          <div class="adminprodmanage-stat-content">
            <p class="adminprodmanage-stat-value">₱{{ totalValue }}</p>
            <h3 class="adminprodmanage-stat-label">Total Value</h3>
          </div>
        </div>
      </div>

      <!-- Active Products Table -->
      <div class="adminprodmanage-table-container" style="max-width: none; width: 100%;">
        <div class="adminprodmanage-table-responsive">
          <table v-if="!loading && filteredProducts.length > 0" class="adminprodmanage-table" style="min-width: 800px;">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Price</th>
                <th>Quantity</th>
                <th v-if="isAdmin" class="adminprodmanage-actions-header" style="text-align: left;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredProducts" :key="product.id">
                <td>
                  <div class="adminprodmanage-product-info">
                    <Package class="adminprodmanage-product-icon" />
                    <span>{{ product.name }}</span>
                  </div>
                </td>
                <td>{{ product.category }}</td>
                <td>{{ product.description || 'No description' }}</td>
                <td class="adminprodmanage-price-cell">₱{{ formatPrice(product.price) }}</td>
                <td>{{ product.quantity }}</td>
                <td v-if="isAdmin">
                  <div class="adminprodmanage-actions" style="justify-content: flex-start;">
                    <button @click="editProduct(product)" class="adminprodmanage-action-btn" aria-label="Edit">
                      <Edit2 class="adminprodmanage-action-icon" />
                    </button>
                    <button @click="archiveProduct(product.id)" class="adminprodmanage-action-btn" aria-label="Archive">
                      <Archive class="adminprodmanage-action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else-if="!loading && filteredProducts.length === 0" class="adminprodmanage-empty-state">
            <Package class="adminprodmanage-empty-icon" />
            <p>No products found</p>
          </div>
          <div v-else class="adminprodmanage-loading-state">
            <Loader class="adminprodmanage-loading-icon adminprodmanage-spin" />
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Archived Products Tab -->
    <div v-if="activeTab === 'archived'" class="adminprodmanage-table-container">
      <div class="adminprodmanage-table-responsive">
        <table v-if="!loading && archivedProducts.length > 0" class="adminprodmanage-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Price</th>
              <th>Quantity</th>
              <th v-if="isAdmin" class="adminprodmanage-actions-header" style="text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in archivedProducts" :key="product.id">
              <td>
                <div class="adminprodmanage-product-info">
                  <Package class="adminprodmanage-product-icon" />
                  <span>{{ product.name }}</span>
                </div>
              </td>
              <td>{{ product.category }}</td>
              <td>{{ product.description || 'No description' }}</td>
              <td class="adminprodmanage-price-cell">₱{{ formatPrice(product.price) }}</td>
              <td>{{ product.quantity }}</td>
              <td v-if="isAdmin">
                <div class="adminprodmanage-actions" style="justify-content: flex-start;">
                  <button @click="restoreProduct(product.id)" class="adminprodmanage-action-btn" aria-label="Restore">
                    <RefreshCw class="adminprodmanage-action-icon" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="!loading && archivedProducts.length === 0" class="adminprodmanage-empty-state">
          <Archive class="adminprodmanage-empty-icon" />
          <p>No archived products</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showModal" class="adminprodmanage-modal-overlay" @click="closeModal">
      <div class="adminprodmanage-modal" @click.stop>
        <div class="adminprodmanage-modal-header">
          <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
          <button @click="closeModal" class="adminprodmanage-modal-close">
            <X class="adminprodmanage-modal-close-icon" />
          </button>
        </div>
        <form @submit.prevent="saveProduct" class="adminprodmanage-modal-content">
          <div class="adminprodmanage-form-group">
            <label for="name">Product Name</label>
            <div class="input-wrapper">
              <Package class="input-icon" />
              <input 
                v-model="currentProduct.name" 
                id="name" 
                type="text" 
                required
                class="adminprodmanage-input"
                placeholder="Enter product name"
              >
            </div>
          </div>
          
          <div class="adminprodmanage-form-group">
            <label for="description">Description</label>
            <div class="input-wrapper">
              <FileText class="input-icon" />
              <textarea 
                v-model="currentProduct.description" 
                id="description" 
                class="adminprodmanage-input adminprodmanage-textarea"
                placeholder="Enter product description"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="adminprodmanage-form-group">
            <label for="category">Category</label>
            <div class="input-wrapper">
              <Tags class="input-icon" />
              <select 
                v-model="currentProduct.category" 
                id="category" 
                required
                class="adminprodmanage-input"
              >
                <option value="" disabled>Select a category</option>
                <option v-for="service in services" :key="service.id" :value="service.name">
                  {{ service.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="adminprodmanage-form-row">
            <div class="adminprodmanage-form-group">
              <label for="price">Price</label>
              <div class="input-wrapper">
                <span class="peso-sign">₱</span>
                <input 
                  v-model="currentProduct.price" 
                  id="price" 
                  type="number" 
                  step="0.01" 
                  required
                  class="adminprodmanage-input price-input"
                  placeholder="0.00"
                >
              </div>
            </div>
            <div class="adminprodmanage-form-group">
              <label for="quantity">Quantity</label>
              <div class="input-wrapper">
                <Package class="input-icon" />
                <input 
                  v-model="currentProduct.quantity" 
                  id="quantity" 
                  type="number" 
                  required
                  class="adminprodmanage-input"
                  placeholder="0"
                >
              </div>
            </div>
          </div>
          
          <div class="adminprodmanage-modal-footer">
            <button type="button" @click="closeModal" class="adminprodmanage-btn adminprodmanage-btn-secondary">
              Cancel
            </button>
            <button type="submit" class="adminprodmanage-btn adminprodmanage-btn-primary">
              {{ editingProduct ? 'Update Product' : 'Add Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { auth, database } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import { 
  AlertCircle, Package, Search, Filter, 
  RotateCcw, Plus, Tags, DollarSign, 
  Edit2, Archive, RefreshCw, Loader, X, FileText 
} from 'lucide-vue-next';

const toast = useToast();
const services = ref([]);
const products = ref([]);
const archivedProducts = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const searchCategory = ref('');
const searchProduct = ref('');
const currentProduct = ref({ name: '', description: '', price: 0, quantity: 0, category: '' });
const editingProduct = ref(null);
const activeTab = ref('active');
const isAdmin = ref(false);

const checkAdminStatus = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      isAdmin.value = false;
      return;
    }

    const userDoc = await getDoc(doc(database, 'users', user.uid));
    if (!userDoc.exists()) {
      isAdmin.value = false;
      return;
    }

    isAdmin.value = userDoc.data().role === 'admin';
  } catch (err) {
    console.error('Error checking admin status:', err);
    isAdmin.value = false;
  }
};

const fetchServices = async () => {
  try {
    const servicesCollection = collection(database, 'services');
    const serviceSnapshot = await getDocs(servicesCollection);
    services.value = serviceSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || 'Unnamed Service',
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error fetching services:', err);
    error.value = 'Failed to fetch services. Please try again.';
  }
};

const fetchProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(database, 'products'));
    products.value = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product => !product.archived);
    
    const archivedSnapshot = await getDocs(collection(database, 'archivedProducts'));
    archivedProducts.value = archivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    loading.value = false;
  } catch (err) {
    console.error('Error loading products:', err);
    error.value = 'Error loading products: ' + err.message;
    loading.value = false;
  }
};

const saveProduct = async () => {
  try {
    if (!isAdmin.value) {
      toast.error('You do not have permission to perform this action');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    await user.getIdToken(true);
    
    const productData = {
      name: currentProduct.value.name,
      description: currentProduct.value.description,
      price: Number(currentProduct.value.price),
      quantity: Number(currentProduct.value.quantity),
      category: currentProduct.value.category,
      updatedBy: user.uid,
      updatedAt: new Date().toISOString()
    };

    if (editingProduct.value) {
      const productRef = doc(database, 'products', editingProduct.value);
      await updateDoc(productRef, productData);
      toast.success('Product updated successfully');
    } else {
      productData.createdBy = user.uid;
      productData.createdAt = new Date().toISOString();
      await addDoc(collection(database, 'products'), productData);
      toast.success('Product added successfully');
    }
    
    await fetchProducts();
    closeModal();
  } catch (err) {
    console.error('Error saving product:', err);
    if (err.code === 'permission-denied') {
      toast.error('You do not have permission to perform this action');
    } else {
      toast.error('Error saving product: ' + err.message);
    }
  }
};

const editProduct = (product) => {
  if (!isAdmin.value) {
    toast.error('You do not have permission to edit products');
    return;
  }
  currentProduct.value = { ...product };
  editingProduct.value = product.id;
  showModal.value = true;
};

const archiveProduct = async (productId) => {
  if (!isAdmin.value) {
    toast.error('You do not have permission to archive products');
    return;
  }

  if (confirm('Are you sure you want to archive this product?')) {
    try {
      const productRef = doc(database, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        toast.error('Product not found');
        return;
      }

      const productData = productSnap.data();

      await setDoc(doc(database, 'archivedProducts', productId), {
        ...productData,
        archivedAt: new Date().toISOString(),
        archivedBy: auth.currentUser?.uid
      });

      await deleteDoc(productRef);
      toast.success('Product archived successfully');
      await fetchProducts();
    } catch (err) {
      console.error('Error archiving product:', err);
      toast.error('Error archiving product: ' + err.message);
    }
  }
};

const restoreProduct = async (productId) => {
  if (!isAdmin.value) {
    toast.error('You do not have permission to restore products');
    return;
  }

  try {
    const archivedProductRef = doc(database, 'archivedProducts', productId);
    const archivedProductSnap = await getDoc(archivedProductRef);
    
    if (!archivedProductSnap.exists()) {
      toast.error('Archived product not found');
      return;
    }

    const archivedProductData = archivedProductSnap.data();
    const { archivedAt, archivedBy, ...productData } = archivedProductData;

    await setDoc(doc(database, 'products', productId), {
      ...productData,
      restoredAt: new Date().toISOString(),
      restoredBy: auth.currentUser?.uid
    });

    await deleteDoc(archivedProductRef);
    toast.success('Product restored successfully');
    await fetchProducts();
  } catch (err) {
    console.error('Error restoring product:', err);
    toast.error('Error restoring product: ' + err.message);
  }
};

const openAddModal = () => {
  if (!isAdmin.value) {
    toast.error('You do not have permission to add products');
    return;
  }
  currentProduct.value = { name: '', description: '', price: 0, quantity: 0, category: '' };
  editingProduct.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  currentProduct.value = { name: '', description: '', price: 0, quantity: 0, category: '' };
  editingProduct.value = null;
};

const applyFilters = () => {
  // Filtering is handled by computed property
};

const resetFilters = () => {
  searchCategory.value = '';
  searchProduct.value = '';
};

const formatPrice = (price) => {
  return Number(price).toFixed(2);
};

const totalProducts = computed(() => products.value.length);
const totalCategories = computed(() => new Set(products.value.map(p => p.category)).size);
const totalValue = computed(() => {
  const total = products.value.reduce((sum, product) => {
    return sum + (Number(product.price) * Number(product.quantity));
  }, 0);
  return total.toFixed(2);
});

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesCategory = searchCategory.value
      ? product.category.toLowerCase() === searchCategory.value.toLowerCase()
      : true;
    const matchesProduct = searchProduct.value
      ? product.name.toLowerCase().includes(searchProduct.value.toLowerCase())
      : true;
    return matchesCategory && matchesProduct;
  });
});

onMounted(async () => {
  try {
    await checkAdminStatus();
    await Promise.all([fetchServices(), fetchProducts()]);
  } catch (err) {
    console.error('Error initializing data:', err);
    error.value = 'Error initializing data: ' + err.message;
  }
});
</script>

<style>
.adminprodmanage-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 650px;
  overflow: hidden; /* Prevent outer scrolling */
}

.adminprodmanage-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.adminprodmanage-alert {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 6px;
  color: #c53030;
  margin-bottom: 1rem;
}

.adminprodmanage-alert-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.adminprodmanage-search-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.adminprodmanage-search-wrapper {
  position: relative;
  flex: 1;
}

.adminprodmanage-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #718096;
}

.adminprodmanage-select,
.adminprodmanage-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4a5568;
  background-color: white;
  transition: all 0.2s;
}

.adminprodmanage-select:focus,
.adminprodmanage-search-input:focus {
  outline: none;
  border-color: #9f7aea;
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
}

.adminprodmanage-btn {
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

.adminprodmanage-btn-primary {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.adminprodmanage-btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
}

.adminprodmanage-btn-add {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.adminprodmanage-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.adminprodmanage-btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.adminprodmanage-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.adminprodmanage-stat-card {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.186);
  transition: transform 0.2s;
}

.adminprodmanage-stat-card:hover {
  transform: translateY(-2px);
}

.adminprodmanage-stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(159, 122, 234, 0.1);
  border-radius: 8px;
  margin-right: 1rem;
}

.adminprodmanage-stat-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #9f7aea;
}

.adminprodmanage-stat-content {
  flex: 1;
}

.adminprodmanage-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #9f7aea;
}

.adminprodmanage-stat-label {
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.adminprodmanage-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  height: calc(100% - 250px);
  display: flex;
  flex-direction: column;
  max-width: none;
  width: 100%;
}

.adminprodmanage-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.adminprodmanage-table-responsive {
  overflow-y: auto;
  overflow-x: auto;
  flex: 1;
}

.adminprodmanage-table {
  width: 100%;
  min-width: 800px; /* Ensure minimum width */
  border-collapse: separate;
  border-spacing: 0;
}

.adminprodmanage-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.adminprodmanage-table th {
  background: #8b5cf6;
  color: white;
  font-weight: 500;
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.adminprodmanage-table th:first-child {
  border-top-left-radius: 6px;
}

.adminprodmanage-table th:last-child {
  border-top-right-radius: 6px;
}

.adminprodmanage-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #4a5568;
}

.adminprodmanage-product-info {
  display: flex;
  align-items: center;
}

.adminprodmanage-product-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  color: #9f7aea;
}

.adminprodmanage-price-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.adminprodmanage-actions {
  display: flex;
  justify-content: flex-start;
  gap: 0.5rem;
}

.adminprodmanage-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: transparent;
  color: #8b5cf6;
  padding: 0;
}

.adminprodmanage-action-btn:hover {
  color: #7c3aed;
  transform: translateY(-1px);
}

.adminprodmanage-action-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.adminprodmanage-actions-header {
  text-align: left;
}

.adminprodmanage-empty-state,
.adminprodmanage-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #718096;
}

.adminprodmanage-empty-icon,
.adminprodmanage-loading-icon {
  width: 3rem;
  height: 3rem;
  color: #9f7aea;
  margin-bottom: 1rem;
}

.adminprodmanage-spin {
  animation: adminprodmanage-spin 1s linear infinite;
}

@keyframes adminprodmanage-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.adminprodmanage-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}

.adminprodmanage-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: translateY(0);
  transition: transform 0.3s ease;
  animation: modalSlideIn 0.3s ease;
  scrollbar-width: thin;
  scrollbar-color: #8b5cf6 #f1f5f9;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.adminprodmanage-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(to right, #8b5cf6, #6366f1);
}

.adminprodmanage-modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
}

.adminprodmanage-modal-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.adminprodmanage-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.adminprodmanage-modal-content {
  padding: 2rem;
}

.adminprodmanage-form-group {
  margin-bottom: 1.5rem;
}

.adminprodmanage-form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 1rem;
  width: 1rem;
  height: 1rem;
  color: #8b5cf6;
}

.adminprodmanage-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #4a5568;
  transition: all 0.2s;
  background-color: #f8fafc;
}

.adminprodmanage-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  background-color: white;
}

.adminprodmanage-input::placeholder {
  color: #a0aec0;
}

.adminprodmanage-textarea {
  padding-top: 0.75rem;
  min-height: 100px;
  resize: vertical;
}

.peso-sign {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #8b5cf6;
  font-weight: 600;
  font-size: 1rem;
}

.price-input {
  padding-left: 2rem !important;
}

.adminprodmanage-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.adminprodmanage-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.adminprodmanage-btn-primary {
  background: linear-gradient(to right, #8b5cf6, #6366f1);
  color: white;
  border: none;
}

.adminprodmanage-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2), 0 2px 4px -1px rgba(139, 92, 246, 0.1);
}

.adminprodmanage-btn-secondary {
  background-color: #f1f5f9;
  color: #64748b;
  border: none;
}

.adminprodmanage-btn-secondary:hover {
  background-color: #e2e8f0;
  transform: translateY(-2px);
}

.adminprodmanage-tabs {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 2rem;
  gap: 2rem;
}

.adminprodmanage-tab {
  padding: 1rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: #718096;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.adminprodmanage-tab:hover {
  color: #4a5568;
}

.adminprodmanage-tab.active {
  color: #8b5cf6;
}

.adminprodmanage-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #8b5cf6;
}

.adminprodmanage-table-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.adminprodmanage-table-responsive::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.adminprodmanage-table-responsive::-webkit-scrollbar-thumb {
  background: #8b5cf6;
  border-radius: 4px;
}

.adminprodmanage-table-responsive::-webkit-scrollbar-thumb:hover {
  background: #7c3aed;
}

@media (max-width: 768px) {
  .adminprodmanage-search-controls {
    flex-direction: column;
  }

  .adminprodmanage-search-wrapper {
    width: 100%;
  }

  .adminprodmanage-form-row {
    grid-template-columns: 1fr;
  }
}
</style>