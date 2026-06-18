import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, List, Badge } from 'react-native-paper';
import { mockRecruitment } from '../mockData/mockData';

export default function RecruitmentScreen() {
  return (
    <View style={styles.container}>
      <Title style={styles.screenTitle}>Recruitment Pipeline</Title>
      <FlatList
        data={mockRecruitment}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.position}
                description={`${item.applicants} Applicants`}
                titleStyle={styles.title}
                descriptionStyle={styles.paragraph}
                left={props => <List.Icon {...props} icon="briefcase" color="#F97316" />}
                right={() => (
                  <Badge style={[styles.badge, item.status === 'Open' ? styles.badgeOpen : (item.status === 'Interviewing' ? styles.badgeInt : styles.badgeClosed)]}>
                    {item.status}
                  </Badge>
                )}
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
  badge: { alignSelf: 'center', paddingHorizontal: 8 },
  badgeOpen: { backgroundColor: '#FFFFFF', color: '#0F172A' },
  badgeInt: { backgroundColor: '#FFFFFF', color: '#0F172A' },
  badgeClosed: { backgroundColor: '#FFFFFF', color: '#0F172A' },
});
