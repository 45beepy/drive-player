// y2k-drive-player/server/src/config/firebaseConfig.js
const admin = require('firebase-admin');

// Load your service account key from the JSON file
// Ensure the path is correct relative to where your server.js (or app.js) runs.
// If you put firebase-admin-sdk.json directly in 'server' directory, use:
const serviceAccount = require('../../firebase-admin-sdk.json'); // Adjust path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
  // You might need to add a databaseURL if you're using Realtime Database
  // databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});

console.log('Firebase Admin SDK initialized successfully.');

module.exports = admin;