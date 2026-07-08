import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  checkIn2?: string;
  checkOut2?: string;
  status: string;
  lateByMinutes?: number;
  totalWorkedHours?: string;
  extraHours?: string;
  shortfallHours?: string;
}

interface AttendanceState {
  records: AttendanceRecord[]; // my attendance
  allRecords: AttendanceRecord[]; // all attendance (admin)
  calendar: AttendanceRecord[]; // calendar view data
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  allRecords: [],
  calendar: [],
  loading: false,
  error: null,
};

export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMyAttendance',
  async (params: { fromDate?: string; toDate?: string; month?: string; year?: string } | void, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/my', { params: params || {} });
      return response.data.data.attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchAllAttendance = createAsyncThunk(
  'attendance/fetchAllAttendance',
  async (params: { fromDate?: string; toDate?: string } | void, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance', { params: params || {} });
      return response.data.data.attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch attendance');
    }
  }
);

// New thunk for calendar data
export const fetchAttendanceCalendar = createAsyncThunk(
  'attendance/fetchAttendanceCalendar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/calendar');
      return response.data.data.attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch calendar');
    }
  }
);

export const markManualAttendance = createAsyncThunk(
  'attendance/markManualAttendance',
  async (data: { checkIn?: string; checkOut?: string; checkIn2?: string; checkOut2?: string; date?: string; employeeId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/mark', {
        employeeId: data.employeeId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        checkIn2: data.checkIn2,
        checkOut2: data.checkOut2,
        date: data.date || new Date().toISOString().split('T')[0],
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to mark attendance');
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async (data: { id: string; checkIn: string; checkOut?: string; checkIn2?: string; checkOut2?: string; status: string; date?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/attendance/${data.id}`, {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        checkIn2: data.checkIn2,
        checkOut2: data.checkOut2,
        status: data.status,
        date: data.date,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update attendance');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Attendance
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All Attendance
      .addCase(fetchAllAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.allRecords = action.payload;
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark Manual Attendance
      .addCase(markManualAttendance.fulfilled, (state, action) => {
        // Find existing record for this date and update, or add new
        const existingIndex = state.records.findIndex(r => r.date === action.payload.date);
        if (existingIndex >= 0) {
          state.records[existingIndex] = action.payload;
        } else {
          state.records.unshift(action.payload);
        }
      })
      // Update Attendance
      .addCase(updateAttendance.fulfilled, (state, action) => {
        // Update in records array
        const recordsIndex = state.records.findIndex(r => r.id === action.payload.id);
        if (recordsIndex >= 0) {
          state.records[recordsIndex] = action.payload;
        }
        // Update in allRecords array
        const allRecordsIndex = state.allRecords.findIndex(r => r.id === action.payload.id);
        if (allRecordsIndex >= 0) {
          state.allRecords[allRecordsIndex] = action.payload;
        }
      })
      // Calendar data handling
      .addCase(fetchAttendanceCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.calendar = action.payload;
      })
      .addCase(fetchAttendanceCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
