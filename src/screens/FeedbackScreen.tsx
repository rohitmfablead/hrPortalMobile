import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, List, Badge } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import AddFeedbackModal from '../components/AddFeedbackModal';

export default function FeedbackScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localFeedback, setLocalFeedback] = useState([
    { id: '1', subject: 'Coffee Machine', details: 'We need a new coffee machine in the break room.', type: 'Suggestion' }
  ]);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddFeedback = (subject: string, details: string, type: string) => {
    const newEntry = {
      id: Date.now().toString(),
      subject,
      details,
      type
    };
    setLocalFeedback([newEntry, ...localFeedback]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.screenTitle}>Feedback</Title>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={localFeedback}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.subject}
                description={item.details}
                titleStyle={styles.title}
                descriptionStyle={styles.paragraph}
                left={props => <List.Icon {...props} icon="message-reply-text" color="#F97316" />}
                right={() => (
                  <Badge style={[styles.badge, item.type === 'Complaint' ? styles.badgeRed : (item.type === 'Praise' ? styles.badgeGreen : styles.badgeBlue)]}>
                    {item.type}
                  </Badge>
                )}
              />
            </Card.Content>
          </Card>
        )}
      />
      <AddFeedbackModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddFeedback} 
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
  badgeRed: { backgroundColor: '#FFFFFF', color: '#0F172A' },
  badgeGreen: { backgroundColor: '#FFFFFF', color: '#0F172A' },
  badgeBlue: { backgroundColor: '#F97316', color: '#0F172A' },
});
