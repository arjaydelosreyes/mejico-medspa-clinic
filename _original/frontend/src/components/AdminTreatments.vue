<template>
  <div class="admintreatment-container">
    <div class="admintreatment-header">
      <h1>Treatment Management</h1>
      <button @click="openModal" class="admintreatment-add-button">
        <Plus class="admintreatment-plus-icon" size="18" />
        Add New Treatment
      </button>
    </div>

    <div class="admintreatment-tabs">
      <button 
        :class="['admintreatment-tab-button', { 'admintreatment-active': !showArchived }]"
        @click="showArchived = false"
      >
        Active Treatments
      </button>
      <button 
        :class="['admintreatment-tab-button', { 'admintreatment-active': showArchived }]"
        @click="showArchived = true"
      >
        Archived Treatments
      </button>
    </div>

    <div class="admintreatment-search-controls">
      <div class="admintreatment-search-wrapper">
        <Package class="admintreatment-search-icon" />
        <select v-model="selectedService" class="admintreatment-select">
          <option value="">Select service</option>
          <option v-for="service in services" :key="service.id" :value="service.name">
            {{ service.name }}
          </option>
        </select>
      </div>
      <div class="admintreatment-search-wrapper">
        <Search class="admintreatment-search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by treatment name" 
          class="admintreatment-search-input"
        >
      </div>
      <button @click="applyFilters" class="admintreatment-btn admintreatment-btn-primary">
        <Filter class="admintreatment-btn-icon" />
        Search
      </button>
      <button @click="resetFilters" class="admintreatment-btn admintreatment-btn-secondary">
        <RotateCcw class="admintreatment-btn-icon" />
        Reset
      </button>
    </div>

    <div class="admintreatment-treatments-table">
      <div class="admintreatment-table-header">
        <div class="admintreatment-treatment-name">Treatment Name</div>
        <div class="admintreatment-description">Description</div>
        <div class="admintreatment-price">Price</div>
        <div class="admintreatment-services">Services</div>
        <div class="admintreatment-actions">Actions</div>
      </div>
      
      <div v-if="paginatedTreatments.length > 0" class="admintreatment-table-body">
        <div v-for="treatment in paginatedTreatments" :key="treatment.id" class="admintreatment-table-row">
          <div class="admintreatment-treatment-name">{{ treatment.name }}</div>
          <div class="admintreatment-description">{{ treatment.description }}</div>
          <div class="admintreatment-price">₱{{ treatment.price.toFixed(2) }}</div>
          <div class="admintreatment-services">{{ getServiceNameById(treatment.services) }}</div>
          <div class="admintreatment-actions">
            <button 
              v-if="!treatment.archived"
              @click="editTreatment(treatment)" 
              class="admintreatment-icon-button admintreatment-edit"
              title="Edit treatment"
            >
              <Pencil class="admintreatment-edit-icon" size="18" />
            </button>
            <button 
              @click="toggleArchiveTreatment(treatment)" 
              class="admintreatment-icon-button"
              :class="treatment.archived ? 'admintreatment-restore' : 'admintreatment-archive'"
              :title="treatment.archived ? 'Restore treatment' : 'Archive treatment'"
            >
              <component 
                :is="treatment.archived ? RotateCcw : Archive" 
                :class="treatment.archived ? 'admintreatment-restore-icon' : 'admintreatment-archive-icon'"
                size="18"
              />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="admintreatment-no-treatments">
        {{ showArchived ? 'No archived treatments found.' : 'No active treatments found.' }}
      </div>
    </div>

    <div class="admintreatment-pagination">
      <span>Showing {{ paginatedTreatments.length }} of {{ totalTreatments }} treatments</span>
      <div class="admintreatment-pagination-buttons">
        <button 
          @click="prevPage" 
          class="admintreatment-pagination-button" 
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          class="admintreatment-pagination-button"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Enhanced Modal -->
    <div v-if="isModalOpen" class="admintreatment-modal">
      <div class="admintreatment-modal-overlay" @click="closeModal"></div>
      <div class="admintreatment-modal-content">
        <div class="admintreatment-modal-header">
          <h3>{{ editingTreatment ? 'Edit Treatment' : 'Add New Treatment' }}</h3>
          <button @click="closeModal" class="admintreatment-modal-close">
            <X size="20" />
          </button>
        </div>
        <form @submit.prevent="editingTreatment ? updateTreatment() : addTreatment()" class="admintreatment-treatment-form">
          <div class="admintreatment-form-group">
            <label for="treatmentName">Treatment Name</label>
            <div class="admintreatment-input-wrapper">
              <input 
                v-model="currentTreatment.name" 
                type="text" 
                id="treatmentName" 
                required 
                placeholder="Enter treatment name"
              />
              <Clipboard class="admintreatment-input-icon" size="16" />
            </div>
          </div>
          <div class="admintreatment-form-group">
            <label for="treatmentDescription">Description</label>
            <div class="admintreatment-input-wrapper">
              <textarea 
                v-model="currentTreatment.description" 
                id="treatmentDescription" 
                rows="3" 
                required
                placeholder="Enter treatment description"
                class="admintreatment-textarea"
              ></textarea>
              <FileText class="admintreatment-input-icon" size="16" />
            </div>
          </div>
          <div class="admintreatment-form-group">
            <label for="treatmentPrice">Price (₱)</label>
            <div class="admintreatment-input-wrapper">
              <input 
                v-model.number="currentTreatment.price" 
                type="number" 
                id="treatmentPrice" 
                step="0.01" 
                min="0" 
                required 
                placeholder="0.00"
              />
              <DollarSign class="admintreatment-input-icon" size="16" />
            </div>
          </div>
          <div class="admintreatment-form-group">
            <label for="treatmentServices">Select Service</label>
            <div class="admintreatment-input-wrapper">
              <select 
                v-model="currentTreatment.services" 
                id="treatmentServices" 
                required
                class="admintreatment-select-input"
              >
                <option value="" disabled>Choose a service</option>
                <option v-for="service in services" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <Package class="admintreatment-input-icon" size="16" />
            </div>
          </div>
          <div class="admintreatment-modal-actions">
            <button type="button" @click="closeModal" class="admintreatment-cancel-button">
              <X size="16" />
              Cancel
            </button>
            <button type="submit" class="admintreatment-submit-button">
              <Check size="16" />
              {{ editingTreatment ? 'Update' : 'Add' }} Treatment
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom Notification -->
    <transition name="fade">
      <div v-if="notification.show" class="admintreatment-notification" :class="notification.type">
        <div class="admintreatment-notification-icon">
          <CheckCircle v-if="notification.type === 'success'" size="24" />
          <XCircle v-else size="24" />
        </div>
        <div class="admintreatment-notification-content">
          <h4 class="admintreatment-notification-title">
            {{ notification.type === 'success' ? 'Success' : 'Error' }}
          </h4>
          <p class="admintreatment-notification-message">{{ notification.message }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { Search, Pencil, Archive, RotateCcw, Plus, CheckCircle, XCircle, Filter, Package, FileText, DollarSign, Check, X, Clipboard } from 'lucide-vue-next';
import { useToast } from 'vue-toastification';

const toast = useToast();
const treatments = ref([]);
const services = ref([]);
const currentTreatment = ref({ name: '', description: '', price: 0, services: '' });
const editingTreatment = ref(null);
const isModalOpen = ref(false);
const searchQuery = ref('');
const selectedService = ref('');
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
  currentTreatment.value = { name: '', description: '', price: 0, services: '' };
  editingTreatment.value = null;
};

