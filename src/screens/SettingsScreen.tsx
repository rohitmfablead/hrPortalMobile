import CustomTextInput from '../components/CustomTextInput';
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Card, Title, Switch, List, Text, Button, Avatar} from 'react-native-paper';
import { mockSettings } from '../mockData/mockData';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Lock, User as UserIcon, Shield } from 'lucide-react-native';
import api from '../services/api';

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
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.put('/employees/me', { name, email, phone });
      alert('Profile updated successfully! Refresh to see changes.');
    } catch (error: any) {
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminOrHr) {
    return (
      <View style={styles.container}>
        <Title style={styles.screenTitle}>Settings</Title>
        <Text style={styles.subtitle}>Manage your application settings.</Text>
        <FlatList
          data={settings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.modernCard}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{item.name}</Text>
                {item.type === 'toggle' ? (
                  <Switch value={item.value as boolean} onValueChange={() => toggleSetting(item.id)} color="#3B82F6" />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Title style={styles.screenTitle}>Settings</Title>
      <Text style={styles.subtitle}>Manage your account preferences and application settings.</Text>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Profile' && styles.activeTab]}
          onPress={() => setActiveTab('Profile')}
        >
          <UserIcon color={activeTab === 'Profile' ? '#3B82F6' : '#64748B'} size={16} />
          <Text style={[styles.tabText, activeTab === 'Profile' && styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Security' && styles.activeTab]}
          onPress={() => setActiveTab('Security')}
        >
          <Lock color={activeTab === 'Security' ? '#3B82F6' : '#64748B'} size={16} />
          <Text style={[styles.tabText, activeTab === 'Security' && styles.activeTabText]}>Security & Password</Text>
        </TouchableOpacity>

      </View>

      <Card style={styles.mainCard}>
        {activeTab === 'Profile' && (
          <View style={styles.cardPadding}>
            <View style={styles.sectionHeader}>
              <UserIcon color="#3B82F6" size={20} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.avatarSection}>
              <Avatar.Text size={64} label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'AU'} style={styles.avatar} color="#FFF" />
              <View style={styles.avatarTextContainer}>
                <Text style={styles.avatarName}>{user?.name || 'Admin User'}</Text>
                <Text style={styles.avatarRole}>{user?.role || 'Admin'}</Text>
                <View style={styles.avatarActions}>
                  <Button mode="contained" textColor="#FFF" style={styles.avatarBtn} labelStyle={styles.btnLabel}>Change Avatar</Button>
                  <Button mode="outlined" textColor="#EF4444" style={styles.removeBtn} labelStyle={styles.btnLabel}>Remove</Button>
                </View>
              </View>
            </View>

            <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
              <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <CustomTextInput value={name} onChangeText={setName} style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" left={<CustomTextInput.Icon icon={() => <UserIcon size={18} color="#94A3B8" />} />} />
              </View>
              <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                <Text style={styles.inputLabel}>Job Title</Text>
                <CustomTextInput value={user?.role || 'Admin'} disabled style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" left={<CustomTextInput.Icon icon={() => <Shield size={18} color="#94A3B8" />} />} />
              </View>
            </View>

            <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
              <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <CustomTextInput value={email} onChangeText={setEmail} style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" left={<CustomTextInput.Icon icon="email-outline" color="#94A3B8" />} />
              </View>
              <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <CustomTextInput value={phone} onChangeText={setPhone} style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" left={<CustomTextInput.Icon icon="phone-outline" color="#94A3B8" />} />
              </View>
            </View>

            <Button mode="contained" style={styles.saveBtn} onPress={handleSaveProfile} loading={loading}>Save Changes</Button>
          </View>
        )}

        {activeTab === 'Security' && (
          <View style={styles.cardPadding}>
            <View style={styles.sectionHeader}>
              <Lock color="#3B82F6" size={20} />
              <Text style={styles.sectionTitle}>Password & Security</Text>
            </View>

            <View style={styles.formRowSingle}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <CustomTextInput value="........" secureTextEntry style={[styles.inputSingle, isMobile && styles.inputContainerMobile]} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" left={<CustomTextInput.Icon icon={() => <Lock size={18} color="#94A3B8" />} />} />
            </View>

            <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
              <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                <Text style={styles.inputLabel}>New Password</Text>
                <CustomTextInput placeholder="New password" secureTextEntry style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" left={<CustomTextInput.Icon icon={() => <Lock size={18} color="#94A3B8" />} />} />
              </View>
              <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <CustomTextInput placeholder="Confirm password" secureTextEntry style={styles.input} outlineColor="#E2E8F0" activeOutlineColor="#3B82F6" left={<CustomTextInput.Icon icon={() => <Lock size={18} color="#94A3B8" />} />} />
              </View>
            </View>

            <Button mode="contained" style={styles.updatePasswordBtn}>Update Password</Button>
          </View>
        )}


      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  screenTitle: { color: '#0F172A', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#64748B', fontSize: 14, marginBottom: 24, marginTop: -4 },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
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
  tabsContainer: { flexDirection: 'row', marginBottom: 20 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  activeTab: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  tabText: { marginLeft: 8, color: '#64748B', fontWeight: '500' },
  activeTabText: { color: '#3B82F6', fontWeight: '600' },
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 0 },
  cardPadding: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0F172A', marginLeft: 8 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  avatar: { backgroundColor: '#3B82F6' },
  avatarTextContainer: { marginLeft: 16 },
  avatarName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  avatarRole: { fontSize: 14, color: '#64748B', marginBottom: 10 },
  avatarActions: { flexDirection: 'row', gap: 8 },
  avatarBtn: { borderRadius: 8, backgroundColor: '#3B82F6' },
  removeBtn: { borderRadius: 8, borderColor: '#EF4444' },
  btnLabel: { fontSize: 12, fontWeight: '600' },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  formRowMobile: { flexDirection: 'column', gap: 16 },
  formRowSingle: { marginBottom: 16 },
  inputContainer: { width: '48%' },
  inputContainerMobile: { width: '100%' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', height: 48, fontSize: 14, borderRadius: 8 },
  inputSingle: { backgroundColor: '#F8FAFC', height: 48, fontSize: 14, width: '48%', borderRadius: 8 },
  saveBtn: { alignSelf: 'flex-end', marginTop: 16, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: '#3B82F6' },
  updatePasswordBtn: { alignSelf: 'flex-start', marginTop: 16, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: '#3B82F6' }
});
