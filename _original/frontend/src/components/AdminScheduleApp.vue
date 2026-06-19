<template>
  <div class="appointment-scheduler-wrapper">
    <div class="illustration">
      <div class="illustration-content">
        <img :src="blogImage" alt="mejico" class="illustration-image" />
      </div>
    </div>
    <div class="appointment-scheduler">
      <div class="header">
        <div class="mode-selection">
          <button @click="setMode('book')" :class="{ active: mode === 'book' }">Booking</button>
          <button @click="setMode('view')" :class="{ active: mode === 'view' }">View Appointments</button>
          <button @click="setMode('update')" :class="{ active: mode === 'update' }" :disabled="!selectedAppointment">Update</button>
        </div>
      </div>
      <div v-if="mode === 'view'" class="appointment-cards">
        <h2>Your Appointments</h2>
        <div v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
          <div class="card-content">
            <i :class="getServiceIcon(appointment.service)" class="service-icon"></i>
            <div class="appointment-details">
              <p><strong>Service:</strong> {{ appointment.service }}</p>
              <p><strong>Date:</strong> {{ formatAppointmentDate(appointment.date) }}</p>
              <p><strong>Time:</strong> {{ appointment.time }}</p>
              <p><strong>Price:</strong> ₱{{ appointment.price.toLocaleString('en-PH') }}</p>
              <p><strong>Status:</strong>
                <span :class="{
                  'status-pending': appointment.status === 'pending',
                  'status-approved': appointment.status === 'approved',
                  'status-pending-cancellation': appointment.status === 'pending cancellation'
                }">
                  {{ appointment.status === 'pending' ? 'Waiting for Approval' : 
                  appointment.status === 'approved' ? 'Approved' : 
                  appointment.status === 'pending cancellation' ? 'Pending Cancellation' : '' }}
                </span>
              </p>
            </div>
          </div>
          <div class="appointment-actions">
            <button @click.stop="selectAppointment(appointment)" class="update-button">Update</button>
            <button @click.stop="cancelAppointment(appointment.id)" class="cancel-button">Cancel</button>
          </div>
        </div>
      </div>

      <div class="form-container" v-if="mode === 'book' || mode === 'update'">
        <!-- Service Selection -->
        <div class="service-selection">
          <h5 style="color: gray;">Select a service.</h5>
          <div class="service-options">
            <div
              v-for="service in services"
              :key="service.id"
              @click="selectedService = service.id"
              :class="['service-option', { selected: selectedService === service.id }]"
            >
              <i :class="service.icon" class="service-icon"></i>
              <p>{{ service.name }}</p>
            </div>
          </div>
        </div>

        <div class="scheduler-container">
          <!-- Date and Time Selection Container -->
          <div class="date-time-selection">
            <div class="form-group">
              <label for="date">Select Date:</label>
              <!-- Your Date Picker Component -->
              <v-date-picker
                v-model="selectedDate"
                :min-date="new Date()"
                :max-date="maxDate"
                class="modern-datepicker"
                inline
              />
            </div>

            <div class="form-group time-slots-wrapper">
              <label>Available Time Slots:</label>
              <div class="time-slots">
                <button
                  v-for="slot in availableTimeSlots"
                  :key="slot"
                  @click="selectTimeSlot(slot)"
                  :class="['time-slot', { 'selected': selectedTime === slot, 'disabled': disableSlot(slot) }]"
                  :disabled="disableSlot(slot)"
                >
                  {{ slot }}
                </button>
              </div>

              <div class="summary" v-if="isFormValid">
                <h2>Appointment Summary</h2>
                <p><strong>Service:</strong> {{ selectedServiceDetails.name }}</p>
                <p><strong>Date:</strong> {{ formattedDate }}</p>
                <p><strong>Time:</strong> {{ selectedTime || 'Please select a time slot' }}</p>
                <p><strong>Price:</strong> ₱{{ selectedServiceDetails.price.toLocaleString('en-PH') }}</p>
              </div>
            </div>
          </div>
        </div>

        <button v-if="isFormValid" @click="mode === 'book' ? scheduleAppointment() : updateAppointment()" class="button">
          {{ mode === 'book' ? 'Book Appointment' : 'Update Appointment' }}
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>

  import { ref, computed, onMounted, watch } from 'vue';
  import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
  import { database } from '../firebase';
  import VueCal from 'vue-cal';
  import VDatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  import blogImage from '../assets/images/logo.png';

  const selectedDate = ref(null);
  const selectedService = ref('');
  const selectedTime = ref('');
  const mode = ref('book');
  const selectedAppointment = ref(null);
  const appointments = ref([]);
  const unavailableTimeSlots = ref([]);
  const availableTimeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const services = [
      { id: 1, name: 'Checkup', duration: 60, price: 80, icon: 'fas fa-stethoscope' },
      { id: 2, name: 'Massage', duration: 90, price: 120, icon: 'fas fa-bottle-droplet' },
      { id: 3, name: 'Manicure', duration: 45, price: 40, icon: 'fas fa-hand' },
      { id: 4, name: 'Pedicure', duration: 60, price: 50, icon: 'fas fa-brush' },
      { id: 5, name: 'Hair Removal', duration: 30, price: 60, icon: 'fas fa-user-ninja' }
  ];

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  
      onMounted(() => {
          fetchAppointments();
      });

  const fetchAppointments = async () => {
      try {
          const querySnapshot = await getDocs(collection(database, 'appointments'));
          appointments.value = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          }));
      } catch (error) {
          console.error('Error fetching appointments:', error);
      }
  };

  const selectTimeSlot = (slot) => {
  if (!disableSlot(slot)) {
      selectedTime.value = slot;
  }
};






