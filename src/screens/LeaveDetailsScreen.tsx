import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, SafeAreaView, Platform, ActivityIndicator, Alert } from 'react-native';
import { User, Calendar as CalendarIcon, FileText, CheckCircle, XCircle, Info } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import api from '../services/api';

export default function LeaveDetailsScreen({ navigation, route }: any) {
  const { leave } = route.params || {};
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [currentLeave, setCurrentLeave] = useState(leave);
  const [loading, setLoading] = useState(false);

  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      const endpoint = `/leaves/${currentLeave.id}/${action}`;
      const res = await api.put(endpoint, { remarks: action === 'approve' ? 'Approved' : 'Rejected' });
      if (res.data.success) {
        setCurrentLeave(res.data.data);
        Alert.alert('Success', `Leave request ${action}ed successfully.`);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error?.message || `Failed to ${action} leave request.`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentLeave) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No leave details available.</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#059669';
      case 'rejected': return '#DC2626';
      default: return '#D97706';
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    if (!currentLeave || !currentLeave.fromDate || !currentLeave.toDate) return marked;

    let currentDate = new Date(currentLeave.fromDate);
    const endDate = new Date(currentLeave.toDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      marked[dateStr] = { selected: true, selectedColor: '#8B5CF6' };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return marked;
  };

  const statusColor = getStatusColor(currentLeave.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatarText}>
              {currentLeave.employeeName ? currentLeave.employeeName[0].toUpperCase() : 'E'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.employeeNameText}>{currentLeave.employeeName || 'Unknown Employee'}</Text>
            <Text style={styles.employeeIdText}>{currentLeave.employeeId || 'ID Not Available'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{currentLeave.status}</Text>
          </View>
        </View>

        {/* Leave Info Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Leave Information</Text>
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Info color="#3B82F6" size={18} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Leave Type</Text>
              <Text style={styles.infoValue}>{currentLeave.leaveType}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <CalendarIcon color="#8B5CF6" size={18} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>
                {currentLeave.fromDate}  To  {currentLeave.toDate}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <FileText color="#F59E0B" size={18} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Reason</Text>
              <Text style={styles.infoValue}>{currentLeave.reason || 'No reason provided'}</Text>
            </View>
          </View>
        </View>

        {/* Calendar View */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Leave Calendar</Text>
          <View style={styles.divider} />
          <Calendar
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: '#8B5CF6',
              arrowColor: '#8B5CF6',
            }}
          />
        </View>

        {/* Action Buttons for Admin/HR */}
        {isAdminOrHR && currentLeave.status === 'Pending' && (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>Review Application</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.rejectBtn]} 
                  onPress={() => handleAction('reject')}
                >
                  <XCircle color="#DC2626" size={20} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.approveBtn]} 
                  onPress={() => handleAction('approve')}
                >
                  <CheckCircle color="#FFFFFF" size={20} />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#64748B',
    fontSize: 18,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.04)' } as any,
      default: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }
    })
  },
  avatarBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
  },
  profileInfo: {
    flex: 1,
  },
  employeeNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  employeeIdText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.04)' } as any,
      default: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }
    })
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    color: '#334155',
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 8,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  rejectBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  approveBtn: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '700',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
