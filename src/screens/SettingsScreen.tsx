import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Switch, List } from 'react-native-paper';
import { mockSettings } from '../mockData/mockData';

export default function SettingsScreen() {
  const [settings, setSettings] = useState(mockSettings);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value: !s.value } : s));
  };

  return (
    <View style={styles.container}>
      <Title style={styles.screenTitle}>Settings</Title>
      <FlatList
        data={settings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.name}
                titleStyle={styles.title}
                right={() => item.type === 'toggle' ? (
                  <Switch value={item.value as boolean} onValueChange={() => toggleSetting(item.id)} color="#F97316" />
                ) : null}
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
  title: { color: '#0F172A', fontSize: 18 },
});
