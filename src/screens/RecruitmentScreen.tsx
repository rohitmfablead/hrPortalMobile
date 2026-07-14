import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text, DeviceEventEmitter, ActivityIndicator, Alert } from 'react-native';
import { Briefcase, Users } from 'lucide-react-native';
import api from '../services/api';

export default function RecruitmentScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localJobs, setLocalJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruitment/jobs');
      setLocalJobs(res.data.data?.jobs || res.data.data || []);
    } catch (error: any) {
      console.log('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Recruitment Pipeline</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
        data={localJobs}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => {
          const isOpen = item.status === 'Open';
          const isInterviewing = item.status === 'Interviewing';
          
          return (
            <View style={styles.modernCard}>
              <View style={[styles.iconWrapper, isOpen && { backgroundColor: '#D1FAE5' }]}>
                <Briefcase color={isOpen ? "#059669" : "#64748B"} size={24} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{item.position || item.title}</Text>
                  <View style={[styles.statusBadge, isOpen ? styles.badgeOpen : (isInterviewing ? styles.badgeInt : styles.badgeClosed)]}>
                    <Text style={[styles.statusText, isOpen ? styles.textOpen : (isInterviewing ? styles.textInt : styles.textClosed)]}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.applicantsRow}>
                  <Users color="#64748B" size={16} style={{ marginRight: 4 }} />
                  <Text style={styles.applicantsText}>{item.applicants || 0} Applicants</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#64748B', fontSize: 18, fontWeight: '500' }}>No active job postings</Text>
          </View>
        }
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  screenTitle: { color: '#0F172A', fontSize: 26, marginBottom: 16, fontWeight: 'bold' },
  modernCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  applicantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantsText: {
    color: '#64748B',
    fontSize: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgeOpen: { backgroundColor: '#D1FAE5' },
  textOpen: { color: '#059669' },
  badgeInt: { backgroundColor: '#FEF3C7' },
  textInt: { color: '#D97706' },
  badgeClosed: { backgroundColor: '#F1F5F9' },
  textClosed: { color: '#64748B' },
});
