// src/services/adminService.js
import { database, collection, getDocs } from '../firebase';

export const getClients = async () => {
  try {
    const usersCollection = collection(database, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const usersList = userSnapshot.docs.map(doc => doc.data());
    return usersList;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};