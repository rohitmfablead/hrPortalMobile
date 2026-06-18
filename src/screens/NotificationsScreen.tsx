import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, List } from 'react-native-paper';
import { mockNotifications } from '../mockData/mockData';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Title style={styles.screenTitle}>Notifications</Title>
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.title}
                description={item.message}
                titleStyle={styles.title}
                descriptionStyle={styles.paragraph}
                descriptionNumberOfLines={3}
                right={props => <Paragraph style={styles.dateText}>{item.date}</Paragraph>}
              />
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  screenTitle: { color: '#0F172A', fontSize: 28, marginBottom: 16, fontWeight: 'bold' },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',},
  title: { color: '#0F172A', fontSize: 18, fontWeight: '600' },
  paragraph: { color: '#0F172A', fontSize: 14, marginTop: 4 },
  dateText: { color: '#0F172A', fontSize: 12, alignSelf: 'center' },
});
