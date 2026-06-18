import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Alert } from 'react-native';

export interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: "Public" | "Optional" | "Restricted";
  description?: string;
}

interface HolidayState {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
}

const initialState: HolidayState = {
  holidays: [],
  loading: false,
  error: null,
};

export const fetchHolidays = createAsyncThunk(
  'holidays/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/holidays');
      return response.data.data.holidays;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch holidays');
    }
  }
);

export const createHoliday = createAsyncThunk(
  'holidays/create',
  async (holidayData: Omit<Holiday, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/holidays', holidayData);
      Alert.alert('Success', 'Holiday added successfully');
      return response.data.data;
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to add holiday');
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const updateHoliday = createAsyncThunk(
  'holidays/update',
  async ({ id, data }: { id: string, data: Partial<Holiday> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/holidays/${id}`, data);
      Alert.alert('Success', 'Holiday updated successfully');
      return response.data.data;
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to update holiday');
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

export const deleteHoliday = createAsyncThunk(
  'holidays/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/holidays/${id}`);
      Alert.alert('Success', 'Holiday deleted successfully');
      return id;
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to delete holiday');
      return rejectWithValue(error.response?.data?.error?.message);
    }
  }
);

const holidaySlice = createSlice({
  name: 'holidays',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.loading = false;
        state.holidays = action.payload;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createHoliday.fulfilled, (state, action) => {
        state.holidays.push(action.payload);
      })
      .addCase(updateHoliday.fulfilled, (state, action) => {
        const index = state.holidays.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.holidays[index] = action.payload;
        }
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter(h => h.id !== action.payload);
      });
  },
});

export default holidaySlice.reducer;
