import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text, DeviceEventEmitter, ActivityIndicator, Alert } from 'react-native';
import { Star, Award, TrendingUp } from 'lucide-react-native';
import api from '../services/api';
import AddPerformanceModal from '../components/AddPerformanceModal';

export default function PerformancesScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localPerformances, setLocalPerformances] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/performance');
      setLocalPerformances(res.data.data?.performances || []);
    } catch (error: any) {
      console.log('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPerformances();
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => setModalVisible(true));
      return () => subscription.remove();
    }, [])
  );

  const handleAddPerformance = async (employee: string, period: string, rating: string) => {
    try {
      await api.post('/performance', { employee, period, rating });
      fetchPerformances();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add performance');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
        data={localPerformances}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const rating = Number(item.overallRating) || 3;
          let ratingLabel = 'Meets Expectations';
          if (rating >= 4.5) ratingLabel = 'Outstanding';
          else if (rating >= 4) ratingLabel = 'Exceeds Expectations';

          const isOutstanding = rating >= 4.5;
          const isExceeds = rating >= 4 && rating < 4.5;
          
          return (
            <View style={styles.modernCard}>
              <View style={[styles.iconWrapper, isOutstanding && { backgroundColor: '#FEF3C7' }]}>
                {isOutstanding ? <Award color="#D97706" size={24} /> : <Star color="#F59E0B" size={24} />}
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{item.name}</Text>
                </View>
                <Text style={styles.period}>Last Review: {item.lastReview}</Text>
                <View style={[styles.statusBadge, isOutstanding ? styles.badgeOut : (isExceeds ? styles.badgeExc : styles.badgeMeet)]}>
                  <Text style={[styles.statusText, isOutstanding ? styles.textOut : (isExceeds ? styles.textExc : styles.textMeet)]}>{ratingLabel} ({rating}/5)</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#64748B', fontSize: 16, fontWeight: '500' }}>No performance records available</Text>
          </View>
        }
      />
      )}
      <AddPerformanceModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddPerformance} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
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
    backgroundColor: '#FEF3C7',
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
    marginBottom: 4,
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  period: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeOut: { backgroundColor: '#FEF3C7' },
  textOut: { color: '#D97706' },
  badgeExc: { backgroundColor: '#F1F5F9' },
  textExc: { color: '#334155' },
  badgeMeet: { backgroundColor: '#DBEAFE' },
  textMeet: { color: '#2563EB' },
});
