import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Platform, KeyboardAvoidingView, ScrollView, Image, Alert, SafeAreaView } from 'react-native';
import CustomTextInput from '../components/CustomTextInput';
import CustomDropdown from '../components/CustomDropdown';
import CustomDatePicker from '../components/CustomDatePicker';
import api from '../services/api';
import { X, User, Mail, Phone, Briefcase, Calendar, DollarSign, Tag, Shield, Camera, Image as ImageIcon, Upload, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { addEmployee, updateEmployee } from '../redux/slices/employeeSlice';
import { RootState, AppDispatch } from '../redux/store';

export default function AddEditEmployeeScreen({ route, navigation }: any) {
  const { employee: employeeToEdit } = route.params || {};
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.employee);
  const [formData, setFormData] = useState({
    firstName: employeeToEdit?.firstName || '',
    lastName: employeeToEdit?.lastName || '',
    email: employeeToEdit?.email || '',
    phone: employeeToEdit?.phone || '',
    department: employeeToEdit?.department || '',
    role: employeeToEdit?.role || 'Employee',
    designation: employeeToEdit?.designation || '',
    salary: employeeToEdit?.salary ? String(employeeToEdit.salary) : '',
    joiningDate: employeeToEdit?.joiningDate ? new Date(employeeToEdit.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: employeeToEdit?.status || 'Active',
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(employeeToEdit?.profilePicture?.url || null);
  const [faceUri, setFaceUri] = useState<string | null>(null);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        firstName: employeeToEdit.firstName || '',
        lastName: employeeToEdit.lastName || '',
        email: employeeToEdit.email || '',
        phone: employeeToEdit.phone || '',
        department: employeeToEdit.department || '',
        role: employeeToEdit.role || 'Employee',
        designation: employeeToEdit.designation || '',
        salary: employeeToEdit.salary ? String(employeeToEdit.salary) : '',
        joiningDate: employeeToEdit.joiningDate ? new Date(employeeToEdit.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: employeeToEdit.status || 'Active',
      });
      setAvatarUri(employeeToEdit.profilePicture?.url || null);
      setFaceUri(null);
    } else {
      setFormData({
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
      setAvatarUri(null);
      setFaceUri(null);
    }
  }, [employeeToEdit]);

  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          api.get('/departments'),
          api.get('/designations')
        ]);
        
        const depts = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data?.data?.departments || deptRes.data?.data || []);
        const desigs = Array.isArray(desigRes.data) ? desigRes.data : (desigRes.data?.data?.designations || desigRes.data?.data || []);
        
        setDepartments(depts);
        setDesignations(desigs);
      } catch (err) {
        console.log('Error fetching masters:', err);
      }
    };
    fetchMasters();
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: employeeToEdit ? 'Edit Employee' : 'Add New Employee' });
  }, [navigation, employeeToEdit]);

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

    if (employeeToEdit) {
      dispatch(updateEmployee({ id: employeeToEdit.id || employeeToEdit._id, employeeData: data }))
        .unwrap()
        .then(() => {
          Alert.alert('Success', 'Employee updated successfully');
          navigation.goBack();
        })
        .catch((err) => {
          Alert.alert('Error', err || 'Failed to update employee');
        });
    } else {
      dispatch(addEmployee(data))
        .unwrap()
        .then(() => {
          Alert.alert('Success', 'Employee added successfully');
          navigation.goBack();
        })
        .catch((err) => {
          Alert.alert('Error', err || 'Failed to add employee');
        });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screenContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

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
                <CustomTextInput
                  label="First Name"
                  value={formData.firstName} onChangeText={v => handleChange('firstName', v)} placeholder="John"
                  left={<CustomTextInput.Icon icon={() => <User color="#F97316" size={18} />} />}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <CustomTextInput
                  label="Last Name"
                  value={formData.lastName} onChangeText={v => handleChange('lastName', v)} placeholder="Doe"
                />
              </View>
            </View>

            <CustomTextInput
              label="Email"
              value={formData.email} onChangeText={v => handleChange('email', v)} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none"
              left={<CustomTextInput.Icon icon={() => <Mail color="#F97316" size={18} />} />}
            />

            <CustomTextInput
              label="Phone"
              value={formData.phone} onChangeText={v => handleChange('phone', v)} placeholder="+1 234 567 890" keyboardType="phone-pad"
              left={<CustomTextInput.Icon icon={() => <Phone color="#F97316" size={18} />} />}
            />

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <CustomDropdown
                  label="Department"
                  value={formData.department}
                  onSelect={v => handleChange('department', v)}
                  options={departments.map(d => ({ label: d.name || d.departmentName || d.title || d.department || d, value: d.name || d.departmentName || d.title || d.department || d }))}
                  placeholder="Select Department"
                  icon={() => <Briefcase color="#F97316" size={18} />}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <CustomDropdown
                  label="Designation"
                  value={formData.designation}
                  onSelect={v => handleChange('designation', v)}
                  options={designations.map(d => ({ label: d.name || d.designationName || d.title || d.designation || d, value: d.name || d.designationName || d.title || d.designation || d }))}
                  placeholder="Select Designation"
                  icon={() => <Tag color="#F97316" size={18} />}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <CustomDropdown
                  label="Role"
                  value={formData.role}
                  onSelect={v => handleChange('role', v)}
                  options={[
                    { label: 'Admin', value: 'Admin' },
                    { label: 'HR', value: 'HR' },
                    { label: 'Employee', value: 'Employee' },
                  ]}
                  placeholder="Select Role"
                  icon={() => <Shield color="#F97316" size={18} />}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <CustomTextInput
                  label="Salary"
                  value={formData.salary} onChangeText={v => handleChange('salary', v)} placeholder="50000" keyboardType="numeric"
                  left={<CustomTextInput.Icon icon={() => <DollarSign color="#F97316" size={18} />} />}
                />
              </View>
            </View>

            <CustomDatePicker
              label="Joining Date"
              value={formData.joiningDate}
              onDateChange={v => handleChange('joiningDate', v)}
            />

            <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Saving...' : employeeToEdit ? 'Save Changes' : 'Add Employee'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F97316' },
  screenContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: { height: 60, backgroundColor: '#F97316', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', letterSpacing: 0.5 },
  backBtn: { padding: 8 },
  scrollContainer: { padding: 20 },
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
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  pickerContainer: { backgroundColor: '#FFFFFF', width: '100%', maxWidth: 350, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  pickerTitle: { color: '#0F172A', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  pickerOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', width: '100%', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  pickerOptionText: { color: '#0F172A', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  pickerDivider: { height: 1, width: '100%', backgroundColor: '#E2E8F0', marginVertical: 8 },
  pickerCancelBtn: { marginTop: 10, paddingVertical: 12, width: '100%', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  pickerCancelText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
});
