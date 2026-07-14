import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, KeyboardAvoidingView, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchMe } from '../redux/slices/authSlice';
import api from '../services/api';
import CustomTextInput from '../components/CustomTextInput';
import CustomDatePicker from '../components/CustomDatePicker';
import Toast from 'react-native-toast-message';
import { ArrowLeft, Calendar as CalendarIcon, Eye, Edit3 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

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
  const [profilePic, setProfilePic] = useState<string | null>(user?.avatar || null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.fullName);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      data.append('dob', formData.dob);
      data.append('bloodGroup', formData.bloodGroup);
      data.append('emergencyContact', `${formData.emergencyName} - ${formData.emergencyPhone}`);
      
      if (formData.password) {
        data.append('password', formData.password);
      }

      if (profilePic && !profilePic.startsWith('http')) {
        const filename = profilePic.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        data.append('avatar', { uri: profilePic, name: filename, type } as any);
      }

      await api.put('/employees/me', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update global user state
      await dispatch(fetchMe()).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully!',
        position: 'bottom'
      });
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error?.message || 'Failed to update profile',
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  const isWide = width > 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#0F172A" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} /> {/* placeholder for balance */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'HR'}
                  </Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Edit3 color="#FFFFFF" size={14} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHelper}>Tap to change picture</Text>
          </View>

          <View style={styles.formGrid}>
            <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
              <CustomTextInput label="Full Name" value={formData.fullName} onChangeText={(val) => handleChange('fullName', val)} />
            </View>
            <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
              <CustomTextInput label="Email Address" value={formData.email} onChangeText={(val) => handleChange('email', val)} keyboardType="email-address" />
            </View>

            <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
              <CustomTextInput label="Phone Number" value={formData.phone} onChangeText={(val) => handleChange('phone', val)} keyboardType="phone-pad" />
            </View>
            <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
              <CustomTextInput 
                label="New Password"
                placeholder="Leave blank to keep current" 
                secureTextEntry 
                value={formData.password} 
                onChangeText={(val) => handleChange('password', val)} 
                autoComplete="new-password"
                textContentType="newPassword"
                importantForAutofill="no"
                right={<CustomTextInput.Icon icon={() => <Eye color="#F97316" size={18} />} />}
              />
            </View>

            <View style={styles.inputGroupFull}>
              <CustomTextInput label="Address" placeholder="Your full address" value={formData.address} onChangeText={(val) => handleChange('address', val)} />
            </View>

            <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
              <CustomDatePicker 
                label="Date of Birth (YYYY-MM-DD)" 
                value={formData.dob} 
                onDateChange={(val) => handleChange('dob', val)} 
              />
            </View>
            <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
              <CustomTextInput label="Blood Group" placeholder="e.g. O+, A-, B+" value={formData.bloodGroup} onChangeText={(val) => handleChange('bloodGroup', val)} />
            </View>

            <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
              <CustomTextInput label="Emergency Contact Name" placeholder="Name of contact" value={formData.emergencyName} onChangeText={(val) => handleChange('emergencyName', val)} />
            </View>
            <View style={[styles.inputGroupHalf, isWide ? null : styles.inputGroupMobile]}>
              <CustomTextInput label="Emergency Contact Phone" placeholder="Phone number" value={formData.emergencyPhone} onChangeText={(val) => handleChange('emergencyPhone', val)} />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  backBtn: { padding: 4 },
  scrollContainer: { padding: 20, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(249, 115, 22, 0.2)' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(249, 115, 22, 0.2)' },
  avatarText: { color: '#0F172A', fontSize: 34, fontWeight: 'bold' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0F172A', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarHelper: { color: '#64748B', fontSize: 14, marginTop: 8 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  inputGroupHalf: { width: '100%', paddingHorizontal: 8, marginBottom: 20, ...Platform.select({ web: { width: '50%' } }) },
  inputGroupMobile: { width: '100%' },
  inputGroupFull: { width: '100%', paddingHorizontal: 8, marginBottom: 20 },
  saveBtn: { backgroundColor: '#F97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
