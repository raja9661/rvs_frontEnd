import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Verify token with backend
        await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login function with automatic redirection
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/auth/login`,
        credentials
      );

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      toast.success('Login successful!');

      // Redirect based on role
      switch(user.role) {
        case 'admin': navigate('/admin-dashboard'); break;
        case 'client': navigate('/client-dashboard'); break;
        // Add other roles as needed
        default: navigate('/');
      }

      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!token) return true;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      loading,
      isTokenExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};