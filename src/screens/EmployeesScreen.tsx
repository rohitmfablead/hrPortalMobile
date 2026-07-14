import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert, DeviceEventEmitter, Platform, Image } from 'react-native';
import { RefreshControl } from "react-native";
import { Card, Title, Paragraph, Avatar, Portal, Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, addEmployee, updateEmployee, deleteEmployee } from '../redux/slices/employeeSlice';
import { RootState, AppDispatch } from '../redux/store';
import { Plus, Pencil, Trash2, Mail, Phone, Calendar, DollarSign, Fingerprint, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import CustomTextInput from '../components/CustomTextInput';

export default function EmployeesScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { employees, loading, error } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchEmployees({}));
  }, [dispatch, refreshCounter]);

  useFocusEffect(
    useCallback(() => {
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => {
        navigation.navigate('AddEditEmployee');
      });
      return () => subscription.remove();
    }, [navigation])
  );

  const confirmDelete = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteModalVisible(true);
  };

  const executeDelete = () => {
    if (employeeToDelete) {
      dispatch(deleteEmployee(employeeToDelete))
        .unwrap()
        .then(() => {
          Alert.alert('Success', 'Employee deleted successfully');
          setDeleteModalVisible(false);
          setEmployeeToDelete(null);
        })
        .catch((err) => {
          Alert.alert('Error', err || 'Failed to delete employee');
          setDeleteModalVisible(false);
          setEmployeeToDelete(null);
        });
    }
  };

  if (loading && employees.length === 0) return <View style={styles.center}><ActivityIndicator size="large" color="#F97316" /></View>;
  if (error) return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;

  const filteredEmployees = employees.filter((emp: any) => {
    const term = searchQuery.toLowerCase();
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.department && emp.department.toLowerCase().includes(term)) ||
      (emp.designation && emp.designation.toLowerCase().includes(term))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <CustomTextInput
          label=""
          placeholder="Search by name, email, or role..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          left={<CustomTextInput.Icon icon={() => <Search color="#64748B" size={18} />} />}
        />
      </View>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
        data={filteredEmployees}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const fullName = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown';
          const avatarLabel = fullName.substring(0, 2).toUpperCase() || 'EMP';
          const isActive = item.status === 'Active';

          return (
            <TouchableOpacity onPress={() => navigation.navigate('EmployeeDetails', { employee: item })} activeOpacity={0.8}>
              <View style={styles.card}>

                {/* Full Height Left Image */}
                {item.profilePicture?.url ? (
                  <Image source={{ uri: item.profilePicture.url }} style={styles.fullImage} />
                ) : (
                  <View style={styles.fullImagePlaceholder}>
                    <Text style={styles.fullImagePlaceholderText}>{avatarLabel}</Text>
                  </View>
                )}

                {/* Right Side Content */}
                <View style={styles.cardContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.title} numberOfLines={1}>{fullName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                      <Text style={[styles.statusText, { color: isActive ? '#16A34A' : '#EF4444' }]}>{item.status || 'Active'}</Text>
                    </View>
                  </View>

                  <Text style={styles.role} numberOfLines={1}>{item.designation || item.role || 'Employee'}</Text>

                  <View style={styles.compactDetails}>
                    <View style={styles.compactRow}>
                      <Mail color="#94A3B8" size={14} style={styles.detailIcon} />
                      <Text style={styles.compactText} numberOfLines={1}>{item.email || 'N/A'}</Text>
                    </View>
                    <View style={styles.compactRow}>
                      <Fingerprint color="#94A3B8" size={14} style={styles.detailIcon} />
                      <Text style={styles.compactText} numberOfLines={1}>{item.department || 'N/A'}</Text>
                    </View>
                  </View>

                  {isAdminOrHR && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity style={styles.actionBtn} onPress={(e) => { e.stopPropagation(); navigation.navigate('AddEditEmployee', { employee: item }); }}>
                        <Pencil color="#F97316" size={16} />
                      </TouchableOpacity>
                      {user?.role === 'Admin' && (
                        <TouchableOpacity style={styles.actionBtnDelete} onPress={(e) => { e.stopPropagation(); confirmDelete(item.id || item._id); }}>
                          <Trash2 color="#EF4444" size={16} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

              </View>
            </TouchableOpacity>
          );
        }}
      />
      <Portal>
        <Modal visible={isDeleteModalVisible} onDismiss={() => setDeleteModalVisible(false)} contentContainerStyle={styles.deleteModalContainer}>
          <Text style={styles.deleteModalTitle}>Confirm Delete</Text>
          <Text style={styles.deleteModalText}>Are you sure you want to delete this employee? This action cannot be undone.</Text>
          <View style={styles.deleteModalActions}>
            <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={executeDelete} style={styles.confirmDeleteBtn}>
              <Text style={styles.confirmDeleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const shadowStyle = Platform.select({
  web: { boxShadow: '0px 8px 24px rgba(249, 115, 22, 0.08)' } as any,
  default: { shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    ...shadowStyle,
    overflow: 'hidden',
  },
  fullImage: {
    width: 130,
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#F8FAFC',
  },
  fullImagePlaceholder: {
    width: 130,
    height: '100%',
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImagePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { color: '#0F172A', fontSize: 21, fontWeight: '800', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 15, fontWeight: '800' },
  role: { color: '#F97316', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  compactDetails: { gap: 6 },
  compactRow: { flexDirection: 'row', alignItems: 'center' },
  detailIcon: { marginRight: 8 },
  compactText: { color: '#64748B', fontSize: 17, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF7ED', borderRadius: 12, marginLeft: 8 },
  actionBtnDelete: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FEF2F2', borderRadius: 12, marginLeft: 8 },
  deleteModalContainer: { backgroundColor: '#FFFFFF', margin: 20, padding: 24, borderRadius: 20, alignItems: 'center', ...shadowStyle },
  deleteModalTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  deleteModalText: { fontSize: 19, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  deleteModalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, paddingVertical: 14, marginRight: 8, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: '700', fontSize: 20 },
  confirmDeleteBtn: { flex: 1, paddingVertical: 14, marginLeft: 8, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  confirmDeleteBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 20 },
});
