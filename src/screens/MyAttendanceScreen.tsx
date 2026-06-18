import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchMyAttendance } from '../redux/slices/attendanceSlice';
import AddAttendanceModal from '../components/AddAttendanceModal';
import { TouchableOpacity, Alert } from 'react-native';

// Convert api data into marked dates for the calendar
const generateMarkedDates = (records: any[]) => {
  const marked: any = {};
  
  records.forEach((item: any) => {
    // API returns date in "YYYY-MM-DD" or ISO string
    const dateStr = item.date ? item.date.split('T')[0] : null;
    if (dateStr) {
      let dotColor = '#0F172A'; // Present (Green)
      if (item.status === 'Absent' || item.status === 'absent') dotColor = '#0F172A'; // Red
      else if (item.status === 'Late' || item.status === 'late') dotColor = '#F97316'; // Orange

      marked[dateStr] = {
        marked: true,
        dotColor,
        selectedColor: '#F97316',
      };
    }
  });

  return marked;
};

export default function MyAttendanceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading } = useSelector((state: RootState) => state.attendance);

  const [selectedDate, setSelectedDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchMyAttendance());
  }, [dispatch]);

  const markedDates = generateMarkedDates(records || []);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleAddAttendance = (date: string, checkIn: string, checkOut: string, status: string) => {
    Alert.alert('Info', 'Manual attendance marking will be processed via API');
    setModalVisible(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F97316"/></View>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Attendance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calendar View */}
        <View style={styles.calendarCard}>
          <Calendar
            current={'2026-10-01'}
            onDayPress={handleDayPress}
            markedDates={{
              ...markedDates,
              [selectedDate]: { ...markedDates[selectedDate], selected: true, disableTouchEvent: true, selectedDotColor: 'orange' }
            }}
            theme={{
              backgroundColor: '#FFFFFF',
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: '#0F172A',
              selectedDayBackgroundColor: '#F97316',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#F97316',
              dayTextColor: '#0F172A',
              textDisabledColor: '#9CA3AF',
              dotColor: '#0F172A',
              selectedDotColor: '#0F172A',
              arrowColor: '#F97316',
              monthTextColor: '#0F172A',
              indicatorColor: '#0F172A',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
            <Text style={styles.legendText}>Late</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
        </View>

        {/* Recent List */}
        <Text style={styles.sectionTitle}>Recent Records</Text>
        {records && records.length > 0 ? records.map((item: any, index: number) => (
          <View key={item.id || index} style={styles.listItem}>
            <View style={styles.listLeft}>
              <View style={styles.iconContainer}>
                <CalendarIcon color="#F97316" size={20} />
              </View>
              <View>
                <Text style={styles.listTitle}>{item.date ? item.date.split('T')[0] : 'Unknown Date'}</Text>
                <View style={styles.timeRow}>
                  <Clock color="#F97316" size={14} style={{ marginRight: 4 }} />
                  <Text style={styles.listSubtitle}>In: {item.checkIn || '-'} | Out: {item.checkOut || '-'}</Text>
                </View>
              </View>
            </View>
            <View style={[
              styles.statusBadge, 
              (item.status === 'Absent' || item.status === 'absent') ? styles.badgeRed : 
              ((item.status === 'Late' || item.status === 'late') ? styles.badgeOrange : styles.badgeGreen)
            ]}>
              <Text style={styles.statusText}>{item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Present'}</Text>
            </View>
          </View>
        )) : (
          <Text style={{color: '#0F172A'}}>No attendance records found</Text>
        )}
      </ScrollView>

      <AddAttendanceModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddAttendance} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
