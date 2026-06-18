import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeAPI } from '../../services/employee';

export const fetchEmployees = createAsyncThunk(
  'employee/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getAll(params);
      return response.data; // { employees, pagination }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch employees');
    }
  }
);

export const addEmployee = createAsyncThunk(
  'employee/add',
  async (employeeData: any, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.create(employeeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add employee');
    }
  }
);

interface EmployeeState {
  employees: any[];
  pagination: any;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  pagination: null,
  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchEmployees.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployees.fulfilled, (state, action) => {
      state.loading = false;
      state.employees = action.payload.employees;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchEmployees.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add Employee
    builder.addCase(addEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addEmployee.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload?.employee) {
        state.employees.unshift(action.payload.employee);
      }
    });
    builder.addCase(addEmployee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default employeeSlice.reducer;
