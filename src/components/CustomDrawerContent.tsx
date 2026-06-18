import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Avatar, Title, Caption, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut } from 'lucide-react-native';
import { RootState } from '../redux/store';
import { logoutLocally } from '../redux/slices/authSlice';
import LogoutConfirmationModal from './LogoutConfirmationModal';

export default function CustomDrawerContent(props: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isLogoutModalVisible, setLogoutModalVisible] = React.useState(false);

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

        {/* Standard Navigation Links */}
        <View style={styles.drawerSection}>
          <DrawerItemList {...props} />
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
    marginBottom: 20,
    borderTopColor: '#0F172A',
    borderTopWidth: 1,
    paddingTop: 15,
    paddingHorizontal: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: { fontSize: 16, marginLeft: 15, fontWeight: 'bold', color: '#F97316',
  },
});
