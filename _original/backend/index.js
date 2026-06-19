const database = require('./config/firebase'); // Firestore setup
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Create a new appointment
app.post('/api/appointments', async (req, res) => {
    const { service, date, time, price } = req.body;

    console.log('Received appointment data:', req.body);

    if (!service || !date || !time || !price) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const appointmentRef = await database.collection('appointments').add({
            service,
            date,
            time,
            price,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Appointment scheduled with ID: ${appointmentRef.id}`);
        res.status(200).json({
            message: 'Appointment scheduled successfully',
            id: appointmentRef.id,
        });
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        res.status(500).json({
            error: 'Failed to schedule appointment',
            details: error.message,
        });
    }
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const appointmentsSnapshot = await database.collection('appointments').get();

        if (appointmentsSnapshot.empty) {
            console.log('No appointments found.');
            return res.status(404).json({ message: 'No appointments available.' });
        }

        const appointments = appointmentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to retrieve appointments' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});