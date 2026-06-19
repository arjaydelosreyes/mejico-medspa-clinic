<template>
  <div class="admin-appointments-list">
    <h2 class="page-title">Approved Appointments</h2>

    <div v-if="error" class="alert alert-error" role="alert">
      <AlertCircle class="alert-icon" />
      <span>{{ error }}</span>
    </div>

    <!-- Search Controls -->
    <div class="search-controls">
      <div class="search-wrapper">
        <CalendarDays class="search-icon" />
        <select v-model="searchMonth" class="select-month">
          <option value="">Select month</option>
          <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
        </select>
      </div>
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input 
          v-model="searchTreatment" 
          type="text" 
          placeholder="Search by treatment" 
          class="search-input"
        >
      </div>
      <button @click="applyFilters" class="btn btn-primary">
        <Filter class="btn-icon" />
        Search
      </button>
      <button @click="resetFilters" class="btn btn-secondary">
        <RotateCcw class="btn-icon" />
        Reset
      </button>
    </div>

    <!-- Appointment Stats -->
    <div class="adminlist-stats-grid">
      <div v-for="(stat, index) in appointmentStats" :key="stat.label" class="adminlist-stat-card">
        <div class="adminlist-stat-icon-wrapper">
          <Users v-if="index === 0" class="adminlist-stat-icon" />
          <CalendarCheck v-if="index === 1" class="adminlist-stat-icon" />
          <CalendarClock v-if="index === 2" class="adminlist-stat-icon" />
        </div>
        <div class="adminlist-stat-content">
          <p class="adminlist-stat-value">{{ stat.value }}</p>
          <h3 class="adminlist-stat-label">{{ stat.label }}</h3>
        </div>
      </div>
    </div>

    <!-- Appointments Table -->
    <div class="table-container">
      <div class="section-header">
        <h3 class="section-title">Appointment Details</h3>
        <div class="dropdown">
          <button class="export-button" @click="$refs.exportMenu.classList.toggle('show')">
            <Download class="btn-icon" />
            Export
          </button>
          <div ref="exportMenu" class="dropdown-menu">
            <button @click="exportToPDF" class="dropdown-item">
              <File class="btn-icon" />
              Export as PDF
            </button>
            <button @click="exportToExcel" class="dropdown-item">
              <FileSpreadsheet class="btn-icon" />
              Export as Excel
            </button>
            <button @click="exportToCSV" class="dropdown-item">
              <FileText class="btn-icon" />
              Export as CSV
            </button>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table v-if="!loading && filteredAppointments.length > 0" class="adminappointments-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time</th>
              <th>Services</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in filteredAppointments" :key="appointment.id">
              <td>
                <div class="patient-info">
                  <User class="patient-icon" />
                  <span class="truncate-text">{{ appointment.patientName }}</span>
                </div>
              </td>
              <td>
                <div class="tooltip-container">
                  <span class="truncate-text">{{ appointment.userEmail }}</span>
                  <div class="tooltip">{{ appointment.userEmail }}</div>
                </div>
              </td>
              <td>
                <div class="tooltip-container">
                  <span class="truncate-text">{{ formatDate(appointment.date) }}</span>
                  <div class="tooltip">{{ formatDate(appointment.date) }}</div>
                </div>
              </td>
              <td>{{ appointment.time }}</td>
              <td>
                <div class="services-cell relative group">
                  <div class="truncate-text">
                    {{ appointment.services[0] }}
                    <span v-if="appointment.services?.length > 1" class="text-gray-400 text-xs ml-1">
                      +{{ appointment.services.length - 1 }} more
                    </span>
                  </div>
                  <div v-if="appointment.services?.length > 1" 
                       class="absolute hidden group-hover:block z-10 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[200px] max-w-[300px] left-0 mt-2">
                    <div class="text-sm font-medium text-gray-700 mb-2">All Services:</div>
                    <ul class="space-y-2">
                      <li v-for="(service, index) in appointment.services" 
                          :key="index"
                          class="text-sm text-gray-600 flex items-center">
                        <div class="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                        {{ service }}
                      </li>
                    </ul>
                    <div class="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                  </div>
                </div>
              </td>
              <td class="price-cell">₱{{ formatPrice(appointment.price) }}</td>
              <td>
                <span class="status-badge">
                  <CheckCircle class="status-icon" />
                  Approved
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="!loading && filteredAppointments.length === 0" class="empty-state">
          <Inbox class="empty-icon" />
          <p>No approved appointments found</p>
        </div>
        <div v-else class="loading-state">
          <Loader class="loading-icon spin" />
          <p>Loading appointments...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, query, where, Timestamp, doc, getDoc } from 'firebase/firestore';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  RotateCcw,
  Users,
  CalendarCheck,
  CalendarClock,
  User,
  CheckCircle,
  Inbox,
  Loader,
  AlertCircle,
  Download,
  File,
  FileSpreadsheet,
  FileText
} from 'lucide-vue-next';

