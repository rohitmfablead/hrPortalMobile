import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title, Caption, Divider, List } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, Database, LayoutList, Briefcase, ChevronDown, ChevronUp, Palmtree, BookOpen, Bell, FileSignature } from 'lucide-react-native';
import { RootState } from '../redux/store';
import { logoutLocally } from '../redux/slices/authSlice';
import LogoutConfirmationModal from './LogoutConfirmationModal';

export default function CustomDrawerContent(props: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isLogoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const [masterExpanded, setMasterExpanded] = React.useState(false);
  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'admin' || user?.role === 'HR' || user?.role === 'hr';

  const handleLogout = () => {
    setLogoutModalVisible(false);
    dispatch(logoutLocally());
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>

        {/* Profile Header section */}
        <View style={styles.userInfoSection}>
          <View style={styles.profileRow}>
            {user?.avatar ? (
              <Avatar.Image source={{ uri: user.avatar }} size={60} />
            ) : (
              <Avatar.Text
                label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'HR'}
                size={60}
              />
            )}
            <View style={styles.profileTextContainer}>
              <Title style={styles.title}>{user?.name || 'User Name'}</Title>
              <Caption style={styles.caption}>{user?.email || 'user@example.com'}</Caption>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Navigation Links */}
        <View style={styles.drawerSection}>
          {(() => {
            const activeRoute = props.state.routes[props.state.index];
            const lowerState = { ...props.state };

            if (activeRoute.name === 'Main' && activeRoute.state) {
              const mainState = activeRoute.state;
              const activeTabRoute = mainState.routes[mainState.index];
              let targetDrawerRouteName = 'Main';

              if (activeTabRoute.name === 'EmployeeTab') targetDrawerRouteName = 'Employees';
              else if (activeTabRoute.name === 'AttendanceTab') targetDrawerRouteName = isAdminOrHR ? 'Attendance' : 'My Attendance';
              else if (activeTabRoute.name === 'LeaveTab') targetDrawerRouteName = isAdminOrHR ? 'Leaves' : 'My Leaves';
              else if (activeTabRoute.name === 'SettingsTab') targetDrawerRouteName = 'Settings';
              else if (activeTabRoute.name === 'ProfileTab') targetDrawerRouteName = isAdminOrHR ? 'Profile' : 'My Profile';

              const targetIndex = lowerState.routes.findIndex((r: any) => r.name === targetDrawerRouteName);
              if (targetIndex !== -1) {
                lowerState.index = targetIndex;
              }
            }

            return <DrawerItemList {...props} state={lowerState} />;
          })()}

          {isAdminOrHR && (
            <View>
              <DrawerItem
                label={({ focused, color }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Title style={{ fontSize: 14, fontWeight: '500', color: '#0F172A', marginTop: 0, marginBottom: 0 }}>Master</Title>
                    {masterExpanded ? <ChevronUp color="#0F172A" size={18} /> : <ChevronDown color="#0F172A" size={18} />}
                  </View>
                )}
                icon={({ color, size }) => <Database color="#0F172A" size={24} />}
                onPress={() => setMasterExpanded(!masterExpanded)}
                focused={false}
                activeTintColor="#F97316"
                inactiveTintColor="#0F172A"
                style={{ backgroundColor: 'transparent' }}
              />
              {masterExpanded && (
                <View style={{ paddingLeft: 10 }}>
                  <DrawerItem
                    label="Departments"
                    icon={({ color, size }) => <LayoutList color="#0F172A" size={18} />}
                    onPress={() => props.navigation.navigate('Departments')}
                    focused={props.state.routes[props.state.index].name === 'Departments'}
                    activeTintColor="#F97316"
                    inactiveTintColor="#0F172A"
                  />
                  <DrawerItem
                    label="Designations"
                    icon={({ color, size }) => <Briefcase color="#0F172A" size={18} />}
                    onPress={() => props.navigation.navigate('Designations')}
                    focused={props.state.routes[props.state.index].name === 'Designations'}
                    activeTintColor="#F97316"
                    inactiveTintColor="#0F172A"
                  />
                  <DrawerItem
                    label="Leave Types"
                    icon={({ color, size }) => <FileSignature color="#0F172A" size={18} />}
                    onPress={() => props.navigation.navigate('LeaveTypes')}
                    focused={props.state.routes[props.state.index].name === 'LeaveTypes'}
                    activeTintColor="#F97316"
                    inactiveTintColor="#0F172A"
                  />
                </View>
              )}
            </View>
          )}

          {/* Manually render trailing items so Master is above them */}
          {['Holidays', 'Rules', 'Notifications'].map(routeName => {
            const route = props.state.routes.find((r: any) => r.name === routeName);
            if (!route) return null;
            const isFocused = props.state.routes[props.state.index].name === routeName;

            let IconComponent;
            if (routeName === 'Holidays') IconComponent = Palmtree;
            else if (routeName === 'Rules') IconComponent = BookOpen;
            else if (routeName === 'Notifications') IconComponent = Bell;

            return (
              <DrawerItem
                key={route.key}
                label={routeName}
                icon={({ color, size }) => IconComponent ? <IconComponent color={color} size={size} /> : null}
                focused={isFocused}
                activeTintColor="#F97316"
                inactiveTintColor="#0F172A"
                onPress={() => props.navigation.navigate(routeName)}
              />
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Logout Button Fixed at Bottom */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
          <LogOut color="#F97316" size={22} />
          <Title style={styles.logoutText}>Log Out</Title>
        </TouchableOpacity>
      </View>

      <LogoutConfirmationModal
        visible={isLogoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTextContainer: {
    marginLeft: 15,
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    marginTop: 3,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    color: '#0F172A',
  },
  divider: {
    backgroundColor: '#FFFFFF',
    height: 1,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomSection: {
    borderTopColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 5

  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16, marginLeft: 15, fontWeight: 'bold', color: '#F97316',
  },
});
