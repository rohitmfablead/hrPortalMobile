import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../redux/store';
import { hydrateAuth, fetchMe } from '../redux/slices/authSlice';
import CustomDrawerContent from '../components/CustomDrawerContent';
import CustomHeader from '../components/CustomHeader';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HolidaysScreen from '../screens/HolidaysScreen';
import LeavesScreen from '../screens/LeavesScreen';
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

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User, Settings as SettingsIcon, Calendar, Users, LayoutList } from 'lucide-react-native';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isHydrated, loading } = useSelector((state: RootState) => state.auth);

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

  if (!isHydrated || loading) {
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
        tabBarInactiveTintcolor: '#0F172A',
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
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
        drawerStyle: { backgroundColor: '#FFFFFF', width: 280 },
        drawerActiveTintColor: '#F97316',
        drawerInactiveTintcolor: '#0F172A',
      }}
    >
      <Drawer.Screen name="Main" component={MainTabs} options={{ title: 'Home' }} />

      {/* Role-Based Screens */}
      {isAdminOrHR ? (
        <>
          <Drawer.Screen name="Employees" component={EmployeesScreen} />
          <Drawer.Screen name="Attendance" component={AttendanceScreen} />
          <Drawer.Screen name="Leaves" component={LeavesScreen} />
          <Drawer.Screen name="Settings" component={SettingsScreen} />
          <Drawer.Screen name="Profile" component={ProfileScreen} />
          <Drawer.Screen name="Payroll" component={PayrollScreen} />
          <Drawer.Screen name="Performances" component={PerformancesScreen} />
          <Drawer.Screen name="Recruitment" component={RecruitmentScreen} />
        </>
      ) : (
        <>
          <Drawer.Screen name="My Attendance" component={MyAttendanceScreen} options={{ title: 'Attendance' }} />
          <Drawer.Screen name="My Leaves" component={MyLeavesScreen} options={{ title: 'Leaves' }} />
          <Drawer.Screen name="My Profile" component={MyProfileScreen} options={{ title: 'Profile' }} />
          <Drawer.Screen name="My Payslip" component={MyPayslipScreen} options={{ title: 'Payslip' }} />
        </>
      )}

      {/* Common Screens for all roles */}
      <Drawer.Screen name="Announcements" component={AnnouncementsScreen} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      <Drawer.Screen name="Holidays" component={HolidaysScreen} />
      <Drawer.Screen name="Rules" component={RulesScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />

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

        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}