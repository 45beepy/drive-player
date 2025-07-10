// client/src/App.jsx
import { useState, useEffect } from 'react';
// No specific index.css needed for this ultra-plain style, but you can keep it
// if it only contains very basic resets. Let's assume it's minimal.
// import './index.css';

function App() {
  const [backendMessage, setBackendMessage] = useState('Connecting to backend...');

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    fetch(backendUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        setBackendMessage(data);
      })
      .catch(error => {
        console.error('Error fetching from backend:', error);
        setBackendMessage(`Failed to connect to backend: ${error.message}`);
      });
  }, []);

  return (
    <div style={{
      fontFamily: 'sans-serif', // Plain sans-serif font
      backgroundColor: '#f0f0f0', // Light grey background
      color: '#333', // Dark grey text
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box',
      lineHeight: '1.6'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#0056b3', // A simple blue for headers
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
        marginBottom: '20px'
      }}>
        Drive Player
      </h1>

      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '5px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2>System Status</h2>
        <p><strong>Backend Connection:</strong> {backendMessage}</p>
        <p><em>(This will update once the backend is running)</em></p>
      </div>

      {/* Placeholder for Album Art - we'll implement this later */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#eee',
        border: '1px dashed #ccc',
        maxWidth: '300px', // Placeholder size
        margin: '30px auto'
      }}>
        <h3>Album Art Placeholder</h3>
        <div style={{
          width: '200px',
          height: '200px',
          backgroundColor: '#bbb',
          margin: '10px auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#555',
          fontSize: '0.9em'
        }}>
          [No Album Art Yet]
        </div>
        <p style={{ fontSize: '0.8em', color: '#666' }}>
          Album art will appear here when playing a song.
        </p>
      </div>

      <p style={{
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '0.9em',
        color: '#666'
      }}>
        © 2025 My Plain Music Player
      </p>
    </div>
  );
}

export default App;