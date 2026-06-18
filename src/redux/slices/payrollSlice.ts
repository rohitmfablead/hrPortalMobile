import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basicSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending';
  paymentDate?: string;
  createdAt: string;
}

interface PayrollState {
  records: PayrollRecord[];
  allRecords: PayrollRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: PayrollState = {
  records: [],
  allRecords: [],
  loading: false,
  error: null,
};

export const fetchMyPayslips = createAsyncThunk(
  'payroll/fetchMyPayslips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payroll/my');
      return response.data.data.payroll;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch payslips');
    }
  }
);

export const fetchAllPayroll = createAsyncThunk(
  'payroll/fetchAllPayroll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payroll');
      return response.data.data.payroll;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch payroll records');
    }
  }
);

export const generatePayslip = createAsyncThunk(
  'payroll/generatePayslip',
  async (data: { employeeId: string; month: string; bonus?: number; deductions?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payroll/generate', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to generate payslip');
    }
  }
);

export const markAsPaid = createAsyncThunk(
  'payroll/markAsPaid',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payroll/${id}/pay`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to mark as paid');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Payslips
      .addCase(fetchMyPayslips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPayslips.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMyPayslips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All Payroll
      .addCase(fetchAllPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.allRecords = action.payload;
      })
      .addCase(fetchAllPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Generate Payslip
      .addCase(generatePayslip.fulfilled, (state, action) => {
        state.allRecords.unshift(action.payload);
      })
      // Mark As Paid
      .addCase(markAsPaid.fulfilled, (state, action) => {
        const index = state.allRecords.findIndex(r => r.id === action.payload.id);
        if (index >= 0) {
          state.allRecords[index] = action.payload;
        }
        const recordsIndex = state.records.findIndex(r => r.id === action.payload.id);
        if (recordsIndex >= 0) {
          state.records[recordsIndex] = action.payload;
        }
      });
  },
});

export const { clearError } = payrollSlice.actions;
export default payrollSlice.reducer;
