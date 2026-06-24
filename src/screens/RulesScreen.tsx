import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text, DeviceEventEmitter, LayoutAnimation, Platform, UIManager, ActivityIndicator, Alert } from 'react-native';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import api from '../services/api';
import AddRuleModal from '../components/AddRuleModal';

export default function RulesScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localRules, setLocalRules] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rules');
      setLocalRules(res.data.data?.rules || []);
    } catch (error: any) {
      console.log('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRules();
      const subscription = DeviceEventEmitter.addListener('onAddAction', () => setModalVisible(true));
      return () => subscription.remove();
    }, [])
  );

  const handleAddRule = async (title: string, description: string) => {
    try {
      await api.post('/rules', { title, description });
      fetchRules();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add rule');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
        data={localRules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          return (
            <View style={styles.modernCard}>
              <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
                <View style={styles.iconWrapper}>
                  <BookOpen color="#F59E0B" size={24} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                {isExpanded ? <ChevronUp color="#94A3B8" size={20} /> : <ChevronDown color="#94A3B8" size={20} />}
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.cardContent}>
                  <Text style={styles.paragraph}>{item.description}</Text>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#64748B', fontSize: 16, fontWeight: '500' }}>No rules available</Text>
          </View>
        }
      />
      )}
      <AddRuleModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddRule} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
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
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paragraph: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },
});
