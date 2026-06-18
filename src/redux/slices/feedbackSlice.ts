import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Feedback {
  id: string;
  title: string;
  description?: string;
  suggestion?: string;
  type?: 'Bug' | 'Suggestion' | 'Praise';
  category?: string;
  status: 'Open' | 'In Progress' | 'Closed';
  createdBy?: string;
  submittedBy?: string;
  rating?: number;
  createdAt: string;
}

interface FeedbackState {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  feedbacks: [],
  loading: false,
  error: null,
};

export const fetchFeedback = createAsyncThunk('feedback/fetchFeedback', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/feedback');
    return response.data.data.feedbacks as Feedback[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch feedback');
  }
});

export const createFeedback = createAsyncThunk('feedback/createFeedback', async (payload: Omit<Feedback, 'id' | 'createdAt' | 'status'>, { rejectWithValue }) => {
  try {
    const response = await api.post('/feedback', payload);
    return response.data.data as Feedback;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to create feedback');
  }
});

export const updateFeedback = createAsyncThunk('feedback/updateFeedback', async ({ id, data }: { id: string; data: Partial<Feedback> }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/feedback/${id}`, data);
    return response.data.data as Feedback;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to update feedback');
  }
});

export const deleteFeedback = createAsyncThunk('feedback/deleteFeedback', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/feedback/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete feedback');
  }
});

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFeedback.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedback.fulfilled, (state, action: PayloadAction<Feedback[]>) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createFeedback.fulfilled, (state, action: PayloadAction<Feedback>) => {
        state.feedbacks.unshift(action.payload);
      })
      .addCase(updateFeedback.fulfilled, (state, action: PayloadAction<Feedback>) => {
        const index = state.feedbacks.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
      })
      .addCase(deleteFeedback.fulfilled, (state, action: PayloadAction<string>) => {
        state.feedbacks = state.feedbacks.filter(f => f.id !== action.payload);
      });
  },
});

export default feedbackSlice.reducer;
