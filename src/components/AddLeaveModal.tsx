import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, TextInput, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { X, Calendar as CalendarIcon, AlignLeft } from 'lucide-react-native';

type AddLeaveModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (type: string, start: string, end: string, status: string) => void;
};

export default function AddLeaveModal({ visible, onClose, onSave }: AddLeaveModalProps) {
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('Oct 10, 2026');
  const [endDate, setEndDate] = useState('Oct 12, 2026');
  const [reason, setReason] = useState('');

  const handleSave = () => {
    // For normal employees, new leaves usually start as Pending.
    onSave(leaveType, startDate, endDate, 'Pending');
    onClose();
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Leave Type</Text>
              <View style={styles.typeButtonsContainer}>
                {['Sick Leave', 'Casual Leave', 'Vacation'].map(type => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.typeBtn, leaveType === type && styles.typeBtnActive]}
                    onPress={() => setLeaveType(type)}
                  >
                    <Text style={[styles.typeBtnText, leaveType === type && styles.typeBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroupRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Start Date</Text>
                <View style={styles.inputContainer}>
                  <CalendarIcon color="#F97316" size={20} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    value={startDate} 
                    onChangeText={setStartDate}
                    placeholder="Oct 10, 2026"
                    placeholderTextColor="#ffffff"
                  />
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>End Date</Text>
                <View style={styles.inputContainer}>
                  <CalendarIcon color="#F97316" size={20} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    value={endDate} 
                    onChangeText={setEndDate}
                    placeholder="Oct 12, 2026"
                    placeholderTextColor="#ffffff"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Reason</Text>
              <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                <AlignLeft color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { height: 76 }]} 
                  value={reason} 
                  onChangeText={setReason}
                  placeholder="Enter reason..."
                  placeholderTextColor="#ffffff"
                  multiline
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Submit Application</Text>
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
