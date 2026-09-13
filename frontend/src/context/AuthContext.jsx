import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [activeMode, setActiveModeState] = useState(localStorage.getItem('activeMode') || 'requester');
  const [loading, setLoading] = useState(true);

  const setActiveMode = (mode) => {
    const validMode = mode === 'tasker' ? 'tasker' : 'requester';
    localStorage.setItem('activeMode', validMode);
    setActiveModeState(validMode);
  };

  const toggleActiveMode = () => {
    setActiveMode(activeMode === 'requester' ? 'tasker' : 'requester');
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error('Failed to fetch user session:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeMode,
        setActiveMode,
        toggleActiveMode,
        loading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

