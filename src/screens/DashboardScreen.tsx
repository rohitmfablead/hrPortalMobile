// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import api from '../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchDashboardData } from '../redux/slices/dashboardSlice';
import { Users, CalendarCheck, Clock, CalendarOff, LogIn, LogOut, Cake, CheckCircle, Palmtree, BookOpen, Megaphone, MessageSquare, LineChart, Bell } from 'lucide-react-native';
import { markManualAttendance } from '../redux/slices/attendanceSlice';
import { useNavigation } from '@react-navigation/native';
import { mockAttendance, mockLeaves, mockBirthdays, mockTasks } from '../mockData/mockData';
import Loader from '../components/Loader';

type DashboardStats = {
  totalEmployees: number;
  todayAttendance: number;
  pendingLeaves: number;
  lateCount: number;
};

const DashboardScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { data: stats, loading, error } = useSelector((state: RootState) => state.dashboard);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  useEffect(() => {
    dispatch(fetchDashboardData('today'));
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
        ) : (
          <View style={styles.headerAvatarPlaceholder}>
            <Text style={styles.headerAvatarText}>
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </Text>
          </View>
        )}
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Admin'} 👋</Text>
        </View>
      </View>

      {/* Quick Actions Removed for Admin */}

      <Text style={styles.sectionTitle}>Quick Links</Text>
      <View style={styles.quickLinksContainer}>
        {[
          { name: 'Holidays', route: 'Holidays', icon: Palmtree, color: '#F97316' },
          { name: 'Rules', route: 'Rules', icon: BookOpen, color: '#F97316' },
          { name: 'Announcements', route: 'Announcements', icon: Megaphone, color: '#F97316' },
          { name: 'Feedback', route: 'Feedback', icon: MessageSquare, color: '#F97316' },
          { name: 'Performance', route: 'Performances', icon: LineChart, color: '#F97316' },
          { name: 'Notifications', route: 'Notifications', icon: Bell, color: '#F97316' },
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

      <Text style={styles.sectionTitle}>Overview</Text>

      {/* Stats Grid */}
      <View style={styles.grid}>
        {/* Total Employees */}
        <Card style={[styles.card, styles.cardBlue]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                <Users color="#F97316" size={24} />
              </View>
            </View>
            <Text style={styles.value}>{stats?.totalEmployees || 0}</Text>
            <Text style={styles.label}>Total Employees</Text>
          </Card.Content>
        </Card>

        {/* Today Attendance */}
        <Card style={[styles.card, styles.cardGreen]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                <CalendarCheck color="#F97316" size={24} />
              </View>
            </View>
            <Text style={styles.value}>{stats?.presentToday || 0}</Text>
            <Text style={styles.label}>Present Today</Text>
          </Card.Content>
        </Card>

        {/* Pending Leaves */}
        <Card style={[styles.card, styles.cardOrange]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                <CalendarOff color="#F97316" size={24} />
              </View>
            </View>
            <Text style={styles.value}>{stats?.pendingLeaves || 0}</Text>
            <Text style={styles.label}>Pending Leaves</Text>
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
            <Text style={styles.value}>{stats?.lateCount || 0}</Text>
            <Text style={styles.label}>Late Arrivals</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Weekly Attendance */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Weekly Attendance</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {stats?.weeklyAttendance && stats.weeklyAttendance.length > 0 ? (
          stats.weeklyAttendance.map((item: any, index: number) => (
            <View key={index} style={styles.weeklyCard}>
              <Text style={styles.weeklyDay}>{item.day}</Text>
              <Text style={styles.weeklyDate}>{new Date(item.date).getDate()}</Text>
              <View style={styles.weeklyStatsRow}>
                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyStatValueGreen}>{item.present}</Text>
                  <Text style={styles.weeklyStatLabel}>P</Text>
                </View>
                <View style={styles.weeklyStat}>
                  <Text style={styles.weeklyStatValueRed}>{item.absent}</Text>
                  <Text style={styles.weeklyStatLabel}>A</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: '#0F172A', marginLeft: 16 }}>No weekly data available</Text>
        )}
      </ScrollView>

      {/* Recent Activities */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
      </View>
      {stats?.recentActivities && stats.recentActivities.length > 0 ? (
        stats.recentActivities.slice(0, 3).map((item: any, index: number) => (
          <View key={index} style={styles.activityModernCard}>
            <View style={styles.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityMessage}>{item.message}</Text>
              <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recent activities</Text>
        </View>
      )}

      {/* Leave Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Leave Overview</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Leaves' as never)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {stats?.leaveOverview && stats.leaveOverview.length > 0 ? (
        stats.leaveOverview.map((item: any, index: number) => {
          const isApproved = item.name === 'Approved';
          const isPending = item.name === 'Pending';
          return (
            <View key={index} style={[styles.leaveCard, isApproved ? styles.leaveApproved : (isPending ? styles.leavePending : styles.leaveRejected)]}>
              <View style={styles.leaveContent}>
                <Text style={styles.leaveType}>{item.name} Leaves</Text>
              </View>
              <View style={[styles.statusBadge, isApproved ? styles.badgeGreen : (isPending ? styles.badgeOrange : styles.badgeRed)]}>
                <Text style={[styles.statusText, isApproved ? styles.textGreen : (isPending ? styles.textOrange : styles.textRed)]}>{item.value}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No leave data</Text>
        </View>
      )}

      {/* Upcoming Birthdays */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Birthdays</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {stats?.upcomingBirthdays && stats.upcomingBirthdays.length > 0 ? (
          stats.upcomingBirthdays.map((item: any, index: number) => (
            <View key={item.id || index} style={styles.birthdayModernCard}>
              <View style={styles.birthdayIconWrapper}>
                <Cake color="#EC4899" size={24} />
              </View>
              <Text style={styles.birthdayModernName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.birthdayModernDate}>{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</Text>
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { marginLeft: 16, width: 250 }]}>
            <Text style={styles.emptyText}>No upcoming birthdays</Text>
          </View>
        )}
      </ScrollView>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '500',
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  headerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  headerAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
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
  cardBlue: { borderBottomWidth: 4, borderBottomColor: '#F97316' },
  cardGreen: { borderBottomWidth: 4, borderBottomColor: '#0F172A' },
  cardOrange: { borderBottomWidth: 4, borderBottomColor: '#F97316' },
  cardRed: { borderBottomWidth: 4, borderBottomColor: '#0F172A' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    color: '#F97316',
    marginBottom: 4, textAlign: 'center',
  },
  label: {
    fontSize: 14, color: '#F97316',
    fontWeight: '500', textAlign: 'center',
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
    borderRadius: 8,
  },
  badgeGreen: { backgroundColor: '#ECFDF5' },
  badgeRed: { backgroundColor: '#FEF2F2' },
  badgeOrange: { backgroundColor: '#FFFBEB' },
  textGreen: { color: '#059669', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  textRed: { color: '#DC2626', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  textOrange: { color: '#D97706', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  activityModernCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    marginTop: 4,
    marginRight: 12,
  },
  activityMessage: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDate: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  leaveCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leaveApproved: { borderLeftColor: '#10B981' },
  leavePending: { borderLeftColor: '#F59E0B' },
  leaveRejected: { borderLeftColor: '#EF4444' },
  leaveContent: {
    flex: 1,
  },
  leaveType: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  birthdayModernCard: {
    backgroundColor: '#FDF2F8',
    padding: 20,
    borderRadius: 24,
    marginRight: 16,
    width: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  birthdayIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FBCFE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  birthdayModernName: {
    color: '#831843',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  birthdayModernDate: {
    color: '#BE185D',
    fontSize: 13,
    fontWeight: '600',
  },
  taskModernItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCompletedItem: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  taskIconWrapper: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  taskSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  weeklyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    width: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  weeklyDay: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  weeklyDate: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  weeklyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#0F172A',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValueGreen: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  weeklyStatValueRed: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  weeklyStatLabel: {
    color: '#0F172A',
    fontSize: 10,
    marginTop: 2,
  },
});

export default DashboardScreen;


