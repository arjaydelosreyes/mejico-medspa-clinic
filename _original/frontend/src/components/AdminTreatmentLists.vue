<template>
  <div class="admintreatment-container">
    <div class="admintreatment-header">
      <h1 class="admintreatment-title">Services and Treatments List</h1>
    </div>

    <div class="admintreatment-controls">
      <div class="admintreatment-filter">
        <select v-model="selectedService" class="admintreatment-select">
          <option value="">All Services</option>
          <option v-for="service in services" :key="service.docId" :value="service.docId">
            {{ service.name }}
          </option>
        </select>
        <ChevronDownIcon class="admintreatment-select-icon" />
      </div>
      
      <div class="admintreatment-search-wrapper">
        <div class="admintreatment-search">
          <SearchIcon class="admintreatment-search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by treatment"
            class="admintreatment-search-input"
          />
        </div>
        
        <button class="admintreatment-button search-button" @click="applyFilters">
          <FilterIcon class="button-icon" />
          Search
        </button>
        
        <button class="admintreatment-button reset-button" @click="resetFilters">
          <RotateCcwIcon class="button-icon" />
          Reset
        </button>
      </div>
    </div>

    <div class="admintreatment-grid">
      <div v-if="loadingServices || loadingTreatments" class="loading-state">
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
        <p class="loading-text">Loading packages...</p>
      </div>
      <div 
        v-else 
        class="admintreatment-service-card"
        v-for="service in filteredServices" 
        :key="service.docId"
      >
        <div class="admintreatment-service-header">
          <h3>{{ service.name }}</h3>
          <PackageIcon class="admintreatment-service-icon" />
        </div>
        
        <div class="admintreatment-treatments-container">
          <div 
            v-if="getTreatmentsForService(service.docId).length > 0" 
            class="admintreatment-treatments-list"
          >
            <div
              v-for="treatment in getTreatmentsForService(service.docId)"
              :key="treatment.id"
              class="admintreatment-treatment-item"
            >
              <div class="admintreatment-treatment-content">
                <h4>{{ treatment.name }}</h4>
                <div class="admintreatment-treatment-price">
                  ₱{{ treatment.price.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
          <div 
            v-else 
            class="admintreatment-empty-state"
          >
            <PackageXIcon class="admintreatment-empty-icon" />
            <p>No treatments available for this service.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { database } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { SearchIcon, ChevronDownIcon, PackageIcon, PackageXIcon, FilterIcon, RotateCcwIcon } from 'lucide-vue-next';

const treatments = ref([]);
const services = ref([]);
const loadingTreatments = ref(true);
const loadingServices = ref(true);
const searchQuery = ref('');
const selectedService = ref('');

const fetchTreatments = async () => {
  try {
    const treatmentsCollection = collection(database, 'treatments');
    const treatmentSnapshot = await getDocs(treatmentsCollection);
    treatments.value = treatmentSnapshot.docs.map(doc => ({
      id: doc.data().id,
      docId: doc.id, // Store the Firestore document ID
      name: doc.data().name,
      price: Number(doc.data().price),
      services: doc.data().services, // This contains the service's document ID
      description: doc.data().description
    }));
    console.log('Fetched treatments:', treatments.value); // Debug log
  } catch (error) {
    console.error('Error fetching treatments:', error);
  } finally {
    loadingTreatments.value = false;
  }
};

const fetchServices = async () => {
  try {
    const servicesCollection = collection(database, 'services');
    const serviceSnapshot = await getDocs(servicesCollection);
    services.value = serviceSnapshot.docs.map(doc => ({
      id: doc.data().id,
      docId: doc.id, // Store the Firestore document ID
      name: doc.data().name
    }));
    console.log('Fetched services:', services.value); // Debug log
  } catch (error) {
    console.error('Error fetching services:', error);
  } finally {
    loadingServices.value = false;
  }
};

const filteredServices = computed(() => {
  if (selectedService.value) {
    return services.value.filter(service => service.docId === selectedService.value);
  }
  return services.value;
});

const filteredTreatments = computed(() => {
  return treatments.value.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesService = !selectedService.value || treatment.services === selectedService.value;
    return matchesSearch && matchesService;
  });
});