const formatTime = (time) => {
  const [hour, minute] = time.split(':');
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

  const getServiceIcon = (serviceName) => {
      const service = services.find(s => s.name === serviceName);
      return service ? service.icon : 'fas fa-concierge-bell';
  };


const updateUnavailableTimeSlots = () => {
  if (!selectedDate.value) return;

  const formattedDate = selectedDate.value.toISOString().split('T')[0];
  unavailableTimeSlots.value = appointments.value
      .filter(appointment => appointment.date === formattedDate)
      .map(appointment => appointment.time);
};

const disableSlot = (slot) => {
  return unavailableTimeSlots.value.includes(slot);
};

watch(selectedDate, updateUnavailableTimeSlots);


  const setMode = (newMode) => {
      mode.value = newMode;
      if (newMode === 'view') {
          fetchAppointments();
          clearSelection();
      }
  };

  const clearSelection = () => {
      selectedService.value = null;
      selectedDate.value = null;
      selectedTime.value = null;
      selectedAppointment.value = null;
  };

  const selectAppointment = (appointment) => {
      selectedAppointment.value = appointment;
      mode.value = 'update';
      selectedService.value = services.find(s => s.name === appointment.service)?.id;
      selectedDate.value = new Date(appointment.date);
      selectedTime.value = appointment.time;
  };

  const updateAppointment = async () => {
      if (selectedAppointment.value) {
          const appointmentRef = doc(database, 'appointments', selectedAppointment.value.id);
          await updateDoc(appointmentRef, {
              service: selectedServiceDetails.value.name,
              date: selectedDate.value.toISOString().split('T')[0],
              time: selectedTime.value,
          });
          alert('Appointment updated successfully!');
          setMode('view');
      }
  };

  const cancelAppointment = async (appointmentId) => {
  try {
      // Update the appointment status to "pending cancellation"
      const appointmentRef = doc(database, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
          status: 'pending cancellation'
      });

      // Create a cancellation request document for tracking
      await addDoc(collection(database, 'cancellation_requests'), {
          appointmentId,
          status: 'pending',
          requestedAt: new Date().toISOString()
      });

      alert('Your cancellation request is pending approval.');
      fetchAppointments(); // Refresh the appointments list to show updated status

  } catch (error) {
      console.error('Error processing cancellation request:', error);
      alert('Failed to send cancellation request.');
  }
};


  const scheduleAppointment = async () => {
  if (isFormValid.value) {
      const appointmentData = {
          service: selectedServiceDetails.value.name,
          date: selectedDate.value.toISOString().split('T')[0], // Ensures you save only the date part
          time: selectedTime.value,
          price: selectedServiceDetails.value.price,
          status: 'pending' // New status field
      };
      
      // Log the appointment data to debug
      console.log("Saving appointment:", appointmentData);
      
      await addDoc(collection(database, 'appointments'), appointmentData);
      alert('Appointment request sent! Waiting for approval.');
      setMode('view');
  }
};




// Computed properties
const isFormValid = computed(() => selectedDate.value && selectedTime.value && selectedService.value);
const selectedServiceDetails = computed(() => services.find(service => service.id === selectedService.value) || {});
const formattedDate = computed(() => selectedDate.value ? new Date(selectedDate.value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '');

const formatAppointmentDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });


</script>

