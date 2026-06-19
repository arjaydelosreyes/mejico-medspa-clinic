<template>
  <div class="admin-content">
    <div class="content-wrapper">
      <div class="header">
        <h1 class="header-title">Client Management</h1>
        <p class="header-subtitle">Manage and view client profiles</p>
      </div>

      <div class="filters">
        <div class="search-container">
          <Search class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="search" 
            placeholder="Search clients..." 
            class="search-input"
          >
        </div>
        <div class="filters-right">
          <div class="select-container">
            <User class="select-prefix-icon" />
            <select 
              v-model="statusFilter"
              class="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown class="select-suffix-icon" />
          </div>
          <div class="select-container">
            <Calendar class="select-prefix-icon" />
            <select 
              v-model="dateFilter"
              class="filter-select"
            >
              <option value="">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <ChevronDown class="select-suffix-icon" />
          </div>
        </div>
      </div>

      <div class="clients-container">
        <div v-if="error" class="error-alert" role="alert">
          <p class="error-title">Error</p>
          <p>{{ error }}</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner-container">
            <div class="spinner">
              <div class="spinner-line" v-for="n in 8" :key="n" :style="{ transform: `rotate(${(n-1) * 45}deg)` }"></div>
            </div>
          </div>
          <p class="loading-text">Loading clients profiles...</p>
        </div>

        <div v-else-if="filteredClients.length === 0" class="empty-state">
          <UserCircle class="empty-icon" />
          <h3 class="empty-title">No clients found</h3>
          <p class="empty-subtitle">Try adjusting your search or filters</p>
        </div>

        <div v-else class="client-grid">
          <div v-for="client in filteredClients" :key="client.id" class="client-card">
            <div class="client-card-content">
              <div class="client-header">
                <div class="client-info">
                  <div class="client-avatar" :style="{ backgroundColor: '#6366f1' }">
                    <img 
                      v-if="client.profileImage" 
                      :src="client.profileImage" 
                      :alt="`${client.firstName} ${client.lastName}`"
                      class="avatar-image"
                    />
                    <span v-else class="initials">{{ getInitials(client.firstName, client.lastName) }}</span>
                  </div>
                  <div>
                    <h3 class="client-name">{{ client.firstName }} {{ client.lastName }}</h3>
                    <p class="client-since">Client since {{ formatDate(client.registrationDate) }}</p>
                  </div>
                </div>
                <span :class="['status-badge', client.status]">
                  {{ client.status }}
                </span>
              </div>
              <div class="client-details">
                <p class="client-detail">
                  <Mail class="detail-icon" />
                  {{ client.email }}
                </p>
                <p class="client-detail">
                  <Phone class="detail-icon" />
                  {{ client.phone || 'N/A' }}
                </p>
                <p class="client-detail">
                  <MapPin class="detail-icon" />
                  {{ formatAddress(client.address) }}
                </p>
              </div>
              <button @click="viewProfile(client)" class="view-profile-button">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Client Profile Modal -->
    <div v-if="selectedClient" class="modal-overlay">
      <div class="modal-content">
        <!-- Left Panel -->
        <div class="modal-left-panel">
          <div class="modal-profile-section">
            <div class="modal-avatar" :style="{ backgroundColor: '#6366f1' }">
              <img 
                v-if="selectedClient.profileImage" 
                :src="selectedClient.profileImage" 
                :alt="`${selectedClient.firstName} ${selectedClient.lastName}`"
                class="avatar-image"
              />
              <span v-else class="initials">{{ getInitials(selectedClient.firstName, selectedClient.lastName) }}</span>
            </div>
            <h2 class="modal-profile-name">{{ selectedClient.firstName }} {{ selectedClient.lastName }}</h2>
            <span :class="['modal-status-badge', selectedClient.status]">
              {{ selectedClient.status }}
            </span>
          </div>
          
          <div class="modal-contact-info">
            <div class="modal-info-row">
              <Mail class="modal-info-icon" />
              {{ selectedClient.email }}
            </div>
            <div class="modal-info-row">
              <Phone class="modal-info-icon" />
              {{ selectedClient.phone || 'N/A' }}
            </div>
            <div class="modal-info-row">
              <MapPin class="modal-info-icon" />
              {{ formatAddress(selectedClient.address) }}
            </div>
            <div class="modal-info-row">
              <Clock class="modal-info-icon" />
              Client since {{ formatDate(selectedClient.registrationDate) }}
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="modal-right-panel">
          <!-- Tab Navigation -->
          <div class="modal-tabs">
            <button 
              v-for="tab in ['Personal', 'Address', 'Medical', 'Treatment']" 
              :key="tab"
              @click="activeTab = tab"
              :class="['modal-tab', { 'active': activeTab === tab }]"
            >
              <User v-if="tab === 'Personal'" class="modal-tab-icon" />
              <Home v-if="tab === 'Address'" class="modal-tab-icon" />
              <Stethoscope v-if="tab === 'Medical'" class="modal-tab-icon" />
              <Clipboard v-if="tab === 'Treatment'" class="modal-tab-icon" />
              {{ tab }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="modal-tab-content">
            <!-- Personal Information Tab -->
            <div v-if="activeTab === 'Personal'" class="tab-pane">
              <h3 class="tab-title">Personal Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label class="info-label">First Name</label>
                  <p class="info-value">{{ selectedClient.firstName }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Last Name</label>
                  <p class="info-value">{{ selectedClient.lastName }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Username</label>
                  <p class="info-value">{{ selectedClient.username }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Email</label>
                  <p class="info-value">{{ selectedClient.email }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Gender</label>
                  <p class="info-value">{{ selectedClient.gender }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Phone Number</label>
                  <p class="info-value">{{ selectedClient.phone }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Date of Birth</label>
                  <p class="info-value">{{ formatDate(selectedClient.dateOfBirth) }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Age</label>
                  <p class="info-value">{{ calculateAge(selectedClient.dateOfBirth) }}</p>
                </div>
              </div>
            </div>

            <!-- Address Tab -->
            <div v-if="activeTab === 'Address'" class="tab-pane">
              <h3 class="tab-title">Address Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label class="info-label">House No./Street</label>
                  <p class="info-value">{{ selectedClient.address?.houseStreet }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Province</label>
                  <p class="info-value">{{ selectedClient.address?.province }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">City</label>
                  <p class="info-value">{{ selectedClient.address?.city }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Barangay</label>
                  <p class="info-value">{{ selectedClient.address?.barangay }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Postal Code</label>
                  <p class="info-value">{{ selectedClient.address?.postalCode }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Country</label>
                  <p class="info-value">{{ selectedClient.address?.country }}</p>
                </div>
              </div>
            </div>

            <!-- Medical Tab -->
            <div v-if="activeTab === 'Medical'" class="tab-pane">
              <h3 class="tab-title">Medical Information</h3>
              <div class="medical-info">
                <div class="medical-item">
                  <h4 class="medical-label">Allergies</h4>
                  <p class="medical-value">{{ selectedClient.medical?.allergies || 'None' }}</p>
                </div>
                <div class="medical-item">
                  <h4 class="medical-label">Chronic Conditions</h4>
                  <p class="medical-value">{{ selectedClient.medical?.chronicConditions || 'None' }}</p>
                </div>
                <div class="medical-item">
                  <h4 class="medical-label">Skin Conditions</h4>
                  <p class="medical-value">{{ selectedClient.medical?.skinConditions || 'None' }}</p>
                </div>
                <div class="medical-item">
                  <h4 class="medical-label">Skin Type</h4>
                  <p class="medical-value">{{ selectedClient.medical?.skinType || 'Not specified' }}</p>
                </div>
                <div class="medical-item">
                  <h4 class="medical-label">Previous Cosmetic Treatments</h4>
                  <p class="medical-value">{{ selectedClient.medical?.previousTreatments || 'None' }}</p>
                </div>
                <div class="medical-item">
                  <h4 class="medical-label">Current Medications</h4>
                  <p class="medical-value">{{ selectedClient.medical?.currentMedications || 'None' }}</p>
                </div>
              </div>
            </div>

            <!-- Treatment Tab -->
            <div v-if="activeTab === 'Treatment'" class="tab-pane">
              <h3 class="tab-title">Treatment History</h3>
              <div v-if="pastAppointments.length > 0" class="treatment-list">
                <div 
                  v-for="appointment in pastAppointments" 
                  :key="appointment.id"
                  class="treatment-item"
                >
                  <div class="treatment-header">
                    <h4 class="treatment-name">
                      {{ Array.isArray(appointment.services) 
                        ? appointment.services.join(', ') 
                        : appointment.services }}
                    </h4>
                    <span :class="['treatment-status', appointment.status.toLowerCase()]">
                      {{ appointment.status }}
                    </span>
                  </div>
                  <div class="treatment-details">
                    <p class="treatment-date">
                      <Calendar class="inline-icon" />
                      Date: {{ formatDate(appointment.date) }}
                    </p>
                    <p class="treatment-time">
                      <Clock class="inline-icon" />
                      Time: {{ appointment.time }}
                    </p>
                    <p class="treatment-price">
                      <DollarSign class="inline-icon" />
                      Price: ₱{{ appointment.price }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="empty-treatment-state">
                <ClipboardX class="empty-treatment-icon" />
                <p class="empty-treatment-text">No past treatment history found</p>
              </div>
            </div>
          </div>
        </div>

        <button @click="selectedClient = null" class="modal-close-button">
          <span class="sr-only">Close</span>
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, ChevronDown, Mail, Phone, MapPin, Clock, User, Home, Stethoscope, Clipboard, UserCircle, Calendar, ClipboardX, DollarSign } from 'lucide-vue-next';
import { database } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

const clients = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedClient = ref(null);
const searchQuery = ref('');
const statusFilter = ref('');
const dateFilter = ref('');
const activeTab = ref('Personal');
const pastAppointments = ref([]);

const fetchClients = async () => {
  loading.value = true;
  error.value = null;
  try {
    const q = query(collection(database, 'users'), where('role', '==', 'client'));
    const querySnapshot = await getDocs(q);
    
    clients.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        status: data.status || 'active',
        dateOfBirth: data.dateOfBirth instanceof Timestamp ? data.dateOfBirth : Timestamp.fromDate(new Date(data.dateOfBirth)),
        lastVisit: data.lastVisit instanceof Timestamp ? data.lastVisit : (data.lastVisit ? Timestamp.fromDate(new Date(data.lastVisit)) : null),
        registrationDate: data.registrationDate instanceof Timestamp ? data.registrationDate : Timestamp.fromDate(new Date(data.registrationDate)),
        profileImage: data.profileImage || null,
        treatments: data.treatments || []
      };
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    error.value = 'Failed to fetch client profiles. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const filteredClients = computed(() => {
  return clients.value.filter(client => {
    const searchLower = searchQuery.value.toLowerCase();
    const matchesSearch = 
      client.firstName?.toLowerCase().includes(searchLower) ||
      client.lastName?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchQuery.value);

    const matchesStatus = !statusFilter.value || client.status === statusFilter.value;

    let matchesDate = true;
    if (dateFilter.value) {
      const now = new Date();
      const registrationDate = client.registrationDate.toDate();
      const diffTime = Math.abs(now - registrationDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch(dateFilter.value) {
        case 'week':
          matchesDate = diffDays <= 7;
          break;
        case 'month':
          matchesDate = diffDays <= 30;
          break;
        case 'year':
          matchesDate = diffDays <= 365;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });
});

const formatDate = (date) => {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  if (date instanceof Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return 'N/A';
};

const formatAddress = (address) => {
  if (!address) return 'N/A';
  const parts = [
    address.houseStreet,
    address.barangay,
    address.city,
    address.province,
    address.postalCode,
    address.country
  ].filter(Boolean);
  return parts.join(', ');
};

const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
};

const fetchPastAppointments = async (userEmail) => {
  try {
    const appointmentsRef = collection(database, 'appointments');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    const q = query(
      appointmentsRef,
      where('userEmail', '==', userEmail)
    );

    const querySnapshot = await getDocs(q);
    const allAppointments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const appointmentDate = new Date(data.date);
      appointmentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
      
      // Only include appointments that are in the past
      if (appointmentDate < today) {
        return {
          id: doc.id,
          date: data.date,
          time: data.time,
          services: Array.isArray(data.services) 
            ? data.services 
            : typeof data.services === 'string'
            ? [data.services]
            : [],
          status: data.status || 'completed',
          price: data.price || 0
        };
      }
      return null;
    }).filter(Boolean); // Remove null entries

    // Sort past appointments by date in descending order
    pastAppointments.value = allAppointments.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateB - dateA;
    });

  } catch (error) {
    console.error('Error fetching past appointments:', error);
    pastAppointments.value = [];
  }
};

const viewProfile = async (client) => {
  selectedClient.value = client;
  activeTab.value = 'Personal';
  if (client.email) {
    await fetchPastAppointments(client.email);
  }
};

const calculateAge = (birthDate) => {
  if (!birthDate) return 'N/A';
  const today = new Date();
  const birth = birthDate instanceof Timestamp ? birthDate.toDate() : new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

onMounted(() => {
  fetchClients();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

/* Base Styles */
.admin-content {
  height: 650px;
  overflow: hidden;
  background-color: #ffffff;
  font-family: 'Poppins', sans-serif;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.header {
  padding: 1rem 0;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.header-subtitle {
  color: #64748b;
  font-size: 0.875rem;
}

/* Filters Styles */
.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  gap: 1rem;
  background-color: #ffffff;
  position: sticky;
  top: 70px; /* Adjust based on your header height */
  z-index: 10;
  border-bottom: 1px solid #e2e8f0;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 600px;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.813rem;
  background-color: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
}

.filters-right {
  display: flex;
  gap: 0.75rem;
}

.select-container {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-select {
  padding: 0.625rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.813rem;
  background-color: white;
  appearance: none;
  min-width: 130px;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.select-prefix-icon,
.select-suffix-icon {
  position: absolute;
  width: 0.875rem;
  height: 0.875rem;
  color: #94a3b8;
  pointer-events: none;
}

.select-prefix-icon {
  left: 0.75rem;
}

.select-suffix-icon {
  right: 0.75rem;
}

/* Client Grid Styles */
.clients-container {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.75rem;
  height: calc(100vh - 180px); /* Adjust this value based on your header and filters height */
  scrollbar-width: thin;
  scrollbar-color: rgba(67, 34, 121, 0.725) transparent;
}

.client-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
  padding-top: 1rem;
}

.client-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.client-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.client-card-content {
  padding: 1.25rem;
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-avatar {
  width: 3rem;
  height: 3rem;
  background-color: #6366f1;
  color: white;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.client-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.125rem;
}

.client-since {
  font-size: 0.75rem;
  color: #64748b;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.688rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #f1f5f9;
  color: #475569;
}

.client-details {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.client-detail {
  display: flex;
  align-items: center;
  font-size: 0.813rem;
  color: #64748b;
  margin: 0;
}

.detail-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: #94a3b8;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.view-profile-button {
  width: 100%;
  background-color: #5442b0;
  color: white;
  padding: 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.813rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-profile-button:hover {
  background-color: #32276e;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 50;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 60rem;
  height: 34rem;
  display: flex;
  animation: modal-slide-up 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

@keyframes modal-slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-left-panel {
  width: 20rem;
  background: linear-gradient(to right, #6d28d9, #4c1d95);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
}

.modal-profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
}

.modal-avatar {
  width: 7rem;
  height: 7rem;
  background-color: white;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1.25rem;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.modal-profile-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.85rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
  max-width: 100%;
  overflow-wrap: break-word;
}

.modal-status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.688rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-status-badge.active {
  background-color: #10B981;
  color: white;
}

.modal-status-badge.inactive {
  background-color: #6B7280;
  color: white;
}

.modal-contact-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 1rem;
  font-size: 0.813rem;
}

.modal-info-row {
  display: flex;
  align-items: center;
  color: white;
  padding: 0.125rem 0;
  gap: 0.75rem;
  line-height: 1.4;
  word-break: break-word;
}

.modal-info-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.modal-info-row span {
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
}

/* Right Panel Styles */
.modal-right-panel {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
  padding: 0;
}

.modal-close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 60;
}

.modal-close-button:hover {
  background-color: #ffffff;
  transform: scale(1.05);
}

.modal-tabs {
  display: flex;
  background-color: #6d28d9;
  padding: 0.75rem 1.5rem;
  gap: 1.25rem;
  align-items: center;
}

.modal-tab {
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.modal-tab.active {
  background-color: white;
  color: #6d28d9;
}

.modal-tab:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-tab.active:hover {
  background-color: white;
}

.modal-tab-content {
  padding: 1.5rem 0;
  height: calc(100% - 3.5rem);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(67, 34, 121, 0.725) transparent;
}

.tab-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  padding-left: 1.5rem;
}

/* Common styles for all information sections */
.info-grid,
.medical-info,
.address-info,
.treatment-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  padding: 0 1.5rem;
}

.info-item,
.medical-item,
.address-item,
.treatment-item {
  background-color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.info-item:hover,
.medical-item:hover,
.address-item:hover,
.treatment-item:hover {
  border-color: #e2e8f0;
  box-shadow: none;
}

.info-label,
.medical-label,
.address-label,
.treatment-name {
  font-size: 0.688rem;
  color: #64748b;
  margin-bottom: 0.375rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.info-value,
.medical-value,
.address-value,
.treatment-date,
.treatment-notes {
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

/* Treatment specific styles */
.treatment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.treatment-status {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.treatment-status.completed {
  background-color: #f0fdf4;
  color: #166534;
}

.treatment-status.scheduled {
  background-color: #eff6ff;
  color: #1e40af;
}

.treatment-date,
.treatment-notes,
.treatment-price,
.treatment-time {
  font-size: 0.688rem;
  color: #64748b;
  margin-top: 0.375rem;
}

.treatment-status.approved {
  background-color: #f0fdf4;
  color: #166534;
}

.treatment-status.cancelled {
  background-color: #fef2f2;
  color: #991b1b;
}

.treatment-status.pending {
  background-color: #fff7ed;
  color: #9a3412;
}

/* Scrollbar styles for clients-container */
.clients-container::-webkit-scrollbar {
  width: 6px;
}

.clients-container::-webkit-scrollbar-track {
  background: transparent;
}

.clients-container::-webkit-scrollbar-thumb {
  background-color: rgba(109, 40, 217, 0.5);
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.clients-container:hover::-webkit-scrollbar-thumb {
  background-color: rgba(109, 40, 217, 0.8);
}

/* Update modal tab content scrollbar styles */
.modal-tab-content::-webkit-scrollbar {
  width: 6px;
}

.modal-tab-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-tab-content::-webkit-scrollbar-thumb {
  background-color: rgba(109, 40, 217, 0.5);
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.modal-tab-content:hover::-webkit-scrollbar-thumb {
  background-color: rgba(109, 40, 217, 0.8);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-item,
.medical-item,
.address-item,
.treatment-item {
  animation: fadeIn 0.3s ease-out;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.empty-treatment-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-treatment-icon {
  width: 3rem;
  height: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.empty-treatment-text {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
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

/* New styles for treatment details */
.treatment-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.inline-icon {
  width: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
  color: #64748b;
}

.treatment-item {
  background-color: white;
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.treatment-item:hover {
  border-color: #6d28d9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>