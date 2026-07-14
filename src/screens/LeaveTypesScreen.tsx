import CustomTextInput from '../components/CustomTextInput';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, DeviceEventEmitter } from 'react-native';
import { RefreshControl } from "react-native";
import { Text, Card, Modal, Portal, Button, IconButton } from 'react-native-paper';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchLeaveTypes } from '../redux/slices/masterSlice';
import * as masterService from '../services/masterService';

export default function LeaveTypesScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const dispatch = useDispatch<AppDispatch>();
  const { leaveTypes, loading } = useSelector((state: RootState) => state.master);
  
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchLeaveTypes());
  }, [dispatch, refreshCounter]);

  useFocusEffect(
    useCallback(() => {
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => showModal());
      return () => subscription.remove();
    }, [])
  );

  const showModal = (leaveType?: any) => {
    if (leaveType) {
      setEditingId(leaveType._id);
      setName(leaveType.name);
      setDescription(leaveType.description || '');
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
    }
    setVisible(true);
  };
  const hideModal = () => setVisible(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await masterService.updateLeaveType(editingId, { name, description });
      } else {
        await masterService.createLeaveType({ name, description });
      }
      hideModal();
      dispatch(fetchLeaveTypes());
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this leave type?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await masterService.deleteLeaveType(id);
            dispatch(fetchLeaveTypes());
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete');
          }
      }},
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Title 
        title={item.name} 
        subtitle={item.description}
        titleStyle={{ color: '#0F172A', fontWeight: 'bold' }}
        subtitleStyle={{ color: '#475569' }}
        right={(props) => (
          <View style={{ flexDirection: 'row' }}>
            <IconButton {...props} icon={({ size }) => <Pencil size={size} color="#0F172A" />} onPress={() => showModal(item)} />
            <IconButton {...props} icon={({ size }) => <Trash2 size={size} color="#EF4444" />} onPress={() => handleDelete(item._id)} />
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
          data={leaveTypes}
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
            {editingId ? 'Edit Leave Type' : 'Add Leave Type'}
          </Text>
          <CustomTextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <CustomTextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            numberOfLines={3}
          />
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
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  modalButton: { marginLeft: 8 },
});
