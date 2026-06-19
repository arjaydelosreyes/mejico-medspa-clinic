<template>
  <div class="appointment-scheduler">
    <Navbar />
  
    <div class="container">
      <div class="scheduler-layout">
        <!-- Calendar Section -->
        <div class="calendar-section">
          <h2>Select Date</h2>
          <div class="custom-calendar">
            <div class="calendar-header">
              <button @click="previousMonth" class="calendar-nav-button">&lt;</button>
              <h3>{{ currentMonthYear }}</h3>
              <button @click="nextMonth" class="calendar-nav-button">&gt;</button>
            </div>
            <div class="calendar-weekdays">
              <span v-for="day in weekdays" :key="day">{{ day }}</span>
            </div>
            <div class="calendar-days">
              <button
                v-for="{ date, isCurrentMonth, isSelected, isDisabled, isAppointmentDate } in calendarDays"
                :key="date.toISOString()"
                @click="selectDate(date)"
                :class="{
                  'current-month': isCurrentMonth,
                  'selected': isSelected,
                  'disabled': isDisabled,
                  'appointment-date': isAppointmentDate
                }"
                :disabled="isDisabled"
              >
                {{ date.getDate() }}
              </button>
            </div>
          </div>
        </div>
  
        <!-- Main Content Section -->
        <div class="appointment-main-content">
          <div class="mode-selection">
            <button 
              v-for="tab in ['book', 'view', 'update']" 
              :key="tab"
              @click="setMode(tab)"
              :class="['mode-button', { active: mode === tab }]"
              :disabled="tab === 'update' && !selectedAppointment"
            >
              {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
            </button>
          </div>
          
           <!-- Modified appointments list section -->
          <div v-if="mode === 'view'" class="appointments-list custom-scrollbar">
            <h2>Your Appointments</h2>
            <div v-for="appointment in appointments" :key="appointment.id" class="appointment-card">
              <div class="appointment-content" @click="highlightAppointmentDate(appointment)">
                <div class="service-icon">
                  <component :is="getServiceIcon(appointment.services[0])" />
                </div>
                <div class="appointment-details">
                  <h3>{{ summarizeServices(appointment.services) }}</h3>
                  <p>{{ formatAppointmentDate(appointment.date) }} at {{ appointment.time }}</p>
                  <p class="price">₱{{ appointment.price.toLocaleString('en-PH') }}</p>
                  <span :class="['status', appointment.status]">
                    {{ appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) }}
                  </span>
                </div>
              </div>
              <div class="appointment-actions">
                <button 
                  @click="selectAppointment(appointment)" 
                  :class="['update-button', { 'disabled-update': isAppointmentCancelledOrPending(appointment) }]"
                  :disabled="isAppointmentCancelledOrPending(appointment)"
                >
                  <PencilIcon class="icon" /> Update
                </button>
                <button 
                  @click="cancelAppointment(appointment.id)" 
                  class="cancel-button"
                  :disabled="isAppointmentCancelledOrPending(appointment)"
                >
                  <XIcon class="icon" /> Cancel
                </button>
              </div>
            </div>
          </div>
  
          <!-- Book or Update Appointment -->
          <div v-if="mode === 'book' || mode === 'update'" class="booking-form">
            <h3 class="services-heading">Select Services</h3>
            <!-- Service Selection -->
            <div class="service-options">
              <div 
                v-for="service in uniqueServices"
                :key="service.id"
                class="service-option"
                :class="{ selected: selectedServices[service.id] > 0 }"
              >
                <!-- Add the quantity badge -->
                <div v-if="getServiceQuantity(service.id) > 0" class="quantity-badge">
                  x{{ getServiceQuantity(service.id) }}
                </div>
                
                <button @click="showTreatmentList(service)" class="service-button">
                  <component :is="service.icon" class="service-icon" />
                  <p>{{ service.name }}</p>
                </button>
              </div>
            </div>
  
            <!-- Time Slots -->
            <div class="time-slots">
              <h3>Available Time Slots</h3>
              <div class="time-slot-options">
                <button
                  v-for="slot in availableTimeSlots"
                  :key="slot"
                  @click="selectTimeSlot(slot)"
                  :class="['time-slot', { 
                    selected: selectedTime === slot, 
                    disabled: disableSlot(slot) 
                  }]"
                  :disabled="disableSlot(slot)"
                >
                  {{ slot }}
                </button>
              </div>
            </div>
  
            <!-- Action Button -->
            <button
              @click="showSummaryModal"
              :disabled="!isFormValid"
              class="action-button"
            >
              <CalendarPlusIcon v-if="mode === 'book'" class="icon" />
              <RefreshCwIcon v-else class="icon" />
              <span>{{ mode === 'book' ? 'Review Appointment' : 'Review Update' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Modified Treatment List Modal -->
    <div v-if="isTreatmentListModalVisible" class="modal-overlay" @click="closeTreatmentListModal">
      <div class="modal treatment-list-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedService?.name }} Services</h3>
          <button @click="closeTreatmentListModal" class="close-button">
            <XIcon class="icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="isLoadingTreatments" class="loading-state">
            <div class="spinner"></div>
            <p>Loading treatments...</p>
          </div>
          
          <div v-else-if="!hasTreatments" class="empty-state">
            <p>No treatments available for {{ selectedService?.name || 'this service' }}.</p>
          </div>
          
          <div v-else class="treatments-grid">
            <div 
              v-for="treatment in treatments" 
              :key="treatment.id"
              class="treatment-card"
              :class="{ 'selected': selectedTreatments[treatment.id] > 0 }"
            >
              <div class="treatment-icon-wrapper">
                <component :is="getServiceIcon(selectedService?.name)" class="treatment-icon" />
              </div>
              
              <div class="treatment-content">
                <h4>{{ treatment.name }}</h4>
                <p class="treatment-description">{{ treatment.description || 'Experience our professional service.' }}</p>
                <div class="treatment-price">₱{{ treatment.price.toLocaleString('en-PH') }}</div>
                
                <div v-if="selectedTreatments[treatment.id]" class="quantity-controls">
                  <button @click.stop="decrementTreatment(treatment)" class="quantity-button">
                    <MinusIcon class="icon" />
                  </button>
                  <span class="quantity">{{ selectedTreatments[treatment.id] }}</span>
                  <button @click.stop="incrementTreatment(treatment)" class="quantity-button">
                    <PlusIcon class="icon" />
                  </button>
                </div>
              </div>
              
              <div class="treatment-footer">
                <button 
                  v-if="!selectedTreatments[treatment.id]"
                  @click.stop="selectTreatment(treatment)" 
                  class="select-treatment-button"
                >
                  <PlusIcon class="icon" />
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions treatment-modal-actions">
          <button 
            @click="confirmTreatmentSelection" 
            class="confirm-button"
            :disabled="!hasSelectedTreatments || isConfirmingTreatment"
          >
            <template v-if="!isConfirmingTreatment && !isTreatmentConfirmed">
              Confirm Selection
            </template>
            <template v-else-if="isConfirmingTreatment">
              <div class="confirm-spinner"></div>
              Confirming...
            </template>
            <template v-else>
              <div class="confirm-success">
                <CheckIcon />
                Confirmed
              </div>
            </template>
          </button>
          <button @click="closeTreatmentListModal" class="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  
    <!-- Summary Modal -->
    <div v-if="isSummaryModalVisible" class="modal-overlay" @click="closeSummaryModal">
      <div class="modal" @click.stop>
        <div class="modal-content">
          <h3 class="summary-title">Appointment Summary</h3>
          <div class="summary-content-wrapper custom-scrollbar">
            <div class="summary-content">
              <!-- Selected Services Section -->
              <div class="selected-services">
                <h4>Selected Services</h4>
                <div v-if="hasSelectedServices">
                  <div v-for="(count, serviceId) in selectedServices" :key="serviceId" class="service-item">
                    <div class="service-info">
                      <div class="service-name-duration">
                        <span class="service-name">{{ getServiceName(serviceId) }}</span>
                      </div>
                      <div class="service-details">
                        <span class="service-quantity">x{{ getServiceQuantity(serviceId) }}</span>
                        <!-- Display selected treatments under the service -->
                        <div v-if="selectedTreatmentsForService[serviceId]" class="selected-treatments">
                          <div v-for="treatment in selectedTreatmentsForService[serviceId]" :key="treatment.id" class="treatment-item">
                            <span>{{ treatment.name }}</span>
                            <span class="treatment-quantity">x{{ treatment.quantity }}</span>
                            <span class="treatment-price">₱{{ (treatment.price * treatment.quantity).toLocaleString('en-PH') }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-services-message">
                  No services selected
                </div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-totals">
                <div class="total-row">
                  <span>Total Price:</span>
                  <span class="highlight price-highlight">₱{{ totalPrice.toLocaleString('en-PH') }}</span>
                </div>
              </div>
              <div class="summary-divider"></div>
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span>{{ formattedDate }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span>
                  <span>{{ selectedTime }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="confirmAppointment" class="confirm-button">
              <CheckIcon class="icon" /> Confirm
            </button>
            <button @click="closeSummaryModal" class="cancel-button">
              <XIcon class="icon" /> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Modal -->
    <div v-if="isConfirmationModalVisible" class="modal-overlay" @click.self="isConfirmationModalVisible = false">
      <div class="modal confirmation-modal">
        <div v-if="confirmationStatus === 'confirming'" class="confirmation-content">
          <div class="spinner"></div>
          <p>Confirming...</p>
        </div>
        <div v-else-if="confirmationStatus === 'confirmed'" class="confirmation-content">
          <div class="check-icon"></div>
          <p>Confirmed Successfully</p>
        </div>
        <div v-else-if="confirmationStatus === 'error'" class="confirmation-content">
          <p>Error occurred. Please try again.</p>
        </div>
      </div>
    </div>
  
    <!-- Cancellation Modal -->
    <div v-if="isCancellationModalVisible" class="modal-overlay" @click.self="isCancellationModalVisible = false">
      <div class="modal confirmation-modal">
        <div v-if="cancellationStatus === 'cancelling'" class="confirmation-content">
          <div class="spinner"></div>
          <p>Cancelling please wait...</p>
        </div>
        <div v-else-if="cancellationStatus === 'cancelled'" class="confirmation-content">
          <div class="check-icon"></div>
          <p>Successfully Cancelled</p>
        </div>
        <div v-else-if="cancellationStatus === 'error'" class="confirmation-content">
          <p>Error occurred. Please try again.</p>
        </div>
      </div>
    </div>
    
    <FooterComponent />
  </div>
</template>
  
<script setup>
import Navbar from './Navbar.vue';
import FooterComponent from './Footer.vue';  
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { 
  collection, 
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, database } from '../firebase';
import { useRouter } from 'vue-router';
import { 
  CalendarPlusIcon, 
  RefreshCwIcon, 
  StethoscopeIcon, 
  DropletIcon, 
  HandIcon, 
  ScissorsIcon, 
  ZapIcon,
  PencilIcon,
  XIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  Scissors
} from 'lucide-vue-next';

const router = useRouter();

const selectedDate = ref(new Date());
const currentMonth = ref(new Date());
const selectedServices = ref({});
const selectedTime = ref('');
const mode = ref('book');
const selectedAppointment = ref(null);
const appointments = ref([]);
const unavailableTimeSlots = ref([]);
const availableTimeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const isSummaryModalVisible = ref(false);
const isConfirmationModalVisible = ref(false);
const confirmationStatus = ref('');
const isCancellationModalVisible = ref(false);
const cancellationStatus = ref('');
const services = ref([]);

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Treatment list modal refs
const isTreatmentListModalVisible = ref(false);
const selectedService = ref(null);
const treatments = ref([]);
const isLoadingTreatments = ref(false);
const loadingTreatments = ref(true);
const selectedTreatments = ref({});
const isConfirmingTreatment = ref(false);
const isTreatmentConfirmed = ref(false);
const currentTotal = ref(0);
const selectedTreatmentsHistory = ref({});

const currentMonthYear = computed(() => {
  return currentMonth.value.toLocaleString('default', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Add days from previous month
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date,
      isCurrentMonth: false,
      isSelected: isSameDate(date, selectedDate.value) || (selectedAppointment.value && isSameDate(date, new Date(selectedAppointment.value.date))),
      isAppointmentDate: selectedAppointment.value && isSameDate(date, new Date(selectedAppointment.value.date)),
      isDisabled: date < new Date()
    });
  }

  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isSelected: isSameDate(date, selectedDate.value),
      isAppointmentDate: selectedAppointment.value && isSameDate(date, new Date(selectedAppointment.value.date)),
      isDisabled: date < new Date()
    });
  }

  // Add days from next month
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isSelected: isSameDate(date, selectedDate.value) || (selectedAppointment.value && isSameDate(date, new Date(selectedAppointment.value.date))),
      isAppointmentDate: selectedAppointment.value && isSameDate(date, new Date(selectedAppointment.value.date)),
      isDisabled: date < new Date()
    });
  }

  return days;
});

