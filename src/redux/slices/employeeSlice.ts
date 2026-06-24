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

export const updateEmployee = createAsyncThunk(
  'employee/update',
  async ({ id, employeeData }: { id: string, employeeData: any }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.update(id, employeeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employee/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await employeeAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete employee');
    }
  }
);

interface EmployeeState {
  employees: any[];
  pagination: any;
  loading: boolean;
  error: string | null;
  isAddModalVisible: boolean;
  employeeToEdit: any | null;
}

const initialState: EmployeeState = {
  employees: [],
  pagination: null,
  loading: false,
  error: null,
  isAddModalVisible: false,
  employeeToEdit: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setAddModalVisible: (state, action) => {
      state.isAddModalVisible = action.payload;
    },
    setEmployeeToEdit: (state, action) => {
      state.employeeToEdit = action.payload;
    }
  },
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

    // Update Employee
    builder.addCase(updateEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEmployee.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.employees.findIndex((e) => e.id === action.payload.id || e._id === action.payload._id || e.id === action.payload?.employee?.id);
      if (index !== -1) {
        state.employees[index] = action.payload.employee || action.payload;
      }
    });
    builder.addCase(updateEmployee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Employee
    builder.addCase(deleteEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteEmployee.fulfilled, (state, action) => {
      state.loading = false;
      state.employees = state.employees.filter((e) => e.id !== action.payload && e._id !== action.payload);
    });
    builder.addCase(deleteEmployee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setAddModalVisible, setEmployeeToEdit } = employeeSlice.actions;
export default employeeSlice.reducer;
