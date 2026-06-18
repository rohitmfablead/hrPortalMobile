import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, TextInput, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { X, Calendar as CalendarIcon, DollarSign } from 'lucide-react-native';

export default function AddPayslipModal({ visible, onClose, onSave }: any) {
  const [period, setPeriod] = useState('Oct 2026');
  const [amount, setAmount] = useState('$5,000');
  const [status, setStatus] = useState('Paid');

  const handleSave = () => {
    onSave(period, amount, status);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Payslip</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#F97316" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Period</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} value={period} onChangeText={setPeriod} placeholderTextColor="#ffffff" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.inputContainer}>
                <DollarSign color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholderTextColor="#ffffff" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusButtonsContainer}>
                {['Paid', 'Pending'].map(s => (
                  <TouchableOpacity key={s} style={[styles.statusBtn, status === s && styles.statusBtnActive]} onPress={() => setStatus(s)}>
                    <Text style={[styles.statusBtnText, status === s && styles.statusBtnTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Payslip</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', ...Platform.select({ web: { justifyContent: 'center', alignItems: 'center' } }) },
  modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', ...Platform.select({ web: { width: '100%', maxWidth: 500, borderRadius: 20 } }) },
  scrollContainer: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 4 },
  formGroup: { marginBottom: 16 },
  label: { color: '#0F172A', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, color: '#0F172A', fontSize: 15 },
  statusButtonsContainer: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  statusBtnActive: { backgroundColor: '#F97316', borderColor: '#E2E8F0' },
  statusBtnText: { color: '#0F172A', fontWeight: '500', fontSize: 14 },
  statusBtnTextActive: { color: '#0F172A', fontWeight: '600' },
  saveBtn: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
