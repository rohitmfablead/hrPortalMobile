import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, DeviceEventEmitter, ActivityIndicator, Alert } from 'react-native';
import { RefreshControl } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { CheckCircle2, Clock, Calendar, Briefcase, ListTodo, MoreVertical } from 'lucide-react-native';
import api from '../services/api';
import AddTaskModal from '../components/AddTaskModal';

export default function TasksScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed'>('All');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data.data?.tasks || []);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => {
        if (isAdminOrHR) {
          setModalVisible(true);
        } else {
          Alert.alert('Unauthorized', 'Only Admin and HR can create tasks.');
        }
      });
      return () => subscription.remove();
    }, [isAdminOrHR])
  );

  const handleCreateTask = async (title: string, description: string, assignedTo: string, priority: string, dueDate: string) => {
    try {
      await api.post('/tasks', { title, description, assignedTo, priority, dueDate });
      setModalVisible(false);
      fetchTasks();
      Alert.alert('Success', 'Task created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return task.status === 'Pending' || task.status === 'In Progress';
    if (activeTab === 'Completed') return task.status === 'Completed';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {['All', 'Pending', 'Completed'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
          data={filteredTasks}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isCompleted = item.status === 'Completed';
            let priorityColor = '#3B82F6';
            if (item.priority === 'High') priorityColor = '#EF4444';
            if (item.priority === 'Low') priorityColor = '#10B981';

            return (
              <View style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                    <Text style={[styles.priorityText, { color: priorityColor }]}>{item.priority}</Text>
                  </View>
                  <View style={[styles.statusBadge, isCompleted ? styles.statusCompletedBg : styles.statusPendingBg]}>
                    <Text style={[styles.statusText, isCompleted ? styles.statusCompletedText : styles.statusPendingText]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.taskTitle, isCompleted && styles.textStrike]}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <View style={styles.infoRow}>
                      <Briefcase size={14} color="#64748B" />
                      <Text style={styles.infoText}>
                        {isAdminOrHR ? `To: ${item.assignedTo?.firstName || ''} ${item.assignedTo?.lastName || ''}` : `From: ${item.assignedBy?.name || 'Admin'}`}
                      </Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: 4 }]}>
                      <Calendar size={14} color="#64748B" />
                      <Text style={styles.infoText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.actionBtn, isCompleted ? styles.actionBtnCompleted : styles.actionBtnPending]}
                    onPress={() => handleStatusChange(item._id, item.status)}
                  >
                    {isCompleted ? <CheckCircle2 size={24} color="#10B981" /> : <Clock size={24} color="#F97316" />}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <ListTodo size={32} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No Tasks Found</Text>
              <Text style={styles.emptyDesc}>You have no tasks in this category.</Text>
            </View>
          }
        />
      )}

      {isAdminOrHR && (
        <AddTaskModal 
          visible={isModalVisible} 
          onClose={() => setModalVisible(false)} 
          onSave={handleCreateTask} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF7ED',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#F97316',
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 40 },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskCardCompleted: {
    opacity: 0.8,
    backgroundColor: '#F8FAFC',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPendingBg: { backgroundColor: '#FFFBEB' },
  statusCompletedBg: { backgroundColor: '#ECFDF5' },
  statusPendingText: { color: '#D97706', fontSize: 14, fontWeight: '600' },
  statusCompletedText: { color: '#059669', fontSize: 14, fontWeight: '600' },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  textStrike: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskDesc: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionBtnPending: {
    backgroundColor: '#FFF7ED',
  },
  actionBtnCompleted: {
    backgroundColor: '#ECFDF5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 16,
  },
});
