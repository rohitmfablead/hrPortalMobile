import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, ActivityIndicator, DeviceEventEmitter, Dimensions, Platform, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Search, Filter, Users, Eye, Edit2, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchAllAttendance, updateAttendance } from '../redux/slices/attendanceSlice';
import AddAttendanceModal from '../components/AddAttendanceModal';
import EditAttendanceModal from '../components/EditAttendanceModal';

const { width } = Dimensions.get('window');

const generateMarkedDates = (records: any[]) => {
  const marked: any = {};

  records.forEach((item: any) => {
    const dateStr = item.date ? item.date.split('T')[0] : null;
    if (dateStr) {
      let dotColor = '#10B981'; // Present
      const status = item.status?.toLowerCase();
      if (status === 'absent') dotColor = '#EF4444'; // Red
      else if (status === 'late') dotColor = '#F59E0B'; // Amber

      marked[dateStr] = {
        marked: true,
        dotColor,
        selectedColor: dotColor,
      };
    }
  });

  return marked;
};

export default function AttendanceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { allRecords, loading } = useSelector((state: RootState) => state.attendance);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('Today');
  const [isTimeDropdownVisible, setTimeDropdownVisible] = useState(false);

  // Fetch all attendance records with date filters based on timeFilter
  useEffect(() => {
    let fromDate, toDate;
    const now = new Date();
    
    if (timeFilter === 'Today') {
      const today = now.toISOString().split('T')[0];
      fromDate = today;
      toDate = today;
    } else if (timeFilter === 'Month') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (timeFilter === 'Year') {
      fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      toDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
    }

    dispatch(fetchAllAttendance({ fromDate, toDate }));
  }, [dispatch, timeFilter]);

  useFocusEffect(
    useCallback(() => {
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => setModalVisible(true));
      return () => subscription.remove();
    }, [])
  );

  const markedDates = useMemo(() => generateMarkedDates(allRecords || []), [allRecords]);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleAddAttendance = (date: string, checkIn: string, checkOut: string, status: string) => {
    Alert.alert('Info', 'Manual attendance marking will be processed via API');
    setModalVisible(false);
  };

  const handleEditAttendance = (id: string, date: string, checkIn: string, checkOut: string, status: string) => {
    if (id) {
      dispatch(updateAttendance({ id, date, checkIn, checkOut, status }));
      Alert.alert('Success', 'Attendance updated successfully');
    }
    setEditModalVisible(false);
  };

  const stats = useMemo(() => {
    let present = 0, late = 0, absent = 0, total = 0;
    (allRecords || []).forEach((r: any) => {
      total++;
      const status = r.status?.toLowerCase();
      if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else present++; // assuming anything else is present
    });
    return { present, late, absent, total };
  }, [allRecords]);

  const filteredRecords = useMemo(() => {
    if (!allRecords) return [];
    return allRecords.filter((item: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        item.employeeName?.toLowerCase().includes(q) || 
        item.employeeId?.toLowerCase().includes(q);
      
      if (!matchesSearch) return false;

      if (activeFilter === 'All') return true;
      if (activeFilter === 'Present') return item.status?.toLowerCase() === 'present';
      if (activeFilter === 'Absent') return item.status?.toLowerCase() === 'absent';
      if (activeFilter === 'Late') return item.status?.toLowerCase() === 'late';
      if (activeFilter === 'IT') return item.department?.toLowerCase() === 'it';
      if (activeFilter === 'HR') return item.department?.toLowerCase() === 'hr';
      
      return true;
    });
  }, [allRecords, searchQuery, activeFilter]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F97316" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Background Gradient Header */}
        <LinearGradient
          colors={['#F97316', '#EA580C']}
          style={styles.headerBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitleText}>Attendance Overview</Text>
              <Text style={styles.headerSubtitleText}>Track your daily records and performance</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerDropdown} 
              onPress={() => setTimeDropdownVisible(true)}
            >
              <Text style={styles.headerDropdownText}>{timeFilter}</Text>
              <ChevronDown color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.contentWrapper}>
          {/* Metrics Cards - positioned to overlap the header */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Users color="#64748B" size={24} />
              </View>
              <Text style={styles.metricValue}>{stats.total}</Text>
              <Text style={styles.metricLabel}>Total Staff</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <CheckCircle2 color="#10B981" size={24} />
              </View>
              <Text style={styles.metricValue}>{stats.present}</Text>
              <Text style={styles.metricLabel}>Present</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <XCircle color="#EF4444" size={24} />
              </View>
              <Text style={styles.metricValue}>{stats.absent}</Text>
              <Text style={styles.metricLabel}>Absent</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
                <AlertCircle color="#F59E0B" size={24} />
              </View>
              <Text style={styles.metricValue}>{stats.late}</Text>
              <Text style={styles.metricLabel}>Late</Text>
            </View>
          </View>

          {/* Search and Filters */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchBox}>
              <Search color="#94A3B8" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search employees..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
              {['All', 'Present', 'Absent', 'Late', 'IT', 'HR'].map(f => (
                <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.filterChip, activeFilter === f && styles.activeFilterChip]}>
                  <Text style={[styles.filterChipText, activeFilter === f && styles.activeFilterChipText]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recent List */}
          <View style={styles.listHeaderRow}>
            <Text style={styles.sectionTitle}>Employee Records</Text>
            <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.viewCalendarBtn}>
              <CalendarIcon color="#0F172A" size={14} />
              <Text style={styles.viewCalendarBtnText}>Calendar</Text>
            </TouchableOpacity>
          </View>

          {filteredRecords && filteredRecords.length > 0 ? filteredRecords.map((item: any, index: number) => {
            const status = item.status?.toLowerCase() || 'present';
            let badgeStyle = styles.badgeGreen;
            let textStyle = styles.textGreen;
            if (status === 'absent') {
              badgeStyle = styles.badgeRed;
              textStyle = styles.textRed;
            } else if (status === 'late') {
              badgeStyle = styles.badgeOrange;
              textStyle = styles.textOrange;
            }

            return (
              <TouchableOpacity key={item.id || item._id || index} style={styles.listItem} onPress={() => navigation.navigate('AttendanceDetails', { employee: item })}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{(item.employeeName || 'E')[0].toUpperCase()}</Text>
                </View>
                <View style={styles.listContent}>
                  <View style={styles.listContentTop}>
                    <Text style={styles.listTitle} numberOfLines={1}>{item.employeeName || 'Employee'}</Text>
                    <View style={[styles.statusBadge, badgeStyle]}>
                      <Text style={[styles.statusText, textStyle]}>{item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Present'}</Text>
                    </View>
                  </View>
                  <Text style={styles.listSubtitleText}>{item.department || item.employeeId || 'Staff'}</Text>
                  <View style={styles.timeDetails}>
                    <Text style={styles.timeText}><Text style={styles.timeLabel}>In:</Text> {item.checkIn || '-'}</Text>
                    <Text style={styles.timeText}><Text style={styles.timeLabel}>Out:</Text> {item.checkOut || '-'}</Text>
                  </View>
                </View>
                <View style={styles.actionColumn}>
                  <TouchableOpacity 
                    style={styles.actionBtnIcon} 
                    onPress={() => {
                      setSelectedRecord(item);
                      setEditModalVisible(true);
                    }}
                  >
                    <Edit2 color="#94A3B8" size={18} />
                  </TouchableOpacity>
                  <View style={styles.actionBtnIcon}>
                    <Eye color="#94A3B8" size={18} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <CalendarIcon color="#94A3B8" size={32} />
              </View>
              <Text style={styles.emptyTitle}>No Records Yet</Text>
              <Text style={styles.emptySubtitle}>Attendance data will appear here once marked</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={isCalendarVisible} transparent={true} animationType="fade" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.calendarModalOverlay}>
          <View style={styles.calendarModalContent}>
            <View style={styles.calendarModalHeader}>
              <Text style={styles.calendarModalTitle}>Calendar View</Text>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <XCircle color="#64748B" size={24} />
              </TouchableOpacity>
            </View>
            <Calendar
              current={new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markedDates={{
                ...markedDates,
                [selectedDate]: { ...markedDates[selectedDate], selected: true, disableTouchEvent: true, selectedDotColor: '#FFFFFF', selectedColor: '#F97316' }
              }}
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#94A3B8',
                selectedDayBackgroundColor: '#F97316',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#F97316',
                dayTextColor: '#1E293B',
                textDisabledColor: '#E2E8F0',
                dotColor: '#F97316',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#F97316',
                monthTextColor: '#0F172A',
                indicatorColor: '#F97316',
                textDayFontWeight: '500',
                textMonthFontWeight: '800',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={isTimeDropdownVisible} transparent={true} animationType="fade" onRequestClose={() => setTimeDropdownVisible(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setTimeDropdownVisible(false)}>
          <View style={styles.dropdownMenu}>
            {['Today', 'Month', 'Year'].map(f => (
              <TouchableOpacity 
                key={f} 
                style={[styles.dropdownItem, timeFilter === f && styles.dropdownItemActive]}
                onPress={() => {
                  setTimeFilter(f);
                  setTimeDropdownVisible(false);
                }}
              >
                <Text style={[styles.dropdownItemText, timeFilter === f && styles.dropdownItemTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <AddAttendanceModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddAttendance}
      />

      <EditAttendanceModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleEditAttendance}
        record={selectedRecord}
      />
    </View>
  );
}

const shadowStyle = Platform.select({
  web: { boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.08)' } as any,
  default: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }
});

const smallShadowStyle = Platform.select({
  web: { boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.04)' } as any,
  default: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBackground: {
    paddingTop: 16,
    paddingBottom: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  headerDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  headerDropdownText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#FFF7ED',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    marginTop: -40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2, // 2 columns
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    ...shadowStyle,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  searchFilterContainer: {
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    marginBottom: 16,
    ...smallShadowStyle,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterChip: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    paddingBottom: 20,
    marginBottom: 28,
    ...shadowStyle,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  viewCalendarBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  calendarModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...shadowStyle,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    ...smallShadowStyle,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F97316',
  },
  listContent: {
    flex: 1,
    paddingRight: 10,
  },
  listContentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  listSubtitleText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  actionColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timeDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  timeLabel: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    ...smallShadowStyle,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  }
});
