import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, List } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import { mockRules } from '../mockData/mockData';
import AddRuleModal from '../components/AddRuleModal';

export default function RulesScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localRules, setLocalRules] = useState(mockRules);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddRule = (title: string, description: string) => {
    const newEntry = {
      id: Date.now().toString(),
      title,
      description
    };
    setLocalRules([newEntry, ...localRules]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.screenTitle}>Company Policies</Title>
        {isAdminOrHR && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={localRules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <List.Accordion
              title={item.title}
              titleStyle={styles.title}
              left={props => <List.Icon {...props} icon="gavel" color="#F97316" />}
              theme={{ colors: { background: 'transparent' } }}
            >
              <Card.Content style={styles.content}>
                <Paragraph style={styles.paragraph}>{item.description}</Paragraph>
              </Card.Content>
            </List.Accordion>
          </Card>
        )}
      />
      <AddRuleModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddRule} 
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
  content: { paddingBottom: 16, paddingHorizontal: 16 },
  paragraph: { color: '#0F172A', fontSize: 14 },
});
