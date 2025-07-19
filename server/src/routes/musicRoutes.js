// y2k-drive-player/server/src/routes/musicRoutes.js
const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const authMiddleware = require('../middleware/authMiddleware'); // Import your auth middleware

// All routes here will use authMiddleware implicitly from app.js setup,
// but we will still explicitly add it for clarity and direct protection
// if this router were used standalone.

// GET /api/music/files - List all music files for the authenticated user
router.get('/files', authMiddleware, musicController.getMusicFiles);

// GET /api/music/stream/:fileId - Stream a specific music file
router.get('/stream/:fileId', authMiddleware, musicController.streamMusicFile);

module.exports = router;