import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Complaint {
  id: string;
  type: "Harassment" | "Discrimination" | "Workplace Issue" | "Policy Violation" | "Other";
  subject: string;
  description: string;
  status: "Pending" | "Under Review" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  reportedBy: string;
  reportedAgainst?: string;
  createdAt: string;
  updatedAt?: string;
  isAnonymous: boolean;
}

interface ComplaintState {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
}

const initialState: ComplaintState = {
  complaints: [],
  loading: false,
  error: null,
};

export const fetchComplaints = createAsyncThunk('complaints/fetchComplaints', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/complaints');
    return response.data.data.complaints as Complaint[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch complaints');
  }
});

export const createComplaint = createAsyncThunk('complaints/createComplaint', async (payload: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'updatedAt'>, { rejectWithValue }) => {
  try {
    const response = await api.post('/complaints', payload);
    return response.data.data as Complaint;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to create complaint');
  }
});

export const updateComplaint = createAsyncThunk('complaints/updateComplaint', async ({ id, data }: { id: string; data: Partial<Complaint> }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/complaints/${id}`, data);
    return response.data.data as Complaint;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to update complaint');
  }
});

export const deleteComplaint = createAsyncThunk('complaints/deleteComplaint', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/complaints/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete complaint');
  }
});

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchComplaints.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action: PayloadAction<Complaint[]>) => {
        state.loading = false;
        state.complaints = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createComplaint.fulfilled, (state, action: PayloadAction<Complaint>) => {
        state.complaints.unshift(action.payload);
      })
      .addCase(updateComplaint.fulfilled, (state, action: PayloadAction<Complaint>) => {
        const index = state.complaints.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.complaints[index] = action.payload;
        }
      })
      .addCase(deleteComplaint.fulfilled, (state, action: PayloadAction<string>) => {
        state.complaints = state.complaints.filter(c => c.id !== action.payload);
      });
  },
});

export default complaintSlice.reducer;
