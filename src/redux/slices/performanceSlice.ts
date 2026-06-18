import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface EmployeePerformance {
  id: string;
  name: string;
  avatar: string;
  department: string;
  role: string;
  overallRating: number;
  goals: { total: number; completed: number };
  skills: Array<{ name: string; rating: number }>;
  lastReview: string;
  nextReview: string;
  achievements: string[];
}

interface PerformanceState {
  performances: EmployeePerformance[];
  loading: boolean;
  error: string | null;
}

const initialState: PerformanceState = {
  performances: [],
  loading: false,
  error: null,
};

export const fetchPerformances = createAsyncThunk('performance/fetchPerformances', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/performance');
    return response.data.data.performances as EmployeePerformance[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch performances');
  }
});

export const createPerformance = createAsyncThunk('performance/createPerformance', async (payload: Omit<EmployeePerformance, 'id'>, { rejectWithValue }) => {
  try {
    const response = await api.post('/performance', payload);
    return response.data.data as EmployeePerformance;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to create performance');
  }
});

export const updatePerformance = createAsyncThunk('performance/updatePerformance', async ({ id, data }: { id: string; data: Partial<EmployeePerformance> }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/performance/${id}`, data);
    return response.data.data as EmployeePerformance;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to update performance');
  }
});

export const deletePerformance = createAsyncThunk('performance/deletePerformance', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/performance/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete performance');
  }
});

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPerformances.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformances.fulfilled, (state, action: PayloadAction<EmployeePerformance[]>) => {
        state.loading = false;
        state.performances = action.payload;
      })
      .addCase(fetchPerformances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPerformance.fulfilled, (state, action: PayloadAction<EmployeePerformance>) => {
        state.performances.unshift(action.payload);
      })
      .addCase(updatePerformance.fulfilled, (state, action: PayloadAction<EmployeePerformance>) => {
        const index = state.performances.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.performances[index] = action.payload;
        }
      })
      .addCase(deletePerformance.fulfilled, (state, action: PayloadAction<string>) => {
        state.performances = state.performances.filter(p => p.id !== action.payload);
      });
  },
});

export default performanceSlice.reducer;
