import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert, DeviceEventEmitter } from 'react-native';
import { Card, Title, Paragraph, Avatar, Portal, Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, addEmployee, updateEmployee, deleteEmployee } from '../redux/slices/employeeSlice';
import { RootState, AppDispatch } from '../redux/store';
import { Plus, Pencil, Trash2, Mail, Phone, Calendar, DollarSign, Fingerprint, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import CustomTextInput from '../components/CustomTextInput';

export default function EmployeesScreen() {
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
  }, [dispatch]);

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
  if (error) return <View style={styles.center}><Text style={{color: 'red'}}>{error}</Text></View>;

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
        data={filteredEmployees}
        keyExtractor={(item) => item.id || item._id}
        renderItem={({ item }) => {
          const fullName = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown';
          const avatarLabel = fullName.substring(0, 2).toUpperCase() || 'EMP';
          const joinDate = item.joiningDate ? new Date(item.joiningDate).toLocaleDateString() : 'N/A';
          const isActive = item.status === 'Active';

          return (
            <TouchableOpacity onPress={() => navigation.navigate('EmployeeDetails', { employee: item })} activeOpacity={0.7}>
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  {isAdminOrHR && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity style={styles.actionBtn} onPress={(e) => { e.stopPropagation(); navigation.navigate('AddEditEmployee', { employee: item }); }}>
                        <Pencil color="#475569" size={18} />
                      </TouchableOpacity>
                      {user?.role === 'Admin' && (
                        <TouchableOpacity style={styles.actionBtn} onPress={(e) => { e.stopPropagation(); confirmDelete(item.id || item._id); }}>
                          <Trash2 color="#EF4444" size={18} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  
                  <View style={styles.cardHeader}>
                    {item.profilePicture?.url ? (
                      <Avatar.Image size={60} source={{ uri: item.profilePicture.url }} style={styles.avatar} />
                    ) : (
                      <Avatar.Text size={60} label={avatarLabel} style={styles.avatar} />
                    )}
                    <View style={styles.headerText}>
                      <Title style={styles.title} numberOfLines={1}>{fullName}</Title>
                      <Paragraph style={styles.role} numberOfLines={1}>{item.designation || item.role || 'Employee'}</Paragraph>
                      <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                        <Text style={[styles.statusText, { color: isActive ? '#16A34A' : '#EF4444' }]}>{item.status || 'Active'}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.compactDetails}>
                    <View style={styles.compactRow}>
                      <Mail color="#64748B" size={14} style={styles.detailIcon} />
                      <Text style={styles.compactText} numberOfLines={1}>{item.email || 'N/A'}</Text>
                    </View>
                    <View style={styles.compactRow}>
                      <Fingerprint color="#64748B" size={14} style={styles.detailIcon} />
                      <Text style={styles.compactText}>{item.department || 'N/A'}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  searchContainer: { marginBottom: 12 },
  row: { justifyContent: 'space-between' },
  card: { 
    marginHorizontal: 4, 
    marginBottom: 12, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: { padding: 16 },
  actionsRow: { flexDirection: 'row', position: 'absolute', top: 16, right: 16, zIndex: 1 },
  actionBtn: { padding: 6, marginLeft: 8, backgroundColor: '#F8FAFC', borderRadius: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { backgroundColor: '#F97316', marginRight: 16 },
  headerText: { flex: 1, paddingRight: 60 }, // Padding to avoid overlap with actions
  title: { color: '#0F172A', fontSize: 18, fontWeight: '700', marginBottom: 2 },
  role: { color: '#64748B', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  compactDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between' },
  compactRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailIcon: { marginRight: 6 },
  compactText: { color: '#475569', fontSize: 13, fontWeight: '500' },
  deleteModalContainer: { backgroundColor: '#FFFFFF', margin: 20, padding: 24, borderRadius: 16, alignItems: 'center' },
  deleteModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  deleteModalText: { fontSize: 15, color: '#475569', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  deleteModalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, paddingVertical: 12, marginRight: 8, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 16 },
  confirmDeleteBtn: { flex: 1, paddingVertical: 12, marginLeft: 8, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' },
  confirmDeleteBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});
