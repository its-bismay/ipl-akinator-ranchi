import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  AuthError,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface UserData {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  username: string | null;
  gamesPlayed: number;
  correctGuesses: number;
  wrongGuesses: number;
  accuracy: number;
  lastPlayed: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  userData: UserData | null;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** Sync a Firebase user to Firestore, creating the document if it doesn't exist. */
async function syncUserToFirestore(user: User): Promise<UserData> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newData: Omit<UserData, 'lastPlayed'> & { lastPlayed: any } = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      username: user.displayName?.split(' ')[0].toLowerCase() || null,
      gamesPlayed: 0,
      correctGuesses: 0,
      wrongGuesses: 0,
      accuracy: 0,
      lastPlayed: serverTimestamp(),
    };
    await setDoc(userRef, newData);
    return newData as UserData;
  }
  return userSnap.data() as UserData;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set the user immediately — don't wait for Firestore.
        setUser(firebaseUser);

        try {
          const data = await syncUserToFirestore(firebaseUser);
          setUserData(data);
        } catch (err) {
          console.error('Error syncing user to Firestore:', err);
          // Fallback: build userData directly from the Firebase user object
          // so the dashboard still renders even if Firestore is unreachable.
          setUserData({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            username: firebaseUser.displayName?.split(' ')[0].toLowerCase() || null,
            gamesPlayed: 0,
            correctGuesses: 0,
            wrongGuesses: 0,
            accuracy: 0,
            lastPlayed: null,
          });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const authErr = err as AuthError;
      // User closing the popup intentionally is not an error worth showing.
      if (authErr.code === 'auth/popup-closed-by-user' || authErr.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Sign-in error:', authErr.code, authErr.message);

      // Map Firebase error codes to user-friendly messages.
      const messages: Record<string, string> = {
        'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups for this site and try again.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add localhost to Firebase → Authentication → Authorized domains.',
        'auth/operation-not-supported-in-this-environment': 'Auth not supported in this environment. Try opening the app directly in a browser tab.',
        'auth/internal-error': 'Firebase internal error. Check the browser console for details.',
      };
      setLoginError(messages[authErr.code] ?? `Sign-in failed: ${authErr.message}`);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) setUserData(snap.data() as UserData);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginError, login, logout, userData, refreshUserData }}>
      {children}
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
