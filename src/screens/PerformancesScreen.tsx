import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text, DeviceEventEmitter, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { RefreshControl } from "react-native";
import { Star, Award, Target, Briefcase, Calendar, CheckCircle2, ChevronRight, BarChart2, TrendingUp } from 'lucide-react-native';
import api from '../services/api';
import AddPerformanceModal from '../components/AddPerformanceModal';

export default function PerformancesScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localPerformances, setLocalPerformances] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/performance');
      setLocalPerformances(res.data.data?.performances || []);
    } catch (error: any) {
      console.log('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPerformances();
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => setModalVisible(true));
      return () => subscription.remove();
    }, [])
  );

  const handleAddPerformance = async (employee: string, period: string, rating: string) => {
    try {
      await api.post('/performance', { employee, period, rating });
      fetchPerformances();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add performance');
    }
  };

  const renderProgressBar = (value: number, color: string = '#F97316') => {
    return (
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
        data={localPerformances}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const rating = Number(item.overallRating) || 3;
          let ratingLabel = 'Meets Expectations';
          let ratingColor = '#3B82F6';
          let ratingBg = '#EFF6FF';
          
          if (rating >= 4.5) {
            ratingLabel = 'Outstanding';
            ratingColor = '#D97706';
            ratingBg = '#FEF3C7';
          } else if (rating >= 4) {
            ratingLabel = 'Exceeds Expectations';
            ratingColor = '#059669';
            ratingBg = '#ECFDF5';
          }

          const goalsTotal = item.goals?.total || 0;
          const goalsCompleted = item.goals?.completed || 0;
          const goalsPercent = goalsTotal > 0 ? (goalsCompleted / goalsTotal) * 100 : 0;
          
          return (
            <View style={styles.modernCard}>
              {/* Header Section */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{item.avatar || item.name.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.title}>{item.name}</Text>
                  {item.role && (
                    <View style={styles.roleRow}>
                      <Briefcase size={14} color="#64748B" />
                      <Text style={styles.roleText}>{item.role} • {item.department}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.ratingBadge, { backgroundColor: ratingBg }]}>
                  <Star size={14} color={ratingColor} fill={ratingColor} />
                  <Text style={[styles.ratingScore, { color: ratingColor }]}>{rating.toFixed(1)}</Text>
                </View>
              </View>

              {/* Status Section */}
              <View style={styles.statusSection}>
                <View style={styles.statusBox}>
                  <Calendar size={16} color="#64748B" />
                  <View style={styles.statusTextBox}>
                    <Text style={styles.statusLabel}>Last Review</Text>
                    <Text style={styles.statusValue}>{new Date(item.lastReview).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusBox}>
                  <Award size={16} color="#64748B" />
                  <View style={styles.statusTextBox}>
                    <Text style={styles.statusLabel}>Performance</Text>
                    <Text style={[styles.statusValue, { color: ratingColor }]}>{ratingLabel}</Text>
                  </View>
                </View>
              </View>

              {/* Goals Section */}
              {item.goals && (
                <View style={styles.goalsSection}>
                  <View style={styles.sectionHeader}>
                    <Target size={18} color="#0F172A" />
                    <Text style={styles.sectionTitle}>Goals Overview</Text>
                  </View>
                  <View style={styles.goalsProgressRow}>
                    <Text style={styles.goalsText}>{goalsCompleted} / {goalsTotal} Completed</Text>
                    <Text style={styles.goalsPercent}>{Math.round(goalsPercent)}%</Text>
                  </View>
                  {renderProgressBar(goalsPercent, '#3B82F6')}
                </View>
              )}

              {/* Skills Section */}
              {item.skills && item.skills.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <BarChart2 size={18} color="#0F172A" />
                    <Text style={styles.sectionTitle}>Key Skills</Text>
                  </View>
                  <View style={styles.skillsGrid}>
                    {item.skills.map((skill: any, index: number) => (
                      <View key={index} style={styles.skillItem}>
                        <View style={styles.skillHeader}>
                          <Text style={styles.skillName} numberOfLines={1}>{skill.name}</Text>
                          <Text style={styles.skillScore}>{skill.rating}%</Text>
                        </View>
                        {renderProgressBar(skill.rating, '#10B981')}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Achievements Section */}
              {item.achievements && item.achievements.length > 0 && (
                <View style={[styles.section, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <View style={styles.sectionHeader}>
                    <Award size={18} color="#0F172A" />
                    <Text style={styles.sectionTitle}>Recent Achievements</Text>
                  </View>
                  {item.achievements.map((ach: string, i: number) => (
                    <View key={i} style={styles.achievementRow}>
                      <CheckCircle2 size={16} color="#F97316" />
                      <Text style={styles.achievementText}>{ach}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <TrendingUp size={32} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No Records Found</Text>
            <Text style={styles.emptyDesc}>Performance reviews will appear here once they are generated.</Text>
          </View>
        }
      />
      )}
      <AddPerformanceModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddPerformance} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  listContainer: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    color: '#64748B',
    fontSize: 15,
    marginLeft: 6,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingScore: {
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 4,
  },
  statusSection: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextBox: {
    marginLeft: 10,
  },
  statusLabel: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  statusDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 20,
    marginBottom: 20,
  },
  goalsSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  goalsProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalsText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
  goalsPercent: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillItem: {
    width: '48%',
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillName: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  skillScore: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 10,
  },
  achievementText: {
    color: '#9A3412',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
});
