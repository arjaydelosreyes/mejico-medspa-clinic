<template>
  <div class="container">
    <h2 class="page-title">Patient Management</h2>

    <!-- Tabs -->
    <div class="tabs">
      <nav class="tab-nav">
        <button 
          @click="activeTab = 'overview'"
          :class="['tab-button', { 'active': activeTab === 'overview' }]"
        >
          Overview
        </button>
        <button 
          @click="activeTab = 'clients'"
          :class="['tab-button', { 'active': activeTab === 'clients' }]"
        >
          Client List
        </button>
      </nav>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="error-alert">
      <strong>Error:</strong>
      <span>{{ error }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-container">
        <div class="spinner">
          <div class="spinner-line" v-for="n in 8" :key="n" :style="{ transform: `rotate(${(n-1) * 45}deg)` }"></div>
        </div>
      </div>
      <p class="loading-text">Loading clients treatments...</p>
    </div>

    <!-- Overview Tab -->
    <div v-else-if="activeTab === 'overview'" class="overview">
      <!-- Stats Cards -->
      <div class="clients-stats-grid">
        <div class="clients-stat-card blue">
          <div class="clients-stat-icon">
            <Users class="icon" />
          </div>
          <div>
            <h3 class="clients-stat-value">{{ clients.length }}</h3>
            <p class="clients-stat-label">Total Clients</p>
          </div>
        </div>

        <div class="clients-stat-card green">
          <div class="clients-stat-icon">
            <Calendar class="icon" />
          </div>
          <div>
            <h3 class="clients-stat-value">{{ totalAppointments }}</h3>
            <p class="clients-stat-label">Total Appointments</p>
          </div>
        </div>

        <div class="clients-stat-card purple">
          <div class="clients-stat-icon">
            <Clock class="icon" />
          </div>
          <div>
            <h3 class="clients-stat-value">{{ formatDate(latestAppointment) }}</h3>
            <p class="clients-stat-label">Latest Appointment</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h3 class="section-title">Recent Activity</h3>
        <div class="activity-list">
          <div v-for="client in recentClients" :key="client.id" class="activity-item">
            <div class="client-info">
              <div class="client-avatar">
                <span>{{ client.firstName[0] }}</span>
              </div>
              <div>
                <p class="client-name">{{ client.firstName }} {{ client.lastName }}</p>
                <p class="client-date">{{ formatDate(client.lastVisit) }}</p>
              </div>
            </div>
            <span class="status-badge approved">approved</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Client List Tab -->
    <div v-else class="client-list">
      <div class="list-header">
        <div class="adminprodmanage-search-controls">
          <div class="adminprodmanage-search-wrapper">
            <Search class="adminprodmanage-search-icon" />
            <input 
              v-model="searchClient" 
              type="text" 
              placeholder="Search clients..." 
              class="adminprodmanage-search-input"
            >
          </div>
          <div class="adminprodmanage-search-wrapper">
            <Filter class="adminprodmanage-search-icon" />
            <select 
              v-model="selectedStatus" 
              class="adminprodmanage-select"
            >
              <option value="">Filter by status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button @click="applyFilters" class="adminprodmanage-btn adminprodmanage-btn-primary">
            <Filter class="adminprodmanage-btn-icon" />
            Search
          </button>
          <button @click="resetFilters" class="adminprodmanage-btn adminprodmanage-btn-secondary">
            <RotateCcw class="adminprodmanage-btn-icon" />
            Reset
          </button>
        </div>
      </div>

      <table class="client-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Total Appointments</th>
            <th>Last Visit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id">
            <td>{{ client.firstName }} {{ client.lastName }}</td>
            <td>
              <div class="contact-info">
                <div class="contact-item">
                  <Mail class="contact-icon" />
                  {{ client.email }}
                </div>
                <div class="contact-item">
                  <Phone class="contact-icon" />
                  {{ client.phone || 'N/A' }}
                </div>
              </div>
            </td>
            <td>{{ client.appointments.length }}</td>
            <td>{{ formatDate(client.lastVisit) }}</td>
            <td>
              <button 
                @click="viewAppointments(client)"
                class="view-details-btn"
              >
                <Eye class="btn-icon" />
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Enhanced Client Details Modal -->
    <div v-if="selectedClient" class="modal-overlay">
      <div class="modal custom-scrollbar">
        <header class="modal-header">
          <div class="modal-title-wrapper">
            <h3 class="modal-title">Client Details</h3>
            <span class="client-name">{{ selectedClient.firstName }} {{ selectedClient.lastName }}</span>
          </div>
          <button @click="selectedClient = null" class="close-btn" aria-label="Close modal">
            <X class="close-icon" />
          </button>
        </header>

        <div class="modal-content">
          <div class="client-details">
            <div class="detail-card">
              <Mail class="detail-icon" />
              <div class="detail-info">
                <p class="detail-label">Email</p>
                <p class="detail-value">{{ selectedClient.email }}</p>
              </div>
            </div>
            
            <div class="detail-card">
              <Phone class="detail-icon" />
              <div class="detail-info">
                <p class="detail-label">Phone</p>
                <p class="detail-value">{{ selectedClient.phone || 'N/A' }}</p>
              </div>
            </div>
            
            <div class="detail-card">
              <Calendar class="detail-icon" />
              <div class="detail-info">
                <p class="detail-label">Total Appointments</p>
                <p class="detail-value">{{ selectedClient.appointments.length }}</p>
              </div>
            </div>
            
            <div class="detail-card">
              <Clock class="detail-icon" />
              <div class="detail-info">
                <p class="detail-label">Last Visit</p>
                <p class="detail-value">{{ formatDate(selectedClient.lastVisit) }}</p>
              </div>
            </div>
          </div>

          <div class="appointment-history">
            <div class="section-header">
              <h4 class="section-title">Appointment History</h4>
              <div class="appointment-count">
                {{ selectedClient.appointments.length }} appointments
              </div>
            </div>
            
            <div class="appointment-table-wrapper custom-scrollbar">
              <table class="appointment-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Services</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="appointment in selectedClient.appointments" :key="appointment.id">
                    <td>
                      <span class="date-cell">{{ formatDate(appointment.date) }}</span>
                    </td>
                    <td>
                      <span class="time-cell">{{ appointment.time }}</span>
                    </td>
                    <td>
                      <span class="treatment-cell">
                        {{ appointment.services.join(', ') }}
                      </span>
                    </td>
                    <td>
                      <span :class="['status-badge', appointment.status]">
                        {{ appointment.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Eye, Users, Calendar, Clock, Search, Mail, Phone, X, Filter, RotateCcw } from 'lucide-vue-next';

const clients = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedClient = ref(null);
const activeTab = ref('overview');
const searchClient = ref('');
const selectedStatus = ref('');
const treatments = ref([]);
const services = ref([]);

// Computed properties for overview stats
const totalAppointments = computed(() => {
  return clients.value.reduce((total, client) => total + client.appointments.length, 0);
});

const latestAppointment = computed(() => {
  return clients.value.reduce((latest, client) => {
    const clientLatest = client.lastVisit;
    return !latest || (clientLatest && clientLatest > latest) ? clientLatest : latest;
  }, null);
});

const recentClients = computed(() => {
  return [...clients.value]
    .sort((a, b) => (b.lastVisit || 0) - (a.lastVisit || 0))
    .slice(0, 5);
});

const fetchClientsAndAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Fetch treatments
    const treatmentsSnapshot = await getDocs(collection(database, 'treatments'));
    treatments.value = treatmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch services
    const servicesSnapshot = await getDocs(collection(database, 'services'));
    services.value = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const usersSnapshot = await getDocs(collection(database, 'users'));
    const usersData = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appointments: []
    }));

    const appointmentsQuery = query(collection(database, 'appointments'), where('status', '==', 'approved'));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    appointmentsSnapshot.forEach((doc) => {
      const appointment = {
        id: doc.id,
        ...doc.data(),
        date: doc.data().date instanceof Timestamp ? doc.data().date : Timestamp.fromDate(new Date(doc.data().date)),
        services: doc.data().services || []
      };

      const clientIndex = usersData.findIndex(user => user.id === appointment.userId);
      if (clientIndex !== -1) {
        usersData[clientIndex].appointments.push(appointment);
        if (!usersData[clientIndex].lastVisit || appointment.date > usersData[clientIndex].lastVisit) {
          usersData[clientIndex].lastVisit = appointment.date;
        }
      }
    });

    clients.value = usersData
      .filter(user => user.appointments.length > 0)
      .sort((a, b) => (b.lastVisit || 0) - (a.lastVisit || 0));

  } catch (err) {
    console.error("Error fetching clients and appointments:", err);
    error.value = 'Failed to fetch client data. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    console.error("Invalid date object:", date);
    return "Invalid Date";
  }
};

