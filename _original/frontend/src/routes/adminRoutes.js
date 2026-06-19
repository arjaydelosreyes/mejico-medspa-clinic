import AdminDashboard from '../components/AdminDashboard.vue';
import AdminProducts from '../components/AdminProducts.vue';
import AdminProfiles from '../components/AdminProfiles.vue';
import AdminInventory from '../components/AdminInventory.vue';
import AdminServices from '../components/AdminServices.vue';
import AdminTreatments from '../components/AdminTreatments.vue';
import AdminTreatmentLists from '../components/AdminTreatmentLists.vue';
import Clients from '../components/Clients.vue';
import AdminAppointments from '../components/AdminAppointments.vue';
import AdminCalendar from '../components/AdminCalendar.vue';
import AdminProductManage from '../components/AdminProductManage.vue';
import AdminAppointmentLists from '../components/AdminAppointmentLists.vue';

const adminMeta = { requiresAuth: true, requiresAdmin: true };

export const adminRoutes = [
  { 
    path: '/admin-dashboard', 
    name: 'AdminDashboard', 
    component: AdminDashboard, 
    meta: adminMeta 
  },
  { 
    path: '/admin/products', 
    name: 'AdminProducts',
    component: AdminProducts, 
    meta: adminMeta 
  },
  { 
    path: '/admin/inventory', 
    name: 'AdminInventory',
    component: AdminInventory, 
    meta: adminMeta 
  },
  { 
    path: '/admin/services', 
    name: 'AdminServices',
    component: AdminServices, 
    meta: adminMeta 
  },
  { 
    path: '/admin/treatments', 
    name: 'AdminTreatments',
    component: AdminTreatments, 
    meta: adminMeta 
  },
  { 
    path: '/admin/treatmentlists', 
    name: 'AdminTreatmentLists',
    component: AdminTreatmentLists, 
    meta: adminMeta 
  },
  { 
    path: '/admin/clients', 
    name: 'Clients',
    component: Clients, 
    meta: adminMeta 
  },
  { 
    path: '/admin/profiles', 
    name: 'AdminProfiles',
    component: AdminProfiles, 
    meta: adminMeta 
  },
  { 
    path: '/admin/appointments', 
    name: 'AdminAppointments',
    component: AdminAppointments, 
    meta: adminMeta 
  },
  { 
    path: '/admin/calendar', 
    name: 'AdminCalendar',
    component: AdminCalendar, 
    meta: adminMeta 
  },
  { 
    path: '/admin/productmanage', 
    name: 'AdminProductManage',
    component: AdminProductManage, 
    meta: adminMeta 
  },
  { 
    path: '/admin/appointmentlists', 
    name: 'AdminAppointmentLists',
    component: AdminAppointmentLists, 
    meta: adminMeta 
  }
];