// y2k-drive-player/server/src/middleware/authMiddleware.js
const admin = require('../config/firebaseConfig'); // Import the initialized Firebase Admin SDK

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided or invalid format.');
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach the decoded token (user info) to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error.message);
    if (error.code === 'auth/id-token-expired') {
        return res.status(401).send('Unauthorized: Token expired. Please log in again.');
    }
    return res.status(401).send('Unauthorized: Invalid token.');
  }
};

module.exports = authMiddleware;