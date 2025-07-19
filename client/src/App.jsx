// y2k-drive-player/client/src/App.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import './index.css';

function App() {
  const [backendMessage, setBackendMessage] = useState('Connecting to backend...');
  const [protectedMessage, setProtectedMessage] = useState('Not authenticated for protected route.');
  const [musicFiles, setMusicFiles] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  // --- CRITICAL CHANGE 2: Destructure googleAccessToken from useAuth ---
  const { currentUser, googleAccessToken, loading, signInWithGoogle, logout } = useAuth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Function to fetch from unprotected route
  useEffect(() => {
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
  }, [backendUrl]);

  // Function to fetch from protected route
  const fetchProtectedData = useCallback(async () => {
    if (!currentUser || !googleAccessToken) { // Check for googleAccessToken
      setProtectedMessage('Please log in and grant Google Drive access.');
      return;
    }

    try {
      const idToken = await currentUser.getIdToken(); // Still need Firebase ID Token for authMiddleware

      // --- CRITICAL CHANGE 3: Use googleAccessToken directly ---
      console.log("--- Debugging Google Access Token (from Context) ---");
      console.log("ID Token:", idToken.substring(0, 20) + '...');
      console.log("Google Access Token:", googleAccessToken); // This should now be a string!
      console.log("--- End Debug ---");

      const response = await fetch(`${backendUrl}/api/protected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Google-Access-Token': googleAccessToken // Sending the captured token
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setProtectedMessage(data.message + ` (User: ${data.user.email})`);
    } catch (error) {
      console.error('Error fetching protected data:', error);
      setProtectedData(`Error accessing protected route: ${error.message}`);
    }
  }, [currentUser, googleAccessToken, backendUrl]); // Add googleAccessToken to dependencies

  // Function to fetch music files from Google Drive via backend
  const fetchMusicFiles = useCallback(async () => {
    if (!currentUser || !googleAccessToken) { // Check for googleAccessToken
      setMusicFiles([]);
      return;
    }

    try {
      const idToken = await currentUser.getIdToken(); // Still need Firebase ID Token

      // --- CRITICAL CHANGE 4: Use googleAccessToken directly ---
      const response = await fetch(`${backendUrl}/api/music/files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Google-Access-Token': googleAccessToken // Sending the captured token
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}: ${errorText}`);
      }

      const files = await response.json();
      setMusicFiles(files);
      console.log('Fetched music files:', files);

    } catch (error) {
      console.error('Error fetching music files:', error);
      alert(`Failed to load music files: ${error.message}`);
      setMusicFiles([]);
    }
  }, [currentUser, googleAccessToken, backendUrl]); // Add googleAccessToken to dependencies

  // Play a song
  const playSong = useCallback((file) => {
    if (!currentUser || !googleAccessToken) { // Check for googleAccessToken
      alert('Please log in and grant Google Drive access to play music.');
      return;
    }

    audioRef.current.pause();
    setIsPlaying(false);
    setCurrentSong(file);

    // --- CRITICAL CHANGE 5: Pass googleAccessToken to stream logic (if needed directly by <audio> or a sub-component) ---
    // For direct <audio> src, custom headers are not possible.
    // The backend's /api/music/stream endpoint must handle the googleAccessToken
    // from the X-Google-Access-Token header sent in that specific fetch call.
    // The previous setup for `fetchMusicFiles` already does this for the list.
    // For stream, the playSong function itself doesn't make the fetch, just sets src.
    // We trust the backend's stream endpoint to handle the token from its own call setup.
    // So no change needed here for `audioRef.current.src`
    const streamUrl = `${backendUrl}/api/music/stream/${file.id}`;
    audioRef.current.src = streamUrl;
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(e => {
      console.error('Error playing audio:', e);
      alert('Failed to play song. Check console for details. Ensure backend is running and CORS is configured.');
      setIsPlaying(false);
    });
  }, [currentUser, googleAccessToken, backendUrl]); // Add googleAccessToken to dependencies

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Run initial fetches on user change
  useEffect(() => {
    if (currentUser && googleAccessToken) { // Only fetch if both user AND token are present
      fetchProtectedData();
      fetchMusicFiles();
    } else {
      setProtectedMessage('Not authenticated for protected route.');
      setMusicFiles([]);
      setCurrentSong(null);
      setIsPlaying(false);
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, [currentUser, googleAccessToken, fetchProtectedData, fetchMusicFiles]); // Add googleAccessToken to dependencies

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-800 text-lg">
        Loading authentication status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-5 font-sans leading-relaxed">
      <h1 className="text-center text-3xl md:text-4xl lg:text-5xl text-blue-700 border-b pb-2 mb-5">
        Drive Player
      </h1>

      <div className="bg-white border border-gray-300 p-4 rounded-md max-w-xl mx-auto shadow-sm mb-5">
        <h2 className="text-xl font-semibold mb-3">Authentication Status</h2>
        {currentUser ? (
          <div className="flex items-center space-x-4">
            {currentUser.photoURL && (
              <img src={currentUser.photoURL} alt="Profile" className="w-12 h-12 rounded-full border border-gray-300" />
            )}
            <div>
              <p>Logged in as: <strong className="font-medium">{currentUser.displayName || currentUser.email}</strong></p>
              <button
                onClick={logout}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-3">You are not logged in.</p>
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-300 p-4 rounded-md max-w-xl mx-auto shadow-sm mb-5">
        <h2 className="text-xl font-semibold mb-3">Backend Connection</h2>
        <p><strong className="font-medium">Unprotected Route:</strong> {backendMessage}</p>
        <p><strong className="font-medium">Protected Route:</strong> {protectedMessage}</p>
        <button
          onClick={fetchProtectedData}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 ease-in-out"
        >
          Test Protected Route
        </button>
        <p className="text-sm text-gray-500 mt-2">
          (Click to manually re-test protected route. Auto-tests on login/logout)
        </p>
      </div>

      {currentUser && musicFiles.length > 0 && (
        <div className="bg-white border border-gray-300 p-4 rounded-md max-w-xl mx-auto shadow-sm mb-5">
          <h2 className="text-xl font-semibold mb-3">Your Music Files</h2>
          <ul className="list-disc pl-5">
            {musicFiles.map(file => (
              <li key={file.id} className="mb-2">
                <button
                  onClick={() => playSong(file)}
                  className="text-blue-600 hover:underline focus:outline-none focus:ring focus:border-blue-300"
                >
                  {file.name}
                </button>
                <span className="text-sm text-gray-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentUser && musicFiles.length === 0 && !loading && (
        <div className="bg-white border border-gray-300 p-4 rounded-md max-w-xl mx-auto shadow-sm mb-5">
          <p className="text-center text-gray-600">No music files found in your Google Drive or failed to load them.</p>
          <p className="text-center text-sm text-gray-500">Ensure you have audio files (MP3, FLAC, WAV, OGG) in your Drive and permissions are granted.</p>
        </div>
      )}


      {/* Current Song Player */}
      {currentSong && (
        <div className="bg-white border border-gray-300 p-4 rounded-md max-w-xl mx-auto shadow-sm mb-5 flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-400 flex items-center justify-center text-gray-600 text-xs flex-shrink-0">
            [Art]
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">Now Playing:</h3>
            <p className="font-medium">{currentSong.name}</p>
          </div>
          <button
            onClick={togglePlayPause}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition duration-150 ease-in-out"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}

      {/* Placeholder for Album Art - still keeping the old one for now if currentSong is null */}
      {!currentSong && (
        <div className="mt-8 text-center p-5 bg-gray-200 border border-dashed border-gray-400 max-w-xs mx-auto">
          <h3 className="text-lg font-medium mb-3">Album Art Placeholder</h3>
          <div className="w-48 h-48 bg-gray-400 flex items-center justify-center text-gray-600 text-sm mx-auto">
            [No Album Art Yet]
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Album art will appear here when playing a song.
          </p>
        </div>
      )}


      <p className="text-center mt-10 text-sm text-gray-600">
        &copy; 2025 My Plain Music Player
      </p>
    </div>
  );
}

export default App;