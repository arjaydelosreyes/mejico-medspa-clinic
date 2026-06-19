<template>
  <div class="adminservice-container">
    <div class="adminservice-header">
      <h1>Services Management</h1>
      <button @click="openModal" class="adminservice-add-button">
        <Plus class="adminservice-plus-icon" size="18" />
        Add New Service
      </button>
    </div>

    <div class="adminservice-tabs">
      <button 
        :class="['adminservice-tab-button', { 'adminservice-active': !showArchived }]"
        @click="showArchived = false"
      >
        Active Services
      </button>
      <button 
        :class="['adminservice-tab-button', { 'adminservice-active': showArchived }]"
        @click="showArchived = true"
      >
        Archived Services
      </button>
    </div>

    <div class="adminservice-search-controls">
      <div class="adminservice-search-wrapper">
        <Clock class="adminservice-search-icon" />
        <select v-model="durationFilter" class="adminservice-select">
          <option value="">Filter by duration</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
        </select>
      </div>
      <div class="adminservice-search-wrapper">
        <Search class="adminservice-search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search services..." 
          class="adminservice-search-input"
        />
      </div>
      <button @click="applyFilters" class="adminservice-btn adminservice-btn-primary">
        <Filter class="adminservice-btn-icon" />
        Search
      </button>
      <button @click="resetFilters" class="adminservice-btn adminservice-btn-secondary">
        <RotateCcw class="adminservice-btn-icon" />
        Reset
      </button>
    </div>

    <div class="adminservice-services-table">
      <div class="adminservice-table-header">
        <div class="adminservice-service-name">Service Name</div>
        <div class="adminservice-duration">Duration</div>
        <div class="adminservice-actions">Actions</div>
      </div>
      
      <div v-if="filteredServices.length > 0" class="adminservice-table-body">
        <div v-for="service in filteredServices" :key="service.id" class="adminservice-table-row">
          <div class="adminservice-service-name">{{ service.name }}</div>
          <div class="adminservice-duration">{{ service.duration }} min</div>
          <div class="adminservice-actions">
            <button 
              v-if="!service.archived"
              @click="editService(service)" 
              class="adminservice-icon-button adminservice-edit"
              title="Edit service"
            >
              <Pencil class="adminservice-edit-icon" size="18" />
            </button>
            <button 
              @click="toggleArchiveService(service)" 
              class="adminservice-icon-button"
              :class="service.archived ? 'adminservice-restore' : 'adminservice-archive'"
              :title="service.archived ? 'Restore service' : 'Archive service'"
            >
              <component 
                :is="service.archived ? RotateCcw : Archive" 
                :class="service.archived ? 'adminservice-restore-icon' : 'adminservice-archive-icon'"
                size="18"
              />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="adminservice-no-services">
        {{ showArchived ? 'No archived services found.' : 'No active services found.' }}
      </div>
    </div>

    <div class="adminservice-pagination">
      <span>Showing {{ filteredServices.length }} of {{ totalServices }} services</span>
      <div class="adminservice-pagination-buttons">
        <button 
          @click="prevPage" 
          class="adminservice-pagination-button" 
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          class="adminservice-pagination-button"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Enhanced Modal -->
    <div v-if="isModalOpen" class="adminservice-modal">
      <div class="adminservice-modal-overlay" @click="closeModal"></div>
      <div class="adminservice-modal-content">
        <div class="adminservice-modal-header">
          <h3>{{ editingService ? 'Edit Service' : 'Add New Service' }}</h3>
          <button @click="closeModal" class="adminservice-modal-close">
            <X size="20" />
          </button>
        </div>
        <form @submit.prevent="editingService ? updateService() : addService()" class="adminservice-service-form">
          <div class="adminservice-form-group">
            <label for="serviceName">Service Name</label>
            <div class="adminservice-input-wrapper">
              <input 
                v-model="currentService.name" 
                type="text" 
                id="serviceName" 
                required 
                placeholder="Enter service name"
              />
              <Clipboard class="adminservice-input-icon" size="16" />
            </div>
          </div>
          <div class="adminservice-form-group">
            <label for="serviceDuration">Duration (minutes)</label>
            <div class="adminservice-input-wrapper">
              <input 
                v-model="currentService.duration" 
                type="number" 
                id="serviceDuration" 
                required 
                placeholder="Enter duration"
                min="15"
                step="15"
              />
              <Clock class="adminservice-input-icon" size="16" />
            </div>
          </div>
          <div class="adminservice-modal-actions">
            <button type="button" @click="closeModal" class="adminservice-cancel-button">
              <X size="16" />
              Cancel
            </button>
            <button type="submit" class="adminservice-submit-button">
              <Check size="16" />
              {{ editingService ? 'Update' : 'Add' }} Service
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom Notification -->
    <transition name="fade">
      <div v-if="notification.show" class="adminservice-notification" :class="notification.type">
        <div class="adminservice-notification-icon">
          <CheckCircle v-if="notification.type === 'success'" size="24" />
          <XCircle v-else size="24" />
        </div>
        <div class="adminservice-notification-content">
          <h4 class="adminservice-notification-title">
            {{ notification.type === 'success' ? 'Success' : 'Error' }}
          </h4>
          <p class="adminservice-notification-message">{{ notification.message }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { Search, Pencil, Archive, RotateCcw, Plus, CheckCircle, XCircle, Clock, Filter, X, Check, Clipboard } from 'lucide-vue-next';

const services = ref([]);
const currentService = ref({ name: '', duration: 60 });
const editingService = ref(null);
const isModalOpen = ref(false);
const searchQuery = ref('');
const durationFilter = ref('');
const showArchived = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;

const notification = ref({ show: false, message: '', type: '' });

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  currentService.value = { name: '', duration: 60 };
  editingService.value = null;
};

