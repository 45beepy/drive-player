// y2k-drive-player/client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// --- CRITICAL: Import GoogleAuthProvider here ---
import { auth, googleProvider, signInWithPopup, signOut, GoogleAuthProvider } from '../firebaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(null); // State for Google-specific access token
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Signed in successfully:', result.user.displayName || result.user.email);
      
      // --- CRITICAL: Capture Google Access Token directly from result ---
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken; // This is the Google-specific access token!
      setGoogleAccessToken(accessToken); // Store it in state
      // --- END CRITICAL CHANGE ---

      // Optional: Log the full result for debugging (can remove later)
      console.log("Raw signInWithPopup result:", result); 

      return result;
    } catch (error) {
      console.error('Google Sign-In Error:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully.');
      setCurrentUser(null);
      setGoogleAccessToken(null); // Clear token on logout
    } catch (error) {
      console.error('Logout Error:', error.message);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      // When auth state changes, if user exists, try to get their latest Google token
      // Note: onAuthStateChanged doesn't directly give accessToken, so it needs to be set on signIn
      // For persistent sessions, we'd need to re-fetch/refresh this token, but let's test this flow first.
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    googleAccessToken, // Include in context value
    loading,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};