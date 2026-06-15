import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import type { User } from '../models/types';
import { MicrosoftLoadingDots } from '../components/MicrosoftLoadingDots';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('openrockets_token');

  useEffect(() => {
    if (!token) {
      window.location.href = 'https://accounts.openrockets.com/login?redirect_uri=' + encodeURIComponent(window.location.href);
      return;
    }

    axios.get('https://openrocketsauth.alwaysdata.net/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      setUser(res.data.user || res.data);
      setIsLoading(false);
    }).catch(err => {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('openrockets_token');
      window.location.href = 'https://accounts.openrockets.com/login?redirect_uri=' + encodeURIComponent(window.location.href);
    });
  }, [token]);

  const logout = () => {
    localStorage.removeItem('openrockets_token');
    window.location.href = 'https://accounts.openrockets.com/login';
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
        <div style={{ width: '48px', height: '48px', position: 'relative' }}>
          <MicrosoftLoadingDots />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
