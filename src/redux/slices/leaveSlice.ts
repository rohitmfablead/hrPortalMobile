import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reviewedBy: string | null;
  reviewedAt: string | null;
  remarks: string;
  createdAt: string;
}

interface LeaveState {
  requests: LeaveRequest[];
  calendarLeaves: LeaveRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  requests: [],
  calendarLeaves: [],
  loading: false,
  error: null,
};

export const fetchLeaves = createAsyncThunk(
  'leaves/fetchLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves');
      return response.data.data.leaves;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch leaves');
    }
  }
);

// New thunk for leave calendar
export const fetchLeaveCalendar = createAsyncThunk(
  'leaves/fetchLeaveCalendar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/calendar');
      return response.data.data.leaves;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch leave calendar');
    }
  }
);
export const applyForLeave = createAsyncThunk(
  'leaves/applyForLeave',
  async (data: { leaveType: string; fromDate: string; toDate: string; reason: string; employeeId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/leaves/apply', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to apply for leave');
    }
  }
);

export const approveLeave = createAsyncThunk(
  'leaves/approveLeave',
  async (data: { id: string; remarks?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leaves/${data.id}/approve`, { remarks: data.remarks });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to approve leave');
    }
  }
);

export const rejectLeave = createAsyncThunk(
  'leaves/rejectLeave',
  async (data: { id: string; remarks?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leaves/${data.id}/reject`, { remarks: data.remarks });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to reject leave');
    }
  }
);

export const cancelLeave = createAsyncThunk(
  'leaves/cancelLeave',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/leaves/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to cancel leave');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leaves
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Leave Calendar
      .addCase(fetchLeaveCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.calendarLeaves = action.payload;
      })
      .addCase(fetchLeaveCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Apply Leave
      .addCase(applyForLeave.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      // Approve Leave
      .addCase(approveLeave.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index >= 0) {
          state.requests[index] = action.payload;
        }
      })
      // Reject Leave
      .addCase(rejectLeave.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index >= 0) {
          state.requests[index] = action.payload;
        }
      })
      // Cancel Leave
      .addCase(cancelLeave.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearError } = leaveSlice.actions;
export default leaveSlice.reducer;
