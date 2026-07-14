// src/screens/DashboardScreen.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { RefreshControl } from "react-native";
import { Card, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchDashboardData } from '../redux/slices/dashboardSlice';
import { Users, CalendarCheck, Clock, CalendarOff, Palmtree, BookOpen, Megaphone, MessageSquare, LineChart, Bell, Cake } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Loader from '../components/Loader';
import { LinearGradient } from 'expo-linear-gradient';

const getAvatarUri = (avatarPath: string | undefined | null) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  const normalizedPath = avatarPath.replace(/\\/g, '/');
  return `https://hrback-production-61ba.up.railway.app${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
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
  }, [dispatch, refreshCounter]);

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

  const avatarUri = getAvatarUri(user?.avatar);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}>
      
      {/* Welcome Section - Premium Header with Gradient */}
      <LinearGradient colors={['#F97316', '#EA580C']} style={styles.welcomeSection}>
        <View style={styles.welcomeHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Admin'} 👋</Text>
          </View>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

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

      <Text style={styles.sectionTitle}>Overview Dashboard</Text>
      
      {/* Premium Stats Grid */}
      <View style={styles.premiumGrid}>
        {[
          { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, gradient: ['#3B82F6', '#2563EB'] },
          { label: 'Present Today', value: stats?.presentToday || 0, icon: CalendarCheck, gradient: ['#10B981', '#059669'] },
          { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: CalendarOff, gradient: ['#F59E0B', '#D97706'] },
          { label: 'Late Arrivals', value: stats?.lateCount || 0, icon: Clock, gradient: ['#EF4444', '#DC2626'] },
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

      {/* Weekly Attendance */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Weekly Attendance</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {stats?.weeklyAttendance && stats.weeklyAttendance.length > 0 ? (
          stats.weeklyAttendance.map((item: any, index: number) => (
            <View key={index} style={styles.weeklyModernCard}>
              <Text style={styles.weeklyDay}>{item.day}</Text>
              <Text style={styles.weeklyDate}>{new Date(item.date).getDate()}</Text>
              <View style={styles.weeklyStatsRow}>
                <View style={styles.weeklyStat}>
                  <Text style={[styles.weeklyStatValue, { color: '#10B981' }]}>{item.present}</Text>
                  <Text style={styles.weeklyStatLabel}>P</Text>
                </View>
                <View style={styles.weeklyStat}>
                  <Text style={[styles.weeklyStatValue, { color: '#EF4444' }]}>{item.absent}</Text>
                  <Text style={styles.weeklyStatLabel}>A</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: '#64748B', marginLeft: 16 }}>No weekly data available</Text>
        )}
      </ScrollView>

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
            <View key={index} style={styles.leaveModernCard}>
              <View style={[styles.leaveColorBar, { backgroundColor: isApproved ? '#10B981' : (isPending ? '#F59E0B' : '#EF4444') }]} />
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

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 60 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  errorText: { color: '#0F172A', fontSize: 18, fontWeight: '500' },
  
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
  userName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  headerAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#FFFFFF' },
  headerAvatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  headerAvatarText: { color: '#F97316', fontSize: 22, fontWeight: '800' },

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
  premiumCardValue: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  premiumCardLabel: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  decorativeCircleTop: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  decorativeCircleBottom: { position: 'absolute', bottom: -30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)' },

  horizontalScroll: { marginHorizontal: 0, paddingHorizontal: 16, paddingBottom: 16 },
  
  weeklyModernCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginRight: 12, width: 100, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  weeklyDay: { color: '#64748B', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  weeklyDate: { color: '#0F172A', fontSize: 26, fontWeight: '800', marginBottom: 12 },
  weeklyStatsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  weeklyStat: { alignItems: 'center' },
  weeklyStatValue: { fontSize: 18, fontWeight: '800' },
  weeklyStatLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginTop: 2 },

  leaveModernCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  leaveColorBar: { width: 6, height: '100%' },
  leaveContent: { flex: 1, paddingVertical: 16, paddingLeft: 16 },
  leaveType: { color: '#0F172A', fontSize: 18, fontWeight: '700' },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 16 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeOrange: { backgroundColor: '#FEF3C7' },
  textGreen: { color: '#059669' },
  textRed: { color: '#DC2626' },
  textOrange: { color: '#D97706' },
  statusText: { fontSize: 15, fontWeight: '700', textTransform: 'uppercase' },

  birthdayModernCard: { padding: 20, borderRadius: 24, marginRight: 16, width: 150, alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  birthdayIconWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  birthdayModernName: { color: '#831843', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  birthdayModernDate: { color: '#BE185D', fontSize: 15, fontWeight: '700' },

  activityModernCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  activityDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#F97316', marginTop: 4, marginRight: 12 },
  activityMessage: { color: '#0F172A', fontSize: 17, fontWeight: '600', marginBottom: 4 },
  activityDate: { color: '#64748B', fontSize: 14, fontWeight: '500' },

  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '600' },
});

export default DashboardScreen;


