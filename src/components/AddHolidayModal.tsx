import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, TextInput, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { X, Calendar as CalendarIcon, Edit3 } from 'lucide-react-native';

export default function AddHolidayModal({ visible, onClose, onSave }: any) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSave = () => {
    onSave(name, date);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Holiday</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#F97316" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Holiday Name</Text>
              <View style={styles.inputContainer}>
                <Edit3 color="#0F172A" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Diwali" placeholderTextColor="#ffffff" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="e.g. Nov 1, 2026" placeholderTextColor="#ffffff" />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Holiday</Text>
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
  saveBtn: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