const uniqueServices = computed(() => {
  const uniqueMap = new Map();
  services.value.forEach(service => {
    if (!uniqueMap.has(service.name)) {
      uniqueMap.set(service.name, {
        ...service,
        id: service.id
      });
    }
  });
  return Array.from(uniqueMap.values());
});

const summarizeServices = (services) => {
  if (!services || !Array.isArray(services)) return '';
  
  const serviceCount = services.reduce((acc, service) => {
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(serviceCount)
    .map(([service, count]) => `${count}x ${service}`)
    .join(', ');
};

const hasSelectedTreatments = computed(() => Object.values(selectedTreatments.value).some(count => count > 0));

function isSameDate(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function previousMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
}

function selectDate(date) {
  selectedDate.value = date;
  updateUnavailableTimeSlots();
}

const confirmAppointment = async () => {
  if (!isFormValid.value) {
    console.error('Form validation failed');
    return;
  }

  try {
    isConfirmationModalVisible.value = true;
    confirmationStatus.value = 'confirming';

    const appointmentData = {
      userId: auth.currentUser?.uid,
      userEmail: auth.currentUser?.email,
      services: Object.entries(selectedServices.value).flatMap(([id, count]) => 
        Array(count).fill(services.value.find(s => s.id === id)?.name)
      ),
      date: selectedDate.value.toISOString().split('T')[0],
      time: selectedTime.value,
      price: totalPrice.value,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (mode.value === 'book') {
      const appointmentsRef = collection(database, 'appointments');
      const appointmentDoc = await addDoc(appointmentsRef, appointmentData);
      console.log('New appointment created with ID:', appointmentDoc.id);

      if (auth.currentUser) {
        const userAppointmentsRef = collection(
          database, 
          'users', 
          auth.currentUser.uid, 
          'appointments'
        );
        
        await addDoc(userAppointmentsRef, {
          appointmentId: appointmentDoc.id,
          createdAt: serverTimestamp()
        });
      }
    } else if (mode.value === 'update' && selectedAppointment.value) {
      const appointmentRef = doc(database, 'appointments', selectedAppointment.value.id);
      await updateDoc(appointmentRef, {
        ...appointmentData,
        updatedAt: serverTimestamp()
      });
    }

    confirmationStatus.value = 'confirmed';
    await fetchAppointments();

    setTimeout(() => {
      isConfirmationModalVisible.value = false;
      closeSummaryModal();
      setMode('view');
    }, 2000);

  } catch (error) {
    console.error('Error saving appointment:', error);
    confirmationStatus.value = 'error';
    alert('Failed to save appointment. Please try again.');
  }
};

const fetchAppointments = async () => {
  if (!auth.currentUser) {
    console.log('No authenticated user');
    return;
  }

  try {
    const appointmentsRef = collection(database, 'appointments');
    const q = query(
      appointmentsRef, 
      where('userId', '==', auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    appointments.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('Fetched appointments:', appointments.value);
  } catch (error) {
    console.error('Error fetching appointments:', error);
  }
};

const cancelAppointment = async (appointmentId) => {
  if (!auth.currentUser) {
    console.log('No authenticated user');
    return;
  }

  try {
    isCancellationModalVisible.value = true;
    cancellationStatus.value = 'cancelling';

    await new Promise(resolve => setTimeout(resolve, 3000));

    const appointmentRef = doc(database, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'pending cancellation',
      updatedAt: serverTimestamp()
    });

    const cancellationRef = collection(database, 'cancellation_requests');
    await addDoc(cancellationRef, {
      appointmentId,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      status: 'pending',
      requestedAt: serverTimestamp()
    });

    await fetchAppointments();
    cancellationStatus.value = 'cancelled';

    setTimeout(() => {
      isCancellationModalVisible.value = false;
      cancellationStatus.value = '';
    }, 2000);

  } catch (error) {
    console.error('Error processing cancellation:', error);
    cancellationStatus.value = 'error';
    setTimeout(() => {
      isCancellationModalVisible.value = false;
      cancellationStatus.value = '';
    }, 2000);
  }
};

const selectTimeSlot = (slot) => {
  if (!disableSlot(slot)) {
    selectedTime.value = slot;
  }
};

const getIconForService = (serviceName) => {
  const iconMap = {
    'Checkup': StethoscopeIcon,
    'Massage': DropletIcon,
    'Manicure': HandIcon,
    'Pedicure': ScissorsIcon,
    'Hair Removal': ZapIcon,
    'Hair Care': Scissors,
    'Hair Cut': Scissors,
    'Hair Style': Scissors,
  };

  return iconMap[serviceName] || StethoscopeIcon;
};

const getServiceIcon = (serviceName) => {
  return getIconForService(serviceName);
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

const setMode = (newMode) => {
  mode.value = newMode;
  if (newMode === 'view') {
    fetchAppointments();
    clearSelection();
  }
};

const clearAllSelections = () => {
  selectedTreatmentsHistory.value = {};
  selectedTreatments.value = {};
  selectedServices.value = {};
  currentTotal.value = 0;
};

const clearSelection = () => {
  selectedServices.value = {};
  selectedTime.value = null;
  selectedAppointment.value = null;
};

const selectAppointment = (appointment) => {
  selectedAppointment.value = appointment;
  mode.value = 'update';
  selectedServices.value = appointment.services.reduce((acc, service) => {
    const serviceObj = services.value.find(s => s.name === service);
    if (serviceObj) {
      acc[serviceObj.id] = (acc[serviceObj.id] || 0) + 1;
    }
    return acc;
  }, {});
  selectedDate.value = new Date(appointment.date);
  currentMonth.value = new Date(appointment.date);
  selectedTime.value = appointment.time;
  updateCalendarHighlight();
};

const highlightAppointmentDate = (appointment) => {
  selectedAppointment.value = appointment;
  selectedDate.value = new Date(appointment.date);
  currentMonth.value = new Date(appointment.date);
  updateCalendarHighlight();
};

const updateCalendarHighlight = () => {
  currentMonth.value = new Date(currentMonth.value);
};

const showSummaryModal = () => {
  if (isFormValid.value) {
    isSummaryModalVisible.value = true;
  }
};

const closeSummaryModal = () => {
  isSummaryModalVisible.value = false;
};

const selectedTreatmentsForService = computed(() => {
  if (!selectedTreatmentsHistory.value || !treatments.value) {
    return {};
  }

  const treatmentsByService = {};
  
  Object.entries(selectedTreatmentsHistory.value).forEach(([serviceId, serviceData]) => {
    if (!serviceData) return;
    
    const serviceTreatments = [];
    Object.entries(serviceData).forEach(([treatmentId, quantity]) => {
      if (treatmentId !== 'total' && treatmentId !== 'quantity') {
        const treatment = treatments.value.find(t => t.id === treatmentId);
        if (treatment) {
          serviceTreatments.push({
            id: treatmentId,
            name: treatment.name,
            price: treatment.price,
            quantity: quantity
          });
        }
      }
    });
    if (serviceTreatments.length > 0) {
      treatmentsByService[serviceId] = serviceTreatments;
    }
  });
  
  return treatmentsByService;
});

const totalPrice = computed(() => {
  if (!selectedTreatmentsHistory.value) return 0;
  
  return Object.values(selectedTreatmentsHistory.value)
    .reduce((sum, serviceHistory) => {
      if (!serviceHistory || typeof serviceHistory.total === 'undefined') {
        return sum;
      }
      return sum + (serviceHistory.total || 0);
    }, 0);
});

watch(selectedTreatments, (newSelectedTreatments) => {
  console.log('Selected treatments changed:', newSelectedTreatments);
}, { deep: true });

watch(treatments, (newTreatments) => {
  console.log('Treatments updated:', newTreatments);
}, { deep: true });

watch(selectedService, (newService, oldService) => {
  if (newService && oldService) {
    const existingTreatments = { ...selectedTreatments.value };
    selectedTreatments.value = existingTreatments;
  }
}, { deep: true });

const isFormValid = computed(() => {
  return (
    selectedDate.value && 
    selectedTime.value && 
    Object.values(selectedServices.value || {}).some(count => count > 0) &&
    totalPrice.value > 0
  );
});

const hasSelectedServices = computed(() => Object.keys(selectedServices.value).length > 0);

const formattedDate = computed(() => 
  selectedDate.value ? selectedDate.value.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
);

const formatAppointmentDate = (date) => 
  new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const getServiceName = (serviceId) => services.value.find(s => s.id === serviceId)?.name || '';
const getServicePrice = (serviceId) => services.value.find(s => s.id === serviceId)?.price || 0;

const isAppointmentCancelledOrPending = (appointment) => {
  return appointment.status === 'cancelled' || appointment.status === 'pending cancellation';
};

const fetchServices = () => {
  const servicesRef = collection(database, 'services');
  return onSnapshot(servicesRef, (snapshot) => {
    const seenNames = new Set();
    services.value = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          icon: getIconForService(data.name)
        };
      })
      .filter(service => {
        if (seenNames.has(service.name)) {
          return false;
        }
        seenNames.add(service.name);
        return true;
      });
    console.log('Fetched services:', services.value);
  }, (error) => {
    console.error('Error fetching services:', error);
  });
};

const fetchTreatments = async (service) => {
  try {
    isLoadingTreatments.value = true;
    const treatmentsCollection = collection(database, 'treatments');
    // Modified query to use service ID instead of name
    const q = query(treatmentsCollection, where('services', '==', service.id));
    const treatmentSnapshot = await getDocs(q);
    
    // Map the treatments and add error handling
    treatments.value = treatmentSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unnamed Treatment',
        description: data.description || 'No description available',
        price: data.price || 0,
        services: data.services || []
      };
    });

    // Log for debugging
    console.log(`Fetched ${treatments.value.length} treatments for service:`, service.name);
    
  } catch (error) {
    console.error('Error fetching treatments:', error);
    treatments.value = []; // Reset on error
  } finally {
    isLoadingTreatments.value = false;
    loadingTreatments.value = false;
  }
};

