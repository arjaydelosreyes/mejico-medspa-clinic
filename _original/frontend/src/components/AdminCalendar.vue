<template>
  <div class="admincalendar-wrapper">
    <div class="admincalendar-container">
      <h2 class="admincalendar-title">Appointment Calendar</h2>
      
      <div class="admincalendar-header">
        <button class="admincalendar-nav-button" @click="previousMonth">
          <ChevronLeftIcon class="nav-icon" />
        </button>
        <div class="admincalendar-month-year">
          <h2 class="admincalendar-month">{{ currentMonthName }}</h2>
          <span class="admincalendar-year">{{ currentYear }}</span>
        </div>
        <button class="admincalendar-nav-button" @click="nextMonth">
          <ChevronRightIcon class="nav-icon" />
        </button>
      </div>

      <div class="admincalendar-weekdays-header">
        <span v-for="day in weekDays" :key="day" class="admincalendar-weekday">{{ day }}</span>
      </div>

      <div class="admincalendar-grid custom-scrollbar">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="admincalendar-day"
          :class="{
            'admincalendar-current-month': day.currentMonth,
            'admincalendar-other-month': !day.currentMonth,
            'admincalendar-selected': isSelected(day.date),
            'admincalendar-today': isToday(day.date)
          }"
          @click="selectDate(day.date)"
        >
          <div class="admincalendar-day-header">
            <span class="admincalendar-day-number">{{ day.dayNumber }}</span>
            <span v-if="getAppointmentsForDate(day.date).length > 0" class="admincalendar-appointment-count">
              {{ getAppointmentsForDate(day.date).length }}
            </span>
          </div>
          <div class="admincalendar-appointment-services custom-scrollbar">
            <div 
              v-for="appointment in getAppointmentsForDate(day.date)"
              :key="appointment.id"
              class="admincalendar-service-item"
            >
              <div 
                class="service-container"
                :class="appointment.status"
              >
                <span class="service-text">{{ appointment.services?.[0] || 'No service' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Appointment Details Modal -->
    <Teleport to="body">
      <div v-if="selectedDate" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <CalendarIcon class="icon" />
              <h3>Appointments for {{ formatDate(selectedDate) }}</h3>
            </div>
            <button class="close-button" @click="closeModal" aria-label="Close modal">
              <XIcon />
            </button>
          </div>

          <div class="modal-content custom-scrollbar">
            <!-- No appointments message -->
            <div v-if="selectedDateAppointments.length === 0" class="empty-state">
              <CalendarXIcon class="empty-icon" />
              <p>No appointments scheduled for this date</p>
            </div>

            <!-- Enhanced Appointments list -->
            <div v-else class="appointments-list">
              <div 
                v-for="appointment in selectedDateAppointments" 
                :key="appointment.id"
                class="appointment-card"
              >
                <div class="appointment-header">
                  <div class="time-badge">
                    <ClockIcon class="time-icon" />
                    {{ formatTime(appointment.time) }}
                  </div>
                  <div :class="['status-badge', appointment.status]">
                    {{ appointment.status }}
                  </div>
                </div>

                <div class="appointment-body">
                  <div class="detail-group">
                    <label>
                      <ScissorsIcon class="detail-icon" />
                      Services
                    </label>
                    <div class="services">
                      <span 
                        v-for="(service, index) in (appointment.services || [])" 
                        :key="index"
                        class="service-tag"
                      >
                        {{ service }}
                      </span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <label>
                      <MailIcon class="detail-icon" />
                      Email
                    </label>
                    <span>{{ appointment.userEmail }}</span>
                  </div>

                  <div class="detail-group">
                    <label>
                      <WalletIcon class="detail-icon" />
                      Price
                    </label>
                    <span class="price">₱{{ appointment.price }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="close-modal-button" @click="closeModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { database } from '../firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { 
  CalendarIcon, 
  XIcon, 
  ClockIcon, 
  MailIcon, 
  WalletIcon,
  ScissorsIcon,
  CalendarXIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next';

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const currentDate = ref(new Date());
const selectedDate = ref(null);
const appointments = ref([]);

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate.value);
});

const currentYear = computed(() => {
  return currentDate.value.getFullYear();
});

const selectedDateAppointments = computed(() => {
  if (!selectedDate.value) return [];
  return getAppointmentsForDate(selectedDate.value);
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Adjust to start week on Monday
  
  const days = [];
  
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      dayNumber: prevMonthDays - i,
      currentMonth: false
    });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      dayNumber: i,
      currentMonth: true
    });
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      dayNumber: i,
      currentMonth: false
    });
  }
  
  return days;
});

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const isSelected = (date) => {
  return selectedDate.value && date.toDateString() === selectedDate.value.toDateString();
};

