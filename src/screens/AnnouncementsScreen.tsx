import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store'
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Card, Title, Paragraph, List } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import AddAnnouncementModal from '../components/AddAnnouncementModal';

export default function AnnouncementsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminOrHR = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr';
  const [localAnnouncements, setLocalAnnouncements] = useState([
    { id: '1', title: 'Office Reopening', message: 'The office will be open starting next week.', date: 'Oct 1, 2026' }
  ]);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddAnnouncement = (title: string, message: string, date: string) => {
    const newEntry = {
      id: Date.now().toString(),
      title,
      message,
      date
    };
    setLocalAnnouncements([newEntry, ...localAnnouncements]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.screenTitle}>Announcements</Title>
        {isAdminOrHR && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={localAnnouncements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.title}
                description={`${item.date}\n${item.message}`}
                titleStyle={styles.title}
                descriptionStyle={styles.paragraph}
                descriptionNumberOfLines={3}
                left={props => <List.Icon {...props} icon="bullhorn" color="#F97316" />}
              />
            </Card.Content>
          </Card>
        )}
      />
      <AddAnnouncementModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSave={handleAddAnnouncement} 
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
});