const showTreatmentList = async (service) => {
  console.log('Showing treatment list for service:', service);
  
  // Ensure we have a valid service object
  if (!service || !service.id) {
    console.error('Invalid service object:', service);
    return;
  }
  
  selectedService.value = service;
  isTreatmentListModalVisible.value = true;
  
  // Fetch treatments for this service
  await fetchTreatments(service);
  
  // Restore any previously selected treatments for this service
  if (selectedTreatmentsHistory.value[service.id]) {
    const previousSelections = selectedTreatmentsHistory.value[service.id];
    const { quantity, total, ...treatmentSelections } = previousSelections;
    selectedTreatments.value = { ...treatmentSelections };
  } else {
    selectedTreatments.value = {};
  }
};

const getServiceQuantity = (serviceId) => {
  return selectedServices.value[serviceId] || 0;
};

const closeTreatmentListModal = () => {
  isTreatmentListModalVisible.value = false;
  selectedService.value = null;
  treatments.value = [];
};

const selectTreatment = (treatment) => {
  selectedTreatments.value = {
    ...selectedTreatments.value,
    [treatment.id]: 1
  };
};

const incrementTreatment = (treatment) => {
  selectedTreatments.value = {
    ...selectedTreatments.value,
    [treatment.id]: (selectedTreatments.value[treatment.id] || 0) + 1
  };
};

