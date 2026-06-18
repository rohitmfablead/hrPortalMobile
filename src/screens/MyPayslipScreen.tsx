import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, List } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import { mockPayslips } from '../mockData/mockData';
import AddPayslipModal from '../components/AddPayslipModal';

export default function MyPayslipScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localPayslips, setLocalPayslips] = useState(mockPayslips);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddPayslip = (period: string, amount: string, status: string) => {
    const newEntry = {
      id: Date.now().toString(),
      period,
      amount,
      status
    };
    setLocalPayslips([newEntry, ...localPayslips]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.screenTitle}>My Payslips</Title>
        {isAdminOrHR && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={localPayslips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.period}
                description={`Amount: ${item.amount}`}
                titleStyle={styles.title}
                descriptionStyle={styles.paragraph}
                left={props => <List.Icon {...props} icon="cash-multiple" color="#F97316" />}
                right={props => <Paragraph style={styles.status}>{item.status}</Paragraph>}
              />
            </Card.Content>
          </Card>
        )}
      />
      <AddPayslipModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddPayslip} 
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
  status: { alignSelf: 'center', color: '#0F172A', fontWeight: 'bold' },
});
