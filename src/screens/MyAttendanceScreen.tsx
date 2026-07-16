import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { RefreshControl } from "react-native";
import { Clock, CheckCircle2, XCircle, AlertCircle, LogIn, LogOut, CalendarIcon } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchMyAttendance } from '../redux/slices/attendanceSlice';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

export default function MyAttendanceScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const dispatch = useDispatch<AppDispatch>();
  const { records, loading } = useSelector((state: RootState) => state.attendance);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayShift, setTodayShift] = useState<any>(null);
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  useEffect(() => {
    dispatch(fetchMyAttendance({ month: selectedMonth.toString(), year: selectedYear.toString() }));
    
    const fetchStatus = async () => {
      try {
        const res = await api.get('/attendance/today-status');
        if (res.data?.success) {
          setTodayShift(res.data.data);
        }
      } catch (err) {
        console.log('Error fetching today status', err);
      }
    };
    fetchStatus();
    
    // Live Clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [dispatch, selectedMonth, selectedYear]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F97316"/></View>;

  // Calculate monthly stats from records based on selected filter
  const currentMonthRecords = records?.filter((r: any) => {
    const d = new Date(r.date);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
  }) || [];

  const presentDays = currentMonthRecords.filter((r: any) => 
    r.status?.toLowerCase() === 'present' || r.status?.toLowerCase() === 'late'
  ).length;
  
  const absentDays = currentMonthRecords.filter((r: any) => 
    r.status?.toLowerCase() === 'absent'
  ).length;
  
  const leaveDays = 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}>
        
        {/* Today Status Card */}
        <LinearGradient 
          colors={['#F97316', '#EA580C']} 
          style={styles.todayCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.dateText}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          <Text style={styles.timeText}>
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>

          <View style={styles.todayMetricsRow}>
            <View style={styles.todayMetricCol}>
              <Text style={styles.todayMetricLabel}>1st Log</Text>
              <Text style={styles.todayMetricValue}>{todayShift?.checkIn || '--:--'} - {todayShift?.checkOut || '--:--'}</Text>
            </View>
            <View style={styles.todayMetricDivider} />
            <View style={styles.todayMetricCol}>
              <Text style={styles.todayMetricLabel}>2nd Log</Text>
              <Text style={styles.todayMetricValue}>{todayShift?.checkIn2 || '--:--'} - {todayShift?.checkOut2 || '--:--'}</Text>
            </View>
            <View style={styles.todayMetricDivider} />
            <View style={styles.todayMetricCol}>
              <Text style={styles.todayMetricLabel}>Working HRs</Text>
              <Text style={styles.todayMetricValue}>{todayShift?.hoursCompleted || '0h 0m'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Monthly Summary */}
        <Text style={styles.sectionTitle}>Monthly Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{presentDays}</Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, {color: '#DC2626'}]}>{absentDays}</Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, {color: '#D97706'}]}>{leaveDays}</Text>
            <Text style={styles.summaryLabel}>Leave</Text>
          </View>
        </View>

        {/* Recent List */}
        {/* Month Selector & History */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>{'<'}</Text>
            </TouchableOpacity>
            
            <Text style={styles.monthText}>
              {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {records && records.length > 0 ? records.map((item: any, index: number) => {
          const status = item.status?.toLowerCase() || 'present';
          let badgeStyle = styles.badgeGreen;
          let textStyle = styles.textGreen;
          if (status === 'absent' || status === 'wo') {
            badgeStyle = status === 'wo' ? styles.badgeGray : styles.badgeRed;
            textStyle = status === 'wo' ? {color: '#64748B'} : styles.textRed;
          } else if (status === 'late') {
            badgeStyle = styles.badgeOrange;
            textStyle = styles.textOrange;
          }

          return (
            <View key={`${item.id || item._id || ''}-${index}`} style={styles.listItem}>
              <View style={styles.listLeft}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateBoxDay}>{item.date ? new Date(item.date).getDate() : '--'}</Text>
                  <Text style={styles.dateBoxMonth}>{item.date ? new Date(item.date).toLocaleString('default', { month: 'short' }) : '--'}</Text>
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.listTitle}>{item.date ? new Date(item.date).toLocaleDateString('en-US', {weekday: 'long'}) : 'Day'}</Text>
                  <View style={styles.timeRow}>
                    <Text style={styles.listSubtitle} numberOfLines={1}>1st: {item.checkIn || '-'} - {item.checkOut || '-'}</Text>
                    {item.checkIn2 ? (
                      <Text style={styles.listSubtitle} numberOfLines={1}>2nd: {item.checkIn2} - {item.checkOut2 || '-'}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
              <View style={styles.listRight}>
                <View style={[styles.statusBadge, badgeStyle]}>
                  <Text style={[styles.statusText, textStyle]}>{item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Present'}</Text>
                </View>
              </View>
            </View>
          );
        }) : (
          <View style={styles.emptyState}>
            <CalendarIcon color="#CBD5E1" size={48} />
            <Text style={styles.emptyText}>No attendance history found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const shadowStyle = Platform.select({
  web: { boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.04)' } as any,
  default: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  todayCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: '0px 8px 24px rgba(249, 115, 22, 0.2)' } as any,
      default: { shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 }
    })
  },
  dateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 24,
  },
  todayMetricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayMetricCol: {
    alignItems: 'center',
    flex: 1,
  },
  todayMetricLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  todayMetricValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  todayMetricDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    ...shadowStyle,
  },
  checkInBtn: {
    backgroundColor: '#10B981',
  },
  checkOutBtn: {
    backgroundColor: '#EF4444',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  historyHeader: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    ...shadowStyle,
  },
  monthBtn: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  monthBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    ...shadowStyle,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...shadowStyle,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateBox: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateBoxDay: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateBoxMonth: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  listTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  listSubtitle: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  listRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGreen: { backgroundColor: '#ECFDF5' },
  badgeRed: { backgroundColor: '#FEF2F2' },
  badgeOrange: { backgroundColor: '#FFFBEB' },
  textGreen: { color: '#059669' },
  textRed: { color: '#DC2626' },
  textOrange: { color: '#D97706' },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 17,
  }
});
