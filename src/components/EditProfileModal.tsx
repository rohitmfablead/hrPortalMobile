import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, TextInput, Platform, KeyboardAvoidingView, ScrollView, Dimensions } from 'react-native';
import { X, Calendar as CalendarIcon, Eye } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function EditProfileModal({ visible, onClose, user, onSave }: any) {
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '9506658558',
    password: '',
    address: 'Your full address',
    dob: '01/01/1990',
    bloodGroup: 'O+',
    emergencyName: 'Emergency Contact',
    emergencyPhone: '9876543210',
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isWide = width > 768;

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color="#F97316" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.formGrid}>
              <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} value={formData.fullName} onChangeText={(val) => handleChange('fullName', val)} />
              </View>
              <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput style={styles.input} value={formData.email} onChangeText={(val) => handleChange('email', val)} keyboardType="email-address" />
              </View>

              <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput style={styles.input} value={formData.phone} onChangeText={(val) => handleChange('phone', val)} keyboardType="phone-pad" />
              </View>
              <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput 
                    style={styles.inputPassword} 
                    placeholder="Leave blank to keep current" 
                    placeholderTextColor="#ffffff" 
                    secureTextEntry 
                    value={formData.password} 
                    onChangeText={(val) => handleChange('password', val)} 
                    autoComplete="new-password"
                    textContentType="newPassword"
                    importantForAutofill="no"
                  />
                  <Eye color="#F97316" size={18} style={styles.eyeIcon} />
                </View>
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.label}>Address</Text>
                <TextInput style={styles.input} placeholder="Your full address" placeholderTextColor="#ffffff" value={formData.address} onChangeText={(val) => handleChange('address', val)} />
              </View>

              <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={styles.passwordContainer}>
                  <TextInput style={styles.inputPassword} placeholder="dd/mm/yyyy" placeholderTextColor="#ffffff" value={formData.dob} onChangeText={(val) => handleChange('dob', val)} />
                  <CalendarIcon color="#F97316" size={18} style={styles.eyeIcon} />
                </View>
              </View>
              <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
                <Text style={styles.label}>Blood Group</Text>
                <TextInput style={styles.input} placeholder="e.g. O+, A-, B+" placeholderTextColor="#ffffff" value={formData.bloodGroup} onChangeText={(val) => handleChange('bloodGroup', val)} />
              </View>

              <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
                <Text style={styles.label}>Emergency Contact Name</Text>
                <TextInput style={styles.input} placeholder="Name of contact" placeholderTextColor="#ffffff" value={formData.emergencyName} onChangeText={(val) => handleChange('emergencyName', val)} />
              </View>
              <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
                <Text style={styles.label}>Emergency Contact Phone</Text>
                <TextInput style={styles.input} placeholder="Phone number" placeholderTextColor="#ffffff" value={formData.emergencyPhone} onChangeText={(val) => handleChange('emergencyPhone', val)} />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', ...Platform.select({ web: { justifyContent: 'center', alignItems: 'center' } }) },
  modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', ...Platform.select({ web: { width: '100%', maxWidth: 600, borderRadius: 20, maxHeight: '80%' } }) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#0F172A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  closeBtn: { padding: 4 },
  scrollContainer: { padding: 20 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  inputGroupHalf: { width: '100%', paddingHorizontal: 8, marginBottom: 20, ...Platform.select({ web: { width: '50%' } }) },
  inputGroupMobile: { width: '100%' },
  inputGroupFull: { width: '100%', paddingHorizontal: 8, marginBottom: 20 },
  label: { color: '#0F172A', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 16, height: 48, color: '#0F172A', fontSize: 14, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, height: 48 },
  inputPassword: { flex: 1, height: '100%', paddingHorizontal: 16, color: '#0F172A', fontSize: 14, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  eyeIcon: { paddingHorizontal: 16 },
  saveBtn: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
