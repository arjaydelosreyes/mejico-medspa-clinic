<template>
  <div class="calendar-wrapper">
    <Navbar />
    
    <div class="calendar-layout">
      <!-- Appointments Panel -->
      <div class="appointments-container">
        <h2 class="appointments-title">Your Scheduled Appointments</h2>
        <p class="appointments-subtitle">{{ userAppointments.length }} upcoming</p>
        
        <div class="appointments-list">
          <div v-for="appointment in userAppointments" :key="appointment.id" class="appointment-card">
            <div class="appointment-header">
              <span class="service-tag" :style="{ backgroundColor: getServiceTagColor(appointment.service) }">{{ appointment.service }}</span>
              <span class="appointment-time">{{ formatTime(appointment.time) }}</span>
            </div>
            <h3 class="appointment-date">{{ formatDate(appointment.date) }}</h3>
            <p class="appointment-duration">Duration: {{ appointment.duration }} min</p>
            <div class="appointment-actions">
              <div class="status-badge approved">
                <CheckCircleIcon class="h-3.5 w-3.5" />
                Approved
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar -->
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="nav-button" @click="previousMonth">
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <div class="month-year">
            <h2 class="month">{{ currentMonthName }}</h2>
            <span class="year">{{ currentYear }}</span>
          </div>
          <button class="nav-button" @click="nextMonth">
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>

        <div class="weekdays-header">
          <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
        </div>

        <div class="calendar-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'current-month': day.currentMonth,
              'other-month': !day.currentMonth,
              'selected': isSelected(day.date),
              'today': isToday(day.date),
              'has-appointment': hasAppointments(day.date)
            }"
            @click="selectDate(day.date)"
          >
            <span class="day-number">{{ day.dayNumber }}</span>
            <div class="appointment-labels">
              <div 
                v-if="hasAppointments(day.date)" 
                class="appointment-label"
                :style="{ backgroundColor: getAppointmentColor(day.date) }"
              >
                {{ truncateText(getAppointmentLabel(day.date), 8) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, ClockIcon, XIcon } from 'lucide-vue-next'
import Navbar from './Navbar.vue'
import FooterComponent from './Footer.vue'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { database } from '../firebase' // Ensure you have this firebase config file

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const currentDate = ref(new Date())
const selectedDate = ref(null)
const userAppointments = ref([])

// Fetch approved appointments from Firestore
onMounted(() => {
  const appointmentsRef = collection(database, 'appointments')
  const q = query(
    appointmentsRef,
    where('status', '==', 'approved')
  )
  
  onSnapshot(q, (snapshot) => {
    userAppointments.value = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date, // Assuming date is stored as string "YYYY-MM-DD"
        time: data.time, // Assuming time is stored as string "HH:mm"
        service: Array.isArray(data.services) ? data.services[0] : (data.service || 'Appointment'),
        duration: data.duration || 60,
        color: data.color || '#8B5CF6'
      }
    })
  })
})

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...'
}

const getAppointmentColor = (date) => {
  const appointment = userAppointments.value.find(apt => 
    apt.date === formatDateForComparison(date)
  )
  return appointment ? getServiceTagColor(appointment.service) : '#8B5CF6'
}

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate.value)
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayIndex = firstDayOfMonth.getDay()
  
  const days = []
  
  const prevMonth = new Date(year, month, 0)
  const prevMonthDays = prevMonth.getDate()
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      dayNumber: prevMonthDays - i,
      currentMonth: false
    })
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      dayNumber: i,
      currentMonth: true
    })
  }
  
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      dayNumber: i,
      currentMonth: false
    })
  }
  
  return days
})

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const selectDate = (date) => {
  selectedDate.value = date
}

const isSelected = (date) => {
  if (!selectedDate.value) return false
  return date.toDateString() === selectedDate.value.toDateString()
}

const isToday = (date) => {
  return date.toDateString() === new Date().toDateString()
}

const formatDateForComparison = (date) => {
  return date.toISOString().split('T')[0]
}

const hasAppointments = (date) => {
  return userAppointments.value.some(apt => apt.date === formatDateForComparison(date))
}

const getAppointmentLabel = (date) => {
  const appointment = userAppointments.value.find(apt => apt.date === formatDateForComparison(date))
  return appointment ? appointment.service : ''
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch (error) {
    console.error('Error formatting time:', error)
    return timeStr
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateStr
  }
}

const getServiceTagColor = (service) => {
  const colors = {
    'Nail Care': '#8B5CF6', // Purple
    'Check Up': '#EC4899', // Pink
    'Checkup': '#EC4899', // Pink (alternative spelling)
    'Massage': '#10B981', // Green
    'Hair Care': '#3B82F6', // Blue
    'Facial Treatment': '#F59E0B', // Amber
    'Spa Treatment': '#14B8A6', // Teal
    'Dental Care': '#EF4444', // Red
    'Eye Exam': '#6366F1'  // Indigo
  }
  return colors[service] || '#8B5CF6' // Default to purple if service not found
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.calendar-wrapper {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ff 100%);
}

