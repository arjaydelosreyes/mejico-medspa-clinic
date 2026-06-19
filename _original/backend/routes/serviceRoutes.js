const express = require('express');
const router = express.Router();
const { admin, database } = require('../config/firebase');

// Get all services
router.get('/', async (req, res) => {
    try {
        const snapshot = await database.collection('services').get();
        const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services', details: error.message });
    }
});

// Create a new service
router.post('/', async (req, res) => {
    const { name, description, price, availability } = req.body;

    if (!name || !description || price === undefined || !availability) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const serviceRef = await database.collection('services').add({
            name,
            description,
            price,
            availability,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: 'Service added successfully', id: serviceRef.id });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: 'Failed to add service', details: error.message });
    }
});

// Update a service
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, availability } = req.body;
    try {
        await database.collection('services').doc(id).update({ name, description, price, availability });
        res.status(200).json({ message: 'Service updated successfully' });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service', details: error.message });
    }
});

// Delete a service
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await database.collection('services').doc(id).delete();
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service', details: error.message });
    }
});

module.exports = router;