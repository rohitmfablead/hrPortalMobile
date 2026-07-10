import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text, DeviceEventEmitter, ActivityIndicator, Alert, Platform } from 'react-native';
import { Megaphone, Pencil, Trash2 } from 'lucide-react-native';
import api from '../services/api';
import AddAnnouncementModal from '../components/AddAnnouncementModal';

export default function AnnouncementsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localAnnouncements, setLocalAnnouncements] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setLocalAnnouncements(res.data.data?.announcements || []);
    } catch (error: any) {
      console.log('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => {
        setEditingItem(null);
        setModalVisible(true);
      });
      return () => subscription.remove();
    }, [])
  );

  const handleSaveAnnouncement = async (title: string, message: string, date: string) => {
    try {
      if (editingItem) {
        await api.put(`/announcements/${editingItem.id}`, { title, message, date });
      } else {
        await api.post('/announcements', { title, message, date });
      }
      fetchAnnouncements();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
        data={localAnnouncements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.modernCard}>
            <View style={styles.iconWrapper}>
              <Megaphone color="#8B5CF6" size={24} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{item.createdAt?.substring(0, 10) || item.date}</Text>
              </View>
              <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
              
              {isAdminOrHR && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 16 }}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Pencil size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#64748B', fontSize: 16, fontWeight: '500' }}>No announcements available</Text>
          </View>
        }
      />
      )}
      <AddAnnouncementModal 
        visible={isModalVisible} 
        onClose={() => { setModalVisible(false); setEditingItem(null); }} 
        onSave={handleSaveAnnouncement}
        initialData={editingItem} 
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
    backgroundColor: '#EDE9FE',
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
  date: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});