const isToday = (date) => {
  return date.toDateString() === new Date().toDateString();
};

const getAppointmentsForDate = (date) => {
  return appointments.value.filter(apt => {
    const aptDate = apt.date.toDate().toDateString();
    const compareDate = date.toDateString();
    return aptDate === compareDate;
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date instanceof Date ? date : date.toDate());
};

const fetchAppointments = async () => {
  try {
    const querySnapshot = await getDocs(collection(database, 'appointments'));
    appointments.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
        status: data.status || 'pending',
        services: Array.isArray(data.services) ? data.services : [],
      };
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
  }
};

const closeModal = () => {
  selectedDate.value = null;
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
.admincalendar-wrapper {
  font-family: 'Poppins', sans-serif;
  height: 650px;
  background-color: #f8fafc;
  overflow: hidden;
}

.admincalendar-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.admincalendar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  text-align: left;
  margin-bottom: 1.5rem;
}

.admincalendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.admincalendar-month-year {
  text-align: center;
}

.admincalendar-month {
  font-size: 28px;
  font-weight: 700;
  color: #4F3D7C;
  margin: 0;
}

.admincalendar-year {
  font-size: 16px;
  color: #6B7280;
}

.admincalendar-nav-button {
  background: #F3F0FF;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F3D7C;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.admincalendar-nav-button:hover {
  background: #E9E3FF;
}

.nav-icon {
  width: 24px;
  height: 24px;
}

.admincalendar-weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.admincalendar-weekday {
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
}

.admincalendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.admincalendar-day {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 8px;
  min-height: 120px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}

.admincalendar-day:hover {
  background: #F9FAFB;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admincalendar-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.admincalendar-day-number {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.admincalendar-appointment-count {
  background-color: #4F3D7C;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 600;
}

.admincalendar-other-month {
  opacity: 0.5;
}

.admincalendar-selected {
  background: #F3F0FF;
  border-color: #4F3D7C;
}

.admincalendar-today {
  background: #E9E3FF;
  font-weight: bold;
}

.admincalendar-appointment-services {
  display: flex;
  flex-direction:
column;
  gap: 4px;
  max-height: calc(100% - 32px);
  overflow-y: auto;
  padding-right: 4px;
}

.admincalendar-service-item {
  margin: 2px 0;
}

.service-container {
  border-radius: 4px;
  padding: 4px 8px;
  width: 100%;
}

.service-text {
  font-size: 12px;
  color: #374151;
  line-height: 1.2;
}

.service-container.pending {
  background-color: #FEF3C7;
  border-left: 3px solid #F59E0B;
}

.service-container.approved {
  background-color: #D1FAE5;
  border-left: 3px solid #10B981;
}

.service-container.cancelled {
  background-color: #FEE2E2;
  border-left: 3px solid #EF4444;
}

/* Enhanced Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  border-radius: 16px;
  width: 90%;
  max-width: 520px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(79, 61, 124, 0.1);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #4F3D7C, #6d4aa5);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.icon {
  width: 24px;
  height: 24px;
  color: white;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 8px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  color: #6b7280;
  padding: 40px 0;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #9CA3AF;
  margin-bottom: 16px;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.appointment-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.appointment-header {
  background: #f3f4f6;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-badge {
  background: #4F3D7C;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-icon {
  width: 16px;
  height: 16px;
}

.status-badge {
  font-size: 0.875rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge.approved {
  background: #f0fdf4;
  color: #15803d;
}

.status-badge.cancelled {
  background: #fef2f2;
  color: #b91c1c;
}

.appointment-body {
  padding: 20px;
}

.detail-group {
  margin-bottom: 16px;
}

.detail-group:last-child {
  margin-bottom: 0;
}

.detail-group label {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.detail-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.services {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.service-tag {
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  color: #4F3D7C;
}

.price {
  font-weight: 600;
  color: #4F3D7C;
  font-size: 1.1rem;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.close-modal-button {
  width: 100%;
  padding: 12px;
  background: #4F3D7C;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-modal-button:hover {
  background: #3D2E63;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #664ba8;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #664ba8;
}

@media (max-width: 640px) {
  .modal {
    width: 95%;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 16px;
  }

  .appointment-header,
  .appointment-body {
    padding: 16px;
  }
}
</style>