const addService = async () => {
  try {
    const customId = 'service-' + Date.now();
    const serviceData = {
      ...currentService.value,
      id: customId,
      archived: false,
      archivedAt: null
    };

    const serviceRef = await addDoc(collection(database, 'services'), serviceData);
    services.value.push(serviceData);
    
    closeModal();
    showNotification('Service added successfully!');
  } catch (error) {
    console.error('Failed to add service:', error);
    showNotification('Failed to add service: ' + error.message, 'error');
  }
};

const editService = (service) => {
  editingService.value = service;
  currentService.value = { ...service };
  openModal();
};

const updateService = async () => {
  try {
    const servicesRef = collection(database, 'services');
    const q = query(servicesRef, where("id", "==", editingService.value.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Service not found');
    }

    const docRef = doc(database, 'services', querySnapshot.docs[0].id);
    await updateDoc(docRef, currentService.value);
    
    const index = services.value.findIndex(s => s.id === editingService.value.id);
    services.value[index] = { ...currentService.value, id: editingService.value.id };
    closeModal();
    showNotification('Service updated successfully!');
  } catch (error) {
    console.error('Failed to update service:', error);
    showNotification('Failed to update service: ' + error.message, 'error');
  }
};

const toggleArchiveService = async (service) => {
  try {
    const servicesRef = collection(database, 'services');
    const q = query(servicesRef, where("id", "==", service.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Service not found');
    }

    const docRef = doc(database, 'services', querySnapshot.docs[0].id);
    const newArchivedStatus = !service.archived;
    
    await updateDoc(docRef, {
      archived: newArchivedStatus,
      archivedAt: newArchivedStatus ? new Date().toISOString() : null
    });
    
    const index = services.value.findIndex(s => s.id === service.id);
    services.value[index] = { 
      ...service, 
      archived: newArchivedStatus,
      archivedAt: newArchivedStatus ? new Date().toISOString() : null
    };
    
    showNotification(
      newArchivedStatus 
        ? 'Service archived successfully.'
        : 'Service restored successfully.'
    );
  } catch (error) {
    console.error('Failed to update archive status:', error);
    showNotification('Failed to update archive status: ' + error.message, 'error');
  }
};

const fetchServices = async () => {
  try {
    const servicesCollection = collection(database, 'services');
    const serviceSnapshot = await getDocs(servicesCollection);
    services.value = serviceSnapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      name: doc.data().name,
      duration: doc.data().duration || 60,
      archived: doc.data().archived || false,
      archivedAt: doc.data().archivedAt || null
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    showNotification('Failed to fetch services: ' + error.message, 'error');
  }
};

onMounted(() => {
  fetchServices();
});

const filteredServices = computed(() => {
  return services.value.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesDuration = !durationFilter.value || service.duration === parseInt(durationFilter.value);
    const matchesArchiveStatus = service.archived === showArchived.value;
    return matchesSearch && matchesDuration && matchesArchiveStatus;
  });
});

