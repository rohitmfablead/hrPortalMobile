import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, DeviceEventEmitter, ActivityIndicator, Platform } from 'react-native';
import { RefreshControl } from "react-native";
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react-native';
import AddLeaveModal from '../components/AddLeaveModal';
import api from '../services/api';

export default function LeavesScreen() {
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

  // Time Filter State
  const [timeFilter, setTimeFilter] = useState('Month');
  const [isTimeDropdownVisible, setTimeDropdownVisible] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

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
      
      const params: any = {};
      if (timeFilter !== 'All') {
        params.fromDate = fromDate;
        params.toDate = toDate;
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

  const handleStatusChange = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await api.put(`/leaves/${id}/${action}`, { remarks: action === 'approve' ? 'Approved' : 'Rejected' });
      if (res.data.success) {
        Alert.alert('Success', `Leave ${action}d successfully`);
        fetchLeaves();
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || `Failed to ${action} leave`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaves();
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => setModalVisible(true));
      return () => subscription.remove();
    }, [timeFilter])
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
        
        {/* Header with Filter */}
        <View style={styles.topHeader}>
          <Text style={styles.sectionTitle}>Leave Types</Text>
          <View style={{ position: 'relative', zIndex: 10 }}>
            <TouchableOpacity 
              style={styles.timeFilterBtn} 
              onPress={() => setTimeDropdownVisible(!isTimeDropdownVisible)}
            >
              <Text style={styles.timeFilterText}>{timeFilter}</Text>
            </TouchableOpacity>

            {isTimeDropdownVisible && (
              <View style={styles.timeDropdown}>
                {['Today', 'Month', 'Year', 'All'].map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.timeOption}
                    onPress={() => {
                      setTimeFilter(opt);
                      setTimeDropdownVisible(false);
                    }}
                  >
                    <Text style={[styles.timeOptionText, timeFilter === opt && { color: '#F97316', fontWeight: '700' }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.gridContainer, { zIndex: -1 }]}>
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
                <View>
                  <Text style={styles.leaveTypeTitle}>{item.leaveType || 'General Leave'}</Text>
                  <Text style={styles.employeeName}>{item.employeeName}</Text>
                </View>
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

              {item.status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.rejectBtnLayout]} 
                    onPress={() => handleStatusChange(item.id || item._id, 'reject')}
                  >
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.approveBtnLayout]} 
                    onPress={() => handleStatusChange(item.id || item._id, 'approve')}
                  >
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

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
    zIndex: 10,
  },
  timeFilterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeFilterText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  timeDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#475569',
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  leaveTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  employeeName: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
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
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  rejectBtnLayout: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  approveBtnLayout: {
    backgroundColor: '#F97316',
    borderColor: '#EA580C',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 16,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
