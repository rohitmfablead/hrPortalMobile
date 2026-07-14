import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      // Store token asynchronously
      if (response.data?.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data; // { token, user }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.message || 'Login failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to send reset link');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      return response.data; // user object
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch user');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      await AsyncStorage.removeItem('token');
      return true;
    } catch (error: any) {
      // Even if API logout fails, we clear local token
      await AsyncStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.error?.message || 'Logout failed');
    }
  }
);

export const hydrateAuth = createAsyncThunk(
  'auth/hydrate',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      return rejectWithValue('Failed to load token');
    }
  }
);

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null, // React Native can't read synchronously
  loading: false,
  error: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logoutLocally: (state) => {
      state.user = null;
      state.token = null;
      // We can't await inside reducer, but it shouldn't block
      AsyncStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    // Hydrate
    builder.addCase(hydrateAuth.fulfilled, (state, action) => {
      state.token = action.payload;
      state.isHydrated = true;
    });
    builder.addCase(hydrateAuth.rejected, (state) => {
      state.token = null;
      state.isHydrated = true;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Me
    builder.addCase(fetchMe.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchMe.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      // If fetching me fails (e.g. invalid token), we might want to clear token
      // state.token = null;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.user = null;
      state.token = null;
    });
  },
});

export const { clearError, logoutLocally } = authSlice.actions;
export default authSlice.reducer;