const decrementTreatment = (treatment) => {
  const currentCount = selectedTreatments.value[treatment.id] || 0;
  if (currentCount > 0) {
    selectedTreatments.value = {
      ...selectedTreatments.value,
      [treatment.id]: currentCount - 1
    };
    if (selectedTreatments.value[treatment.id] === 0) {
      const { [treatment.id]: _, ...rest } = selectedTreatments.value;
      selectedTreatments.value = rest;
    }
  }
};

const confirmTreatmentSelection = async () => {
  if (!selectedService.value || !treatments.value) {
    console.error('Required data is missing');
    return;
  }

  try {
    isConfirmingTreatment.value = true;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let serviceTotal = 0;
    let totalQuantity = 0;
    
    Object.entries(selectedTreatments.value || {}).forEach(([treatmentId, quantity]) => {
      const treatment = treatments.value.find(t => t.id === treatmentId);
      if (treatment && treatment.price) {
        serviceTotal += treatment.price * quantity;
        totalQuantity += parseInt(quantity) || 0;
      }
    });
    
    if (selectedService.value.id) {
      selectedTreatmentsHistory.value = {
        ...selectedTreatmentsHistory.value,
        [selectedService.value.id]: {
          ...(selectedTreatments.value || {}),
          total: serviceTotal,
          quantity: totalQuantity
        }
      };
    }
    
    currentTotal.value = Object.values(selectedTreatmentsHistory.value || {})
      .reduce((sum, serviceHistory) => {
        if (!serviceHistory || typeof serviceHistory.total === 'undefined') {
          return sum;
        }
        return sum + (serviceHistory.total || 0);
      }, 0);
    
    if (selectedService.value.id) {
      selectedServices.value = {
        ...selectedServices.value,
        [selectedService.value.id]: totalQuantity
      };
    }
    
    isConfirmingTreatment.value = false;
    isTreatmentConfirmed.value = true;
    
    setTimeout(() => {
      isTreatmentConfirmed.value = false;
      closeTreatmentListModal();
    }, 1000);
  } catch (error) {
    console.error('Error in confirmTreatmentSelection:', error);
    isConfirmingTreatment.value = false;
  }
};

