import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Platform } from 'react-native';
import CustomTextInput from './CustomTextInput';
import CustomDropdown from './CustomDropdown';
import CustomDatePicker from './CustomDatePicker';
import api from '../services/api';
import { X, Calendar as CalendarIcon, Clock, User } from 'lucide-react-native';

type AddAttendanceModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (date: string, checkIn: string, checkOut: string, status: string, employeeId?: string) => void;
};

export default function AddAttendanceModal({ visible, onClose, onSave }: AddAttendanceModalProps) {
  // In a real app, we'd use a proper date/time picker library. 
  // For simplicity and web compatibility, we'll use text inputs with standard formats for now.
  const [date, setDate] = useState('Oct 20, 2026');
  const [checkIn, setCheckIn] = useState('09:00 AM');
  const [checkOut, setCheckOut] = useState('06:00 PM');
  const [status, setStatus] = useState('Present');
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      api.get('/employees').then(res => {
        const emps = Array.isArray(res.data) ? res.data : (res.data.data?.employees || res.data.data || []);
        setEmployees(emps);
      }).catch(err => console.log('Error fetching employees:', err));
    }
  }, [visible]);

  const handleSave = () => {
    onSave(date, checkIn, checkOut, status, employeeId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Attendance</Text>
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

          <CustomDatePicker
              label="Date"
              value={date} 
              onDateChange={setDate}
          />

          <View style={styles.formGroupRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <CustomTextInput
                label="Check In"
                value={checkIn} 
                onChangeText={setCheckIn}
                placeholder="09:00 AM"
                left={<CustomTextInput.Icon icon={() => <Clock color="#F97316" size={18} />} />}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <CustomTextInput
                label="Check Out"
                value={checkOut} 
                onChangeText={setCheckOut}
                placeholder="06:00 PM"
                left={<CustomTextInput.Icon icon={() => <Clock color="#F97316" size={18} />} />}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusButtonsContainer}>
              {['Present', 'Late', 'Absent'].map(s => (
                <TouchableOpacity 
                  key={s} 
                  style={[styles.statusBtn, status === s && styles.statusBtnActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.statusBtnText, status === s && styles.statusBtnTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Attendance</Text>
          </TouchableOpacity>

        </View>
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
    padding: 20,
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 20,
      }
    })
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
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
    fontSize: 16,
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
    fontSize: 17,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusBtnActive: {
    backgroundColor: '#F97316',
    borderColor: '#E2E8F0',
  },
  statusBtnText: {
    color: '#0F172A',
    fontWeight: '500',
    fontSize: 16,
  },
  statusBtnTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
