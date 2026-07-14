import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform, ActivityIndicator } from 'react-native';
import { RefreshControl } from "react-native";
import { Card, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchDashboardData } from '../redux/slices/dashboardSlice';
import { CalendarCheck, CalendarOff, Clock, TrendingUp, LogIn, LogOut, Cake, CheckCircle, Palmtree, BookOpen, Megaphone, MessageSquare, LineChart, Bell } from 'lucide-react-native';
import { markManualAttendance } from '../redux/slices/attendanceSlice';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FaceCheckInModal from '../components/FaceCheckInModal';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const getAvatarUri = (avatarPath: string | undefined | null) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  const normalizedPath = avatarPath.replace(/\\/g, '/');
  return `https://hrback-production-61ba.up.railway.app${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
};

export default function MyDashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const { user } = useSelector((state: RootState) => state.auth);
  const { data: stats, loading: dashboardLoading } = useSelector((state: RootState) => state.dashboard);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const [isCheckedIn, setIsCheckedIn] = React.useState(false);
  const [isCheckedOut, setIsCheckedOut] = React.useState(false);
  const [isCheckedIn2, setIsCheckedIn2] = React.useState(false);
  const [isCheckedOut2, setIsCheckedOut2] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(true);
  const [isFaceModalVisible, setIsFaceModalVisible] = React.useState(false);
  const [todayShift, setTodayShift] = React.useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

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
            setIsCheckedIn2(res.data.data.isCheckedIn2);
            setIsCheckedOut2(res.data.data.isCheckedOut2);
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
    if (isCheckedIn2 && !isCheckedOut2) {
      setCheckoutLoading(true);
      const payload = { checkIn2: todayShift?.checkIn2 || '', checkOut2: time, employeeId: user?.id };
      dispatch(markManualAttendance(payload))
        .unwrap()
        .then(() => {
          Toast.show({ type: 'success', text1: 'Success', text2: `Checked out successfully at ${time}` });
          setIsCheckedOut2(true);
          setCheckoutLoading(false);
        })
        .catch((err) => {
          Toast.show({ type: 'error', text1: 'Error', text2: err?.message || err });
          setCheckoutLoading(false);
        });
    } else if (isCheckedOut && !isCheckedIn2) {
      setIsFaceModalVisible(true);
    } else if (isCheckedIn && !isCheckedOut) {
      setCheckoutLoading(true);
      const payload = { checkIn: todayShift?.checkIn || '', checkOut: time, employeeId: user?.id };
      dispatch(markManualAttendance(payload))
        .unwrap()
        .then(() => {
          Toast.show({ type: 'success', text1: 'Success', text2: `Checked out successfully at ${time}` });
          setIsCheckedOut(true);
          setCheckoutLoading(false);
        })
        .catch((err) => {
          Toast.show({ type: 'error', text1: 'Error', text2: err?.message || err });
          setCheckoutLoading(false);
        });
    } else {
      setIsFaceModalVisible(true);
    }
  };

  const handleFaceMatchSuccess = () => {
    setIsFaceModalVisible(false);
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const isShift2 = isCheckedOut && !isCheckedIn2;
    const payload = isShift2 ? { checkIn2: time, employeeId: user?.id } : { checkIn: time, employeeId: user?.id };

    dispatch(markManualAttendance(payload))
      .unwrap()
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `Face matched! Checked in successfully at ${time}`
        });
        if (isShift2) {
          setIsCheckedIn2(true);
        } else {
          setIsCheckedIn(true);
        }
      })
      .catch((err) => Toast.show({ type: 'error', text1: 'Error', text2: err?.message || err }));
  };

  const avatarUri = getAvatarUri(user?.avatar);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}>

      {/* Welcome Section - Premium Header with Gradient */}
      <LinearGradient colors={['#F97316', '#EA580C']} style={styles.welcomeSection}>
        <View style={styles.welcomeHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Employee'} 👋</Text>
          </View>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'HR'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Quick Actions - Only for Employees */}
      {isEmployee && (
        <View style={styles.attendanceSection}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isCheckedOut2 ? styles.checkOutBtn : (!isCheckedOut ? (isCheckedIn ? styles.checkOutBtn : styles.checkInBtn) : (isCheckedIn2 ? styles.checkOutBtn : styles.checkInBtn)),
                { width: '100%', opacity: (isCheckedOut2 || statusLoading) ? 0.6 : 1 }
              ]}
              onPress={isCheckedOut2 ? undefined : handleAttendance}
              disabled={isCheckedOut2 || statusLoading}
            >
              <LinearGradient 
                colors={isCheckedOut2 ? ['#F1F5F9', '#E2E8F0'] : (!isCheckedOut ? (isCheckedIn ? ['#FEE2E2', '#FECACA'] : ['#D1FAE5', '#A7F3D0']) : (isCheckedIn2 ? ['#FEE2E2', '#FECACA'] : ['#D1FAE5', '#A7F3D0']))} 
                style={styles.actionBtnGradient}
              >
                {checkoutLoading ? (
                  <ActivityIndicator color="#DC2626" size="small" />
                ) : (
                  isCheckedOut2 ? <CheckCircle color="#64748B" size={24} /> : (!isCheckedOut ? (isCheckedIn ? <LogOut color="#DC2626" size={24} /> : <LogIn color="#059669" size={24} />) : (isCheckedIn2 ? <LogOut color="#DC2626" size={24} /> : <LogIn color="#059669" size={24} />))
                )}
                <Text style={[styles.actionBtnText, { color: isCheckedOut2 ? '#475569' : (!isCheckedOut ? (isCheckedIn ? '#B91C1C' : '#047857') : (isCheckedIn2 ? '#B91C1C' : '#047857')) }]}>
                  {statusLoading ? 'Checking...' : checkoutLoading ? 'Processing...' : (isCheckedOut2 ? 'Completed' : (!isCheckedOut ? (isCheckedIn ? 'Check Out' : 'Check In') : (isCheckedIn2 ? 'Check Out' : 'Check In')))}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {todayShift?.checkIn && (
            <View style={styles.shiftInfoRow}>
              <View style={styles.shiftInfoItem}>
                <Text style={styles.shiftInfoLabel}>1st Log</Text>
                <Text style={styles.shiftInfoValue}>{todayShift.checkIn} - {todayShift.checkOut || '...'}</Text>
              </View>
              {todayShift?.checkIn2 && (
                <View style={styles.shiftInfoItem}>
                  <Text style={styles.shiftInfoLabel}>2nd Log</Text>
                  <Text style={styles.shiftInfoValue}>{todayShift.checkIn2} - {todayShift.checkOut2 || '...'}</Text>
                </View>
              )}
              <View style={styles.shiftInfoItem}>
                <Text style={styles.shiftInfoLabel}>Remaining</Text>
                <Text style={[styles.shiftInfoValue, { color: '#F97316' }]}>{todayShift.hoursRemaining}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Quick Links Modern Style */}
      <Text style={styles.sectionTitle}>Quick Links</Text>
      <View style={styles.quickLinksContainer}>
        {[
          { name: 'Holidays', route: 'Holidays', icon: Palmtree, color: '#10B981', gradient: ['#D1FAE5', '#A7F3D0'] },
          { name: 'Rules', route: 'Rules', icon: BookOpen, color: '#3B82F6', gradient: ['#DBEAFE', '#BFDBFE'] },
          { name: 'Announce', route: 'Announcements', icon: Megaphone, color: '#F59E0B', gradient: ['#FEF3C7', '#FDE68A'] },
          { name: 'Feedback', route: 'Feedback', icon: MessageSquare, color: '#8B5CF6', gradient: ['#EDE9FE', '#DDD6FE'] },
          { name: 'Performance', route: 'Performances', icon: LineChart, color: '#EC4899', gradient: ['#FCE7F3', '#FBCFE8'] },
          { name: 'Alerts', route: 'Notifications', icon: Bell, color: '#EF4444', gradient: ['#FEE2E2', '#FECACA'] },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <TouchableOpacity key={link.name} style={styles.quickLinkModernBox} onPress={() => navigation.navigate(link.route as never)}>
              <LinearGradient colors={link.gradient as any} style={styles.quickLinkModernIconWrapper}>
                <Icon color={link.color} size={24} />
              </LinearGradient>
              <Text style={styles.quickLinkModernText}>{link.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>My Overview</Text>

      {/* Premium Stats Grid */}
      <View style={styles.premiumGrid}>
        {[
          { label: 'Days Present', value: stats?.attendanceThisMonth?.present || 0, icon: CalendarCheck, gradient: ['#10B981', '#059669'] },
          { label: 'Leaves Taken', value: stats?.attendanceThisMonth?.absent || 0, icon: CalendarOff, gradient: ['#F59E0B', '#D97706'] },
          { label: 'Late Arrivals', value: stats?.attendanceThisMonth?.late || 0, icon: Clock, gradient: ['#EF4444', '#DC2626'] },
          { label: 'Productivity', value: `${stats?.attendanceThisMonth?.percentage || 100}%`, icon: TrendingUp, gradient: ['#A855F7', '#7E22CE'] },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <LinearGradient key={idx} colors={stat.gradient as any} style={styles.premiumCard}>
              <View style={styles.premiumCardHeader}>
                <View style={styles.premiumIconContainer}>
                  <Icon color="#FFFFFF" size={24} />
                </View>
              </View>
              <Text style={styles.premiumCardValue}>{stat.value}</Text>
              <Text style={styles.premiumCardLabel}>{stat.label}</Text>
              {/* Decorative Element */}
              <View style={styles.decorativeCircleTop} />
              <View style={styles.decorativeCircleBottom} />
            </LinearGradient>
          )
        })}
      </View>

      {/* My Weekly Attendance */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Weekly Attendance</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Attendance' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {stats?.weeklyAttendance && stats.weeklyAttendance.length > 0 ? (
        [...stats.weeklyAttendance].reverse().slice(0, 7).map((item: any, index: number) => (
          <View key={index} style={styles.attendanceListItem}>
            <View>
              <Text style={styles.listTitle}>{item.day}, {new Date(item.date).toLocaleDateString()}</Text>
              {item.isWeekend && <Text style={styles.listSubtitle}>Weekend</Text>}
            </View>
            <View style={[
              styles.statusBadge,
              item.status === 'present' ? styles.badgeGreen :
                (item.status === 'absent' || item.status === 'missing' ? styles.badgeRed : 
                 item.status === 'wo' ? styles.badgeGray : styles.badgeOrange)
            ]}>
              <Text style={[styles.statusText, item.status === 'present' ? styles.textGreen : (item.status === 'absent' || item.status === 'missing' ? styles.textRed : item.status === 'wo' ? {color: '#64748B'} : styles.textOrange)]}>
                {item.status === 'wo' ? 'Weekly Off' : (item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : '')}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={{ color: '#0F172A', marginLeft: 16 }}>No attendance data</Text>
      )}

      {/* My Leaves */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Leaves</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Leaves' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {stats?.recentLeaves && stats.recentLeaves.length > 0 ? (
        stats.recentLeaves.map((item: any, index: number) => {
          const isApproved = item.status === 'Approved';
          const isPending = item.status === 'Pending';
          return (
            <View key={index} style={styles.leaveModernCard}>
              <View style={[styles.leaveColorBar, { backgroundColor: isApproved ? '#10B981' : (isPending ? '#F59E0B' : '#EF4444') }]} />
              <View style={styles.leaveContent}>
                <Text style={styles.leaveType}>{item.type || 'Leave Request'}</Text>
                <Text style={styles.leaveDates}>{item.startDate}  •  {item.endDate}</Text>
              </View>
              <View style={[styles.statusBadge, isApproved ? styles.badgeGreen : (isPending ? styles.badgeOrange : styles.badgeRed)]}>
                <Text style={[styles.statusText, isApproved ? styles.textGreen : (isPending ? styles.textOrange : styles.textRed)]}>{item.status}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recent leaves</Text>
        </View>
      )}

      {/* Upcoming Holidays */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {stats?.upcomingHolidays && stats.upcomingHolidays.length > 0 ? (
          stats.upcomingHolidays.map((item: any, index: number) => (
            <LinearGradient key={index} colors={['#D1FAE5', '#A7F3D0']} style={styles.holidayModernCard}>
              <View style={styles.holidayIconWrapper}>
                <Palmtree color="#047857" size={28} />
              </View>
              <View style={styles.holidayInfo}>
                <Text style={styles.holidayName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.holidayDate}>{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              </View>
            </LinearGradient>
          ))
        ) : (
          <View style={[styles.emptyCard, { marginLeft: 16, width: 250 }]}>
            <Text style={styles.emptyText}>No upcoming holidays</Text>
          </View>
        )}
      </ScrollView>

      {/* Upcoming Birthdays */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Birthdays</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {stats?.upcomingBirthdays && stats.upcomingBirthdays.length > 0 ? (
          stats.upcomingBirthdays.map((item: any, index: number) => (
            <LinearGradient key={item.id || index} colors={['#FCE7F3', '#FBCFE8']} style={styles.birthdayModernCard}>
              <View style={styles.birthdayIconWrapper}>
                <Cake color="#EC4899" size={24} />
              </View>
              <Text style={styles.birthdayModernName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.birthdayModernDate}>{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</Text>
            </LinearGradient>
          ))
        ) : (
          <View style={[styles.emptyCard, { marginLeft: 16, width: 250 }]}>
            <Text style={styles.emptyText}>No upcoming birthdays</Text>
          </View>
        )}
      </ScrollView>

      {/* My Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Tasks</Text>
      </View>
      {stats?.pendingTasks && stats.pendingTasks.length > 0 ? (
        stats.pendingTasks.map((item: any, index: number) => {
          const isCompleted = item.status === 'Completed';
          return (
            <TouchableOpacity key={item.id || index} style={styles.taskModernItem}>
              <View style={[styles.taskIconWrapper, { backgroundColor: isCompleted ? '#D1FAE5' : '#FEF3C7' }]}>
                <CheckCircle color={isCompleted ? '#10B981' : '#F59E0B'} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>{item.title}</Text>
                <Text style={styles.taskSubtitle}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No tasks pending</Text>
        </View>
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 60 },
  
  welcomeSection: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 18, color: '#FFEDD5', fontWeight: '500', marginBottom: 4 },
  userName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5, textTransform: 'capitalize' },
  headerAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#FFFFFF' },
  headerAvatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  headerAvatarText: { color: '#F97316', fontSize: 22, fontWeight: '800' },

  attendanceSection: { marginHorizontal: 16, marginBottom: 24 },
  actionsContainer: { marginBottom: 0 },
  actionBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  actionBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16 },
  checkInBtn: {},
  checkOutBtn: {},
  actionBtnText: { fontSize: 20, fontWeight: '700', marginLeft: 12 },
  
  shiftInfoRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  shiftInfoItem: { alignItems: 'center', flex: 1 },
  shiftInfoLabel: { color: '#64748B', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  shiftInfoValue: { color: '#0F172A', fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 16, marginLeft: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12, paddingHorizontal: 16 },
  viewAllText: { color: '#F97316', fontSize: 16, fontWeight: '600' },

  quickLinksContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', paddingHorizontal: 8, marginBottom: 8 },
  quickLinkModernBox: { width: '33.33%', alignItems: 'center', marginBottom: 20 },
  quickLinkModernIconWrapper: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  quickLinkModernText: { color: '#475569', fontSize: 15, fontWeight: '600' },

  premiumGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  premiumCard: { width: '48%', borderRadius: 24, padding: 20, marginBottom: 16, position: 'relative', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6 },
  premiumCardHeader: { marginBottom: 12 },
  premiumIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  premiumCardValue: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  premiumCardLabel: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  decorativeCircleTop: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  decorativeCircleBottom: { position: 'absolute', bottom: -30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)' },

  horizontalScroll: { marginHorizontal: 0, paddingHorizontal: 16, paddingBottom: 16 },
  
  attendanceListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginHorizontal: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  listTitle: { color: '#0F172A', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  listSubtitle: { color: '#64748B', fontSize: 15 },
  
  leaveModernCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  leaveColorBar: { width: 6, height: '100%' },
  leaveContent: { flex: 1, paddingVertical: 16, paddingLeft: 16 },
  leaveType: { color: '#0F172A', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  leaveDates: { color: '#64748B', fontSize: 15, fontWeight: '500' },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeOrange: { backgroundColor: '#FEF3C7' },
  badgeGray: { backgroundColor: '#F1F5F9' },
  textGreen: { color: '#059669' },
  textRed: { color: '#DC2626' },
  textOrange: { color: '#D97706' },
  statusText: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },

  holidayModernCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginRight: 16, width: 260, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  holidayIconWrapper: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  holidayInfo: { flex: 1 },
  holidayName: { color: '#064E3B', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  holidayDate: { color: '#047857', fontSize: 15, fontWeight: '700' },

  birthdayModernCard: { padding: 20, borderRadius: 24, marginRight: 16, width: 150, alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  birthdayIconWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  birthdayModernName: { color: '#831843', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  birthdayModernDate: { color: '#BE185D', fontSize: 15, fontWeight: '700' },

  taskModernItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  taskIconWrapper: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  taskTitle: { color: '#0F172A', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  taskTitleCompleted: { color: '#94A3B8', textDecorationLine: 'line-through' },
  taskSubtitle: { color: '#64748B', fontSize: 15, fontWeight: '600' },

  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
});
