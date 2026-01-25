import React from 'react'
import { createContext } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { defaultProfileImage } from '../config/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const API_URL = import.meta.env.VITE_API_URL;

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
   
    navigate("/OverView");
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };


    const updateUserContext = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

    const fetchUserResource = async (endpoint, options = {}) => {
      if (!user || !token) return [];

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: options.method || 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: options.body ? JSON.stringify(options.body) : null
        });

        if (!response.ok) {
          //! dime qué revienta!!!!!
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${response.status}: Error al obtener datos`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error en fetchUserResource:", error);
        return null;
      }
    };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUserContext, fetchUserResource }}>
      {children}
    </AuthContext.Provider>
  );
};
