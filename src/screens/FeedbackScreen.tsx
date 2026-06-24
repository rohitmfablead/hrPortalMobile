import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text, DeviceEventEmitter, ActivityIndicator, Alert } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import api from '../services/api';
import AddFeedbackModal from '../components/AddFeedbackModal';

export default function FeedbackScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localFeedback, setLocalFeedback] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedback');
      setLocalFeedback(res.data.data?.feedbacks || []);
    } catch (error: any) {
      console.log('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeedback();
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => setModalVisible(true));
      return () => subscription.remove();
    }, [])
  );

  const handleAddFeedback = async (subject: string, details: string, type: string) => {
    try {
      await api.post('/feedback', { subject, details, type });
      fetchFeedback();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
        data={localFeedback}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isComplaint = item.type === 'Complaint';
          const isPraise = item.type === 'Praise';
          
          return (
            <View style={styles.modernCard}>
              <View style={styles.iconWrapper}>
                <MessageSquare color="#3B82F6" size={24} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{item.subject}</Text>
                  <View style={[styles.statusBadge, isComplaint ? styles.badgeRed : (isPraise ? styles.badgeGreen : styles.badgeOrange)]}>
                    <Text style={[styles.statusText, isComplaint ? styles.textRed : (isPraise ? styles.textGreen : styles.textOrange)]}>{item.type}</Text>
                  </View>
                </View>
                <Text style={styles.message}>{item.details}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#64748B', fontSize: 16, fontWeight: '500' }}>No feedback available</Text>
          </View>
        }
      />
      )}
      <AddFeedbackModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddFeedback} 
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
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
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
    marginBottom: 6,
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  message: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGreen: { backgroundColor: '#ECFDF5' },
  badgeRed: { backgroundColor: '#FEF2F2' },
  badgeOrange: { backgroundColor: '#FFFBEB' },
  textGreen: { color: '#059669', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  textRed: { color: '#DC2626', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  textOrange: { color: '#D97706', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
});
