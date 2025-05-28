
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserById } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration purposes
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'student@example.com',
    role: 'student',
    department: 'Computer Science',
    year: 3,
    studentId: 'CS2023001'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'hod@example.com',
    role: 'hod',
    department: 'Computer Science'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'placement@example.com',
    role: 'placement'
  },
  {
    id: '4',
    name: 'Mary Williams',
    email: 'principal@example.com',
    role: 'principal'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          // Try to get user data from Firestore
          const userData = await getUserById(firebaseUser.uid);
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Fallback to mock user for demo purposes
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
            console.warn('User data not found in Firestore, using local storage data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to mock user for demo purposes
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll still use mock users
      // In a real app, you would authenticate with Firebase and validate the role
      
      // Attempt Firebase authentication
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // At this point, the onAuthStateChanged will handle setting the user
      } catch (firebaseError) {
        console.warn('Firebase auth failed, falling back to mock users for demo');
        
        // Fallback to mock users for demo purposes
        const foundUser = mockUsers.find(
          user => user.email === email && user.role === role
        );
        
        if (!foundUser) {
          throw new Error('Invalid credentials');
        }
        
        // Set user in state and localStorage
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