const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const searchMonth = ref('');
const searchTreatment = ref('');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const appointmentStats = computed(() => [
  { label: 'Total Approved Appointments', value: appointments.value.length },
  { label: 'This Month', value: appointments.value.filter(a => a.date.toDate().getMonth() === new Date().getMonth()).length },
  { label: 'Next Month', value: appointments.value.filter(a => a.date.toDate().getMonth() === (new Date().getMonth() + 1) % 12).length },
]);

const fetchApprovedAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const q = query(collection(database, 'appointments'), where('status', '==', 'approved'));
    const querySnapshot = await getDocs(q);
    const appointmentsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date instanceof Timestamp ? doc.data().date : Timestamp.fromDate(new Date(doc.data().date)),
      price: doc.data().price || 0,
      services: doc.data().services || [],
    }));

    appointments.value = await Promise.all(appointmentsData.map(async (appointment) => {
      const userDoc = await getDoc(doc(database, 'users', appointment.userId));
      const userData = userDoc.data() || {};
      return {
        ...appointment,
        patientName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'N/A',
      };
    }));
  } catch (err) {
    console.error("Error fetching approved appointments:", err);
    error.value = 'Failed to fetch approved appointments. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    console.error("Invalid date object:", date);
    return "Invalid Date";
  }
};

const formatPrice = (price) => {
  return price.toFixed(2);
};

const filteredAppointments = computed(() => {
  return appointments.value.filter(appointment => {
    const matchesMonth = searchMonth.value
      ? (appointment.date.toDate().getMonth() + 1) === Number(searchMonth.value)
      : true;
    const matchesTreatment = searchTreatment.value
      ? appointment.services.some(service => service.toLowerCase().includes(searchTreatment.value.toLowerCase()))
      : true;
    return matchesMonth && matchesTreatment;
  });
});

const applyFilters = () => {
  // Filtering handled by computed property
};

const resetFilters = () => {
  searchMonth.value = '';
  searchTreatment.value = '';
};

