export const mockHolidays = [
  { id: '1', name: 'New Year', date: 'Jan 1, 2026' },
  { id: '2', name: 'Company Anniversary', date: 'Apr 12, 2026' },
  { id: '3', name: 'Summer Break', date: 'Jul 4, 2026' },
  { id: '4', name: 'Thanksgiving', date: 'Nov 26, 2026' },
];

export const mockLeaves = [
  { id: '1', type: 'Sick Leave', start: 'Oct 10, 2026', end: 'Oct 12, 2026', status: 'Approved' },
  { id: '2', type: 'Casual Leave', start: 'Nov 5, 2026', end: 'Nov 6, 2026', status: 'Pending' },
  { id: '3', type: 'Vacation', start: 'Dec 20, 2026', end: 'Dec 30, 2026', status: 'Approved' },
];

export const mockAttendance = [
  { id: '1', date: 'Today', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
  { id: '2', date: 'Yesterday', status: 'Present', checkIn: '08:55 AM', checkOut: '06:15 PM' },
  { id: '3', date: 'Oct 12, 2026', status: 'Absent', checkIn: '-', checkOut: '-' },
  { id: '4', date: 'Oct 11, 2026', status: 'Late', checkIn: '10:30 AM', checkOut: '06:00 PM' },
];

export const mockDashboardStats = {
  totalEmployees: 124,
  todayAttendance: 118,
  pendingLeaves: 5,
  lateCount: 3,
};

export const mockPayslips = [
  { id: '1', period: 'September 2026', amount: '$5,200', status: 'Paid' },
  { id: '2', period: 'August 2026', amount: '$5,200', status: 'Paid' },
  { id: '3', period: 'July 2026', amount: '$4,800', status: 'Paid' },
];

export const mockProfile = {
  name: 'Jane Doe',
  email: 'jane.doe@company.com',
  role: 'Senior Developer',
  department: 'Engineering',
  joinDate: 'Jan 15, 2022',
};

export const mockNotifications = [
  { id: '1', title: 'System Update', message: 'The HR system will be down for maintenance this weekend.', date: '2h ago' },
  { id: '2', title: 'Leave Approved', message: 'Your casual leave request has been approved.', date: '1d ago' },
  { id: '3', title: 'New Policy', message: 'Please review the updated remote work guidelines.', date: '3d ago' },
];

export const mockPayroll = [
  { id: '1', employee: 'Jane Doe', period: 'Sep 2026', gross: '$6,000', net: '$5,200' },
  { id: '2', employee: 'John Smith', period: 'Sep 2026', gross: '$5,500', net: '$4,800' },
  { id: '3', employee: 'Alice Johnson', period: 'Sep 2026', gross: '$7,200', net: '$6,100' },
];

export const mockPerformances = [
  { id: '1', employee: 'Jane Doe', rating: 'Exceeds Expectations', period: 'Q3 2026' },
  { id: '2', employee: 'John Smith', rating: 'Meets Expectations', period: 'Q3 2026' },
  { id: '3', employee: 'Alice Johnson', rating: 'Outstanding', period: 'Q3 2026' },
];

export const mockRecruitment = [
  { id: '1', position: 'Frontend Developer', applicants: 24, status: 'Open' },
  { id: '2', position: 'Backend Developer', applicants: 12, status: 'Interviewing' },
  { id: '3', position: 'Product Manager', applicants: 8, status: 'Closed' },
];

export const mockRules = [
  { id: '1', title: 'Code of Conduct', description: 'Be respectful and professional at all times.' },
  { id: '2', title: 'Remote Work', description: 'Core hours are 10 AM to 3 PM EST.' },
  { id: '3', title: 'Expense Policy', description: 'Submit expenses within 30 days of purchase.' },
];

export const mockSettings = [
  { id: '1', name: 'Dark Mode', type: 'toggle', value: true },
  { id: '2', name: 'Push Notifications', type: 'toggle', value: true },
  { id: '3', name: 'Email Alerts', type: 'toggle', value: false },
  { id: '4', name: 'Language', type: 'select', value: 'English' },
];

export const mockEmployees = [
  { id: '1', name: 'Jane Doe', role: 'Senior Developer', department: 'Engineering' },
  { id: '2', name: 'John Smith', role: 'UX Designer', department: 'Design' },
  { id: '3', name: 'Alice Johnson', role: 'Product Manager', department: 'Product' },
  { id: '4', name: 'Bob Wilson', role: 'QA Engineer', department: 'Engineering' },
];

export const mockBirthdays = [
  { id: '1', name: 'Jane Doe', date: 'Oct 15', role: 'Senior Developer' },
  { id: '2', name: 'Alice Johnson', date: 'Nov 02', role: 'Product Manager' },
  { id: '3', name: 'Bob Wilson', date: 'Dec 12', role: 'QA Engineer' },
];

export const mockTasks = [
  { id: '1', title: 'Complete performance reviews', status: 'Pending', deadline: 'Oct 15, 2026' },
  { id: '2', title: 'Approve pending leaves', status: 'In Progress', deadline: 'Oct 12, 2026' },
  { id: '3', title: 'Onboard new UI/UX Designer', status: 'Completed', deadline: 'Oct 05, 2026' },
];
