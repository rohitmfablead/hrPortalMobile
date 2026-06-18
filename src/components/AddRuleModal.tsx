import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, TextInput, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { X, Type, AlignLeft } from 'lucide-react-native';

export default function AddRuleModal({ visible, onClose, onSave }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    onSave(title, description);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Company Policy</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#F97316" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Policy Title</Text>
              <View style={styles.inputContainer}>
                <Type color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Remote Work Policy" placeholderTextColor="#ffffff" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                <AlignLeft color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput style={[styles.input, { height: 76 }]} value={description} onChangeText={setDescription} placeholder="Enter policy details..." placeholderTextColor="#ffffff" multiline />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Policy</Text>
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
