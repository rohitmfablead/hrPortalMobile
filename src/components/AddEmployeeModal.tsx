import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, TextInput, Platform, KeyboardAvoidingView, ScrollView, Image, Alert } from 'react-native';
import { X, User, Mail, Phone, Briefcase, Calendar, DollarSign, Tag, Shield, Camera, Image as ImageIcon, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddEmployeeModal({ visible, onClose, onSave, loading }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: 'Employee',
    designation: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [faceUri, setFaceUri] = useState<string | null>(null);

  const [isPickerModalVisible, setPickerModalVisible] = useState(false);
  const [currentPickerTarget, setCurrentPickerTarget] = useState<'avatar' | 'face' | null>(null);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const openPickerModal = (target: 'avatar' | 'face') => {
    setCurrentPickerTarget(target);
    setPickerModalVisible(true);
  };

  const handleImageSelection = async (type: 'camera' | 'gallery') => {
    setPickerModalVisible(false);

    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    };

    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permissions are required.');
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (currentPickerTarget === 'avatar') {
        setAvatarUri(result.assets[0].uri);
      } else if (currentPickerTarget === 'face') {
        setFaceUri(result.assets[0].uri);
      }
    }
  };

  const handleSave = async () => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, (formData as any)[key]);
    });

    // Face Registration string
    data.append('faceRegistration', JSON.stringify({ isRegistered: false, faceImage: "", faceEmbedding: [] }));

    if (avatarUri) {
      const filename = avatarUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      if (Platform.OS === 'web') {
        const response = await fetch(avatarUri);
        const blob = await response.blob();
        data.append('avatar', blob, filename);
      } else {
        data.append('avatar', { uri: avatarUri, name: filename, type } as any);
      }
    }

    if (faceUri) {
      const filename = faceUri.split('/').pop() || 'face.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      if (Platform.OS === 'web') {
        const response = await fetch(faceUri);
        const blob = await response.blob();
        data.append('faceRegistration', blob, filename);
      } else {
        data.append('faceRegistration', { uri: faceUri, name: filename, type } as any);
      }
    }

    onSave(data);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add New Employee</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#F97316" size={24} />
              </TouchableOpacity>
            </View>

            {/* Profile & Face Image Pickers */}
            <View style={styles.imagePickerRow}>
              <View style={styles.imagePickerContainer}>
                <Text style={styles.label}>Profile Picture</Text>
                <TouchableOpacity style={styles.imagePickerBox} onPress={() => openPickerModal('avatar')}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.placeholderBox}>
                      <Camera color="#F97316" size={24} />
                      <Text style={styles.placeholderText}>Select Image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.imagePickerContainer}>
                <Text style={styles.label}>Face Data</Text>
                <TouchableOpacity style={styles.imagePickerBox} onPress={() => openPickerModal('face')}>
                  {faceUri ? (
                    <Image source={{ uri: faceUri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.placeholderBox}>
                      <ImageIcon color="#F97316" size={24} />
                      <Text style={styles.placeholderText}>Select Face</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                  <User color="#F97316" size={20} style={styles.inputIcon} />
                  <TextInput style={styles.input} value={formData.firstName} onChangeText={v => handleChange('firstName', v)} placeholder="John" placeholderTextColor="#ffffff" />
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} value={formData.lastName} onChangeText={v => handleChange('lastName', v)} placeholder="Doe" placeholderTextColor="#ffffff" />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} value={formData.email} onChangeText={v => handleChange('email', v)} placeholder="john@example.com" placeholderTextColor="#ffffff" keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputContainer}>
                <Phone color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} value={formData.phone} onChangeText={v => handleChange('phone', v)} placeholder="+1 234 567 890" placeholderTextColor="#ffffff" keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Department</Text>
                <View style={styles.inputContainer}>
                  <Briefcase color="#F97316" size={20} style={styles.inputIcon} />
                  <TextInput style={styles.input} value={formData.department} onChangeText={v => handleChange('department', v)} placeholder="Design" placeholderTextColor="#ffffff" />
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Designation</Text>
                <View style={styles.inputContainer}>
                  <Tag color="#F97316" size={20} style={styles.inputIcon} />
                  <TextInput style={styles.input} value={formData.designation} onChangeText={v => handleChange('designation', v)} placeholder="UI Designer" placeholderTextColor="#ffffff" />
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.inputContainer}>
                  <Shield color="#F97316" size={20} style={styles.inputIcon} />
                  <TextInput style={styles.input} value={formData.role} onChangeText={v => handleChange('role', v)} placeholder="Employee" placeholderTextColor="#ffffff" />
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Salary</Text>
                <View style={styles.inputContainer}>
                  <DollarSign color="#F97316" size={20} style={styles.inputIcon} />
                  <TextInput style={styles.input} value={formData.salary} onChangeText={v => handleChange('salary', v)} placeholder="50000" placeholderTextColor="#ffffff" keyboardType="numeric" />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Joining Date</Text>
              <View style={styles.inputContainer}>
                <Calendar color="#F97316" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} value={formData.joiningDate} onChangeText={v => handleChange('joiningDate', v)} placeholder="YYYY-MM-DD" placeholderTextColor="#ffffff" />
              </View>
            </View>

            <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Add Employee'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Image Picker Modal */}
      <Modal visible={isPickerModalVisible} transparent={true} animationType="fade" onRequestClose={() => setPickerModalVisible(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setPickerModalVisible(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Image Option</Text>
            
            <TouchableOpacity style={styles.pickerOption} onPress={() => handleImageSelection('camera')}>
              <Camera color="#F97316" size={24} />
              <Text style={styles.pickerOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <View style={styles.pickerDivider} />

            <TouchableOpacity style={styles.pickerOption} onPress={() => handleImageSelection('gallery')}>
              <Upload color="#F97316" size={24} />
              <Text style={styles.pickerOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerCancelBtn} onPress={() => setPickerModalVisible(false)}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  formRow: { flexDirection: 'row', justifyContent: 'space-between' },
  formGroup: { marginBottom: 16 },
  label: { color: '#0F172A', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, color: '#0F172A', fontSize: 15 },
  saveBtn: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  imagePickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  imagePickerContainer: { flex: 1, marginHorizontal: 4 },
  imagePickerBox: {
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderBox: { alignItems: 'center' },
  placeholderText: { color: '#0F172A', fontSize: 12, marginTop: 4 },
  pickerOverlay: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 20 },
  pickerContainer: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 350, borderRadius: 16, padding: 20, alignItems: 'center' },
  pickerTitle: { color: '#0F172A', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  pickerOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', width: '100%', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10 },
  pickerOptionText: { color: '#0F172A', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  pickerDivider: { height: 1, width: '100%', backgroundColor: '#FFFFFF', marginVertical: 8 },
  pickerCancelBtn: { marginTop: 10, paddingVertical: 12, width: '100%', alignItems: 'center' },
  pickerCancelText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
