import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = 'https://hrback-production-61ba.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error reading token from AsyncStorage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors (e.g., unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      try {
        await AsyncStorage.removeItem('token');
        // Dispatch logoutLocally to update Redux state, which unmounts protected screens and renders LoginScreen
        const { default: store } = require('../redux/store');
        const { logoutLocally } = require('../redux/slices/authSlice');
        store.dispatch(logoutLocally());
      } catch (e) {
        console.error('Error handling unauthorized error', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