const calculateTotalFromHistory = () => {
  let total = 0;
  Object.values(selectedTreatmentsHistory.value).forEach(serviceHistory => {
    if (serviceHistory.total) {
      total += serviceHistory.total;
    }
  });
  return total;
};

const resetCurrentTotal = () => {
  currentTotal.value = 0;
};

// New function to handle navigation
const handleNavigation = async () => {
  if (!auth.currentUser) {
    // If user is not authenticated, redirect to login
    router.push('/login');
    return;
  }
  
  // Stay on the current route if user is authenticated
  await fetchAppointments();
};

// New computed property to check if treatments are available
const hasTreatments = computed(() => {
  return treatments.value && treatments.value.length > 0;
});

onMounted(() => {
  const unsubscribe = fetchServices();
  fetchAppointments();

  // Watch for authentication state changes
  const unsubscribeAuth = watch(() => auth.currentUser, (newUser) => {
    if (newUser) {
      handleNavigation();
    }
  });

  onUnmounted(() => {
    unsubscribe();
    unsubscribeAuth();
  });
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.appointment-scheduler {
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ff 100%);
  color: #1F2937;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1400px;
  height: calc(100vh - 10rem);
  margin: 9rem auto 5rem;
  padding: 0 1rem;
  position: relative;
}

.scheduler-layout {
  display: flex;
  gap: 2rem;
  background-color: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  height: calc(100vh - 200px); /* Adjust height to fit viewport */
  min-height: 600px; /* Minimum height */
  overflow: hidden;
}

.calendar-section {
  flex: 1.2;
  max-width: 400px;
  border-right: 1px solid #E5E7EB;
  padding-right: 2rem;
}

.appointment-main-content {
  flex: 2;
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure full height */
  position: relative; /* For proper child positioning */
}

.mode-selection {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2.5rem;
  padding: 0.5rem;
  gap: 0.75rem;
  background: rgba(139, 92, 246, 0.05);
  border-radius: 100px;
}

.mode-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 100px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: transparent;
  color: #6B46C1;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

.mode-button.active {
  background-color: #8B5CF6;
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.mode-button:hover:not(.active) {
  background-color: rgba(139, 92, 246, 0.1);
}

.mode-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

h2, h3 {
  color: #8B5CF6;
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-size: 16px;
}

.appointment-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 0.75rem; /* Slightly reduced from 1rem */
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.appointments-list {
  flex: 1;
  height: calc(100% - 4rem); /* Adjusted from previous calc(100vh - 280px) */
  overflow-y: auto;
  padding-right: 1rem;
  margin: 0; /* Remove the -1rem 0 0 0 margin */
}

/* Make the heading more compact */
.appointments-list h2 {
  margin-bottom: 1rem;
  padding-top: 0.5rem; /* Reduced from 1rem */
}

.appointment-content {
  display: flex;
  align-items: center;
}

.service-icon {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1rem;
  color: #8B5CF6;
}

.service-icon svg {
  width: 24px;
  height: 24px;
  color: #8B5CF6;
}

.appointment-details h3 {
  font-size: 1.2rem;
  color: #111827;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.appointment-details p {
  font-size: 0.9rem;
  color: #4B5563;
  margin: 0 0 0.25rem 0;
}

.price {
  color: #8B5CF6;
  font-weight: 600;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.pending {
  background-color: #F3F0FF;
  color: #8B5CF6;
}

.status.approved {
  background-color: #ECFDF5;
  color: #059669;
}

.status.pending.cancellation {
  background-color: #FEF2F2;
  color: #DC2626;
}

.appointment-actions {
  display: flex;
  gap: 0.75rem;
}

.appointment-actions button {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.update-button {
  background-color: #8B5CF6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
}

.update-button:hover {
  background-color: #7C3AED;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.update-button.disabled-update {
  background-color: #A78BFA;
  color: #F3F4F6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-button {
  background-color: white;
  color: #EF4444;
  border: 1px solid #EF4444;
}

.cancel-button:hover {
  background-color: #FEF2F2;
  transform: translateY(-2px);
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 2rem; /* Increased from 1rem to create more space */
  flex-grow: 1;
  padding-top: 1rem; /* Increased from 0.5rem */
  position: relative; /* Added to help with positioning */
  min-height: 500px; /* Added to ensure enough vertical space */
}

.services-heading {
  font-size: 16px;
  color: #8B5CF6;
  margin-bottom: 1rem;
  font-weight: 500;
  padding-top: 0; 
  margin-top: -20px
}

.service-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: .5rem;
}

.service-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 15px;
  transition: all 0.3s ease;
  background-color: #F3F4F6;
  margin-top: -15px;
}

.service-button {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
}

.service-icon {
  margin-bottom: 1rem;
}

.service-icon svg {
  width: 24px;
  height: 24px;
  color: #8B5CF6;
}

.service-price {
  position: absolute;
  bottom: 0.5rem;
  font-size: 0.8rem;
  color: #8B5CF6;
  font-weight: 600;
}

.service-option:hover {
  background-color: #C4B5FD;
}

.service-option.selected {
  border: 2px solid #8B5CF6;
  background-color: #C4B5FD;
}

.service-option p {
  margin-bottom: 1px;
  margin-top: 5px;
  font-size: 16px;
  color: #1F2937;
  text-align: center;
  font-weight: 600;
}

.service-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #8B5CF6;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.decrement-button {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background-color: #EF4444;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
}

.decrement-button:hover {
  background-color: #DC2626;
}

.time-slot-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.75rem;
}

