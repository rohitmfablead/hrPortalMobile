import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { NavigationContainerRefContext } from '@react-navigation/native';
import api from '../services/api';
import { RootState } from '../redux/store';

export default function GlobalSocketListener() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = React.useContext(NavigationContainerRefContext);

  useEffect(() => {
    if (!user) return;

    const currentUserId = user._id || user.id;
    if (!currentUserId) return;

    const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
    const socketUrl = baseURL.replace('/api', '');

    const socket = io(socketUrl);
    socket.emit("join", currentUserId);

    socket.on("receive_message", (message: any) => {
      const currentRoute = navigation?.getCurrentRoute();
      // Avoid showing toast if we are currently chatting
      if (currentRoute?.name === 'ChatRoom') return;
      
      Toast.show({
        type: 'info',
        text1: 'New Message',
        text2: message.text || (message.imageUrl ? 'Image received' : 'New message'),
        position: 'bottom',
        onPress: () => {
          navigation?.navigate('ChatRoom', { user: { _id: message.sender } } as never);
          Toast.hide();
        }
      });
    });

    socket.on("receive_notification", (notification: any) => {
      const currentRoute = navigation?.getCurrentRoute();
      if (currentRoute?.name === 'Notifications') return;
      
      Toast.show({
        type: 'success',
        text1: notification.title || 'Notification',
        text2: notification.message || 'New notification',
        position: 'bottom',
        onPress: () => {
          navigation?.navigate('Notifications' as never);
          Toast.hide();
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigation]);

  return null;
}
