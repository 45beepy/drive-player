// y2k-drive-player/server/server.js
const app = require('./src/app'); // Import the Express app from the src folder

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access backend at: http://localhost:${PORT}`);
});