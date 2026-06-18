import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'General' | 'Urgent' | 'Event' | 'Policy';
  priority: 'Low' | 'Medium' | 'High';
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isPinned: boolean;
  targetAudience: 'All' | 'Admin' | 'HR' | 'Employee';
}

interface AnnouncementsState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementsState = {
  announcements: [],
  loading: false,
  error: null,
};

export const fetchAnnouncements = createAsyncThunk('announcements/fetchAnnouncements', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/announcements');
    return response.data.data.announcements as Announcement[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch announcements');
  }
});

export const createAnnouncement = createAsyncThunk('announcements/createAnnouncement', async (payload: Omit<Announcement, 'id' | 'createdAt'>, { rejectWithValue }) => {
  try {
    const response = await api.post('/announcements', payload);
    return response.data.data as Announcement;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to create announcement');
  }
});

export const deleteAnnouncement = createAsyncThunk('announcements/deleteAnnouncement', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/announcements/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete announcement');
  }
});

const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAnnouncements.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action: PayloadAction<Announcement[]>) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAnnouncement.fulfilled, (state, action: PayloadAction<Announcement>) => {
        state.announcements.unshift(action.payload);
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action: PayloadAction<string>) => {
        state.announcements = state.announcements.filter(a => a.id !== action.payload);
      });
  },
});

export default announcementSlice.reducer;
