<template>
  <main>
    <div class="dashboard-header">
      <h1>Dashboard <span class="text-accent">Overview</span></h1>
      <div class="period-controls">
        <select class="period-select">
          <option>Month to date</option>
        </select>
        <span class="compared-text">compared to</span>
        <select class="period-select">
          <option>Previous period</option>
        </select>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">Total Clients</div>
        <div class="metric-value">{{ totalPatients }}</div>
        <div :class="['percentage', clientPercentageChange > 0 ? 'increase' : 'decrease']">
          {{ clientPercentageChange > 0 ? '↑' : '↓' }} {{ Math.abs(clientPercentageChange) }}%
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-header">Total Revenue</div>
        <div class="metric-value">₱{{ formatPrice(calculateTotalRevenue()) }}</div>
        <div :class="['percentage', revenuePercentageChange > 0 ? 'increase' : 'decrease']">
          {{ revenuePercentageChange > 0 ? '↑' : '↓' }} {{ Math.abs(revenuePercentageChange) }}%
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-header">Approved Appointments</div>
        <div class="metric-value">{{ approvedAppointments.length }}</div>
        <div :class="['percentage', appointmentPercentageChange > 0 ? 'increase' : 'decrease']">
          {{ appointmentPercentageChange > 0 ? '↑' : '↓' }} {{ Math.abs(appointmentPercentageChange) }}%
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-header">Total Products</div>
        <div class="metric-value">{{ totalProducts }}</div>
        <div :class="['percentage', productPercentageChange > 0 ? 'increase' : 'decrease']">
          {{ productPercentageChange > 0 ? '↑' : '↓' }} {{ Math.abs(productPercentageChange) }}%
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Appointments per Day</h3>
          <select class="period-select">
            <option>Last 30 days</option>
          </select>
        </div>
        <canvas ref="appointmentChartRef"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>Daily Revenue</h3>
          <select class="period-select">
            <option>Last 7 days</option>
          </select>
        </div>
        <canvas ref="revenueChartRef"></canvas>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { database } from '../firebase';
import 'chartjs-adapter-moment';
import Chart from 'chart.js/auto';

const users = ref([]);
const products = ref([]);
const clients = ref([]);
const totalPatients = ref(0);
const appointments = ref([]);
const appointmentChartRef = ref(null);
const revenueChartRef = ref(null);
let appointmentChart = null;
let revenueChart = null;
const error = ref(null);

const totalProducts = computed(() => products.value.length);

const approvedAppointments = computed(() =>
  appointments.value.filter(appointment => appointment.status === 'approved')
);

const fetchProducts = async () => {
  try {
    const productsCollection = collection(database, 'products');
    const snapshot = await getDocs(productsCollection);
    products.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    error.value = 'Error loading products: ' + err.message;
    console.error(error.value);
  }
};

const fetchRecentUsers = async () => {
  try {
    const usersCollection = collection(database, 'users');
    const q = query(usersCollection, orderBy('createdAt', 'desc'), limit(5));
    const snapshot = await getDocs(q);
    users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    error.value = 'Error loading users: ' + err.message;
    console.error(error.value);
  }
};

const fetchClients = async () => {
  try {
    const q = query(collection(database, 'users'), where('role', '==', 'client'));
    const querySnapshot = await getDocs(q);

    clients.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastVisit: doc.data().lastVisit instanceof Timestamp ? doc.data().lastVisit : Timestamp.fromDate(new Date(doc.data().lastVisit)),
    }));

    totalPatients.value = clients.value.length;
  } catch (err) {
    console.error("Error fetching clients:", err);
    error.value = 'Failed to fetch client profiles. Please try again later.';
  }
};

const fetchAppointments = async () => {
  try {
    const q = query(collection(database, 'appointments'), orderBy('date'));
    const querySnapshot = await getDocs(q);
    appointments.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date)),
        price: parseFloat(data.price) || 0,
      };
    });
    createAppointmentChart();
    createRevenueChart();
  } catch (err) {
    console.error("Error fetching appointments:", err);
    error.value = 'Failed to fetch appointments. Please try again later.';
  }
};

const createAppointmentChart = () => {
  const ctx = appointmentChartRef.value.getContext('2d');
  
  // Process appointment data by date
  const appointmentsByDate = {};
  appointments.value.forEach(appointment => {
    const date = appointment.date.toDate().toISOString().split('T')[0];
    appointmentsByDate[date] = (appointmentsByDate[date] || 0) + 1;
  });

  // Sort dates and get last 30 days
  const sortedDates = Object.keys(appointmentsByDate).sort();
  const last30Days = sortedDates.slice(-30);
  const appointmentCounts = last30Days.map(date => appointmentsByDate[date] || 0);

  // Generate an array of colors
  const colors = [
    'rgba(124, 58, 237, 0.8)',   // Purple (original color)
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(16, 185, 129, 0.8)',   // Green
    'rgba(245, 158, 11, 0.8)',   // Amber
    'rgba(239, 68, 68, 0.8)',    // Red
  ];

  if (appointmentChart) {
    appointmentChart.destroy();
  }

  appointmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: last30Days,
      datasets: [{
        label: 'Appointments',
        data: appointmentCounts,
        backgroundColor: last30Days.map((_, index) => colors[index % colors.length]),
        borderColor: last30Days.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [8, 4]
          },
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgb(17, 24, 39)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'normal'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: (context) => {
              return `Appointments: ${context.parsed.y}`;
            }
          }
        }
      }
    }
  });
};

