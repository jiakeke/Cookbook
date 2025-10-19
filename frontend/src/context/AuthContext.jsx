import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = Date.now() >= decoded.exp * 1000;
        if (isExpired) {
          logout();
        } else {
          setUser({ id: decoded.id, name: decoded.name, role: decoded.role });
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Invalid token");
        logout();
      }
    } else {
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);