const exportToPDF = async () => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    const tableData = filteredAppointments.value.map(appointment => [
      appointment.patientName,
      appointment.userEmail,
      formatDate(appointment.date),
      appointment.time,
      appointment.services?.join(', ') || 'No service',
      `₱${formatPrice(appointment.price)}`,
      'Approved'
    ]);

    doc.autoTable({
      head: [['Patient Name', 'Email', 'Date', 'Time', 'Services', 'Price', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save('approved-appointments.pdf');
  } catch (err) {
    console.error('Error exporting to PDF:', err);
    error.value = 'Failed to export PDF. Please try again.';
  }
};

const exportToExcel = async () => {
  try {
    const XLSX = await import('xlsx');
    
    const data = filteredAppointments.value.map(appointment => ({
      'Patient Name': appointment.patientName,
      'Email': appointment.userEmail,
      'Date': formatDate(appointment.date),
      'Time': appointment.time,
      'Services': appointment.services?.join(', ') || 'No service',
      'Price': `₱${formatPrice(appointment.price)}`,
      'Status': 'Approved'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Approved Appointments');
    
    XLSX.writeFile(wb, 'approved-appointments.xlsx');
  } catch (err) {
    console.error('Error exporting to Excel:', err);
    error.value = 'Failed to export Excel file. Please try again.';
  }
};

const exportToCSV = async () => {
  try {
    const XLSX = await import('xlsx');
    
    const data = filteredAppointments.value.map(appointment => ({
      'Patient Name': appointment.patientName,
      'Email': appointment.userEmail,
      'Date': formatDate(appointment.date),
      'Time': appointment.time,
      'Services': appointment.services?.join(', ') || 'No service',
      'Price': `₱${formatPrice(appointment.price)}`,
      'Status': 'Approved'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'approved-appointments.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error exporting to CSV:', err);
    error.value = 'Failed to export CSV file. Please try again.';
  }
};

onMounted(() => {
  fetchApprovedAppointments();
});
</script>

<style>
.admin-appointments-list {
  max-width: 1200px;
  margin: 0 auto;
  height: 650px;
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.alert {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.alert-error {
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
}

.search-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  width: 1rem;
  height: 1rem;
}

.select-month,
.search-input {
  width: 100%;
  padding: 0.4rem 0.5rem 0.4rem 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s ease;
}

.select-month:focus,
.search-input:focus {
  outline: none;
  border-color: #9f7aea;
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.1);
}

.btn {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #9f7aea, #667eea);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(159, 122, 234, 0.2);
}

.btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.adminlist-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.adminlist-stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.adminlist-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.adminlist-stat-icon-wrapper {
  background: rgba(159, 122, 234, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  margin-right: 0.75rem;
}

.adminlist-stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #7c3aed;
}

.adminlist-stat-content {
  flex: 1;
}

.adminlist-stat-label {
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.adminlist-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #9f7aea;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #32276e;
  margin-bottom: 1.5rem;
}

.table-responsive {
  overflow-y: auto;
  overflow-x: auto;
  margin: 0 -1rem;
  padding: 0 1rem;
  flex: 1;
  min-height: 0;
}

.table-responsive::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #9f7aea;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #8b5cf6;
}

.adminappointments-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
}

.adminappointments-table th {
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
  border-right: 1px solid rgba(255, 255, 255, 0.67);
}

.adminappointments-table tbody tr:hover {
  background-color: #f8fafc;
}

.adminappointments-table th:first-child {
  border-top-left-radius: 8px;
}

.adminappointments-table th:last-child {
  border-right: none;
}

.adminappointments-table td:last-child {
  border-right: none;
}

.adminappointments-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #edf2f7;
  border-right: 1px solid #edf2f7;
  color: #2d3748;
  font-size: 0.75rem;
}

.patient-info {
  display: flex;
  align-items: center;
}

.patient-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.price-cell {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: #f0fff4;
  color: #38a169;
  border-radius: 9999px;
  font-size: 0.675rem;
  font-weight: 500;
}

.status-icon {
  width: 0.875rem;
  height: 0.875rem;
  margin-right: 0.25rem;
}

.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.empty-icon,
.loading-icon {
  width: 2.5rem;
  height: 2.5rem;
  color:#8b5cf6;
  margin-bottom: 0.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tooltip-container {
  position: relative;
  display: inline-block;
  max-width: 200px;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.tooltip {
  visibility: hidden;
  position: absolute;
  z-index: 100;
  background: #32276e;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  width: max-content;
  max-width: 300px;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tooltip-container:hover .tooltip {
  visibility: visible;
}

.services-cell {
  position: relative;
}

.group:hover .group-hover\:block {
  display: block;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.additional-services {
  color: #a0aec0;
  font-size: 0.75rem;
  margin-left: 0.25rem;
}

.services-tooltip-header {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.services-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #718096;
  padding: 0.25rem 0;
}

.service-bullet {
  width: 0.375rem;
  height: 0.375rem;
  background-color: #9f7aea;
  border-radius: 9999px;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .admin-appointments-list {
    padding: 0.75rem;
  }
  
  .search-controls {
    flex-direction: column;
  }
  
  .select-month,
  .search-input,
  .btn {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.export-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.export-button:hover {
  background-color: #7c3aed;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  min-width: 12rem;
}

.dropdown-menu.show {
  display: block;
  animation: fadeIn 0.2s ease-out;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #7c3aed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>