<template>
  <div class="admin-approval">
      <h2>Cancellation Requests</h2>
      <ul>
          <li v-for="request in cancellationRequests" :key="request.id">
              Appointment ID: {{ request.appointmentId }} - Status: {{ request.status }}
              <button @click="approveCancellation(request.id)">Approve</button>
              <button @click="rejectCancellation(request.id)">Reject</button>
          </li>
      </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { database } from '../firebase'; // Adjust the path as needed

const cancellationRequests = ref([]);

// Fetch cancellation requests on mount
onMounted(() => {
  fetchCancellationRequests();
});

const fetchCancellationRequests = async () => {
  try {
      const querySnapshot = await getDocs(collection(database, 'cancellation_requests'));
      cancellationRequests.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
      console.error('Error fetching cancellation requests:', error);
  }
};

const approveCancellation = async (requestId) => {
  // Update appointment status in appointments collection
  const appointmentRef = doc(database, 'appointments', requestId);
  await updateDoc(appointmentRef, { status: 'cancelled' }); // or however you track status

  // Remove cancellation request after approval
  await deleteDoc(doc(database, 'cancellation_requests', requestId));
  alert('Cancellation approved!');
  fetchCancellationRequests(); // Refresh the list
};

const rejectCancellation = async (requestId) => {
  // Remove cancellation request upon rejection
  await deleteDoc(doc(database, 'cancellation_requests', requestId));
  alert('Cancellation rejected!');
  fetchCancellationRequests(); // Refresh the list
};
</script>

<style scoped>
.admin-approval {
  margin: 20px;
}

.admin-approval ul {
  list-style-type: none;
  padding: 0;
}

.admin-approval li {
  margin: 10px 0;
}
</style>