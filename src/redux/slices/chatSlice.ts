import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface ChatState {
  users: any[];
  messages: any[];
  loadingUsers: boolean;
  loadingMessages: boolean;
  error: string | null;
}

const initialState: ChatState = {
  users: [],
  messages: [],
  loadingUsers: false,
  loadingMessages: false,
  error: null,
};

// Async thunks
export const fetchChatUsers = createAsyncThunk(
  'chat/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/users');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch users'
      );
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/messages/${userId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch messages'
      );
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<any>) => {
      // Add message if it doesn't already exist
      const exists = state.messages.find(m => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      // action.payload is the current user ID. We mark messages sent by current user as read
      state.messages = state.messages.map(m => 
        m.sender === action.payload ? { ...m, read: true } : m
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchChatUsers
      .addCase(fetchChatUsers.pending, (state) => {
        state.loadingUsers = true;
        state.error = null;
      })
      .addCase(fetchChatUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = action.payload;
      })
      .addCase(fetchChatUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload as string;
      })
      // fetchChatMessages
      .addCase(fetchChatMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
        state.messages = [];
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload as string;
      });
  },
});

export const { addMessage, clearMessages, markMessagesAsRead } = chatSlice.actions;
export default chatSlice.reducer;