const paginatedServices = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredServices.value.slice(startIndex, endIndex);
});

const totalServices = computed(() => filteredServices.value.length);

const totalPages = computed(() => Math.ceil(totalServices.value / itemsPerPage));

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const applyFilters = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = '';
  durationFilter.value = '';
  currentPage.value = 1;
};
</script>

<style scoped>
.adminservice-container {
  height: 100%;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.adminservice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.adminservice-header h1 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.adminservice-add-button {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.adminservice-plus-icon {
  font-size: 1rem;
}

.adminservice-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.adminservice-tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
}

.adminservice-tab-button.adminservice-active {
  color: #8b5cf6;
  border-bottom: 2px solid #8b5cf6;
  font-weight: 500;
}

.adminservice-search-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.adminservice-search-wrapper {
  position: relative;
  flex: 1;
}

.adminservice-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #718096;
}

.adminservice-select,
.adminservice-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4a5568;
  background-color: white;
  transition: all 0.2s;
}

.adminservice-select:focus,
.adminservice-search-input:focus {
  outline: none;
  border-color: #9f7aea;
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
}

.adminservice-btn {
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

.adminservice-btn-primary {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.adminservice-btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
}

.adminservice-btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.adminservice-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.adminservice-services-table {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.adminservice-table-header {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 120px 100px;
  background: #8b5cf6;
  padding: 0.75rem;
  position: sticky;
  top: 0;
}

.adminservice-table-header > div {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.adminservice-table-row {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 120px 100px;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  font-size: 0.875rem;
}

.adminservice-table-row:hover {
  background: #f9fafb;
}

.adminservice-icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.adminservice-icon-button:hover {
  background-color: #f3f4f6;
}

.adminservice-edit-icon {
  color: #8b5cf6;
}

.adminservice-restore-icon {
  color: #10b981;
}

.adminservice-archive-icon {
  color: #6b7280;
}

.adminservice-icon-button.adminservice-restore:hover {
  background-color: #d1fae5;
}

.adminservice-icon-button.adminservice-archive:hover {
  background-color: #f3f4f6;
}

.adminservice-table-body {
  flex: 1;
  overflow-y: auto;
}

.adminservice-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.adminservice-pagination-buttons {
  display: flex;
  gap: 0.25rem;
}

.adminservice-pagination-button {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
}

.adminservice-pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.adminservice-no-services {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.adminservice-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px;
  border-radius: 12px;
  background-color: white;
  color: #374151;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 400px;
  width: 100%;
}

.adminservice-notification-icon {
  flex-shrink: 0;
}

.adminservice-notification-content {
  flex-grow: 1;
}

.adminservice-notification-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.adminservice-notification-message {
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.adminservice-notification.success {
  border-left: 4px solid #7c3aed;
}

.adminservice-notification.success .adminservice-notification-icon {
  color: #7c3aed;
}

.adminservice-notification.error {
  border-left: 4px solid #ef4444;
}

.adminservice-notification.error .adminservice-notification-icon {
  color: #ef4444;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}

/* Enhanced Modal Styles */
.adminservice-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.adminservice-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.adminservice-modal-content {
  background: white;
  border-radius: 16px;
  width: 500px;
  max-width: 95%;
  position: relative;
  z-index: 51;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

.adminservice-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
}

.adminservice-modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.adminservice-modal-close {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.adminservice-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.adminservice-service-form {
  padding: 1.5rem;
}

.adminservice-form-group {
  margin-bottom: 1.5rem;
}

.adminservice-form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.adminservice-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.adminservice-input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #f9fafb;
}

.adminservice-input-wrapper input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: white;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.adminservice-input-icon {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

.adminservice-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.adminservice-submit-button,
.adminservice-cancel-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.adminservice-submit-button {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
  border: none;
}

.adminservice-submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);
}

.adminservice-cancel-button {
  background: #f3f4f6;
  color: #374151;
  border: none;
}

.adminservice-cancel-button:hover {
  background: #e5e7eb;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .adminservice-search-controls {
    flex-direction: column;
  }

  .adminservice-search-wrapper {
    width: 100%;
  }
}
</style>