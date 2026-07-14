import CustomTextInput from '../components/CustomTextInput';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { RefreshControl } from "react-native";
import { Text, Card, Modal, Portal, Button, IconButton, Menu } from 'react-native-paper';
import { Pencil, Trash2, ChevronDown } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchDesignations, fetchDepartments } from '../redux/slices/masterSlice';
import * as masterService from '../services/masterService';

export default function DesignationsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const dispatch = useDispatch<AppDispatch>();
  const { designations, departments, loading } = useSelector((state: RootState) => state.master);
  
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchDesignations());
    dispatch(fetchDepartments());
  }, [dispatch, refreshCounter]);

  useFocusEffect(
    useCallback(() => {
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => showModal());
      return () => subscription.remove();
    }, [])
  );

  const showModal = (desig?: any) => {
    if (desig) {
      setEditingId(desig._id);
      setTitle(desig.title);
      setDepartmentId(desig.departmentId?._id || desig.departmentId);
    } else {
      setEditingId(null);
      setTitle('');
      setDepartmentId(departments.length > 0 ? departments[0]._id : '');
    }
    setVisible(true);
  };
  const hideModal = () => setVisible(false);

  const handleSubmit = async () => {
    if (!title.trim() || !departmentId) {
      Alert.alert('Error', 'Title and Department are required');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await masterService.updateDesignation(editingId, { title, departmentId });
      } else {
        await masterService.createDesignation({ title, departmentId });
      }
      hideModal();
      dispatch(fetchDesignations());
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this designation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await masterService.deleteDesignation(id);
            dispatch(fetchDesignations());
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete');
          }
      }},
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Title 
        title={item.title} 
        subtitle={`Department: ${item.departmentId?.name || 'Unknown'}`}
        titleStyle={{ color: '#0F172A', fontWeight: 'bold' }}
        subtitleStyle={{ color: '#475569' }}
        right={(props) => (
          <View style={{ flexDirection: 'row' }}>
            <IconButton {...props} icon={({ size }) => <Pencil size={size} color="#0F172A" />} onPress={() => showModal(item)} />
            <IconButton {...props} icon={({ size, color }) => <Trash2 size={size} color="#EF4444" />} onPress={() => handleDelete(item._id)} />
          </View>
        )}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#F97316" /></View>
      ) : (
        <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
          data={designations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
        />
      )}

      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
          <Text variant="titleLarge" style={[styles.modalTitle, { color: '#0F172A' }]}>
            {editingId ? 'Edit Designation' : 'Add Designation'}
          </Text>
          <CustomTextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <Menu
            visible={dropdownVisible}
            onDismiss={() => setDropdownVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setDropdownVisible(true)}>
                <View pointerEvents="none">
                  <CustomTextInput
                    label="Department"
                    value={departments.find(d => d._id === departmentId)?.name || ''}
                    mode="outlined"
                    editable={false}
                    right={<CustomTextInput.Icon icon={({ size }) => <ChevronDown size={size} color="#0F172A" />} />}
                    style={styles.input}
                    textColor="#0F172A"
                    theme={{ colors: { background: '#FFFFFF', onSurfaceVariant: '#475569' } }}
                  />
                </View>
              </TouchableOpacity>
            }
          >
            {departments.map(dept => (
              <Menu.Item 
                key={dept._id} 
                onPress={() => { setDepartmentId(dept._id); setDropdownVisible(false); }} 
                title={dept.name} 
              />
            ))}
          </Menu>
          <View style={styles.modalActions}>
            <Button onPress={hideModal} style={styles.modalButton} textColor="#0F172A">Cancel</Button>
            <Button mode="contained" onPress={handleSubmit} loading={isSubmitting} style={styles.modalButton} buttonColor="#F97316">
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { marginBottom: 12, backgroundColor: '#FFFFFF' },
  modalContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8 },
  modalTitle: { marginBottom: 16, fontWeight: 'bold' },
  input: { marginBottom: 12 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 12, paddingHorizontal: 8 },
  pickerLabel: { fontSize: 14, color: '#666', marginTop: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  modalButton: { marginLeft: 8 },
});
