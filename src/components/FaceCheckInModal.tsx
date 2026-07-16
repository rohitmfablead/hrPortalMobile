import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import CustomTextInput from './CustomTextInput';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera as CameraIcon, Upload, X, User, CheckCircle } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import api from '../services/api';

type FaceCheckInModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function FaceCheckInModal({ visible, onClose, onSuccess }: FaceCheckInModalProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [permission, requestPermission] = useCameraPermissions();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFaceRegistered, setIsFaceRegistered] = useState<boolean | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setIsMatched(false);
      setUploadedImage(null);
      // Removed checkFaceStatus() as requested
    }
  }, [visible]);

  useEffect(() => {
    if (visible && !permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [visible, permission?.granted, permission?.canAskAgain]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible && permission?.granted && !isMatched && isFaceRegistered !== false && !isVerifying && !uploadedImage) {
      interval = setInterval(() => {
        handleAutoCapture();
      }, 2500); // Poll every 2.5 seconds
    }
    return () => clearInterval(interval);
  }, [visible, permission?.granted, isMatched, isFaceRegistered, isVerifying, uploadedImage]);

  const checkFaceStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await api.get('/face/check-status');
      if (response.data?.success) {
        setIsFaceRegistered(response.data.data.faceRegistered);
      }
    } catch (error) {
      console.log('Error checking face status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleVerifyFace = async (uri: string) => {
    setIsVerifying(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('face', blob, 'face.jpg');
      } else {
        const filename = uri.split('/').pop() || 'face.jpg';
        const type = `image/${filename.split('.').pop() || 'jpeg'}`;
        formData.append('face', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: filename,
          type,
        } as any);
      }

      const response = await api.post('/face/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // console.log('Face Match API Response (Manual):', response.data);

      if (response.data?.success && response.data?.data?.isMatch) {
        setIsMatched(true);
        setMatchPercentage(response.data.data.matchPercentage);

        // Log if it matched a different user but allow it for testing purposes
        if (response.data.data.userId !== user?.id && response.data.data.name !== user?.name && user?.role !== 'Admin') {
          console.warn(`Face matched another employee: ${response.data.data.name}, but allowing for demo purposes.`);
        }
      } else {
        Alert.alert('Not Recognized', 'Face not recognized in the system.');
        setUploadedImage(null);
      }
    } catch (error: any) {
      console.log('Verification Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to verify face.');
      setUploadedImage(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAutoVerifyFace = async (uri: string) => {
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('face', blob, 'face.jpg');
      } else {
        const filename = uri.split('/').pop() || 'face.jpg';
        const type = `image/${filename.split('.').pop() || 'jpeg'}`;
        formData.append('face', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: filename,
          type,
        } as any);
      }

      const response = await api.post('/face/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // console.log('Face Match API Response (Auto):', response.data);

      if (response.data?.success && response.data?.data?.isMatch) {
        setIsMatched(true);
        setMatchPercentage(response.data.data.matchPercentage);
        if (response.data.data.userId !== user?.id && response.data.data.name !== user?.name && user?.role !== 'Admin') {
          console.warn(`Face matched another employee: ${response.data.data.name}, but allowing for demo purposes.`);
        }
      }
    } catch (error: any) {
      console.log('Auto Verification Error:', error.response?.data || error.message);
      // Silent failure for auto verification
    }
  };

  const cameraRef = React.useRef<any>(null);

  const handleLiveCapture = async () => {
    if (cameraRef.current) {
      try {
        setIsVerifying(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        setUploadedImage(photo.uri);
        handleVerifyFace(photo.uri);
      } catch (error) {
        setIsVerifying(false);
        console.log('Error capturing live photo: ', error);
        Alert.alert('Error', 'Failed to capture photo from camera');
      }
    }
  };

  const handleAutoCapture = async () => {
    if (cameraRef.current && !isVerifying) {
      try {
        setIsVerifying(true);
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.3 });
        await handleAutoVerifyFace(photo.uri);
      } catch (error) {
        console.log('Error capturing auto photo: ', error);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploadedImage(result.assets[0].uri);
        handleVerifyFace(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image: ', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <CameraIcon color="#3B82F6" size={20} />
              <Text style={styles.headerTitle}>Face Check-In</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color="#94A3B8" size={24} />
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
          <View style={[styles.userInfoCard, { backgroundColor: '#F8FAFC' }]}>
            <View style={[styles.avatarContainer, { backgroundColor: '#FFF7ED' }]}>
              <User color="#F97316" size={24} />
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || 'Employee'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Staff'}</Text>
            </View>
          </View>

          {/* Camera View Area */}
          <View style={[styles.cameraContainer, { borderColor: isMatched ? '#10B981' : isVerifying ? '#3B82F6' : '#E2E8F0', shadowColor: isVerifying ? '#3B82F6' : 'transparent', shadowOpacity: 0.5, shadowRadius: 15, elevation: isVerifying ? 10 : 0 }]}>
            {uploadedImage ? (
              <View style={styles.cameraWrapper}>
                <Image source={{ uri: uploadedImage }} style={styles.camera} resizeMode="cover" />
                <View style={[styles.cameraOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                  {isVerifying && <ActivityIndicator size="large" color="#3B82F6" />}
                  {isMatched && <CheckCircle color="#10B981" size={54} />}
                </View>
              </View>
            ) : statusLoading ? (
              <View style={styles.verifyingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.cameraText}>Checking Face Status...</Text>
              </View>
            ) : isFaceRegistered === false ? (
              <View style={styles.cameraFallback}>
                <Text style={[styles.fallbackText, { textAlign: 'center', marginHorizontal: 20, color: '#0F172A' }]}>
                  Your face is not registered. Please contact HR.
                </Text>
              </View>
            ) : !permission?.granted ? (
              <View style={styles.cameraFallback}>
                <Text style={[styles.fallbackText, { color: '#0F172A' }]}>Camera permission required.</Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                  <Text style={styles.permissionBtnText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraWrapper}>
                <CameraView style={styles.camera} facing="front" ref={cameraRef} />
                <View style={[styles.cameraOverlay, { backgroundColor: isVerifying ? 'rgba(59,130,246,0.1)' : isMatched ? 'rgba(16,185,129,0.2)' : 'transparent' }]}>
                  {isVerifying && <ActivityIndicator size="large" color="#3B82F6" />}
                  {isMatched && <CheckCircle color="#10B981" size={54} />}
                </View>
              </View>
            )}
          </View>

          {/* Scanning Text Badge */}
          <View style={styles.statusBadgeContainer}>
            {isVerifying ? (
              <Text style={[styles.statusBadgeText, { color: '#3B82F6' }]}>Scanning face...</Text>
            ) : isMatched ? (
              <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>
                Face Matched! {matchPercentage ? `(${matchPercentage}%)` : ''}
              </Text>
            ) : (
              <Text style={[styles.statusBadgeText, { color: '#64748B' }]}>Please look at the camera</Text>
            )}
          </View>

          {/* Footer Buttons */}
          {isMatched ? (
            <TouchableOpacity
              style={{
                backgroundColor: '#22c55e',
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}
              onPress={() => {
                setIsMatched(false);
                setMatchPercentage(null);
                onSuccess();
              }}
            >
              <CheckCircle color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>Confirm & Mark Attendance</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.footerBtn, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', marginRight: 12 }]}
                onPress={handleUploadPhoto}
              >
                <Upload color="#0284C7" size={18} />
                <Text style={[styles.footerBtnText, { color: '#0284C7' }]}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]} onPress={onClose}>
                <X color="#EF4444" size={18} />
                <Text style={[styles.footerBtnText, { color: '#EF4444' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 10,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  cameraContainer: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
  },
  fallbackText: {
    color: '#0F172A',
    marginBottom: 12,
    fontWeight: '500',
    fontSize: 15,
  },
  permissionBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cameraWrapper: {
    width: '100%',
    height: '100%',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
  },
  faceGuideFrame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 110,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  simulateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  captureBtnInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  verifyingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cameraText: {
    color: '#0F172A',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerBtnText: {
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
  },
});
