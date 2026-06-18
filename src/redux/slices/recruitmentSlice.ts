import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Job {
  _id: string;
  title: string;
  department: string;
  description: string;
  status: "Open" | "Closed";
  createdAt?: string;
  id?: string; // fallback
}

export interface Candidate {
  _id: string;
  name: string;
  jobId: string;
  resume: string;
  status: "Applied" | "Shortlisted" | "Rejected" | "Interview";
  createdAt?: string;
  id?: string; // fallback
}

interface RecruitmentState {
  jobs: Job[];
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
}

const initialState: RecruitmentState = {
  jobs: [],
  candidates: [],
  loading: false,
  error: null,
};

// --- Jobs Thunks ---

export const fetchJobs = createAsyncThunk('recruitment/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/recruitment/jobs');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch jobs');
  }
});

export const createJob = createAsyncThunk('recruitment/createJob', async (data: Partial<Job>, { rejectWithValue }) => {
  try {
    const response = await api.post('/recruitment/jobs', data);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to create job');
  }
});

export const updateJob = createAsyncThunk('recruitment/updateJob', async ({ id, data }: { id: string; data: Partial<Job> }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/recruitment/jobs/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to update job');
  }
});

export const deleteJob = createAsyncThunk('recruitment/deleteJob', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/recruitment/jobs/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete job');
  }
});

// --- Candidates Thunks ---

export const fetchCandidates = createAsyncThunk('recruitment/fetchCandidates', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/recruitment/candidates');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch candidates');
  }
});

export const createCandidate = createAsyncThunk('recruitment/createCandidate', async (data: Partial<Candidate>, { rejectWithValue }) => {
  try {
    const response = await api.post('/recruitment/candidates', data);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to create candidate');
  }
});

export const updateCandidateStatus = createAsyncThunk('recruitment/updateCandidateStatus', async ({ id, status }: { id: string; status: Candidate['status'] }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/recruitment/candidates/${id}/status`, { status });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to update candidate status');
  }
});

export const deleteCandidate = createAsyncThunk('recruitment/deleteCandidate', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/recruitment/candidates/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete candidate');
  }
});

const recruitmentSlice = createSlice({
  name: 'recruitment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Jobs
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => { state.loading = false; state.jobs = action.payload; })
      .addCase(fetchJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createJob.fulfilled, (state, action) => { state.jobs.unshift(action.payload); })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(j => j._id === action.payload._id);
        if (index >= 0) state.jobs[index] = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(j => j._id !== action.payload);
        state.candidates = state.candidates.filter(c => c.jobId !== action.payload);
      });

    // Candidates
    builder
      .addCase(fetchCandidates.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCandidates.fulfilled, (state, action) => { state.loading = false; state.candidates = action.payload; })
      .addCase(fetchCandidates.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createCandidate.fulfilled, (state, action) => { state.candidates.unshift(action.payload); })
      .addCase(updateCandidateStatus.fulfilled, (state, action) => {
        const index = state.candidates.findIndex(c => c._id === action.payload._id);
        if (index >= 0) state.candidates[index] = action.payload;
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.candidates = state.candidates.filter(c => c._id !== action.payload);
      });
  },
});

export default recruitmentSlice.reducer;