.time-slot {
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background-color: #F3F4F6;
  color: #1F2937;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-slot:hover:not(.disabled) {
  background-color: #C4B5FD;
}

.time-slot.selected {
  background-color: #8B5CF6;
  color: white;
}

.time-slot.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button {
  width: 100%;
  min-height: 3.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: sticky; /* Changed to sticky */
  bottom: 0; /* Stick to bottom */
  margin-top: auto; /* Push to bottom */
  margin-bottom: 0; /* Removed bottom margin */
  z-index: 10; /* Ensure button stays on top */
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

.action-button:hover:not(:disabled)::before {
  opacity: 1;
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.action-button:disabled {
  background: #E5E7EB;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-button:disabled::before {
  display: none;
}

.action-button .icon {
  width: 1.25rem;
  height: 1.25rem;
  position: relative;
  z-index: 1;
}

.action-button span {
  position: relative;
  z-index: 1;
}

.custom-calendar {
  width: 100%;
  min-width: 350px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #8B5CF6;
  color: white;
}

.calendar-header h3 {
  font-weight: 600;
  color: white;
  margin-bottom: 0;
}

.calendar-nav-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 600;
  background-color: #F3F4F6;
  border-bottom: 1px solid #E5E7EB;
}

.calendar-weekdays span {
  padding: 0.5rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-days button {
  aspect-ratio: 1;
  border: none;
  background: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 50%;
  margin: 2px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-days button:hover:not(:disabled) {
  background-color: #F3F4F6;
  border: 2px solid #C4B5FD;
}

.calendar-days button.current-month {
  color: #1F2937;
}

.calendar-days button:not(.current-month) {
  color: #6B7280;
}

.calendar-days button.selected {
  background-color: #8B5CF6;
  border: 2px solid #8B5CF6;
  color: white;
}

.calendar-days button.selected:hover {
  background-color: #7C3AED;
  border-color: #7C3AED;
}

.calendar-days button.appointment-date {
  background-color: #C4B5FD;
  border: 2px solid #8B5CF6;
  color: #4C1D95;
}

.calendar-days button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.summary-content-wrapper {
  flex: 1;
  overflow-y: auto;
  margin: 1rem -2rem;
  padding: 0 2rem;
  position: relative;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #8B5CF6 #E5E7EB;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #E5E7EB;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #8B5CF6;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #7C3AED;
}

.summary-content {
  background-color: #f8f5ff;
  border-radius: 10px;
  padding: 1rem;
}

.summary-title {
  color: #8B5CF6;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: .3rem;
}

.selected-services {
  margin-bottom: 1.5rem;
}

.selected-services h4 {
  color: #4B5563;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.service-item {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.256);
  border: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.service-name-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.service-details {
  display: flex;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px dashed #E5E7EB;
}

.service-name {
  font-weight: 600;
  color: #1F2937;
  font-size: 1.1rem;
}

.service-duration {
  color: #6B7280;
  font-size: 0.9rem;
}

.service-quantity {
  font-weight: 500;
  color: #8B5CF6;
  background-color: #F3F4F6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.service-price {
  font-weight: 600;
  color: #8B5CF6;
  font-size: 1.1rem;
  margin-top: -120px;
}

.summary-divider {
  height: 1px;
  background-color: #bbbcbe;
  margin: 1.5rem 0;
}

.summary-totals .total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.highlight {
  color: #8B5CF6;
  font-size: 1.125rem;
}

.price-highlight {
  font-size: 1.25rem;
  color: #8B5CF6;
}

.appointment-details .detail-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #6B7280;
}

.detail-row .label {
  font-weight: 500;
  color: #374151;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.confirm-button,
.cancel-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.confirm-button {
  background-color: #10B981;
  color: white;
  border: none;
}

.confirm-button:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.cancel-button {
  background-color: white;
  color: #EF4444;
  border: 2px solid #EF4444;
}

.cancel-button:hover {
  background-color: #FEE2E2;
  transform: translateY(-1px);
}

.icon {
  width: 1rem;
  height: 1rem;
}

.no-services-message {
  color: #6B7280;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.confirmation-modal {
  width: 300px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: white;
  border-radius: 15px;
  padding: 2rem;
}

.confirmation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.confirmation-content p {
  color: #1F2937;
  font-size: 1.1rem;
  font-weight: 500;
}

.spinner {
  border: 4px solid rgba(139, 92, 246, 0.1);
  border-left-color: #8B5CF6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.check-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #10B981;
  display: flex;
  justify-content: center;
  align-items: center;
}

.check-icon::before {
  content: '\2714';
  color: white;
  font-size: 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.appointments-list {
  height: calc(100% - 4rem);
  overflow-y: auto;
  padding-right: 1rem;
}

/* Add new styles for treatments display */
.selected-treatments {
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid #E5E7EB;
}

.treatment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.25rem;
}

.treatment-quantity {
  color: #8B5CF6;
  font-weight: 500;
}

.treatment-price {
  margin-left: auto;
  color: #8B5CF6;
  font-weight: 600;
}

.treatment-list-modal {
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.treatments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.treatment-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #E5E7EB;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.treatment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #C4B5FD;
}

.treatment-card.selected {
  border-color: #8B5CF6;
  background-color: #F3F4F6;
  box-shadow: 0 0 0 2px #8B5CF6;
}

.treatment-icon-wrapper {
  width: 48px;
  height: 48px;
  background-color: #F3F4F6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.treatment-icon {
  width: 24px;
  height: 24px;
  color: #8B5CF6;
}

.treatment-content {
  flex: 1;
}

.treatment-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.treatment-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.treatment-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #8B5CF6;
}

.treatment-footer {
  display: flex;
  justify-content: flex-end;
}

.select-treatment-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #8B5CF6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.select-treatment-button:hover {
  background-color: #7C3AED;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #6B7280;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  background-color: white;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.quantity-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background-color: #8B5CF6;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-button:hover {
  background-color: #7C3AED;
}

.quantity {
  font-weight: 600;
  color: #1F2937;
  min-width: 20px;
  text-align: center;
}

.treatment-modal-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.confirm-button:disabled {
  background-color: #E5E7EB;
  cursor: not-allowed;
}

.confirm-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8B5CF6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

.confirm-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #ffffff;
}

.confirm-success svg {
  width: 24px;
  height: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.service-option {
  position: relative; 
}

.quantity-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #8B5CF6;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
}

.time-slots {
  margin-bottom: 2rem; /* Added more space before the button */
}

/* Added padding to ensure content doesn't get hidden behind sticky button */
.appointment-main-content {
  padding-bottom: 1rem; /* Reduced from 5rem */
}

@media (max-width: 1024px) {
  .scheduler-layout {
    flex-direction: column;
  }

  .calendar-section {
    max-width: 100%;
    border-right: none;
    border-bottom: 1px solid #E5E7EB;
    padding-right: 0;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }
}

@media (max-width: 1024px) {
  .appointments-list {
    height: calc(100vh - 350px); /* Adjusted calculation */
  }
  
  .scheduler-layout {
    height: auto;
    min-height: calc(100vh - 250px);
  }
}

@media (max-width: 768px) {
  .appointment-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .appointment-actions {
    margin-top: 1rem;
  }
}

@media (max-width: 480px) {
  .action-button {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
    min-height: 3rem;
  }
}

@media (max-width: 640px) {
  .treatments-grid {
    grid-template-columns: 1fr;
  }
  
  .treatment-card {
    padding: 1rem;
  }
}
</style>