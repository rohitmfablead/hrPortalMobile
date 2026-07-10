import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import attendanceReducer from './slices/attendanceSlice';
import leaveReducer from './slices/leaveSlice';
import payrollReducer from './slices/payrollSlice';
import notificationReducer from './slices/notificationSlice';
import holidayReducer from './slices/holidaySlice';
import ruleReducer from './slices/ruleSlice';
import announcementReducer from './slices/announcementSlice';
import feedbackReducer from './slices/feedbackSlice';
import complaintReducer from './slices/complaintSlice';
import performanceReducer from './slices/performanceSlice';
import dashboardReducer from './slices/dashboardSlice';
import recruitmentReducer from './slices/recruitmentSlice';
import masterReducer from './slices/masterSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    attendance: attendanceReducer,
    leaves: leaveReducer,
    payroll: payrollReducer,
    notifications: notificationReducer,
    holidays: holidayReducer,
    rules: ruleReducer,
    announcements: announcementReducer,
    feedback: feedbackReducer,
    complaints: complaintReducer,
    performance: performanceReducer,
    dashboard: dashboardReducer,
    recruitment: recruitmentReducer,
    master: masterReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
