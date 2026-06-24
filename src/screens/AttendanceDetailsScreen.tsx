import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, SafeAreaView, Platform, ActivityIndicator, Modal } from 'react-native';
import { ArrowLeft, Calendar as CalendarIcon, Plus, Home } from 'lucide-react-native';
import api from '../services/api';

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function AttendanceDetailsScreen({ navigation, route }: any) {
  const { employee } = route.params || {};
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);

  useEffect(() => {
    if (employee?.employeeId || employee?.id) {
      setLoading(true);
      const targetId = employee.employeeId || employee.id;
      const fromDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
      const toDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

      api.get('/attendance', { params: { employeeId: targetId, fromDate, toDate } })
        .then(res => {
          setHistory(res.data.data.attendance || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [employee, selectedMonth, selectedYear]);

  const renderBadge = (badge: any, index: number) => {
    let containerStyle: any = styles.badgeContainer;
    let textStyle: any = styles.badgeText;

    switch (badge.type) {
      case 'outline-green':
        containerStyle = [styles.badgeContainer, { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' }];
        textStyle = [styles.badgeText, { color: '#059669' }];
        break;
      case 'outline-gray':
        containerStyle = [styles.badgeContainer, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' }];
        textStyle = [styles.badgeText, { color: '#64748B' }];
        break;
      case 'solid-red':
        containerStyle = [styles.badgeContainer, { backgroundColor: '#DC2626', borderWidth: 0 }];
        textStyle = [styles.badgeText, { color: '#FFFFFF' }];
        break;
      case 'solid-green':
        containerStyle = [styles.badgeContainer, { backgroundColor: '#059669', borderWidth: 0 }];
        textStyle = [styles.badgeText, { color: '#FFFFFF' }];
        break;
    }

    return (
      <View key={index} style={containerStyle}>
        <Text style={textStyle}>{badge.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Employee Info Profile Banner */}
        {employee && (
          <View style={styles.employeeProfileCard}>
            <View style={styles.employeeAvatarBg}>
              <Text style={styles.employeeAvatarText}>
                {employee.employeeName ? employee.employeeName[0].toUpperCase() : 'E'}
              </Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeNameText}>{employee.employeeName || 'Unknown Employee'}</Text>
              <Text style={styles.employeeRoleText}>{employee.department || employee.employeeId || 'Staff Member'}</Text>
            </View>
          </View>
        )}

        {/* Subheader Title & Action Buttons */}
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderTitle}>Attendance Monthly</Text>
          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.monthBtn} onPress={() => setMonthPickerVisible(true)}>
              <Text style={styles.monthBtnText}>{MONTH_NAMES[selectedMonth]}</Text>
              <CalendarIcon color="#3B82F6" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Month Picker Modal */}
        <Modal visible={isMonthPickerVisible} transparent={true} animationType="fade" onRequestClose={() => setMonthPickerVisible(false)}>
          <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setMonthPickerVisible(false)}>
            <View style={styles.dropdownMenu}>
              <ScrollView>
                {MONTH_NAMES.map((m, idx) => (
                  <TouchableOpacity 
                    key={m} 
                    style={[styles.dropdownItem, selectedMonth === idx && styles.dropdownItemActive]}
                    onPress={() => {
                      setSelectedMonth(idx);
                      setMonthPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, selectedMonth === idx && styles.dropdownItemTextActive]}>{m} {selectedYear}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Cards */}
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
        ) : history.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 40 }}>No attendance records found.</Text>
        ) : (
          history.map((item, index) => {
            let cardStyle: any = styles.card;
            let markerColor = '#3B82F6'; // Default Blue

            const status = item.status?.toLowerCase();
            const isAbsent = status === 'absent';
            const isLate = status === 'late';

            let badges = [];
            if (isAbsent) {
              cardStyle = [styles.card, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }];
              markerColor = '#DC2626';
              badges.push({ text: 'Absent', type: 'solid-red' });
            } else if (isLate) {
              markerColor = '#F59E0B';
              badges.push({ text: 'Late', type: 'outline-gray' });
            } else {
              badges.push({ text: 'Present', type: 'outline-green' });
            }

            const dateStr = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const checkInColor = isLate ? '#DC2626' : '#059669';
            const checkOutColor = '#059669';
            const workingHoursColor = item.shortfallHours ? '#D97706' : '#059669';

          return (
            <View key={item.id} style={cardStyle}>
              {/* Vertical Marker */}
              <View style={[styles.verticalMarker, { backgroundColor: markerColor }]} />
              
              <View style={styles.cardContent}>
                {/* Card Header (Date & Badges) */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.dateText}>{dateStr}</Text>
                  <View style={styles.badgesRow}>
                    {badges.map((badge, idx) => renderBadge(badge, idx))}
                    {!isAbsent && (
                      <View style={styles.homeIconContainer}>
                        <Home color="#94A3B8" size={14} />
                      </View>
                    )}
                  </View>
                </View>

                {/* Stats Row (Only if not absent) */}
                {!isAbsent && (
                  <View style={styles.statsRow}>
                    <View style={styles.statCol}>
                      <Text style={[styles.statValue, { color: checkInColor }]}>{item.checkIn || '-'}</Text>
                      <Text style={styles.statLabel}>Check In</Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={[styles.statValue, { color: checkOutColor }]}>{item.checkOut || '-'}</Text>
                      <Text style={styles.statLabel}>Check Out</Text>
                    </View>
                    <View style={[styles.statCol, { alignItems: 'flex-end' }]}>
                      <Text style={[styles.statValue, { color: workingHoursColor }]}>{item.totalWorkedHours || '-'}</Text>
                      <Text style={styles.statLabel}>Working HR's</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })
        )}
        
      </ScrollView>
    </SafeAreaView>
  );
}

const shadowStyle = Platform.select({
  web: { boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.04)' } as any,
  default: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  employeeProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.04)' } as any,
      default: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }
    })
  },
  employeeAvatarBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  employeeAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F97316',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  employeeRoleText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  monthBtnText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 13,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 220, // Approximate position
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    width: 140,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...shadowStyle,
  },
  verticalMarker: {
    width: 4,
    backgroundColor: '#3B82F6',
    marginVertical: 16,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  homeIconContainer: {
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 8,
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  }
});