const viewAppointments = (client) => {
  selectedClient.value = client;
};

const applyFilters = () => {
  // Implement your filter logic here using searchClient and selectedStatus
};

const resetFilters = () => {
  searchClient.value = '';
  selectedStatus.value = '';
};

onMounted(() => {
  fetchClientsAndAppointments();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

.container {
  font-family: 'Poppins', sans-serif;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.tabs {
  margin-bottom: 2rem;
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 0.5rem 1rem;
  margin-right: 2rem;
  border: none;
  background: none;
  font-size: 1rem;
  color: #6b7280;
  cursor: pointer;
}

.tab-button.active {
  color: #8B5CF6;
  border-bottom: 2px solid #8B5CF6;
}

.error-alert {
  background-color: #fee2e2;
  border: 1px solid #f87171;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
}

.overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.clients-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.clients-stat-card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
}

.clients-stat-card.blue {
  background-color: #eff6ff;
}

.clients-stat-card.green {
  background-color: #ecfdf5;
}

.clients-stat-card.purple {
  background-color: #f5f3ff;
}

.clients-stat-icon {
  background-color: rgba(255, 255, 255, 0.5);
  padding: 0.75rem;
  border-radius: 9999px;
  margin-right: 1rem;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #8b5cf6;
}

.clients-stat-label {
  font-size: 0.875rem;
  color: #4b5563;
}

.clients-stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.recent-activity {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.recent-activity h3.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem !important;
  color: #382d6e;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.client-info {
  display: flex;
  align-items: center;
}

.client-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background-color:#6B46C1 ;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: azure;
}

.client-name {
  font-weight: 500;
  color: #000000;
}

.activity-list .client-name {
  font-weight: 500;
  color: #000000 !important;
}

.client-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.approved {
  background-color: #d1fae5;
  color: #065f46;
}

.client-list {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 20rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.client-table {
  width: 100%;
  border-collapse: collapse;
}

.client-table th,
.client-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.client-table th {
  font-weight: 500;
  color: #6b7280;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.contact-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.view-details-btn {
  display: flex;
  align-items: center;
  color: white;
  background-color: #6B46C1;
  border: none;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
}

.view-details-btn:hover {
  background-color: #543897;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 50;
}

.modal {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 48rem;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(0);
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(to right, #8B5CF6, #6B46C1);
  border-radius: 1rem 0 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.client-name {
  color: #e9d5ff;
  font-size: 1rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.modal-content {
  padding: 2rem;
}

.client-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background-color: #f8fafc;
  border-radius: 0.75rem;
  transition: transform 0.2s;
}

.detail-card:hover {
  transform: translateY(-2px);
}

.detail-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #8B5CF6;
}

.detail-info {
  flex: 1;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.appointment-count {
  font-size: 0.875rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
}

.appointment-table-wrapper {
  background-color: #ffffff;
  border: 1px solid #f3f4f6;
  border-radius: 0.75rem;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.appointment-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.appointment-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #4b5563;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  z-index: 1;
}

.appointment-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.appointment-table tr:last-child td {
  border-bottom: none;
}

.date-cell {
  color: #1f2937;
  font-weight: 500;
}

.time-cell {
  color: #6b7280;
}

.treatment-cell {
  color: #1f2937;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.approved {
  background-color: #ecfdf5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fffbeb;
  color: #92400e;
}

.status-badge.cancelled {
  background-color: #fef2f2;
  color: #991b1b;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #8B5CF6 #f3f4f6;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #8B5CF6;
  border-radius: 3px;
  border: none;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #7C3AED;
}

.adminprodmanage-search-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.adminprodmanage-search-wrapper {
  position: relative;
  width: 450px;
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

.adminprodmanage-btn {
  white-space: nowrap;
}

.adminprodmanage-btn-primary {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.adminprodmanage-btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
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

/* Updated loading state styles */
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
  .adminprodmanage-search-controls {
    flex-wrap: wrap;
  }
  
  .adminprodmanage-search-wrapper {
    width: 100%;
  }
  .client-details {
    grid-template-columns: 1fr;
  }
  
  .modal {
    margin: 1rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .appointment-table {
    font-size: 0.875rem;
  }
}
</style>

