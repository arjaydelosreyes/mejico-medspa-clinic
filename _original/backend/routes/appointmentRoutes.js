const express = require('express');
const router = express.Router();
const { admin, database } = require('../config/firebase');

// Get all appointments
router.get('/', async (req, res) => {
    try {
        const appointmentsSnapshot = await database.collection('appointments').get();
        
        if (appointmentsSnapshot.empty) {
            return res.status(404).json({ message: 'No appointments available.' });
        }
        
        const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(appointments);
    } catch (error) {
        console.error('Error retrieving appointments:', error);
        res.status(500).json({ error: 'Failed to retrieve appointments', details: error.message });
    }
});

// Create a new appointment
router.post('/', async (req, res) => {
    const { service, date, time, price } = req.body;

    if (!service || !date || !time || !price) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const appointmentRef = await database.collection('appointments').add({
            service,
            date,
            time,
            price,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: 'Appointment scheduled successfully', id: appointmentRef.id });
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        res.status(500).json({ error: 'Failed to schedule appointment', details: error.message });
    }
});

// Update an appointment
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { service, date, time, price } = req.body;

    if (!service || !date || !time || !price) {
        return res.status(400).json({ error: 'All fields are required for updating the appointment.' });
    }

    try {
        await database.collection('appointments').doc(id).update({
            service,
            date,
            time,
            price,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: 'Appointment updated successfully' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Failed to update appointment', details: error.message });
    }
});

// Delete an appointment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await database.collection('appointments').doc(id).delete();
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Failed to delete appointment', details: error.message });
    }
});

module.exports = router;