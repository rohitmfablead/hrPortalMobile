import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Rule {
  id: string;
  category: string;
  title: string;
  description: string;
  documentUrl?: string;
  lastUpdated: string;
}

interface RulesState {
  rules: Rule[];
  loading: boolean;
  error: string | null;
}

const initialState: RulesState = {
  rules: [],
  loading: false,
  error: null,
};

export const fetchRules = createAsyncThunk('rules/fetchRules', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/rules');
    return response.data.data.rules as Rule[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch rules');
  }
});

export const createRule = createAsyncThunk('rules/createRule', async (rule: Omit<Rule, 'id' | 'lastUpdated'>, { rejectWithValue }) => {
  try {
    const response = await api.post('/rules', rule);
    return response.data.data as Rule;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to create rule');
  }
});

export const updateRule = createAsyncThunk('rules/updateRule', async (rule: Rule, { rejectWithValue }) => {
  try {
    const response = await api.put(`/rules/${rule.id}`, rule);
    return response.data.data as Rule;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to update rule');
  }
});

export const deleteRule = createAsyncThunk('rules/deleteRule', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/rules/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete rule');
  }
});

const ruleSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRules.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRules.fulfilled, (state, action: PayloadAction<Rule[]>) => {
        state.loading = false;
        state.rules = action.payload;
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createRule.fulfilled, (state, action: PayloadAction<Rule>) => {
        state.rules.unshift(action.payload);
      })
      .addCase(updateRule.fulfilled, (state, action: PayloadAction<Rule>) => {
        const idx = state.rules.findIndex(r => r.id === action.payload.id);
        if (idx >= 0) state.rules[idx] = action.payload;
      })
      .addCase(deleteRule.fulfilled, (state, action: PayloadAction<string>) => {
        state.rules = state.rules.filter(r => r.id !== action.payload);
      });
  },
});

export default ruleSlice.reducer;
