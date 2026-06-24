import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Text, Avatar, Card } from 'react-native-paper';
import { Mail, Phone, Calendar, DollarSign, Fingerprint, MapPin, Droplet, Users, ShieldCheck, ArrowLeft } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export default function EmployeeDetailsScreen({ route, navigation }: any) {
  const { employee } = route.params || {};

  if (!employee) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.center, styles.screenContainer]}><Text>No employee data provided.</Text></View>
      </SafeAreaView>
    );
  }
  if (!employee) return null;

  const fullName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
  const avatarLabel = fullName.substring(0, 2).toUpperCase() || 'EMP';
  const joinDate = employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A';
  const dob = employee.dob ? new Date(employee.dob).toLocaleDateString() : 'N/A';
  const isActive = employee.status === 'Active';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHeader}>
            {employee.profilePicture?.url ? (
              <Avatar.Image size={100} source={{ uri: employee.profilePicture.url }} style={styles.avatar} />
            ) : (
              <Avatar.Text size={100} label={avatarLabel} style={styles.avatar} />
            )}
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.designation}>{employee.designation || employee.role || 'Employee'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#FEE2E2' }]}>
              <Text style={[styles.statusText, { color: isActive ? '#16A34A' : '#EF4444' }]}>{employee.status || 'Active'}</Text>
            </View>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Work Information</Text>
              
              <View style={styles.detailRow}>
                <View style={styles.iconBox}><Fingerprint color="#F97316" size={18} /></View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Employee ID</Text>
                  <Text style={styles.detailValue}>{employee.id || employee._id}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconBox}><Users color="#F97316" size={18} /></View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue}>{employee.department || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconBox}><Calendar color="#F97316" size={18} /></View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Joining Date</Text>
                  <Text style={styles.detailValue}>{joinDate}</Text>
                </View>
              </View>

              {!!employee.salary && (
                <View style={styles.detailRow}>
                  <View style={styles.iconBox}><DollarSign color="#F97316" size={18} /></View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Salary</Text>
                    <Text style={styles.detailValue}>{employee.salary}</Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.detailRow}>
                <View style={styles.iconBox}><Mail color="#F97316" size={18} /></View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{employee.email || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconBox}><Phone color="#F97316" size={18} /></View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{employee.phone || 'N/A'}</Text>
                </View>
              </View>

              {!!employee.dob && (
                <View style={styles.detailRow}>
                  <View style={styles.iconBox}><Calendar color="#F97316" size={18} /></View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Date of Birth</Text>
                    <Text style={styles.detailValue}>{dob}</Text>
                  </View>
                </View>
              )}

              {!!employee.bloodGroup && (
                <View style={styles.detailRow}>
                  <View style={styles.iconBox}><Droplet color="#F97316" size={18} /></View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Blood Group</Text>
                    <Text style={styles.detailValue}>{employee.bloodGroup}</Text>
                  </View>
                </View>
              )}

              {!!employee.address && (
                <View style={styles.detailRow}>
                  <View style={styles.iconBox}><MapPin color="#F97316" size={18} /></View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{employee.address}</Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>

          {employee.emergencyContact && (employee.emergencyContact.name || employee.emergencyContact.phone) && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <Text style={styles.emergencyName}>{employee.emergencyContact.name}</Text>
                <Text style={styles.emergencyText}>{employee.emergencyContact.relation || 'Relation: N/A'}</Text>
                <Text style={styles.emergencyText}>{employee.emergencyContact.phone || 'Phone: N/A'}</Text>
              </Card.Content>
            </Card>
          )}

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Security & Access</Text>
              <View style={styles.detailRow}>
                <View style={styles.iconBox}><ShieldCheck color="#F97316" size={18} /></View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Face Registration</Text>
                  <Text style={styles.detailValue}>
                    {employee.faceRegistration?.isRegistered ? 'Registered' : 'Not Registered'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F97316' },
  screenContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: { height: 60, backgroundColor: '#F97316', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', letterSpacing: 0.5 },
  backBtn: { padding: 8 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: '#F97316',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  designation: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
});
