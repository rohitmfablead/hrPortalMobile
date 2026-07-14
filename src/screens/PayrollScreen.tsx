import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { RefreshControl } from "react-native";
import { Card, Title, Paragraph, List } from 'react-native-paper';
import { mockPayroll } from '../mockData/mockData';

export default function PayrollScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCounter, setRefreshCounter] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshCounter(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <View style={styles.container}>
      <Title style={styles.screenTitle}>Payroll Overview</Title>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
        data={mockPayroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={item.employee}
                description={`Period: ${item.period} | Gross: ${item.gross}`}
                titleStyle={styles.title}
                descriptionStyle={styles.paragraph}
                left={props => <List.Icon {...props} icon="account-cash" color="#F97316" />}
                right={props => <Paragraph style={styles.netPay}>Net: {item.net}</Paragraph>}
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
  screenTitle: { color: '#0F172A', fontSize: 30, marginBottom: 16, fontWeight: 'bold' },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',},
  title: { color: '#0F172A', fontSize: 20, fontWeight: '600' },
  paragraph: { color: '#0F172A', fontSize: 16, marginTop: 4 },
  netPay: { alignSelf: 'center', color: '#0F172A', fontWeight: 'bold' },
});
