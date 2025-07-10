// server.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Import cors

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 or whatever is set in .env

// Middleware
app.use(cors()); // Enable CORS for all routes (we'll configure this more securely later)
app.use(express.json()); // Enable parsing of JSON request bodies

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Drive Player Backend is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});