.calendar-layout {
  max-width: 1600px; /* Increased from 1400px */
  margin: 2rem auto;
  padding: 0 4rem; /* Increased padding for better spacing */
  display: grid;
  grid-template-columns: 380px 1fr; /* Slightly wider sidebar */
  gap: 3rem; /* Increased gap between columns */
  align-items: start;
}

.appointments-container {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(79, 61, 124, 0.12);
  margin-top: 30px;
  margin-left: 20px;
  height: 965px;
  display: flex;
  flex-direction: column;
  margin-top: 100px;
}

.appointments-title {
  color: #4F3D7C;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.appointments-subtitle {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.appointments-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 61, 124, 0.3) transparent;
  padding-right: 0.5rem;
}

.appointments-list::-webkit-scrollbar {
  width: 6px;
}

.appointments-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.appointments-list::-webkit-scrollbar-thumb {
  background-color: rgba(79, 61, 124, 0.3);
  border-radius: 3px;
}

.appointments-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(79, 61, 124, 0.5);
}

.appointment-card {
  background: #F8F7FF;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(79, 61, 124, 0.08);
  margin-bottom: 0.75rem;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.service-tag {
  padding: 0.35rem 0.75rem;
  border-radius: 0.75rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
}


.appointment-time {
  color: #4F3D7C;
  font-weight: 500;
  font-size: 0.875rem;
}

.appointment-date {
  color: #1F2937;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.appointment-duration {
  color: #6B7280;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.reschedule {
  background: #F3F0FF;
  color: #4F3D7C;
}

.action-btn.cancel {
  background: #FEE2E2;
  color: #DC2626;
}

.calendar-container {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem; /* Increased padding */
  box-shadow: 0 10px 30px rgba(79, 61, 124, 0.12);
  width: 100%;
  max-width: 1000px; /* Increased from 850px */
  margin: 100px auto 0; /* Added auto horizontal margins */
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.month-year {
  text-align: center;
}

.month {
  color: #4F3D7C;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.year {
  color: #6B7280;
  font-size: 1rem;
}

.nav-button {
  background: #F3F0FF;
  border: none;
  border-radius: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F3D7C;
  cursor: pointer;
  transition: all 0.2s ease;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.75rem;
}

.weekday {
  color: #6B7280;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.35rem;
}

.calendar-day {
  aspect-ratio: 1;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgba(79, 61, 124, 0.08);
  padding: 0.35rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  transition: all 0.2s ease;
  position: relative;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1F2937;
}

.other-month {
  color: #D1D5DB;
  background: #FAFAFA;
}

.other-month .day-number {
  color: #D1D5DB;
}

.selected {
  background: #4F3D7C;
  color: white;
  border-color: #4F3D7C;
}

.selected .day-number {
  color: white;
}

.today {
  border: 2px solid #4F3D7C;
  font-weight: 600;
}

.appointment-labels {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-top: auto;
}

.appointment-label {
  font-size: 0.6rem;
  padding: 0.15rem 0.25rem;
  border-radius: 0.25rem;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 1;
  max-width: 100%;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.approved {
  background: #ECFDF5;
  color: #059669;
}

@media (max-width: 1400px) {
  .calendar-layout {
    grid-template-columns: 1fr;
    max-width: 1000px;
    padding: 0 2rem;
  }
}

@media (max-width: 768px) {
  .calendar-layout {
    padding: 0 1rem;
    margin-top: 2rem;
  }
}

@media (max-width: 1200px) {
  .calendar-layout {
    grid-template-columns: 1fr;
    max-width: 850px;
  }

  .appointments-container {
    order: 2;
    height: auto;
    max-height: 500px;
  }

  .calendar-container {
    order: 1;
  }
}

@media (max-width: 768px) {
  .calendar-layout {
    padding: 0 1rem;
    margin-top: 100px;
  }

  .calendar-container,
  .appointments-container {
    padding: 1rem;
  }

  .month {
    font-size: 1.25rem;
  }

  .calendar-day {
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .calendar-layout {
    margin-top: 80px;
  }

  .calendar-container,
  .appointments-container {
    padding: 0.75rem;
  }

  .month {
    font-size: 1.125rem;
  }

  .weekday {
    font-size: 0.7rem;
  }

  .calendar-day {
    padding: 0.2rem;
  }

  .day-number {
    font-size: 0.7rem;
  }

  .appointment-label {
    font-size: 0.55rem;
    padding: 0.1rem 0.2rem;
  }
}
</style>