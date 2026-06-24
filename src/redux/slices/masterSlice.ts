import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as masterService from '../../services/masterService';

interface MasterState {
  departments: any[];
  designations: any[];
  leaveTypes: any[];
  loading: boolean;
  error: string | null;
}

const initialState: MasterState = {
  departments: [],
  designations: [],
  leaveTypes: [],
  loading: false,
  error: null,
};

export const fetchDepartments = createAsyncThunk('master/fetchDepartments', async (_, { rejectWithValue }) => {
  try {
    return await masterService.getDepartments();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
  }
});

export const fetchDesignations = createAsyncThunk('master/fetchDesignations', async (_, { rejectWithValue }) => {
  try {
    return await masterService.getDesignations();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch designations');
  }
});

export const fetchLeaveTypes = createAsyncThunk('master/fetchLeaveTypes', async (_, { rejectWithValue }) => {
  try {
    return await masterService.getLeaveTypes();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave types');
  }
});

const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDepartments.fulfilled, (state, action) => { state.loading = false; state.departments = action.payload; })
      .addCase(fetchDepartments.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchDesignations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDesignations.fulfilled, (state, action) => { state.loading = false; state.designations = action.payload; })
      .addCase(fetchDesignations.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchLeaveTypes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => { state.loading = false; state.leaveTypes = action.payload; })
      .addCase(fetchLeaveTypes.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export default masterSlice.reducer;
