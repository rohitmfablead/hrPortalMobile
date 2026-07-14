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

  const [activeTab, setActiveTab] = useState<'Feedback' | 'Complaint'>('Feedback');

  const fetchItems = async () => {
    try {
      setLoading(true);
      if (activeTab === 'Feedback') {
        const res = await api.get('/feedback');
        const data = res.data.data?.feedbacks || res.data || [];
        setLocalFeedback(Array.isArray(data) ? data : []);
      } else {
        const res = await api.get('/complaints');
        const data = res.data.data?.complaints || res.data || [];
        setLocalFeedback(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      console.log('Error fetching items:', error);
      setLocalFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [activeTab])
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('onAddAction', () => setModalVisible(true));
    return () => subscription.remove();
  }, []);

  const handleAddSubmit = async (payload: any) => {
    try {
      if (activeTab === 'Feedback') {
        await api.post('/feedback', payload);
      } else {
        await api.post('/complaints', payload);
      }
      fetchItems();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || `Failed to submit ${activeTab.toLowerCase()}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Feedback' && styles.activeTab]} 
          onPress={() => setActiveTab('Feedback')}
        >
          <Text style={[styles.tabText, activeTab === 'Feedback' && styles.activeTabText]}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Complaint' && styles.activeTab]} 
          onPress={() => setActiveTab('Complaint')}
        >
          <Text style={[styles.tabText, activeTab === 'Complaint' && styles.activeTabText]}>Complaint</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
        data={localFeedback}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={({ item }) => {
          const isComplaintTab = activeTab === 'Complaint';
          const displayTitle = isComplaintTab ? item.subject : item.title;
          const displayDetails = isComplaintTab ? item.description : item.suggestion;
          const displayType = isComplaintTab ? item.type : item.category;
          
          return (
            <View style={styles.modernCard}>
              <View style={styles.iconWrapper}>
                <MessageSquare color="#3B82F6" size={24} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{displayTitle}</Text>
                  <View style={[styles.statusBadge, isComplaintTab ? styles.badgeRed : styles.badgeGreen]}>
                    <Text style={[styles.statusText, isComplaintTab ? styles.textRed : styles.textGreen]}>{displayType}</Text>
                  </View>
                </View>
                <Text style={styles.message}>{displayDetails}</Text>
                {isComplaintTab && item.priority && (
                  <Text style={[styles.message, { marginTop: 4, fontWeight: 'bold' }]}>Priority: {item.priority}</Text>
                )}
                {!isComplaintTab && item.rating && (
                  <Text style={[styles.message, { marginTop: 4, fontWeight: 'bold' }]}>Rating: {item.rating}/5</Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#64748B', fontSize: 18, fontWeight: '500' }}>No {activeTab.toLowerCase()} available</Text>
          </View>
        }
      />
      )}
      <AddFeedbackModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddSubmit} 
        defaultType={activeTab}
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
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  message: {
    color: '#475569',
    fontSize: 16,
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
  textGreen: { color: '#059669', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  textRed: { color: '#DC2626', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  textOrange: { color: '#D97706', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
  },
});
