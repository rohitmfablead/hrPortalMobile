import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView, DeviceEventEmitter } from 'react-native';
import { Menu, Bell, ArrowLeft, Plus } from 'lucide-react-native';
import { DrawerHeaderProps } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

function getHeaderTitle(route: any, optionsTitle: string | undefined) {
  if (route.name === 'Main') {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'DashboardTab';
    switch (routeName) {
      case 'DashboardTab': return 'Dashboard';
      case 'EmployeeTab': return 'Employee';
      case 'AttendanceTab': return 'Attendance';
      case 'LeaveTab': return 'Leave';
      case 'SettingsTab': return 'Settings';
      case 'ProfileTab': return 'Profile';
      default: return routeName;
    }
  }
  return optionsTitle !== undefined ? optionsTitle : route.name;
}

export default function CustomHeader({ navigation, options, route, showBackButton }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  // Try to use the title from options, fallback to route name or nested tab route
  const title = getHeaderTitle(route, options.title);
  const isBottomNavScreen = route.name === 'Main';

  const adminOnlyAddScreens = [
    'Employee', 'Holidays', 'Leave', 'Announcements', 'Payslip', 
    'Attendance', 'Performances', 'Departments', 'Rules', 
    'Designations', 'LeaveTypes', 'Tasks'
  ];
  
  const allRolesAddScreens = [
    'Leaves', // MyLeaves
    'Feedback'
  ];

  const showAddBtn = allRolesAddScreens.includes(title) || (isAdminOrHR && adminOnlyAddScreens.includes(title));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {showBackButton ? (
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.iconButton}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => (navigation as any).toggleDrawer?.()} 
            style={styles.iconButton}
          >
            <Menu color="#FFFFFF" size={24} />
          </TouchableOpacity>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightContainer}>
          {showAddBtn && (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => DeviceEventEmitter.emit('onAddAction')}
            >
              <Plus color="#FFFFFF" size={24} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications' as never)}>
            <Bell color="#FFFFFF" size={22} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F97316',
  },
  headerContainer: {
    height: 60,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F97316',
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badge: {backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