const createRevenueChart = () => {
  const ctx = revenueChartRef.value.getContext('2d');
  const revenueData = processRevenueData();

  if (revenueChart) {
    revenueChart.destroy();
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
  gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: revenueData.labels,
      datasets: [{
        label: 'Daily Revenue',
        data: revenueData.data,
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(124, 58, 237)',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          max: Math.max(...revenueData.data) * 1.2,
          grid: {
            borderDash: [8, 4]
          },
          ticks: {
            font: {
              size: 12
            },
            callback: function(value) {
              return '₱' + value.toLocaleString();
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgb(17, 24, 39)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'normal'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: (context) => {
              return `Revenue: ₱${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
};

const processRevenueData = () => {
  const dailyRevenue = {};

  appointments.value.forEach(appointment => {
    const date = appointment.date.toDate().toISOString().split('T')[0];
    const revenue = appointment.price || 0;
    dailyRevenue[date] = (dailyRevenue[date] || 0) + revenue;
  });

  const sortedDates = Object.keys(dailyRevenue).sort();

  return {
    labels: sortedDates,
    data: sortedDates.map(date => dailyRevenue[date])
  };
};

const calculateTotalRevenue = () => {
  return appointments.value.reduce((total, appointment) => {
    return total + (appointment.price || 0);
  }, 0);
};

const formatPrice = (price) => {
  return price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// New computed properties for percentage changes
const clientPercentageChange = computed(() => {
  const previousPeriodClients = clients.value.filter(client => {
    const registrationDate = client.registrationDate instanceof Timestamp 
      ? client.registrationDate.toDate() 
      : new Date(client.registrationDate);
    return registrationDate < new Date(new Date().setMonth(new Date().getMonth() - 1));
  }).length;
  
  const currentClients = clients.value.length;
  return previousPeriodClients > 0 
    ? ((currentClients - previousPeriodClients) / previousPeriodClients * 100).toFixed(1)
    : 0;
});

const appointmentPercentageChange = computed(() => {
  const previousPeriodAppointments = appointments.value.filter(apt => {
    const aptDate = apt.date instanceof Timestamp ? apt.date.toDate() : new Date(apt.date);
    return aptDate < new Date(new Date().setMonth(new Date().getMonth() - 1));
  }).length;
  
  const currentAppointments = approvedAppointments.value.length;
  return previousPeriodAppointments > 0 
    ? ((currentAppointments - previousPeriodAppointments) / previousPeriodAppointments * 100).toFixed(1)
    : 0;
});

const revenuePercentageChange = computed(() => {
  const currentRevenue = calculateTotalRevenue();
  const previousPeriodRevenue = appointments.value
    .filter(apt => {
      const aptDate = apt.date instanceof Timestamp ? apt.date.toDate() : new Date(apt.date);
      return aptDate < new Date(new Date().setMonth(new Date().getMonth() - 1));
    })
    .reduce((total, apt) => total + (apt.price || 0), 0);

  return previousPeriodRevenue > 0
    ? ((currentRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1)
    : 0;
});

const productPercentageChange = computed(() => {
  // Assuming you have a way to track product changes over time
  // For now, we'll return a static value
  return -3.2;
});

onMounted(() => {
  fetchAppointments();
  fetchRecentUsers();
  fetchProducts();
  fetchClients();
});
</script>

<style scoped>
main {
  background: white;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-top: -10px;
  margin-bottom: 20px;
}

.text-accent {
  color: #6366f1;
}

.period-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: -10px;
  margin-bottom: 20px;
}

.compared-text {
  color: #64748b;
  font-size: 0.875rem;
}

.period-select {
  padding: 0.375rem 1.75rem 0.375rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #475569;
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.metric-header {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.metric-value {
  color: #0f172a;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.percentage {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.increase {
  color: #16a34a;
  background-color: #f0fdf4;
}

.decrease {
  color: #dc2626;
  background-color: #fef2f2;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  min-height: 400px;
  max-height: 400px;
}

.chart-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  height: 110%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 600;
}

.chart-card canvas {
  flex: 1;
  height: 300px !important;
  max-height: 300px !important;
  width: 100% !important;
}

@media (max-width: 1280px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    height: 800px;
  }
}

@media (max-width: 640px) {
  main {
    padding: 0.75rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .period-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .period-select {
    width: 100%;
  }
  
  .charts-grid {
    height: auto;
    min-height: 800px;
  }
}
</style>