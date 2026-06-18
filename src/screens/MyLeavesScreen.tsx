import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Plus, Calendar as CalendarIcon, FileText } from 'lucide-react-native';
import { mockLeaves } from '../mockData/mockData';
import AddLeaveModal from '../components/AddLeaveModal';

// Generate marked dates for leaves. 
// For leaves that span multiple days, we highlight all days between start and end.
const generateMarkedDates = (leavesList: any[]) => {
  const marked: any = {};
  
  leavesList.forEach(item => {
    // Basic parser for "Oct 10, 2026"
    const startMatch = item.start.match(/([a-zA-Z]+) (\d+), (\d+)/);
    const endMatch = item.end.match(/([a-zA-Z]+) (\d+), (\d+)/);
    
    if (startMatch && endMatch) {
      const startDay = parseInt(startMatch[2]);
      const endDay = parseInt(endMatch[2]);
      
      let dotColor = '#F97316'; // Pending (Orange)
      if (item.status === 'Approved') dotColor = '#0F172A'; // Green
      else if (item.status === 'Rejected') dotColor = '#0F172A'; // Red

      for (let day = startDay; day <= endDay; day++) {
        const dateStr = `2026-10-${day.toString().padStart(2, '0')}`;
        marked[dateStr] = {
          marked: true,
          dotColor,
          selectedColor: '#F97316',
        };
      }
    }
  });

  return marked;
};

export default function MyLeavesScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [localLeaves, setLocalLeaves] = useState(mockLeaves);
  const [markedDates, setMarkedDates] = useState(generateMarkedDates(mockLeaves));

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleAddLeave = (type: string, start: string, end: string, status: string) => {
    const newEntry = {
      id: Date.now().toString(),
      type,
      start,
      end,
      status
    };
    
    const updatedLeaves = [newEntry, ...localLeaves];
    setLocalLeaves(updatedLeaves);
    setMarkedDates(generateMarkedDates(updatedLeaves));
    
    Alert.alert('Success', 'Leave application submitted successfully');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Leaves</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.addBtnText}>Apply</Text>
        </TouchableOpacity>
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
            <Text style={styles.legendText}>Approved</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
            <Text style={styles.legendText}>Rejected</Text>
          </View>
        </View>

        {/* Recent List */}
        <Text style={styles.sectionTitle}>Leave Applications</Text>
        {localLeaves.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={styles.listLeft}>
              <View style={styles.iconContainer}>
                <FileText color="#F97316" size={20} />
              </View>
              <View>
                <Text style={styles.listTitle}>{item.type}</Text>
                <View style={styles.timeRow}>
                  <CalendarIcon color="#F97316" size={14} style={{ marginRight: 4 }} />
                  <Text style={styles.listSubtitle}>{item.start} - {item.end}</Text>
                </View>
              </View>
            </View>
            <View style={[
              styles.statusBadge, 
              item.status === 'Rejected' ? styles.badgeRed : (item.status === 'Pending' ? styles.badgeOrange : styles.badgeGreen)
            ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <AddLeaveModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddLeave} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
