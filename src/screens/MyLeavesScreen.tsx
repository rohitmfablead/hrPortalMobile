import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, DeviceEventEmitter, ActivityIndicator, Platform, Modal } from 'react-native';
import { RefreshControl } from "react-native";
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react-native';
import AddLeaveModal from '../components/AddLeaveModal';
import api from '../services/api';

export default function MyLeavesScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const navigation = useNavigation<any>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Request' | 'History'>('Request');
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  // Month Picker State
  const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);
  const [isAllFilter, setIsAllFilter] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let params = {};
      if (!isAllFilter) {
        const fromDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
        const toDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
        params = { fromDate, toDate };
      }
      
      const res = await api.get('/leaves', { params });
      if (res.data.success) {
        const fetchedLeaves = res.data.data.leaves || [];
        setLeaves(fetchedLeaves);

        // Extract unique leave types from the fetched leaves
        const uniqueTypes = Array.from(new Set(fetchedLeaves.map((l: any) => l.leaveType).filter(Boolean)));
        setLeaveTypes(uniqueTypes.map(name => ({ name })));
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaves();
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => setModalVisible(true));
      return () => subscription.remove();
    }, [selectedMonth, selectedYear, isAllFilter])
  );

  const handleAddLeave = () => {
    fetchLeaves();
  };

  const calculateDays = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
  };


  const countApplications = (leaveTypeName: string) => {
    let count = 0;
    leaves.forEach(item => {
      const dbType = (item.leaveType || '').toLowerCase();
      const typeName = (leaveTypeName || '').toLowerCase();
      
      const isMatch = dbType === typeName || typeName.includes(dbType) || dbType.includes(typeName);
      
      if (isMatch) {
        count += 1;
      }
    });
    return count;
  };

  const filteredLeaves = leaves.filter(item => {
    if (activeTab === 'Request') return item.status === 'Pending';
    return item.status === 'Approved' || item.status === 'Rejected';
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}>
        
        {/* Header with Month Picker */}
        <View style={styles.topHeader}>
          <Text style={styles.sectionTitle}>Leave Types</Text>
          <TouchableOpacity style={styles.monthBtn} onPress={() => setMonthPickerVisible(true)}>
            <Text style={styles.monthBtnText}>{isAllFilter ? 'ALL TIME' : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`}</Text>
            <CalendarIcon color="#F97316" size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          {leaveTypes.map((item, index) => {
            const colors = [
              { bg: '#DBEAFE', color: '#1E3A8A' },
              { bg: '#FEF3C7', color: '#92400E' },
              { bg: '#FCE7F3', color: '#9D174D' },
              { bg: '#DCFCE7', color: '#166534' },
              { bg: '#F3E8FF', color: '#6B21A8' },
              { bg: '#CCFBF1', color: '#115E59' },
            ];
            const theme = colors[index % colors.length];
            const applicationsCount = countApplications(item.name);
            return (
              <View key={item._id || index} style={[styles.gridCard, { backgroundColor: theme.bg }]}>
                <Text style={[styles.gridCount, { color: theme.color }]}>{applicationsCount}</Text>
                <Text style={[styles.gridTitle, { color: theme.color }]}>{item.name}</Text>
              </View>
            );
          })}
        </View>

        {/* Leave Requests Header */}
        <View style={styles.requestsHeader}>
          <Text style={styles.sectionTitle}>Leave Requests</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>+ Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, activeTab === 'Request' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('Request')}
          >
            <Text style={[styles.toggleText, activeTab === 'Request' && styles.toggleTextActive]}>Request</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, activeTab === 'History' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('History')}
          >
            <Text style={[styles.toggleText, activeTab === 'History' && styles.toggleTextActive]}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Leaves List */}
        {loading ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
        ) : filteredLeaves.length === 0 ? (
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} leaves found.</Text>
        ) : (
          filteredLeaves.map((item) => (
            <TouchableOpacity 
              key={item.id || item._id} 
              style={styles.leaveCard}
              onPress={() => navigation.navigate('LeaveDetails', { leave: item })}
              activeOpacity={0.7}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.leaveTypeTitle}>{item.leaveType || 'General Leave'}</Text>
                <View style={[
                  styles.statusBadge, 
                  item.status === 'Rejected' ? styles.badgeRed : (item.status === 'Pending' ? styles.badgeOrange : styles.badgeGreen)
                ]}>
                  <Text style={[
                    styles.statusText,
                    item.status === 'Rejected' ? styles.textRed : (item.status === 'Pending' ? styles.textOrange : styles.textGreen)
                  ]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.cardInfoRow}>
                <CalendarIcon color="#64748B" size={14} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {new Date(item.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(item.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
              </View>

              <View style={styles.cardInfoRow}>
                <Clock color="#64748B" size={14} style={styles.infoIcon} />
                <Text style={styles.infoText}>{calculateDays(item.fromDate, item.toDate)} days</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* Month Picker Modal */}
      <Modal visible={isMonthPickerVisible} transparent={true} animationType="fade" onRequestClose={() => setMonthPickerVisible(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setMonthPickerVisible(false)}>
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownTitle}>Select Month</Text>
            <View style={styles.monthGrid}>
              {MONTH_NAMES.map((m, idx) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthOptionBtn, selectedMonth === idx && !isAllFilter && styles.monthOptionBtnActive]}
                  onPress={() => {
                    setSelectedMonth(idx);
                    setIsAllFilter(false);
                    setMonthPickerVisible(false);
                  }}
                >
                  <Text style={[styles.monthOptionText, selectedMonth === idx && !isAllFilter && styles.monthOptionTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <AddLeaveModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddLeave} 
        leaveTypes={leaveTypes}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    width: '31%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  gridCount: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 8,
  },
  monthBtnText: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: '700',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  monthOptionBtn: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthOptionBtnActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  monthOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  monthOptionTextActive: {
    color: '#FFFFFF',
  },
  requestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#F97316',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 40,
    fontSize: 17,
  },
  leaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.04)' } as any,
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }
    })
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaveTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeGreen: { backgroundColor: '#ECFDF5' },
  badgeRed: { backgroundColor: '#FEF2F2' },
  badgeOrange: { backgroundColor: '#FEF3C7' },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textGreen: { color: '#059669' },
  textRed: { color: '#DC2626' },
  textOrange: { color: '#D97706' },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  applyBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
