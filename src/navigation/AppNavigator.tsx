import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../redux/store';
import { hydrateAuth, fetchMe } from '../redux/slices/authSlice';
import CustomDrawerContent from '../components/CustomDrawerContent';
import CustomHeader from '../components/CustomHeader';
import GlobalSocketListener from '../components/GlobalSocketListener';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LeaveTypesScreen from '../screens/LeaveTypesScreen';
import HolidaysScreen from '../screens/HolidaysScreen';
import LeavesScreen from '../screens/LeavesScreen';
import LeaveDetailsScreen from '../screens/LeaveDetailsScreen';
import MyAttendanceScreen from '../screens/MyAttendanceScreen';
import MyDashboardScreen from '../screens/MyDashboardScreen';
import MyLeavesScreen from '../screens/MyLeavesScreen';
import MyPayslipScreen from '../screens/MyPayslipScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PayrollScreen from '../screens/PayrollScreen';
import PerformancesScreen from '../screens/PerformancesScreen';
import RecruitmentScreen from '../screens/RecruitmentScreen';
import RulesScreen from '../screens/RulesScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import DepartmentsScreen from '../screens/DepartmentsScreen';
import DesignationsScreen from '../screens/DesignationsScreen';
import EmployeeDetailsScreen from '../screens/EmployeeDetailsScreen';
import AddEditEmployeeScreen from '../screens/AddEditEmployeeScreen';
import AttendanceDetailsScreen from '../screens/AttendanceDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import TasksScreen from '../screens/TasksScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Home, User, Settings as SettingsIcon, Calendar, Users, LayoutList,
  Banknote, TrendingUp, UserPlus, Megaphone, MessageSquare, 
  Palmtree, BookOpen, Bell, FileText, Briefcase, FileSignature, ListTodo
} from 'lucide-react-native';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isHydrated, loading, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isHydrated) {
      dispatch(hydrateAuth());
    }
  }, [isHydrated, dispatch]);

  useEffect(() => {
    if (isHydrated && token) {
      dispatch(fetchMe());
    }
  }, [isHydrated, token, dispatch]);

  if (!isHydrated || (loading && !user && token)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return token ? <>{children}</> : <LoginScreen />;
}

function MainTabs() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0' },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#0F172A',
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={isAdminOrHR ? DashboardScreen : MyDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />

      {isAdminOrHR && (
        <Tab.Screen
          name="EmployeeTab"
          component={EmployeesScreen}
          options={{
            title: 'Employee',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
          }}
        />
      )}

      <Tab.Screen
        name="AttendanceTab"
        component={isAdminOrHR ? AttendanceScreen : MyAttendanceScreen}
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="LeaveTab"
        component={isAdminOrHR ? LeavesScreen : MyLeavesScreen}
        options={{
          title: 'Leave',
          tabBarIcon: ({ color, size }) => <LayoutList color={color} size={size} />
        }}
      />
      {isAdminOrHR ? (
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />
          }}
        />
      ) : (
        <Tab.Screen
          name="ProfileTab"
          component={MyProfileScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />
          }}
        />
      )}
    </Tab.Navigator>
  );
}

