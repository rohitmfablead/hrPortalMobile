import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, List, Badge } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import { mockPerformances } from '../mockData/mockData';
import AddPerformanceModal from '../components/AddPerformanceModal';

export default function PerformancesScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localPerformances, setLocalPerformances] = useState(mockPerformances);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddPerformance = (employee: string, period: string, rating: string) => {
    const newEntry = {
      id: Date.now().toString(),
      employee,
      period,
      rating
    };
    setLocalPerformances([newEntry, ...localPerformances]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.screenTitle}>Performances</Title>
        {isAdminOrHR && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={localPerformances}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.employee}
                description={`Period: ${item.period}`}
                titleStyle={styles.title}
                descriptionStyle={styles.paragraph}
                left={props => <List.Icon {...props} icon="star-circle" color="#0F172A" />}
                right={() => (
                  <Badge style={[styles.badge, item.rating === 'Outstanding' ? styles.badgeOut : (item.rating === 'Exceeds Expectations' ? styles.badgeExc : styles.badgeMeet)]}>
                    {item.rating}
                  </Badge>
                )}
              />
            </Card.Content>
          </Card>
        )}
      />
      <AddPerformanceModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddPerformance} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  screenTitle: { color: '#0F172A', fontSize: 28, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F97316', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 6 },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',},
  title: { color: '#0F172A', fontSize: 18, fontWeight: '600' },
  paragraph: { color: '#0F172A', fontSize: 14, marginTop: 4 },
  badge: { alignSelf: 'center', paddingHorizontal: 8 },
  badgeOut: { backgroundColor: '#FFFFFF', color: '#0F172A' },
  badgeExc: { backgroundColor: '#FFFFFF', color: '#0F172A' },
  badgeMeet: { backgroundColor: '#F97316', color: '#0F172A' },
});