const addTreatment = async () => {
  try {
    const customId = 'treatment-' + Date.now();
    const treatmentData = {
      ...currentTreatment.value,
      id: customId,
      archived: false,
      archivedAt: null
    };

    const treatmentRef = await addDoc(collection(database, 'treatments'), treatmentData);
    treatments.value.push(treatmentData);
    
    closeModal();
    showNotification('Treatment added successfully!');
  } catch (error) {
    console.error('Failed to add treatment:', error);
    showNotification('Failed to add treatment: ' + error.message, 'error');
  }
};

const editTreatment = (treatment) => {
  editingTreatment.value = treatment;
  currentTreatment.value = { ...treatment };
  openModal();
};

const updateTreatment = async () => {
  try {
    const treatmentsRef = collection(database, 'treatments');
    const q = query(treatmentsRef, where("id", "==", editingTreatment.value.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Treatment not found');
    }

    const docRef = doc(database, 'treatments', querySnapshot.docs[0].id);
    await updateDoc(docRef, currentTreatment.value);
    
    const index = treatments.value.findIndex(t => t.id === editingTreatment.value.id);
    treatments.value[index] = { ...currentTreatment.value, id: editingTreatment.value.id };
    closeModal();
    showNotification('Treatment updated successfully!');
  } catch (error) {
    console.error('Failed to update treatment:', error);
    showNotification('Failed to update treatment: ' + error.message, 'error');
  }
};

const toggleArchiveTreatment = async (treatment) => {
  try {
    const treatmentsRef = collection(database, 'treatments');
    const q = query(treatmentsRef, where("id", "==", treatment.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Treatment not found');
    }

    const docRef = doc(database, 'treatments', querySnapshot.docs[0].id);
    const newArchivedStatus = !treatment.archived;
    
    await updateDoc(docRef, {
      archived: newArchivedStatus,
      archivedAt: newArchivedStatus ? new Date().toISOString() : null
    });
    
    const index = treatments.value.findIndex(t => t.id === treatment.id);
    treatments.value[index] = { 
      ...treatment, 
      archived: newArchivedStatus,
      archivedAt: newArchivedStatus ? new Date().toISOString() : null
    };
    
    showNotification(
      newArchivedStatus 
        ? 'Treatment archived successfully.'
        : 'Treatment restored successfully.'
    );
  } catch (error) {
    console.error('Failed to update archive status:', error);
    showNotification('Failed to update archive status: ' + error.message, 'error');
  }
};

const fetchTreatments = async () => {
  try {
    const treatmentsCollection = collection(database, 'treatments');
    const treatmentSnapshot = await getDocs(treatmentsCollection);
    treatments.value = treatmentSnapshot.docs.map(doc => ({
      id: doc.data().id || doc.id,
      name: doc.data().name,
      description: doc.data().description,
      price: doc.data().price,
      services: doc.data().services,
      archived: doc.data().archived || false,
      archivedAt: doc.data().archivedAt || null
    }));
  } catch (error) {
    console.error('Error fetching treatments:', error);
    showNotification('Failed to fetch treatments: ' + error.message, 'error');
  }
};

const fetchServices = async () => {
  try {
    const servicesCollection = collection(database, 'services');
    const serviceSnapshot = await getDocs(servicesCollection);
    services.value = serviceSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    showNotification('Failed to fetch services: ' + error.message, 'error');
  }
};

onMounted(() => {
  fetchTreatments();
  fetchServices();
});

const filteredTreatments = computed(() => {
  return treatments.value.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesService = !selectedService.value || treatment.services === selectedService.value;
    const matchesArchiveStatus = treatment.archived === showArchived.value;
    return matchesSearch && matchesService && matchesArchiveStatus;
  });
});

