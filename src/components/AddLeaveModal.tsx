import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import CustomTextInput from './CustomTextInput';
import CustomDropdown from './CustomDropdown';
import CustomDatePicker from './CustomDatePicker';
import { X, Calendar as CalendarIcon, AlignLeft, User, Tag } from 'lucide-react-native';

import api from '../services/api';

type AddLeaveModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  leaveTypes?: any[];
};

export default function AddLeaveModal({ visible, onClose, onSave, leaveTypes = [] }: AddLeaveModalProps) {
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [fetchedLeaveTypes, setFetchedLeaveTypes] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      api.get('/employees').then(res => {
        const emps = Array.isArray(res.data) ? res.data : (res.data.data?.employees || res.data.data || []);
        setEmployees(emps);
      }).catch(err => console.log('Error fetching employees:', err));

      api.get('/leave-types').then(res => {
        const lts = Array.isArray(res.data) ? res.data : (res.data.data?.leaveTypes || res.data.data || []);
        setFetchedLeaveTypes(lts);
      }).catch(err => console.log('Error fetching leave types:', err));
    }
  }, [visible]);

  const handleSave = async () => {
    if (!startDate || !endDate || !reason) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/leaves/apply', {
        employeeId,
        leaveType,
        fromDate: new Date(startDate).toISOString().split('T')[0],
        toDate: new Date(endDate).toISOString().split('T')[0],
        reason
      });
      if (res.data.success) {
        onSave();
        onClose();
        // Reset fields
        setStartDate('');
        setEndDate('');
        setReason('');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Apply Leave</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#F97316" size={24} />
              </TouchableOpacity>
            </View>

            <CustomDropdown
              label="Employee"
              value={employeeId}
              onSelect={setEmployeeId}
              options={employees.map(emp => ({ label: emp.firstName ? `${emp.firstName} ${emp.lastName}` : emp.name || 'Unknown', value: emp._id || emp.id }))}
              placeholder="Select Employee"
              icon={() => <User color="#F97316" size={18} />}
            />

            <CustomDropdown
              label="Leave Type"
              value={leaveType}
              onSelect={setLeaveType}
              options={(fetchedLeaveTypes.length > 0 ? fetchedLeaveTypes : leaveTypes).map(lt => ({ label: lt.name || lt.title || lt.type || lt, value: lt.name || lt.title || lt.type || lt }))}
              placeholder="Select Leave Type"
              icon={() => <Tag color="#F97316" size={18} />}
            />

            <View style={styles.formGroupRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <CustomDatePicker
                  label="Start Date"
                  value={startDate} 
                  onDateChange={setStartDate}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <CustomDatePicker
                  label="End Date"
                  value={endDate} 
                  onDateChange={setEndDate}
                />
              </View>
            </View>

            <CustomTextInput
              label="Reason"
              value={reason} 
              onChangeText={setReason}
              placeholder="Enter reason..."
              multiline
              numberOfLines={3}
              left={<CustomTextInput.Icon icon={() => <AlignLeft color="#F97316" size={18} />} />}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Submitting...' : 'Submit Application'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
      }
    })
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 20,
      }
    })
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  formGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#0F172A',
    fontSize: 15,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeBtnActive: {
    backgroundColor: '#F97316',
    borderColor: '#E2E8F0',
  },
  typeBtnText: {
    color: '#0F172A',
    fontWeight: '500',
    fontSize: 13,
  },
  typeBtnTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
