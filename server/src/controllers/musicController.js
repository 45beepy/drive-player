// y2k-drive-player/server/src/controllers/musicController.js
const googleDriveModel = require('../models/googleDriveModel'); // Import your model

// Controller to handle listing music files
const getMusicFiles = async (req, res) => {
  // The user's Google Drive access token is passed from the frontend,
  // typically as part of the Firebase ID token result or directly.
  // For simplicity, we assume the frontend sends the actual Google access_token
  // obtained via Firebase's getIdTokenResult(true).
  const googleAccessToken = req.headers['x-google-access-token']; // Custom header for Google token

  if (!googleAccessToken) {
    return res.status(400).send('Bad Request: Google Access Token required.');
  }

  try {
    const files = await googleDriveModel.listMusicFiles(googleAccessToken);
    res.json(files);
  } catch (error) {
    console.error('Error listing music files from Google Drive:', error.message);
    res.status(500).send('Internal Server Error: Could not list files.');
  }
};

// Controller to handle streaming a specific music file
const streamMusicFile = async (req, res) => {
  const fileId = req.params.fileId; // Get fileId from URL parameters
  const googleAccessToken = req.headers['x-google-access-token']; // Custom header for Google token

  if (!googleAccessToken) {
    return res.status(400).send('Bad Request: Google Access Token required.');
  }

  try {
    const fileStream = await googleDriveModel.getFileStream(googleAccessToken, fileId);

    // Set appropriate headers for streaming audio
    res.setHeader('Content-Type', 'audio/mpeg'); // Adjust based on common audio types (e.g., audio/flac, audio/wav)
    res.setHeader('Accept-Ranges', 'bytes'); // Enable range requests for seeking

    // Pipe the file stream directly to the response
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) { // Only send error if headers haven't been sent yet
            res.status(500).send('Internal Server Error: Could not stream file.');
        } else {
            res.end(); // If headers sent, just end the response
        }
    });

    // You might also want to handle 'end' and 'close' events
    fileStream.on('end', () => {
        console.log(`Stream for fileId ${fileId} ended.`);
    });

  } catch (error) {
    console.error(`Error streaming file ${fileId} from Google Drive:`, error.message);
    // Be careful not to send response if headers are already sent by piping
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error: Could not stream file.');
    }
  }
};

module.exports = {
  getMusicFiles,
  streamMusicFile,
};