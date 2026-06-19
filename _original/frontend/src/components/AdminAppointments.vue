<template>
  <div class="adminappointment-appointments">
    <h2 class="page-title">Appointment Management</h2>

    <div v-if="error" class="error-alert">
      <AlertCircle class="alert-icon" />
      <span>{{ error }}</span>
    </div>

    <!-- Search Controls -->
    <div class="search-controls">
      <div class="search-wrapper">
        <User class="search-icon" />
        <input
          v-model="searchName"
          class="search-input"
          placeholder="Search by name"
          type="text"
        />
      </div>
      <div class="search-wrapper">
        <CalendarDays class="search-icon" />
        <select v-model="searchMonth" class="select-month">
          <option value="">Select month</option>
          <option v-for="i in 12" :key="i" :value="i">
            {{ new Date(2023, i - 1, 1).toLocaleString('default', { month: 'long' }) }}
          </option>
        </select>
      </div>
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input
          v-model="searchTreatment"
          class="search-input"
          placeholder="Search by treatment"
          type="text"
        />
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

    <!-- Statistics Cards -->
    <div class="adminappointment-stats-container">
      <div class="adminappointment-stat-card">
        <div class="adminappointment-stat-icon-wrapper">
          <UsersIcon class="adminappointment-stat-icon" />
        </div>
        <div class="adminappointment-stat-content">
          <p class="adminappointment-stat-value">{{ filteredAppointments.length }}</p>
          <h3 class="adminappointment-stat-label">Total Appointments</h3>
        </div>
      </div>
      <div class="adminappointment-stat-card">
        <div class="adminappointment-stat-icon-wrapper">
          <CalendarIcon class="adminappointment-stat-icon" />
        </div>
        <div class="adminappointment-stat-content">
          <p class="adminappointment-stat-value">
            {{ filteredAppointments.filter(a => new Date(a.date.toDate()).getMonth() === new Date().getMonth()).length }}
          </p>
          <h3 class="adminappointment-stat-label">This Month</h3>
        </div>
      </div>
      <div class="adminappointment-stat-card">
        <div class="adminappointment-stat-icon-wrapper">
          <HourglassIcon class="adminappointment-stat-icon" />
        </div>
        <div class="adminappointment-stat-content">
          <p class="adminappointment-stat-value">
            {{ filteredAppointments.filter(a => new Date(a.date.toDate()) > new Date()).length }}
          </p>
          <h3 class="adminappointment-stat-label">Next Month</h3>
        </div>
      </div>
    </div>

    <!-- Appointment Details with scrollable table -->
    <div class="appointment-details">
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
      <div class="table-wrapper">
        <table v-if="!loading && filteredAppointments.length > 0" class="appointments-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time</th>
              <th>Services</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in filteredAppointments" :key="appointment.id">
              <td class="tooltip-cell">
                <div class="truncate">{{ appointment.clientName }}</div>
                <div class="tooltip">{{ appointment.clientName }}</div>
              </td>
              <td class="tooltip-cell">
                <div class="truncate">{{ appointment.userEmail }}</div>
                <div class="tooltip">{{ appointment.userEmail }}</div>
              </td>
              <td class="tooltip-cell">
                <div class="truncate">{{ formatDate(appointment.date) }}</div>
                <div class="tooltip">{{ formatDate(appointment.date) }}</div>
              </td>
              <td>{{ appointment.time }}</td>
              <td class="relative group">
                <div class="truncate max-w-[150px]" :title="appointment.services?.join(', ')">
                  {{ appointment.services?.[0] || 'No service' }}
                  <span v-if="appointment.services?.length > 1" class="text-gray-400">+{{ appointment.services.length - 1 }} more</span>
                </div>
                <div v-if="appointment.services?.length > 1" 
                     class="absolute hidden group-hover:block z-10 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[200px] max-w-[300px] left-0 mt-2 transform transition-all duration-200 ease-in-out">
                  <div class="text-sm font-medium text-gray-700 mb-2">All Services:</div>
                  <ul class="space-y-2">
                    <li v-for="(service, index) in appointment.services" 
                        :key="index"
                        class="text-sm text-gray-600 whitespace-normal flex items-center">
                      <div class="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                      {{ service }}
                    </li>
                  </ul>
                  <div class="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                </div>
              </td>
              <td>₱{{ appointment.price || '0.00' }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(appointment.status)]">
                  {{ formatStatus(appointment.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    @click="approveAppointment(appointment)" 
                    class="action-button approve"
                    :disabled="['approved', 'cancelled', 'rejected'].includes(appointment.status)"
                  >
                    Approve
                  </button>
                  <button 
                    @click="declineAppointment(appointment)" 
                    class="action-button decline"
                    :disabled="['approved', 'cancelled', 'rejected'].includes(appointment.status)"
                  >
                    Decline
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!loading && filteredAppointments.length === 0" class="no-data">
          No appointments found.
        </p>
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
import { collection, getDocs, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { 
  Users as UsersIcon, 
  Calendar as CalendarIcon, 
  Hourglass as HourglassIcon, 
  Loader,
  User,
  Search,
  Filter,
  RotateCcw,
  CalendarDays,
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileText,
  File
} from 'lucide-vue-next';

const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const searchName = ref('');
const searchMonth = ref('');
const searchTreatment = ref('');

const fetchAppointments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const querySnapshot = await getDocs(collection(database, 'appointments'));
    const appointmentsData = [];

    for (const appointmentDoc of querySnapshot.docs) {
      const data = appointmentDoc.data();
      const userDocRef = doc(database, 'users', data.userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      appointmentsData.push({
        id: appointmentDoc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
        status: data.status || 'pending',
        clientName: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown Client',
        userEmail: userData ? userData.email : 'Unknown Email',
        services: data.services || [data.service]
      });
    }

    appointments.value = appointmentsData;
  } catch (err) {
    console.error("Error fetching appointments:", err);
    error.value = 'Failed to fetch appointments. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const approveAppointment = async (appointment) => {
  try {
    await updateDoc(doc(database, 'appointments', appointment.id), {
      status: 'approved'
    });
    appointment.status = 'approved';
    appointments.value = [...appointments.value];
  } catch (err) {
    console.error('Error approving appointment:', err);
    error.value = 'Failed to approve appointment. Please try again later.';
  }
};

const declineAppointment = async (appointment) => {
  try {
    await updateDoc(doc(database, 'appointments', appointment.id), {
      status: 'rejected'
    });
    appointment.status = 'rejected';
    appointments.value = [...appointments.value];
  } catch (err) {
    console.error('Error declining appointment:', err);
    error.value = 'Failed to decline appointment. Please try again later.';
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

const filteredAppointments = computed(() => {
  return appointments.value.filter(appointment => {
    const matchesName = searchName.value
      ? appointment.clientName.toLowerCase().includes(searchName.value.toLowerCase())
      : true;
    const matchesMonth = searchMonth.value
      ? (appointment.date.toDate().getMonth() + 1) === Number(searchMonth.value)
      : true;
    const matchesTreatment = searchTreatment.value
      ? appointment.services.some(service => 
          service.toLowerCase().includes(searchTreatment.value.toLowerCase())
        )
      : true;
    return matchesName && matchesMonth && matchesTreatment;
  });
});

const applyFilters = () => {
  // Filtering is handled by computed property
};

const resetFilters = () => {
  searchName.value = '';
  searchMonth.value = '';
  searchTreatment.value = '';
};

const getStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'pending':
    case 'pending cancellation':
      return 'pending';
    case 'rejected':
    case 'cancelled':
      return 'rejected';
    default:
      return '';
  }
};

const formatStatus = (status) => {
  return status === 'pending cancellation' ? 'pending cancel' : status;
};

const exportToPDF = async () => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    const tableData = filteredAppointments.value.map(appointment => [
      appointment.clientName,
      appointment.userEmail,
      formatDate(appointment.date),
      appointment.time,
      appointment.services?.join(', ') || 'No service',
      `₱${appointment.price || '0.00'}`,
      appointment.status
    ]);

    doc.autoTable({
      head: [['Patient Name', 'Email', 'Date', 'Time', 'Services', 'Price', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save('appointments.pdf');
  } catch (err) {
    console.error('Error exporting to PDF:', err);
    error.value = 'Failed to export PDF. Please try again.';
  }
};

const exportToExcel = async () => {
  try {
    const XLSX = await import('xlsx');
    
    const data = filteredAppointments.value.map(appointment => ({
      'Patient Name': appointment.clientName,
      'Email': appointment.userEmail,
      'Date': formatDate(appointment.date),
      'Time': appointment.time,
      'Services': appointment.services?.join(', ') || 'No service',
      'Price': `₱${appointment.price || '0.00'}`,
      'Status': appointment.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
    
    XLSX.writeFile(wb, 'appointments.xlsx');
  } catch (err) {
    console.error('Error exporting to Excel:', err);
    error.value = 'Failed to export Excel file. Please try again.';
  }
};

const exportToCSV = async () => {
  try {
    const XLSX = await import('xlsx');
    
    const data = filteredAppointments.value.map(appointment => ({
      'Patient Name': appointment.clientName,
      'Email': appointment.userEmail,
      'Date': formatDate(appointment.date),
      'Time': appointment.time,
      'Services': appointment.services?.join(', ') || 'No service',
      'Price': `₱${appointment.price || '0.00'}`,
      'Status': appointment.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'appointments.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error exporting to CSV:', err);
    error.value = 'Failed to export CSV file. Please try again.';
  }
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style>
.adminappointment-appointments {
  max-width: 1200px;
  margin: 0 auto;
  height: 650px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.error-alert {
  display: flex;
  align-items: center;
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.alert-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.search-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.search-input,
.select-month {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  background-color: white;
  transition: all 0.2s;
}

.search-input:focus,
.select-month:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-primary {
  background-color: #7c3aed;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #6d28d9;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.adminappointment-stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1px;
}

.adminappointment-stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.adminappointment-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.adminappointment-stat-icon-wrapper {
  background: rgba(159, 122, 234, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  margin-right: 0.75rem;
}

.adminappointment-stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #7c3aed;
}

.adminappointment-stat-content {
  flex: 1;
}

.adminappointment-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #9f7aea;
  margin: 0;
}

.adminappointment-stat-label {
  color: #718096;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.appointment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-top: 1rem;
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.appointments-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.appointments-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #8b5cf6;
}

.appointments-table th,
.appointments-table td {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  border-right: 1px solid #e5e7eb;
}

.appointments-table th:last-child,
.appointments-table td:last-child {
  border-right: none;
}

.appointments-table th {
  color: #f8fafc;
}

.appointments-table td {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.appointments-table tr:last-child td {
  border-bottom: none;
}
.appointments-table tr:hover {
  background-color: rgba(139, 92, 246, 0.1); /* Pastel purple with low opacity */
}

.status-badge {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
}

.status-badge.approved {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s ease;
  line-height: 1;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.approve {
  background-color: #22c55e;
  color: white;
}

.action-button.decline {
  background-color: #ef4444;
  color: white;
}

.no-data,
.loading-state {
  text-align: center;
  color: #8b5cf6;
  padding: 2rem;
}

.loading-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #7c3aed;
  margin-bottom: 0.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tooltip-cell {
  position: relative;
  max-width: 200px;
}

.tooltip {
  visibility: hidden;
  position: absolute;
  z-index: 1;
  background-color: #8b5cf6;
  color: white;
  text-align: center;
  border-radius: 6px;
  padding: 5px 10px;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #8b5cf6 transparent transparent transparent;
}

.tooltip-cell:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.additional-services {
  font-size: 0.75rem;
  color: #6b7280;
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