<style scoped>
  * {
      font-family: 'Poppins', sans-serif;
  }

  .date-time-summary-container {
      display: flex;
      flex-direction: column;
      gap: 20px; 
  }

  .modern-datepicker {
      font-family: 'Arial', sans-serif; /* Change font as needed */
      border: 1px solid #ccc; /* Border styling */
      border-radius: 8px; /* Rounded corners */
      overflow: hidden; /* To ensure child elements fit within the border */
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
      max-width: 400px; /* Set a max width for the date picker */
      margin: 0 auto; /* Center the date picker */
  }

  .modern-datepicker .dp-calendar {
      background-color: #ffffff; /* Background color of the calendar */
  }

  .modern-datepicker .dp-calendar .dp-header {
      background-color: #2a0747; /* Header background color */
      color: white; /* Header text color */
      padding: 10px; /* Padding around the header */
      text-align: center; /* Center the header text */
      border-bottom: 2px solid #4b0082; /* Bottom border for the header */
  }

  .modern-datepicker .dp-calendar .dp-day {
      padding: 10px; /* Spacing around days */
      cursor: pointer; /* Pointer on hover */
      transition: background-color 0.3s, color 0.3s; /* Smooth transition for hover */
      border-radius: 50%; /* Round day buttons */
  }

  .modern-datepicker .dp-calendar .dp-day:hover {
      background-color: #e7f1ff; /* Light blue background on hover */
      color: #52267a; /* Change text color on hover */
  }

  .modern-datepicker .dp-calendar .dp-day.selected {
      background-color: #52267a; /* Color for selected day */
      color: white; /* Text color for selected day */
      font-weight: bold; /* Bold text for selected day */
  }

  .modern-datepicker .dp-calendar .dp-day.disabled {
      color: #ccc; /* Color for disabled days */
      pointer-events: none; /* Disable hover on disabled days */
  }

  .summary-container {
      margin-top: 20px; 
  }

  .mode-selection {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 20px;
  } 

  .date-picker {
      width: 100%;
      border-radius: 8px;
  }

  .time-slots {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
  }

  .time-slot {
      background-color: #e9ecef;
      border: none;
      border-radius: 5px;
      padding: 10px 15px;
      cursor: pointer;
      transition: background-color 0.2s;
      flex: 1 1 120px; /* Flexible sizing for time slots */
  }

  .time-slot.selected {
      background-color: #007bff;
      color: white;
  }

  .time-slot.disabled {
      background-color: #d3d3d3;
      cursor: not-allowed;
  }

  .status-pending {
      color: #e6ac00; 
  }

  .status-approved {
      color: #28a745; 
  }

  .status-pending-cancellation {
      color: #e67e22; 
  }

  .mode-selection button {
      font-size: 16px;
      padding: 10px 15px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      color: #4b0082;
      background-color: #e6e6fa;
      transition: background-color 0.3s, color 0.3s;
  }

  .mode-selection button.active {
      background-color: #4b0082;
      color: white;
  }

  .mode-selection button:hover {
      background-color: #d8bfd8;
  }

  .header {
      display: flex;
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 20px; 
  }

  .appointment-scheduler-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      max-width: 100%;
      height: 100%;
      margin: 0 auto;
      background-color: #f8f8f8;
  }

  .illustration-content {
      text-align: center;
  }

  .illustration h1 {
      color: #1a1a1a;
      font-size: 32px;
      margin-bottom: 30px;
  }

  .scheduler-container {
      background-color: #f7f7f7; 
      padding: 20px; 
      border-radius: 8px; 
      box-shadow: 0 4px 8px rgba(55, 38, 73, 0.2); 
      z-index: 10; 
  }

  .illustration {
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 40%; 
      height: 100vh; 
      overflow: hidden; 
      background-color: #f9f9f9;
      z-index: 1; 
  }

  .illustration-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
  }

  .appointment-scheduler {
      margin-left: 40%; 
      width: 60%; 
      padding: 40px;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      overflow-y: auto; 
      height: 100vh; 
      position: relative; 
      z-index: 0; 
  }

  .appointment-cards {
      display: flex;
      flex-direction: column;
      gap: 20px;
  }

  .appointment-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
  }

  .appointment-card:hover {
      transform: translateY(-3px);
  }

  .card-content {
      display: flex;
      align-items: center;
      gap: 20px;
  }

  .service-icon {
      font-size: 35px;
      color: #4b0082;
      background-color: #e6e6fa;
      padding: 15px;
      border-radius: 50%;
  }

  .appointment-details {
      display: flex;
      flex-direction: column;
  }

  .appointment-actions {
      display: flex;
      gap: 10px;
  }

  .update-button, .cancel-button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
  }

  .update-button {
      background-color: #288cc5;
  }

  .cancel-button {
      background-color: rgb(226, 19, 19);
  }

  .update-button:hover, .cancel-button:hover {
      opacity: 0.8;
  }

  .form-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
  }

  .service-selection {
      margin-bottom: 20px;
  }

  .service-options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 20px;
      justify-items: center;
  }

  .service-option {
      text-align: center;
      cursor: pointer;
      transition: transform 0.3s;
  }

  .service-option.selected {
      transform: scale(1.1);
      border-color: #4b0082;
  }

  .service-icon {
      font-size: 35px;
      margin-bottom: 10px;
      color: #4b0082;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #e6e6fa;
      transition: background-color 0.3s;
  }

  .service-icon:hover {
      background-color: #d8bfd8;
  }

  .date-time-selection {
      display: flex;
      justify-content: space-between;
      position: relative; 
      z-index: 2; 
  }

  .vdp-datepicker__calendar {
      position: relative; 
      z-index: 3; 
  }

  .time-slots-wrapper {
      flex: 1;
      margin-left: 20px;
  }

  .summary {
      margin-top: 20px; 
  }

  .button {
      width: 100%;
      padding: 14px;
      background-color: rgb(39, 29, 108);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
  }

  .button:hover {
      background-color: #4b0082;
  }

  .button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
  }

  .date-picker {
      width: 100%;
      max-width: 350px;
      height: auto;
  }

</style>