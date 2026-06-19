<!-- src/views/Analytics.vue -->
<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-6">Analytics Dashboard</h2>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">Total Patients</h3>
        <p class="text-3xl font-bold text-purple-600">{{ totalPatients }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">Monthly Revenue</h3>
        <p class="text-3xl font-bold text-purple-600">₱{{ monthlyRevenue }}M</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-sm text-gray-500 mb-2">Treatment Success</h3>
        <p class="text-3xl font-bold text-purple-600">{{ treatmentSuccess }}%</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Patient Growth</h3>
        <!-- Placeholder for chart -->
        <div class="h-48 bg-gray-200 rounded"></div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">AI Treatment Recommendations</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="treatment in aiTreatments" :key="treatment.name" class="flex items-center">
            <span class="w-3 h-3 rounded-full" :class="treatment.color"></span>
            <span class="text-sm ml-2">{{ treatment.name }}: {{ treatment.match }}% Match</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Users -->
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Recent Users</h3>
      <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
      <table class="w-full">
        <thead>
          <tr class="text-left text-gray-500">
            <th class="pb-2">Email</th>
            <th class="pb-2">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="py-2">{{ user.email }}</td>
            <td>{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { database } from '../firebase'; // Adjust the import path based on your project structure

const users = ref([]);
const error = ref(null);
const totalPatients = ref(2547);
const monthlyRevenue = ref(4.8);
const treatmentSuccess = ref(94.2);

const aiTreatments = ref([
  { name: 'Treatment A', match: 85, color: 'bg-purple-500' },
  { name: 'Treatment B', match: 65, color: 'bg-teal-500' },
  { name: 'Treatment C', match: 45, color: 'bg-teal-500' },
]);

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

onMounted(() => {
  fetchRecentUsers();
});
</script>