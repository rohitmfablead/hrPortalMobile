import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { Card, Title, Paragraph, List } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const data = res.data?.data?.notifications || res.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Title style={styles.screenTitle}>Notifications</Title>
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item.id || item._id || index.toString()}
          renderItem={({ item }) => (
            <Card style={[styles.card, !item.isRead && styles.unreadCard]}>
              <Card.Content>
                <List.Item
                  title={item.title}
                  description={item.message}
                  titleStyle={styles.title}
                  descriptionStyle={styles.paragraph}
                  descriptionNumberOfLines={3}
                  right={props => (
                    <Paragraph style={styles.dateText}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                    </Paragraph>
                  )}
                />
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No notifications found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  screenTitle: { color: '#0F172A', fontSize: 28, marginBottom: 16, fontWeight: 'bold' },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',},
  unreadCard: { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
  title: { color: '#0F172A', fontSize: 18, fontWeight: '600' },
  paragraph: { color: '#475569', fontSize: 14, marginTop: 4 },
  dateText: { color: '#64748B', fontSize: 12, alignSelf: 'flex-start', marginTop: 8 },
  emptyText: { color: '#64748B', fontSize: 16, fontWeight: '500' },
});