function MainDrawer() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'admin' || user?.role === 'HR' || user?.role === 'hr';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
        drawerStyle: { backgroundColor: '#FFFFFF', width: 280 },
        drawerActiveTintColor: '#F97316',
        drawerInactiveTintColor: '#0F172A',
      }}
    >
      <Drawer.Screen name="Main" component={MainTabs} options={{ title: 'Home', drawerIcon: ({ color, size }) => <Home color={color} size={size} /> }} listeners={({ navigation }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('Main', { screen: 'DashboardTab' }); } })} />

      {/* Role-Based Screens */}
      {isAdminOrHR ? (
        <>
          <Drawer.Screen name="Employees" component={EmployeesScreen} options={{ drawerIcon: ({ color, size }) => <Users color={color} size={size} /> }} listeners={({ navigation }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('Main', { screen: 'EmployeeTab' }); } })} />
          <Drawer.Screen name="Attendance" component={AttendanceScreen} options={{ drawerIcon: ({ color, size }) => <Calendar color={color} size={size} /> }} listeners={({ navigation }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('Main', { screen: 'AttendanceTab' }); } })} />
          <Drawer.Screen name="Leaves" component={LeavesScreen} options={{ drawerIcon: ({ color, size }) => <LayoutList color={color} size={size} /> }} listeners={({ navigation }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('Main', { screen: 'LeaveTab' }); } })} />
          <Drawer.Screen name="Tasks" component={TasksScreen} options={{ drawerIcon: ({ color, size }) => <ListTodo color={color} size={size} /> }} />
          <Drawer.Screen name="Settings" component={SettingsScreen} options={{ drawerIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> }} listeners={({ navigation }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('Main', { screen: 'SettingsTab' }); } })} />
          <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="Payroll" component={PayrollScreen} options={{ drawerIcon: ({ color, size }) => <Banknote color={color} size={size} /> }} />
          <Drawer.Screen name="Performances" component={PerformancesScreen} options={{ drawerIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }} />
          <Drawer.Screen name="Recruitment" component={RecruitmentScreen} options={{ drawerIcon: ({ color, size }) => <UserPlus color={color} size={size} /> }} />
          <Drawer.Screen name="Departments" component={DepartmentsScreen} options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="Designations" component={DesignationsScreen} options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen name="LeaveTypes" component={LeaveTypesScreen} options={{ drawerItemStyle: { display: 'none' } }} />
        </>
      ) : (
        <>
          <Drawer.Screen name="My Attendance" component={MyAttendanceScreen} options={{ title: 'Attendance', drawerIcon: ({ color, size }) => <Calendar color={color} size={size} /> }} listeners={({ navigation }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('Main', { screen: 'AttendanceTab' }); } })} />
          <Drawer.Screen name="My Leaves" component={MyLeavesScreen} options={{ title: 'Leaves', drawerIcon: ({ color, size }) => <LayoutList color={color} size={size} /> }} listeners={({ navigation }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('Main', { screen: 'LeaveTab' }); } })} />
          <Drawer.Screen name="My Tasks" component={TasksScreen} options={{ title: 'Tasks', drawerIcon: ({ color, size }) => <ListTodo color={color} size={size} /> }} />
          <Drawer.Screen name="My Profile" component={MyProfileScreen} options={{ title: 'Profile', drawerIcon: ({ color, size }) => <User color={color} size={size} /> }} listeners={({ navigation }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('Main', { screen: 'ProfileTab' }); } })} />
          <Drawer.Screen name="My Payslip" component={MyPayslipScreen} options={{ title: 'Payslip', drawerIcon: ({ color, size }) => <FileText color={color} size={size} /> }} />
          <Drawer.Screen name="My Performances" component={PerformancesScreen} options={{ title: 'Performances', drawerIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }} />
        </>
      )}

      {/* Common Screens for all roles */}
      <Drawer.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages', drawerIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
      <Drawer.Screen name="Announcements" component={AnnouncementsScreen} options={{ drawerIcon: ({ color, size }) => <Megaphone color={color} size={size} /> }} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} options={{ drawerIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
      <Drawer.Screen name="Holidays" component={HolidaysScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="Rules" component={RulesScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ drawerItemStyle: { display: 'none' } }} />

      {/* Hidden Screens that are part of MainTabs but might be targeted directly */}
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="My Dashboard" component={MyDashboardScreen} options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />

        <Stack.Screen name="Root">
          {() => (
            <RequireAuth>
              <MainDrawer />
            </RequireAuth>
          )}
        </Stack.Screen>

        <Stack.Screen name="EmployeeDetails" component={EmployeeDetailsScreen} options={{ headerShown: true, header: (props) => <CustomHeader {...props} showBackButton={true} />, title: 'Employee Details' }} />
        <Stack.Screen name="AddEditEmployee" component={AddEditEmployeeScreen} options={{ headerShown: true, header: (props) => <CustomHeader {...props} showBackButton={true} />, title: 'Employee Form' }} />
        <Stack.Screen name="AttendanceDetails" component={AttendanceDetailsScreen} options={{ headerShown: true, header: (props) => <CustomHeader {...props} showBackButton={true} />, title: 'Attendance Details' }} />
        <Stack.Screen name="LeaveDetails" component={LeaveDetailsScreen} options={{ headerShown: true, header: (props) => <CustomHeader {...props} showBackButton={true} />, title: 'Leave Details' }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ headerShown: false }} />
        
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
      <GlobalSocketListener />
      <Toast />
    </NavigationContainer>
  );
}