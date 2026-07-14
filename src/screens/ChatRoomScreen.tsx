import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import { Send, ChevronLeft, Image as ImageIcon, X, Check, CheckCheck } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { io, Socket } from 'socket.io-client';
import { fetchChatMessages, addMessage, clearMessages, markMessagesAsRead } from '../redux/slices/chatSlice';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';

export default function ChatRoomScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const otherUser = route.params?.user;
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { messages, loadingMessages: loading } = useSelector((state: RootState) => state.chat);

  const currentUserId = currentUser?._id || currentUser?.id;
  const otherUserId = otherUser?._id || otherUser?.id;

  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          {otherUser.avatar && otherUser.avatar !== 'AU' && otherUser.avatar.length > 5 ? (
            <Avatar.Image size={32} source={{ uri: otherUser.avatar }} />
          ) : (
            <Avatar.Text size={32} label={otherUser.name.substring(0, 2).toUpperCase()} color="#FFF" style={{ backgroundColor: '#F97316' }} />
          )}
          <View style={styles.headerTextWrapper}>
            <Text style={styles.headerName}>{otherUser.name}</Text>
            <Text style={styles.headerRole}>
              {isTyping ? <Text style={{ fontStyle: 'italic', color: '#F97316' }}>typing...</Text> : otherUser.role}
            </Text>
          </View>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
      )
    });
  }, [navigation, otherUser, isTyping]);

  useEffect(() => {
    // Derive Socket URL from api baseURL
    const baseURL = api.defaults.baseURL || "https://hrback-production-61ba.up.railway.app/api";
    const socketUrl = baseURL.replace('/api', '');

    // Connect to Socket.IO server
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    if (currentUserId) {
      newSocket.emit("join", currentUserId);
    }

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (message: any) => {
        // Check if message is from the other user or sent by current user
        if (message.sender === otherUserId || message.sender === currentUserId) {
          dispatch(addMessage(message));
          
          if (message.sender === otherUserId) {
            socket.emit("mark_read", { senderId: currentUserId, receiverId: otherUserId });
          }
          
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      };

      const handleTyping = (data: any) => {
        if (data.senderId === otherUserId) setIsTyping(true);
      };

      const handleStopTyping = (data: any) => {
        if (data.senderId === otherUserId) setIsTyping(false);
      };

      const handleMessagesRead = (data: any) => {
        if (data.readerId === otherUserId) {
          dispatch(markMessagesAsRead(currentUserId));
        }
      };
      
      socket.on("receive_message", handleReceiveMessage);
      socket.on("user_typing", handleTyping);
      socket.on("user_stop_typing", handleStopTyping);
      socket.on("messages_read", handleMessagesRead);
      
      return () => {
        socket.off("receive_message", handleReceiveMessage);
        socket.off("user_typing", handleTyping);
        socket.off("user_stop_typing", handleStopTyping);
        socket.off("messages_read", handleMessagesRead);
      };
    }
  }, [socket, otherUserId, currentUserId, dispatch]);

  useEffect(() => {
    dispatch(clearMessages());
    dispatch(fetchChatMessages(otherUserId)).then(() => {
      if (socket) {
        socket.emit("mark_read", { senderId: currentUserId, receiverId: otherUserId });
      }
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    });
  }, [dispatch, otherUserId]);

  const sendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || !socket || !currentUser) return;

    let finalImageUrl = undefined;

    if (selectedImage) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        let filename = selectedImage.split('/').pop() || 'image.jpg';
        
        if (Platform.OS === 'web') {
          const imageResponse = await fetch(selectedImage);
          const blob = await imageResponse.blob();
          
          if (!filename.includes('.')) {
            const ext = blob.type.split('/')[1] || 'jpg';
            filename = `image.${ext}`;
          }
          
          formData.append('image', blob, filename);
          
          const token = await require('@react-native-async-storage/async-storage').default.getItem('token');
          const baseURL = api.defaults.baseURL || "https://hrback-production-61ba.up.railway.app/api";
          const response = await fetch(`${baseURL}/chat/upload-image`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) throw new Error("Upload failed");
          const data = await response.json();
          if (data?.success && data.data.imageUrl) {
            finalImageUrl = data.data.imageUrl;
          }
        } else {
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          formData.append('image', {
            uri: selectedImage,
            name: filename,
            type,
          } as any);

          const response = await api.post('/chat/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (response.data?.success && response.data.data.imageUrl) {
            finalImageUrl = response.data.data.imageUrl;
          }
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const newMsg = {
      senderId: currentUserId,
      receiverId: otherUserId,
      text: inputText,
      imageUrl: finalImageUrl || undefined,
    };

    socket.emit("send_message", newMsg);
    
    setInputText('');
    setSelectedImage(null);
    socket.emit("stop_typing", { senderId: currentUserId, receiverId: otherUserId });
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (socket) {
      socket.emit("typing", { senderId: currentUserId, receiverId: otherUserId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { senderId: currentUserId, receiverId: otherUserId });
      }, 2000);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender === currentUserId;
    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          {item.imageUrl && (
            <Image 
              source={{ uri: `${api.defaults.baseURL?.replace('/api', '')}${item.imageUrl}` }} 
              style={styles.messageImage} 
              resizeMode="cover"
            />
          )}
          {item.text ? (
            <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
              {item.text}
            </Text>
          ) : null}
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeOther]}>
              {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe && (
              item.read ? <CheckCheck size={12} color="#BFDBFE" style={styles.tick} /> : <Check size={12} color="rgba(255,255,255,0.7)" style={styles.tick} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputAreaWrapper}>
        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removePreviewBtn} onPress={() => setSelectedImage(null)}>
              <X size={12} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={pickImage} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator size="small" color="#F97316" />
            ) : (
              <ImageIcon color="#64748B" size={24} />
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={() => sendMessage()} 
            disabled={isUploading || (!inputText.trim() && !selectedImage)}
          >
            <Send color={(inputText.trim() || selectedImage) && !isUploading ? "#FFF" : "#FDBA74"} size={20} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextWrapper: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerRole: {
    fontSize: 12,
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageWrapperMe: {
    justifyContent: 'flex-end',
  },
  messageWrapperOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageBubbleMe: {
    backgroundColor: '#F97316',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextMe: {
    color: '#FFF',
  },
  messageTextOther: {
    color: '#1E293B',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeOther: {
    color: '#94A3B8',
  },
  tick: {
    marginLeft: 4,
  },
  inputAreaWrapper: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewContainer: {
    padding: 12,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  removePreviewBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  attachButton: {
    padding: 10,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 48,
    maxHeight: 120,
    fontSize: 16,
    color: '#1E293B',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
