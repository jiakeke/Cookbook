import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        const isExpired = Date.now() >= decoded.exp * 1000;
        if (isExpired) {
          logout();
        } else {
          setUser({ id: decoded.id, name: decoded.name });
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Invalid token");
        logout();
      }
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
