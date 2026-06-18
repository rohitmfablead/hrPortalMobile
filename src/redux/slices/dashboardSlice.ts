import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface DashboardData {
  // Admin/HR specific
  totalEmployees?: number;
  activeEmployees?: number;
  presentToday?: number;
  attendancePercentage?: number;
  totalPayout?: number;
  departmentStats?: Array<{ name: string; count: number }>;
  recentActivities?: Array<{ type: string; message: string; date: string }>;
  weeklyAttendance?: Array<{ day: string; date: string; present: number; absent: number }>;
  leaveOverview?: Array<{ name: string; value: number }>;

  // Employee specific
  employeeName?: string;
  department?: string;
  attendanceThisMonth?: { present: number; absent: number; late: number; percentage: number };
  todayHours?: string;
  leaveBalance?: Record<string, number>;
  pendingLeaves?: number;
  salaryStatus?: string;
  upcomingHolidays?: Array<{ name: string; date: string }>;
  upcomingBirthdays?: Array<{ name: string; date: string }>;
  recentLeaves?: Array<any>;
  pendingTasks?: Array<{ id: number; title: string; status: string }>;
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk('dashboard/fetchDashboardData', async (timeframe: string | undefined, { rejectWithValue }) => {
  try {
    const query = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await api.get(`/dashboard/stats${query}`);
    return response.data.data as DashboardData;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch dashboard data');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDashboardData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<DashboardData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