const paginatedTreatments = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredTreatments.value.slice(startIndex, endIndex);
});

const totalTreatments = computed(() => filteredTreatments.value.length);

const totalPages = computed(() => Math.ceil(totalTreatments.value / itemsPerPage));

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

const getServiceNameById = (serviceId) => {
  const service = services.value.find(s => s.id === serviceId);
  return service ? service.name : '';
};

const applyFilters = () => {
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedService.value = '';
  currentPage.value = 1;
};
</script>

<style scoped>
.admintreatment-container {
  height: 100%;
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.admintreatment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.admintreatment-header h1 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.admintreatment-add-button {
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

.admintreatment-plus-icon {
  font-size: 1rem;
}

.admintreatment-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.admintreatment-tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
}

.admintreatment-tab-button.admintreatment-active {
  color: #8b5cf6;
  border-bottom: 2px solid #8b5cf6;
  font-weight: 500;
}

.admintreatment-search-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.admintreatment-search-wrapper {
  position: relative;
  flex: 1;
}

.admintreatment-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #718096;
}

.admintreatment-select,
.admintreatment-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4a5568;
  background-color: white;
  transition: all 0.2s;
}

.admintreatment-select:focus,
.admintreatment-search-input:focus {
  outline: none;
  border-color: #9f7aea;
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
}

