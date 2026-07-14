import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text,  Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import CustomTextInput from './CustomTextInput';
import { X, User, Calendar as CalendarIcon } from 'lucide-react-native';

export default function AddPerformanceModal({ visible, onClose, onSave }: any) {
  const [employee, setEmployee] = useState('');
  const [period, setPeriod] = useState('Q3 2026');
  const [rating, setRating] = useState('Outstanding');

  const handleSave = () => {
    onSave(employee, period, rating);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Performance Review</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#F97316" size={24} />
              </TouchableOpacity>
            </View>

            <CustomTextInput
              label="Employee Name"
              value={employee} onChangeText={setEmployee} placeholder="e.g. John Doe"
              left={<CustomTextInput.Icon icon={() => <User color="#F97316" size={18} />} />}
              
            />

            <CustomTextInput
              label="Period"
              value={period} onChangeText={setPeriod}
              left={<CustomTextInput.Icon icon={() => <CalendarIcon color="#F97316" size={18} />} />}
              
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating</Text>
              <View style={styles.ratingButtonsContainer}>
                {['Outstanding', 'Exceeds Expectations', 'Meets Expectations'].map(r => (
                  <TouchableOpacity key={r} style={[styles.ratingBtn, rating === r && styles.ratingBtnActive]} onPress={() => setRating(r)}>
                    <Text style={[styles.ratingBtnText, rating === r && styles.ratingBtnTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Review</Text>
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 4 },
  formGroup: { marginBottom: 16 },
  label: { color: '#0F172A', fontSize: 16, marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, color: '#0F172A', fontSize: 17 },
  ratingButtonsContainer: { gap: 8 },
  ratingBtn: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  ratingBtnActive: { backgroundColor: '#F97316', borderColor: '#E2E8F0' },
  ratingBtnText: { color: '#0F172A', fontWeight: '500', fontSize: 16 },
  ratingBtnTextActive: { color: '#0F172A', fontWeight: '600' },
  saveBtn: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
