// y2k-drive-player/server/src/models/googleDriveModel.js
const { google } = require('googleapis');

// Function to initialize Google Drive API client using user's access token
function getDriveClient(accessToken) {
  // Create an OAuth2 client. We don't need client_id, client_secret here
  // because we're not starting a new OAuth flow. We're just using an existing access token.
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  return google.drive({ version: 'v3', auth });
}

/**
 * Lists music files (MP3, FLAC, WAV, OGG) from the user's Google Drive.
 * @param {string} accessToken - The user's Google Drive access token.
 * @returns {Promise<Array>} A promise that resolves to an array of music files.
 */
async function listMusicFiles(accessToken) {
  const drive = getDriveClient(accessToken);
  const files = [];
  let nextPageToken = null;

  do {
    const res = await drive.files.list({
      q: "mimeType contains 'audio/' or name contains '.mp3' or name contains '.flac' or name contains '.wav' or name contains '.ogg'",
      fields: 'nextPageToken, files(id, name, mimeType, size, webContentLink, webViewLink, parents)',
      spaces: 'drive',
      pageToken: nextPageToken || undefined,
      pageSize: 100 // Fetch up to 100 files at a time
    });

    files.push(...res.data.files);
    nextPageToken = res.data.nextPageToken;

  } while (nextPageToken);

  return files;
}

/**
 * Gets a readable stream for a specific file from Google Drive.
 * @param {string} accessToken - The user's Google Drive access token.
 * @param {string} fileId - The ID of the file to stream.
 * @returns {Promise<ReadableStream>} A promise that resolves to a readable stream.
 */
async function getFileStream(accessToken, fileId) {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.get({
    fileId: fileId,
    alt: 'media' // Important: 'alt=media' gets the file content, not just metadata
  }, {
    responseType: 'stream' // Request a stream response
  });

  return res.data; // This is the readable stream
}

module.exports = {
  listMusicFiles,
  getFileStream,
};  