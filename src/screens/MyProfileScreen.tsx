import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Platform, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { ShieldCheck, Calendar as CalendarIcon, CheckCircle2, Star, Edit3, Mail, Phone, MapPin, Droplet, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MyProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Read-only state for display
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'User Name',
    email: user?.email || 'user@example.com',
    phone: '+91 9506658558',
    address: '123 Main Street, City, Country',
    dob: '01 Jan 1990',
    bloodGroup: 'O+',
    emergencyName: 'Jane Doe',
    emergencyPhone: '+91 9876543210',
  });

  const handleSaveProfile = (newData: any) => {
    setProfileData((prev) => ({ ...prev, ...newData }));
  };

  const isWide = width > 768;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.layout, isWide && styles.layoutWide]}>
        
        {/* LEFT COLUMN: Profile Summary */}
        <View style={[styles.leftCol, isWide && styles.leftColWide]}>
          <View style={styles.card}>
            <View style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'HR'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>{profileData.fullName}</Text>
            
            <View style={styles.roleRow}>
              <ShieldCheck color="#F97316" size={16} />
              <Text style={styles.roleText}>{user?.role || 'Employee'}</Text>
            </View>

            <View style={styles.badgesRow}>
              <View style={styles.badgeOutline}>
                <Text style={styles.badgeOutlineText}>Design</Text>
              </View>
              <View style={styles.badgeSolid}>
                <Text style={styles.badgeSolidText}>Active</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>JOINED</Text>
                <Text style={styles.statValue}>2026</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ID</Text>
                <Text style={styles.statValue}>{user?.id || 'EMP123'}</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.quickStatsRow}>
            <View style={[styles.card, styles.quickStatCard]}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                <CheckCircle2 color="#F97316" size={20} />
              </View>
              <Text style={styles.quickStatNumber}>24</Text>
              <Text style={styles.quickStatLabel}>DAYS PRESENT</Text>
            </View>
            <View style={[styles.card, styles.quickStatCard]}>
              <View style={[styles.iconBg, { backgroundColor: '#FFFFFF' }]}>
                <Star color="#F97316" size={20} />
              </View>
              <Text style={styles.quickStatNumber}>2</Text>
              <Text style={styles.quickStatLabel}>LEAVES TAKEN</Text>
            </View>
          </View>
        </View>

        {/* RIGHT COLUMN: Profile Details */}
        <View style={[styles.card, styles.rightCol, isWide && styles.rightColWide]}>
          <View style={styles.rightHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
              <Edit3 color="#0F172A" size={16} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>View your contact details and preferences below.</Text>

          <View style={styles.infoList}>
            {/* Full Name */}
            <View style={[styles.infoItem, isWide ? null : styles.infoItemMobile]}>
              <View style={styles.infoIconBg}><Users color="#F97316" size={18} /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue} >{profileData.fullName}</Text>
              </View>
            </View>

            {/* Email */}
            <View style={[styles.infoItem, isWide ? null : styles.infoItemMobile]}>
              <View style={styles.infoIconBg}><Mail color="#F97316" size={18} /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue} >{profileData.email}</Text>
              </View>
            </View>

            {/* Phone */}
            <View style={[styles.infoItem, isWide ? null : styles.infoItemMobile]}>
              <View style={styles.infoIconBg}><Phone color="#F97316" size={18} /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue} >{profileData.phone}</Text>
              </View>
            </View>

            {/* DOB */}
            <View style={[styles.infoItem, isWide ? null : styles.infoItemMobile]}>
              <View style={styles.infoIconBg}><CalendarIcon color="#F97316" size={18} /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue} >{profileData.dob}</Text>
              </View>
            </View>

            {/* Blood Group */}
            <View style={[styles.infoItem, isWide ? null : styles.infoItemMobile]}>
              <View style={styles.infoIconBg}><Droplet color="#F97316" size={18} /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Blood Group</Text>
                <Text style={styles.infoValue} >{profileData.bloodGroup}</Text>
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={[styles.infoItem, isWide ? null : styles.infoItemMobile]}>
              <View style={styles.infoIconBg}><Phone color="#F97316" size={18} /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Emergency Contact</Text>
                <Text style={styles.infoValue} >{profileData.emergencyName} ({profileData.emergencyPhone})</Text>
              </View>
            </View>

            {/* Address */}
            <View style={[styles.infoItem, styles.infoItemFull]}>
              <View style={styles.infoIconBg}><MapPin color="#F97316" size={18} /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{profileData.address}</Text>
              </View>
            </View>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const shadowStyle = Platform.select({
  web: { boxShadow: '0px 8px 24px rgba(249, 115, 22, 0.12)' } as any,
  default: { shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 }
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24, paddingBottom: 60 },
  layout: { flexDirection: 'column', gap: 24 },
  layoutWide: { flexDirection: 'row', alignItems: 'flex-start' },
  leftCol: { flexDirection: 'column', gap: 24, width: '100%' },
  leftColWide: { width: 320 },
  rightCol: { flex: 1, width: '100%', padding: 24 },
  rightColWide: { },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#F1F5F9', ...shadowStyle },
  avatarWrapper: { alignItems: 'center', marginBottom: 16 },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(249, 115, 22, 0.2)' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(249, 115, 22, 0.2)' },
  avatarText: { color: '#FFFFFF', fontSize: 34, fontWeight: 'bold' },
  userName: { color: '#0F172A', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  roleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  roleText: { color: '#F97316', fontSize: 17, fontWeight: '700', marginLeft: 6 },
  badgesRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  badgeOutline: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  badgeOutlineText: { color: '#F97316', fontSize: 14, fontWeight: '600' },
  badgeSolid: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: '#FFF7ED' },
  badgeSolidText: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  dividerVertical: { width: 1, height: 30, backgroundColor: '#F1F5F9' },
  statLabel: { color: '#64748B', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  statValue: { color: '#0F172A', fontSize: 17, fontWeight: '800' },
  quickStatsRow: { flexDirection: 'row', gap: 16 },
  quickStatCard: { flex: 1, padding: 16 },
  iconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  quickStatNumber: { color: '#0F172A', fontSize: 34, fontWeight: '800', marginBottom: 4 },
  quickStatLabel: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  rightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: '#0F172A', fontSize: 24, fontWeight: '800' },
  sectionSubtitle: { color: '#64748B', fontSize: 16, marginBottom: 24, width: '100%' },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  editBtnText: { color: '#F97316', fontSize: 16, fontWeight: '700', marginLeft: 6 },
  infoList: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -10 },
  infoItem: { width: '100%', paddingHorizontal: 10, marginBottom: 24, flexDirection: 'row', alignItems: 'center' },
  infoItemMobile: { width: '100%' },
  infoItemFull: { width: '100%' },
  infoTextContainer: { flex: 1 },
  infoIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#FFEDD5' },
  infoLabel: { color: '#64748B', fontSize: 15, marginBottom: 4, fontWeight: '500' },
  infoValue: { color: '#0F172A', fontSize: 18, fontWeight: '600' },
});
