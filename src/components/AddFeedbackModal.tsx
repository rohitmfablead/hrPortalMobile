import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text,  Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import CustomTextInput from './CustomTextInput';
import { X, MessageSquare, AlignLeft } from 'lucide-react-native';

export default function AddFeedbackModal({ visible, onClose, onSave }: any) {
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [type, setType] = useState('Suggestion');

  const handleSave = () => {
    onSave(subject, details, type);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Submit Feedback</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#F97316" size={24} />
              </TouchableOpacity>
            </View>

            <CustomTextInput
              label="Type"
              value={subject} onChangeText={setSubject} placeholder="e.g. New Coffee Machine"
              left={<CustomTextInput.Icon icon={() => <MessageSquare color="#F97316" size={18} />} />}
              
            />

            <CustomTextInput
              label="Details"
               value={details} onChangeText={setDetails} placeholder="Share your thoughts..." multiline
              left={<CustomTextInput.Icon icon={() => <AlignLeft color="#F97316" size={18} />} />}
              
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Submit Feedback</Text>
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
  typeButtonsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  typeBtnActive: { backgroundColor: '#F97316', borderColor: '#E2E8F0' },
  typeBtnText: { color: '#0F172A', fontWeight: '500', fontSize: 13 },
  typeBtnTextActive: { color: '#0F172A', fontWeight: '600' },
  saveBtn: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
