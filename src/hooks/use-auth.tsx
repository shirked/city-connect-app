
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for prototype phase
const mockUser: User = {
  id: 'prototype-user-id',
  email: 'user@example.com',
  name: 'Demo User',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const login = async () => {
    // No-op
    console.log("Login function called, but is disabled for prototype.");
  };

  const signup = async () => {
    // No-op
    console.log("Signup function called, but is disabled for prototype.");
  };

  const logout = () => {
    // In a real scenario, this would clear the user state.
    // For the prototype, we can just log it.
    console.log("Logout function called, but is disabled for prototype.");
    // We could redirect to a "logged out" screen if one existed.
    // For now, we'll just stay on the current page.
    // If you want a full redirect on logout, we can re-enable it.
  };

  return (
    <AuthContext.Provider value={{ user: mockUser, login, signup, logout, isLoading: false }}>
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
