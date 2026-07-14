import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text,  Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import CustomTextInput from './CustomTextInput';
import { X, MessageSquare, AlignLeft } from 'lucide-react-native';

export default function AddFeedbackModal({ visible, onClose, onSave, defaultType = 'Feedback' }: any) {
  // Common
  const [subject, setSubject] = useState(''); // also acts as title for feedback
  const [details, setDetails] = useState(''); // also acts as suggestion/description

  // Feedback specific
  const [category, setCategory] = useState('Benefits');
  const [rating, setRating] = useState('5');

  // Complaint specific
  const [complaintType, setComplaintType] = useState('Harassment');
  const [priority, setPriority] = useState('High');
  const [reportedAgainst, setReportedAgainst] = useState('');

  React.useEffect(() => {
    if (visible) {
      setSubject('');
      setDetails('');
      setCategory('Benefits');
      setRating('5');
      setComplaintType('Harassment');
      setPriority('High');
      setReportedAgainst('');
    }
  }, [visible, defaultType]);

  const handleSave = () => {
    if (defaultType === 'Complaint') {
      onSave({
        subject,
        description: details,
        type: complaintType,
        priority,
        reportedAgainst,
        isAnonymous: false,
        reportedBy: 'Self'
      });
    } else {
      onSave({
        title: subject,
        suggestion: details,
        category: category,
        rating: parseInt(rating) || 5,
        submittedBy: 'Self'
      });
    }
    onClose();
  };

  const isComplaint = defaultType === 'Complaint';

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {isComplaint ? 'Submit Complaint' : 'Submit Feedback'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#F97316" size={24} />
              </TouchableOpacity>
            </View>

            {isComplaint ? (
              <>
                <CustomTextInput
                  label="Complaint Type"
                  value={complaintType} onChangeText={setComplaintType} placeholder="e.g. Harassment, Facilities"
                  left={<CustomTextInput.Icon icon={() => <MessageSquare color="#F97316" size={18} />} />}
                />
                <CustomTextInput
                  label="Reported Against (Optional)"
                  value={reportedAgainst} onChangeText={setReportedAgainst} placeholder="e.g. John Doe, IT Dept"
                />
                <CustomTextInput
                  label="Priority"
                  value={priority} onChangeText={setPriority} placeholder="e.g. High, Medium, Low"
                />
              </>
            ) : (
              <>
                <CustomTextInput
                  label="Category"
                  value={category} onChangeText={setCategory} placeholder="e.g. Benefits, Work Environment"
                  left={<CustomTextInput.Icon icon={() => <MessageSquare color="#F97316" size={18} />} />}
                />
                <CustomTextInput
                  label="Rating (1-5)"
                  value={rating} onChangeText={setRating} placeholder="5" keyboardType="numeric"
                />
              </>
            )}

            <CustomTextInput
              label={isComplaint ? "Subject" : "Title"}
              value={subject} onChangeText={setSubject} placeholder={isComplaint ? "e.g. AC not working" : "e.g. New Coffee Machine"}
              left={<CustomTextInput.Icon icon={() => <MessageSquare color="#F97316" size={18} />} />}
            />

            <CustomTextInput
              label={isComplaint ? "Description" : "Suggestion"}
               value={details} onChangeText={setDetails} placeholder="Share your thoughts..." multiline
              left={<CustomTextInput.Icon icon={() => <AlignLeft color="#F97316" size={18} />} />}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {isComplaint ? 'Submit Complaint' : 'Submit Feedback'}
              </Text>
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
  typeButtonsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  typeBtnActive: { backgroundColor: '#F97316', borderColor: '#E2E8F0' },
  typeBtnText: { color: '#0F172A', fontWeight: '500', fontSize: 15 },
  typeBtnTextActive: { color: '#0F172A', fontWeight: '600' },
  saveBtn: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
