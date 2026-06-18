import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, addEmployee } from '../redux/slices/employeeSlice';
import { RootState, AppDispatch } from '../redux/store';
import { Plus } from 'lucide-react-native';
import AddEmployeeModal from '../components/AddEmployeeModal';

export default function EmployeesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading, error } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployees({}));
  }, [dispatch]);

  const handleAddEmployee = (data: any) => {
    dispatch(addEmployee(data))
      .unwrap()
      .then(() => {
        Alert.alert('Success', 'Employee added successfully');
        setModalVisible(false);
      })
      .catch((err) => {
        Alert.alert('Error', err || 'Failed to add employee');
      });
  };

  if (loading && employees.length === 0) return <View style={styles.center}><ActivityIndicator size="large" color="#F97316" /></View>;
  if (error) return <View style={styles.center}><Text style={{color: 'red'}}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.screenTitle}>Employees Directory</Title>
        {isAdminOrHR && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id || item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const fullName = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown';
          const avatarLabel = fullName.substring(0, 2).toUpperCase() || 'EMP';
          return (
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Avatar.Text size={48} label={avatarLabel} style={styles.avatar} />
                <Title style={styles.title} numberOfLines={1}>{fullName}</Title>
                <Paragraph style={styles.role} numberOfLines={1}>{item.designation || item.role || 'Employee'}</Paragraph>
                <Paragraph style={styles.department} numberOfLines={1}>{item.department || 'N/A'}</Paragraph>
              </Card.Content>
            </Card>
          );
        }}
      />
      <AddEmployeeModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddEmployee}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 8,
    paddingBottom: 16 
  },
  screenTitle: { color: '#0F172A', fontSize: 24, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F97316', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 6 },
  row: { justifyContent: 'space-between' },
  card: { flex: 1, marginHorizontal: 4, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',},
  cardContent: { alignItems: 'center', padding: 12 },
  avatar: { backgroundColor: '#F97316', marginBottom: 8 },
  title: { color: '#F97316', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  role: { color: '#F97316', fontSize: 12, textAlign: 'center' },
  department: { color: '#0F172A', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
