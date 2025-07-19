// y2k-drive-player/server/src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');
const musicRoutes = require('./routes/musicRoutes'); // Import your music routes

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
// Basic Test Route (unprotected)
app.get('/', (req, res) => {
    res.send('Drive Player Backend is running! (Unprotected)');
});

// Protected Test Route (still useful for verifying auth middleware)
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'You accessed a protected route!',
        user: {
            uid: req.user.uid,
            email: req.user.email,
            name: req.user.name || 'N/A'
        }
    });
});

// Use music routes - ALL routes within musicRoutes will now automatically be
// protected by authMiddleware if you include it in musicRoutes.js as done above.
app.use('/api/music', musicRoutes); // This mounts your music-related routes

module.exports = app;