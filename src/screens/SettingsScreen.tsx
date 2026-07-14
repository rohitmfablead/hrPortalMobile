import CustomTextInput from '../components/CustomTextInput';
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { Card, Title, Switch, Text, Button, Avatar} from 'react-native-paper';
import { mockSettings } from '../mockData/mockData';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Lock, User as UserIcon, Shield, Camera, Trash2 } from 'lucide-react-native';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [settings, setSettings] = useState(mockSettings);
  const [activeTab, setActiveTab] = useState('Profile');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const isAdminOrHr = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value: !s.value } : s));
  };

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 123-4567');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      let payload: any = { name, email, phone };
      let config = {};

      if (avatarUri) {
        payload = new FormData();
        payload.append('name', name);
        payload.append('email', email);
        payload.append('phone', phone);
        
        const imageResponse = await fetch(avatarUri);
        const blob = await imageResponse.blob();
        
        let filename = avatarUri.split('/').pop() || 'avatar.jpg';
        if (!filename.includes('.')) {
          const ext = blob.type.split('/')[1] || 'jpg';
          filename = `avatar.${ext}`;
        }
        
        payload.append('avatar', blob, filename);
        
        const token = await require('@react-native-async-storage/async-storage').default.getItem('token');
        const response = await fetch('https://hrback-production-61ba.up.railway.app/api/employees/me', {
          method: 'PUT',
          body: payload,
          headers: {
            'Authorization': `Bearer ${token}`
            // Note: Don't set Content-Type manually with fetch so boundary gets generated
          },
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || 'Upload failed');
        }
      } else {
        await api.put('/employees/me', payload);
      }
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile: ' + (error.response?.data?.message || error.message),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminOrHr) {
    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={settings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.modernCard}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{item.name}</Text>
                {item.type === 'toggle' ? (
                  <Switch value={item.value as boolean} onValueChange={() => toggleSetting(item.id)} color="#F97316" />
                ) : null}
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  // Admin and HR View
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.floatingProfileCard}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
            {avatarUri || user?.avatar || user?.profilePicture?.url ? (
              <Avatar.Image size={72} source={{ uri: avatarUri || user?.avatar || user?.profilePicture?.url }} style={styles.avatar} />
            ) : (
              <Avatar.Text size={72} label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'AU'} style={styles.avatar} color="#FFF" />
            )}
            <View style={styles.cameraIcon}>
              <Camera size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{user?.name || 'Admin User'}</Text>
          <Text style={styles.profileRole}>{user?.role || 'Admin'}</Text>
          <TouchableOpacity style={styles.removeAvatarBtn} onPress={() => setAvatarUri(null)}>
            <Trash2 size={14} color="#EF4444" />
            <Text style={styles.removeAvatarText}>Remove Avatar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[styles.premiumTab, activeTab === 'Profile' && styles.premiumTabActive]}
            onPress={() => setActiveTab('Profile')}
            activeOpacity={0.8}
          >
            <UserIcon color={activeTab === 'Profile' ? '#FFF' : '#64748B'} size={18} />
            <Text style={[styles.premiumTabText, activeTab === 'Profile' && styles.premiumTabTextActive]}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.premiumTab, activeTab === 'Security' && styles.premiumTabActive]}
            onPress={() => setActiveTab('Security')}
            activeOpacity={0.8}
          >
            <Lock color={activeTab === 'Security' ? '#FFF' : '#64748B'} size={18} />
            <Text style={[styles.premiumTabText, activeTab === 'Security' && styles.premiumTabTextActive]}>Security</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          {activeTab === 'Profile' && (
            <View>
              <Text style={styles.sectionHeaderTitle}>Personal Information</Text>

              <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
                <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <CustomTextInput value={name} onChangeText={setName} style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#F97316" left={<CustomTextInput.Icon icon={() => <UserIcon size={18} color="#94A3B8" />} />} />
                </View>
                <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                  <Text style={styles.inputLabel}>Job Title</Text>
                  <CustomTextInput value={user?.role || 'Admin'} disabled style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#F97316" left={<CustomTextInput.Icon icon={() => <Shield size={18} color="#94A3B8" />} />} />
                </View>
              </View>

              <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
                <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <CustomTextInput value={email} disabled style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#F97316" left={<CustomTextInput.Icon icon="email-outline" color="#94A3B8" />} />
                </View>
                <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <CustomTextInput value={phone} onChangeText={setPhone} style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#F97316" left={<CustomTextInput.Icon icon="phone-outline" color="#94A3B8" />} />
                </View>
              </View>

              <TouchableOpacity style={styles.primaryGradientBtn} onPress={handleSaveProfile} disabled={loading}>
                <LinearGradient colors={['#F97316', '#EA580C']} style={styles.btnGradient}>
                  <Text style={styles.btnGradientText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'Security' && (
            <View>
              <Text style={styles.sectionHeaderTitle}>Password & Security</Text>

              <View style={styles.formRowSingle}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <CustomTextInput value="........" secureTextEntry style={[styles.inputSingle, isMobile && styles.inputContainerMobile]} outlineColor="#E2E8F0" activeOutlineColor="#F97316" left={<CustomTextInput.Icon icon={() => <Lock size={18} color="#94A3B8" />} />} />
              </View>

              <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
                <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <CustomTextInput placeholder="New password" secureTextEntry style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#F97316" left={<CustomTextInput.Icon icon={() => <Lock size={18} color="#94A3B8" />} />} />
                </View>
                <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <CustomTextInput placeholder="Confirm password" secureTextEntry style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#F97316" left={<CustomTextInput.Icon icon={() => <Lock size={18} color="#94A3B8" />} />} />
                </View>
              </View>

              <TouchableOpacity style={styles.primaryGradientBtn}>
                <LinearGradient colors={['#F97316', '#EA580C']} style={styles.btnGradient}>
                  <Text style={styles.btnGradientText}>Update Password</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: 16 },
  screenTitle: { color: '#0F172A', fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20 },
  subtitle: { color: '#64748B', fontSize: 14, marginBottom: 24, marginTop: -4, paddingHorizontal: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 },
  floatingProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: { backgroundColor: '#F97316' },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: '#1E293B',
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  profileRole: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 16 },
  removeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  removeAvatarText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 100,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  premiumTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 100,
    gap: 8,
  },
  premiumTabActive: {
    backgroundColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  premiumTabText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  premiumTabTextActive: { color: '#FFFFFF' },
  contentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 24,
  },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  formRowMobile: { flexDirection: 'column', gap: 20 },
  formRowSingle: { marginBottom: 20 },
  inputContainer: { width: '48%' },
  inputContainerMobile: { width: '100%' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', height: 52, fontSize: 15, borderRadius: 12 },
  inputSingle: { backgroundColor: '#F8FAFC', height: 52, fontSize: 15, width: '48%', borderRadius: 12 },
  primaryGradientBtn: {
    marginTop: 12,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  btnGradient: {
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  btnGradientText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    padding: 20,
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
});
