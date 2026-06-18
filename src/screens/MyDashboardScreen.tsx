import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchDashboardData } from '../redux/slices/dashboardSlice';
import { CalendarCheck, CalendarOff, Clock, TrendingUp, LogIn, LogOut, Cake, CheckCircle, Palmtree } from 'lucide-react-native';
import { markManualAttendance } from '../redux/slices/attendanceSlice';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { mockAttendance, mockLeaves, mockBirthdays, mockTasks } from '../mockData/mockData';
import FaceCheckInModal from '../components/FaceCheckInModal';
import api from '../services/api';

export default function MyDashboardScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: stats, loading: dashboardLoading } = useSelector((state: RootState) => state.dashboard);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const [isCheckedIn, setIsCheckedIn] = React.useState(false);
  const [isCheckedOut, setIsCheckedOut] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(true);
  const [isFaceModalVisible, setIsFaceModalVisible] = React.useState(false);
  const [todayShift, setTodayShift] = React.useState<any>(null);

  const isEmployee = user?.role === 'Employee' || user?.role === 'employee';

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchDashboardData('today'));
      const fetchStatus = async () => {
        if (!isEmployee) {
          setStatusLoading(false);
          return;
        }
        try {
          const res = await api.get('/attendance/today-status');
          if (res.data?.success) {
            setIsCheckedIn(res.data.data.isCheckedIn);
            setIsCheckedOut(res.data.data.isCheckedOut);
            setTodayShift(res.data.data);
          }
        } catch (err) {
          console.log('Error fetching today status', err);
        } finally {
          setStatusLoading(false);
        }
      };
      fetchStatus();
    }, [])
  );

  const handleAttendance = () => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (isCheckedIn) {
      // Check Out
      dispatch(markManualAttendance({ checkIn: '', checkOut: time, employeeId: user?.id }))
        .unwrap()
        .then(() => {
          Alert.alert('Success', 'Checked out successfully at ' + time);
          setIsCheckedIn(false);
        })
        .catch((err) => Alert.alert('Error', err));
    } else {
      // Open Face Recognition Modal
      setIsFaceModalVisible(true);
    }
  };

  const handleFaceMatchSuccess = () => {
    setIsFaceModalVisible(false);
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    dispatch(markManualAttendance({ checkIn: time, employeeId: user?.id }))
      .unwrap()
      .then(() => {
        Alert.alert('Success', 'Face matched! Checked in successfully at ' + time);
        setIsCheckedIn(true);
      })
      .catch((err) => Alert.alert('Error', err));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.userName}>{user?.name || 'Employee'} 👋</Text>
            {stats?.todayHours ? (
              <View style={styles.hoursBadge}>
                <Clock color="#a855f7" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.hoursText}>{stats.todayHours}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Quick Actions - Only for Employees */}
      {isEmployee && (
        <View style={{ marginBottom: 24 }}>
          <View style={[styles.actionsContainer, { marginBottom: 0 }]}>
            <TouchableOpacity 
              style={[
                styles.actionBtn, 
                isCheckedOut ? styles.checkOutBtn : (isCheckedIn ? styles.checkOutBtn : styles.checkInBtn), 
                { width: '100%', opacity: (isCheckedOut || statusLoading) ? 0.6 : 1 }
              ]} 
              onPress={isCheckedOut ? undefined : handleAttendance}
              disabled={isCheckedOut || statusLoading}
            >
              {isCheckedOut ? <CheckCircle color="#F97316" size={20} /> : (isCheckedIn ? <LogOut color="#F97316" size={20} /> : <LogIn color="#F97316" size={20} />)}
              <Text style={styles.actionBtnText}>
                {statusLoading ? 'Checking...' : (isCheckedOut ? 'Shift Completed' : (isCheckedIn ? 'Check Out' : 'Check In'))}
              </Text>
            </TouchableOpacity>
          </View>

          {todayShift?.checkIn && (
            <View style={styles.shiftInfoRow}>
              <View style={styles.shiftInfoItem}>
                <Text style={styles.shiftInfoLabel}>Check In</Text>
                <Text style={styles.shiftInfoValue}>{todayShift.checkIn}</Text>
              </View>
              <View style={styles.shiftInfoItem}>
                <Text style={styles.shiftInfoLabel}>Completed</Text>
                <Text style={[styles.shiftInfoValue, {color: '#0F172A'}]}>{todayShift.hoursCompleted}</Text>
              </View>
              <View style={styles.shiftInfoItem}>
                <Text style={styles.shiftInfoLabel}>Remaining</Text>
                <Text style={[styles.shiftInfoValue, {color: '#F97316'}]}>{todayShift.hoursRemaining}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick Links</Text>
      <View style={styles.quickLinksContainer}>
        {[
          { name: 'Holidays', route: 'Holidays', icon: require('lucide-react-native').Palmtree, color: '#F97316' },
          { name: 'Rules', route: 'Rules', icon: require('lucide-react-native').BookOpen, color: '#F97316' },
          { name: 'Announcements', route: 'Announcements', icon: require('lucide-react-native').Megaphone, color: '#F97316' },
          { name: 'Feedback', route: 'Feedback', icon: require('lucide-react-native').MessageSquare, color: '#F97316' },
          { name: 'Performance', route: 'Performances', icon: require('lucide-react-native').LineChart, color: '#F97316' },
          { name: 'Notifications', route: 'Notifications', icon: require('lucide-react-native').Bell, color: '#F97316' },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <TouchableOpacity 
              key={link.name} 
              style={styles.quickLinkBox} 
              onPress={() => navigation.navigate(link.route as never)}
            >
              <View style={[styles.quickLinkIconContainer, { backgroundColor: `${link.color}20` }]}>
                <Icon color={link.color} size={24} />
              </View>
              <Text style={styles.quickLinkText}>{link.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>My Overview</Text>

      {/* Stats Grid */}
      <View style={styles.grid}>
        {/* Days Present */}
        <Card style={[styles.card, styles.cardGreen]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                <CalendarCheck color="#F97316" size={24} />
              </View>
            </View>
            <Text style={styles.value}>{stats?.attendanceThisMonth?.present || 0}</Text>
            <Text style={styles.label}>Days Present</Text>
          </Card.Content>
        </Card>

        {/* Leaves Taken */}
        <Card style={[styles.card, styles.cardOrange]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                <CalendarOff color="#F97316" size={24} />
              </View>
            </View>
            <Text style={styles.value}>{stats?.attendanceThisMonth?.absent || 0}</Text>
            <Text style={styles.label}>Leaves Taken</Text>
          </Card.Content>
        </Card>

        {/* Late Arrivals */}
        <Card style={[styles.card, styles.cardRed]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                <Clock color="#F97316" size={24} />
              </View>
            </View>
            <Text style={styles.value}>{stats?.attendanceThisMonth?.late || 0}</Text>
            <Text style={styles.label}>Late Arrivals</Text>
          </Card.Content>
        </Card>

        {/* Productivity */}
        <Card style={[styles.card, styles.cardPurple]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                <TrendingUp color="#a855f7" size={24} />
              </View>
            </View>
            <Text style={styles.value}>{stats?.attendanceThisMonth?.percentage || 100}%</Text>
            <Text style={styles.label}>Productivity</Text>
          </Card.Content>
        </Card>
      </View>

      {/* My Weekly Attendance */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Weekly Attendance</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Attendance' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {stats?.weeklyAttendance && stats.weeklyAttendance.length > 0 ? (
        stats.weeklyAttendance.slice(0, 5).map((item: any, index: number) => (
          <View key={index} style={styles.listItem}>
            <View>
              <Text style={styles.listTitle}>{item.day}, {new Date(item.date).toLocaleDateString()}</Text>
              {item.isWeekend && <Text style={styles.listSubtitle}>Weekend</Text>}
            </View>
            <View style={[
              styles.statusBadge, 
              item.status === 'present' ? styles.badgeGreen : 
              (item.status === 'absent' || item.status === 'missing' ? styles.badgeRed : styles.badgeOrange)
            ]}>
              <Text style={styles.statusText}>{item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : ''}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={{color: '#0F172A'}}>No attendance data</Text>
      )}

      {/* My Leaves */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Leaves</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Leaves' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {stats?.recentLeaves && stats.recentLeaves.length > 0 ? (
        stats.recentLeaves.map((item: any, index: number) => (
          <View key={index} style={styles.listItem}>
            <View>
              <Text style={styles.listTitle}>{item.type || 'Leave'}</Text>
              <Text style={styles.listSubtitle}>{item.startDate} to {item.endDate}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'Approved' ? styles.badgeGreen : styles.badgeOrange]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={{color: '#0F172A'}}>No recent leaves</Text>
      )}

      {/* Upcoming Holidays */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {stats?.upcomingHolidays && stats.upcomingHolidays.length > 0 ? (
          stats.upcomingHolidays.map((item: any, index: number) => (
            <View key={index} style={styles.birthdayCard}>
              <View style={[styles.birthdayIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Palmtree color="#F97316" size={24} />
              </View>
              <Text style={styles.birthdayName}>{item.name}</Text>
              <Text style={[styles.birthdayDate, { color: '#0F172A' }]}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
          ))
        ) : (
          <Text style={{color: '#0F172A', marginLeft: 16}}>No upcoming holidays</Text>
        )}
      </ScrollView>

      {/* Upcoming Birthdays */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Birthdays</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {stats?.upcomingBirthdays && stats.upcomingBirthdays.length > 0 ? (
          stats.upcomingBirthdays.map((item: any, index: number) => (
            <View key={item.id || index} style={styles.birthdayCard}>
              <View style={styles.birthdayIcon}>
                <Cake color="#F97316" size={24} />
              </View>
              <Text style={styles.birthdayName}>{item.name}</Text>
              <Text style={styles.birthdayDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
          ))
        ) : (
          <Text style={{color: '#0F172A', marginLeft: 16}}>No upcoming birthdays</Text>
        )}
      </ScrollView>

      {/* My Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Tasks</Text>
      </View>
      {stats?.pendingTasks && stats.pendingTasks.length > 0 ? (
        stats.pendingTasks.map((item: any, index: number) => (
          <View key={item.id || index} style={styles.taskItem}>
            <View style={styles.taskIcon}>
              <CheckCircle color={item.status === 'Completed' ? '#0F172A' : '#F97316'} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.listTitle, item.status === 'Completed' && styles.completedText]}>{item.title}</Text>
              <Text style={styles.listSubtitle}>{item.status}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={{color: '#0F172A'}}>No tasks pending</Text>
      )}
      
      {isEmployee && (
        <FaceCheckInModal 
          visible={isFaceModalVisible} 
          onClose={() => setIsFaceModalVisible(false)} 
          onSuccess={handleFaceMatchSuccess} 
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkInBtn: {
    backgroundColor: '#FFFFFF', // Green
  },
  checkOutBtn: {
    backgroundColor: '#FFFFFF', // Red
  },
  actionBtnText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickLinkBox: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickLinkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLinkText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardGreen: { borderBottomWidth: 4, borderBottomColor: '#0F172A' },
  cardOrange: { borderBottomWidth: 4, borderBottomColor: '#F97316' },
  cardRed: { borderBottomWidth: 4, borderBottomColor: '#0F172A' },
  cardPurple: { borderBottomWidth: 4, borderBottomColor: '#a855f7' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  label: { fontSize: 14, color: '#F97316',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  viewAllText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listSubtitle: {
    color: '#0F172A',
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeGreen: { backgroundColor: '#FFFFFF' },
  badgeRed: { backgroundColor: '#FFFFFF' },
  badgeOrange: { backgroundColor: 'rgba(249, 115, 22, 0.1)' },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  birthdayCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  birthdayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  birthdayName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  birthdayDate: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '500',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskIcon: {
    marginRight: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#0F172A',
  },
  hoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 12,
  },
  hoursText: {
    color: '#a855f7',
    fontSize: 13,
    fontWeight: 'bold',
  },
  shiftInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shiftInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  shiftInfoLabel: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  shiftInfoValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
