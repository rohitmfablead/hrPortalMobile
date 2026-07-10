import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Avatar } from 'react-native-paper';
import { MessageSquare, Users } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../services/api';
import { io, Socket } from 'socket.io-client';
import { RootStackParamList } from '../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchChatUsers } from '../redux/slices/chatSlice';

type ChatListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatList'>;

export default function ChatListScreen() {
  const navigation = useNavigation<ChatListNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { users, loadingUsers: loading } = useSelector((state: RootState) => state.chat);
  const [conversations, setConversations] = useState<any[]>([]);

  const fetchConvos = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data?.success) {
        setConversations(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    dispatch(fetchChatUsers());
  }, [dispatch]);

  // Real-time updates via Socket
  useEffect(() => {
    const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
    const socketUrl = baseURL.replace('/api', '');
    const socket = io(socketUrl);
    
    const currentUserId = user?._id || user?.id;
    if (currentUserId) {
      socket.emit("join", currentUserId);
    }

    socket.on("receive_message", () => {
      fetchConvos(); // Refetch conversations to update last message & unread count instantly
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchConvos();
    }, [])
  );

  const openChat = (otherUser: any) => {
    navigation.navigate('ChatRoom', { user: otherUser });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Start a conversation with colleagues</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const conv = conversations.find(c => c.participants.some((p: any) => p._id === item._id));
          const unreadCount = conv?.unreadCount || 0;
          const lastMsg = conv?.lastMessage;

          return (
            <TouchableOpacity 
              style={styles.userCard}
              onPress={() => openChat(item)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrapper}>
                {item.avatar && item.avatar !== 'AU' && item.avatar.length > 5 ? (
                  <Avatar.Image size={50} source={{ uri: item.avatar }} />
                ) : (
                  <Avatar.Text size={50} label={item.name.substring(0, 2).toUpperCase()} color="#FFF" style={{ backgroundColor: '#F97316' }} />
                )}
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userRole} numberOfLines={1}>
                  {lastMsg ? (lastMsg.text || '📸 Image') : item.role}
                </Text>
              </View>
              <View style={styles.iconWrapper}>
                <MessageSquare size={20} color={unreadCount > 0 ? "#F97316" : "#94A3B8"} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No users found to chat with.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  userRole: {
    fontSize: 13,
    color: '#64748B',
  },
  badge: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
});