const getTreatmentsForService = (serviceDocId) => {
  return treatments.value.filter(treatment => treatment.services === serviceDocId);
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedService.value = '';
};

const applyFilters = () => {
  console.log('Current filters - Search:', searchQuery.value, 'Service:', selectedService.value);
};

onMounted(async () => {
  await fetchServices();
  await fetchTreatments();
});
</script>

<style scoped>
.admintreatment-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admintreatment-header {
  margin-bottom: 2rem;
}

.admintreatment-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  text-align: left;
  margin-bottom: 1.5rem;
}

.admintreatment-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  width: 100%;
}

.admintreatment-search-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: nowrap;
}

.admintreatment-search {
  position: relative;
  flex: 1;
  min-width: 660px;
}

.admintreatment-search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  height: 40px; /* Slightly increased height */
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  background-color: white;
  transition: all 0.2s ease;
}

.admintreatment-search-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.admintreatment-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
}

.admintreatment-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  height: 36px;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  background-clip: padding-box;
}

.search-button {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.search-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(159, 122, 234, 0.2);
}

.reset-button {
  background-color: #edf2f7;
  color: #4a5568;
  border: none;
}

.reset-button:hover {
  background-color: #e2e8f0;
}

.button-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.admintreatment-select {
  width: 100%;
  padding: 0.625rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  background-color: white;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admintreatment-select:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.admintreatment-filter {
  position: relative;
  width: 200px;
}

.admintreatment-select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
  pointer-events: none;
}

.admintreatment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.admintreatment-service-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.admintreatment-service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(109, 40, 217, 0.1));
  pointer-events: none;
}

.admintreatment-service-card::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 2px dashed rgba(124, 58, 237, 0.3);
  border-radius: 0.75rem;
  pointer-events: none;
}

.admintreatment-service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.admintreatment-service-header {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  padding: 1.5rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.admintreatment-service-header::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.5;
}

.admintreatment-service-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  position: relative;
}

.admintreatment-service-icon {
  width: 1.5rem;
  height: 1.5rem;
  position: relative;
}

.admintreatment-treatments-container {
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #7c3aed #f3f4f6;
  position: relative;
}

.admintreatment-treatments-container::-webkit-scrollbar {
  width: 6px;
}

.admintreatment-treatments-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.admintreatment-treatments-container::-webkit-scrollbar-thumb {
  background-color: #7c3aed;
  border-radius: 3px;
}

.admintreatment-treatments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admintreatment-treatment-item {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.admintreatment-treatment-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(109, 40, 217, 0.05));
  pointer-events: none;
}

.admintreatment-treatment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.admintreatment-treatment-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.admintreatment-treatment-content h4 {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.admintreatment-treatment-price {
  font-weight: 600;
  color: #7c3aed;
  font-size: 1.125rem;
  background: rgba(180, 146, 240, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  position: relative;
}

.admintreatment-empty-state {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.admintreatment-empty-icon {
  width: 3rem;
  height: 3rem;
  color: #9ca3af;
}

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

@media (max-width: 768px) {
  .admintreatment-container {
    padding: 1rem;
  }
  
  .admintreatment-controls {
    flex-direction: column;
  }
  
  .admintreatment-search {
    min-width: 100%;
  }
  
  .admintreatment-search-wrapper {
    flex-direction: column;
  }
  
  .admintreatment-search,
  .admintreatment-filter {
    width: 100%;
    max-width: none;
  }
  
  .admintreatment-button {
    width: 100%;
    justify-content: center;
  }
  
  .admintreatment-grid {
    grid-template-columns: 1fr;
  }
}
</style>