.admintreatment-btn {
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

.admintreatment-btn-primary {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.admintreatment-btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
}

.admintreatment-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.admintreatment-btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.admintreatment-treatments-table {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.admintreatment-table-header {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(200px, 2fr) 100px 150px 100px;
  background: #8b5cf6;
  padding: 0.75rem;
  position: sticky;
  top: 0;
}

.admintreatment-table-header > div {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.admintreatment-table-row {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(200px, 2fr) 100px 150px 100px;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  font-size: 0.875rem;
}

.admintreatment-table-row:hover {
  background: #f9fafb;
}

.admintreatment-icon-button {
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

.admintreatment-icon-button:hover {
  background-color: #f3f4f6;
}

.admintreatment-edit-icon {
  color: #8b5cf6;
}

.admintreatment-restore-icon {
  color: #10b981;
}

.admintreatment-archive-icon {
  color: #6b7280;
}

.admintreatment-icon-button.admintreatment-restore:hover {
  background-color: #d1fae5;
}

.admintreatment-icon-button.admintreatment-archive:hover {
  background-color: #f3f4f6;
}

.admintreatment-table-body {
  flex: 1;
  overflow-y: auto;
}

.admintreatment-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.admintreatment-pagination-buttons {
  display: flex;
  gap: 0.25rem;
}

.admintreatment-pagination-button {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
}

.admintreatment-pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admintreatment-no-treatments {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.admintreatment-treatment-name {
  padding-right: 2rem;
}

.admintreatment-price {
  text-align: center;
}

.admintreatment-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.admintreatment-notification {
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

.admintreatment-notification-icon {
  flex-shrink: 0;
}

.admintreatment-notification-content {
  flex-grow: 1;
}

.admintreatment-notification-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.admintreatment-notification-message {
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.admintreatment-notification.success {
  border-left: 4px solid #7c3aed;
}

.admintreatment-notification.success .admintreatment-notification-icon {
  color: #7c3aed;
}

.admintreatment-notification.error {
  border-left: 4px solid #ef4444;
}

.admintreatment-notification.error .admintreatment-notification-icon {
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
.admintreatment-modal {
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

.admintreatment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.admintreatment-modal-content {
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

.admintreatment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
}

.admintreatment-modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.admintreatment-modal-close {
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

.admintreatment-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.admintreatment-treatment-form {
  padding: 1.5rem;
}

.admintreatment-form-group {
  margin-bottom: 1.5rem;
}

.admintreatment-form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.admintreatment-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.admintreatment-input-wrapper input,
.admintreatment-input-wrapper textarea,
.admintreatment-input-wrapper select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #f9fafb;
}

.admintreatment-input-wrapper input:focus,
.admintreatment-input-wrapper textarea:focus,
.admintreatment-input-wrapper select:focus {
  outline: none;
  border-color: #8b5cf6;
  background: white;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.admintreatment-textarea {
  min-height: 100px;
  resize: vertical;
}

.admintreatment-select-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.admintreatment-input-icon {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

.admintreatment-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.admintreatment-submit-button,
.admintreatment-cancel-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.admintreatment-input-wrapper textarea {
  padding-left: 2.5rem;
}

.admintreatment-input-wrapper textarea + .admintreatment-input-icon {
  top: 0.95rem;
  transform: none;
}

.admintreatment-submit-button {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
  color: white;
  border: none;
}

.admintreatment-submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);
}

.admintreatment-cancel-button {
  background: #f3f4f6;
  color: #374151;
  border: none;
}

.admintreatment-cancel-button:hover {
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
  .admintreatment-search-controls {
    flex-direction: column;
  }

  .admintreatment-search-wrapper {
    width: 100%;
  }

  .admintreatment-table-header,
  .admintreatment-table-row {
    grid-template-columns: 1fr 1fr;
  }

  .admintreatment-description,
  .admintreatment-services {
    display: none;
  }
}
</style>