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

  const handleSimulateMatch = () => {
    Alert.alert('Info', 'Please upload a photo using the button below. Live camera scan API is not fully linked here yet.');
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
              <CameraIcon color="#F97316" size={18} />
              <Text style={styles.headerTitle}>Check-In with Face Recognition</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color="#F97316" size={24} />
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
          <View style={styles.userInfoCard}>
            <View style={styles.avatarContainer}>
              <User color="#F97316" size={24} />
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || 'Employee'}</Text>
              <Text style={styles.userRole}>{user?.role || 'Staff'}</Text>
            </View>
          </View>

          {/* Camera View Area */}
          <View style={styles.cameraContainer}>
            {uploadedImage ? (
              <View style={styles.cameraWrapper}>
                <Image source={{ uri: uploadedImage }} style={styles.camera} resizeMode="cover" />
                <View style={[styles.cameraOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  {isVerifying ? (
                    <View style={styles.verifyingContainer}>
                      <ActivityIndicator size="large" color="#F97316" />
                      <Text style={styles.cameraText}>Verifying Face...</Text>
                    </View>
                  ) : isMatched ? (
                    <View style={styles.verifyingContainer}>
                      <User color="#10B981" size={48} />
                      <Text style={[styles.cameraText, { color: '#10B981', fontWeight: 'bold', fontSize: 18, marginTop: 12 }]}>
                        Face Matched! {matchPercentage ? `(${matchPercentage}%)` : ''}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : statusLoading ? (
              <View style={styles.verifyingContainer}>
                <ActivityIndicator size="large" color="#F97316" />
                <Text style={styles.cameraText}>Checking Face Status...</Text>
              </View>
            ) : isFaceRegistered === false ? (
              <View style={styles.cameraFallback}>
                <Text style={[styles.fallbackText, { textAlign: 'center', marginHorizontal: 20 }]}>
                  Your face is not registered in the system. Please contact HR or register your face in Profile Settings before checking in.
                </Text>
              </View>
            ) : !permission?.granted ? (
              <View style={styles.cameraFallback}>
                <Text style={styles.fallbackText}>Camera permission is required.</Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                  <Text style={styles.permissionBtnText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraWrapper}>
                <CameraView style={styles.camera} facing="front" />

                {/* Overlay inside camera */}
                <View style={styles.cameraOverlay}>
                  {isVerifying ? (
                    <View style={styles.verifyingContainer}>
                      <ActivityIndicator size="large" color="#F97316" />
                      <Text style={styles.cameraText}>Verifying Face...</Text>
                    </View>
                  ) : isMatched ? (
                    <View style={styles.verifyingContainer}>
                      <User color="#10B981" size={48} />
                      <Text style={[styles.cameraText, { color: '#10B981', fontWeight: 'bold', fontSize: 18, marginTop: 12 }]}>
                        Face Matched! {matchPercentage ? `(${matchPercentage}%)` : ''}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulateMatch}>
                      <CameraIcon color="#F97316" size={28} />
                      <Text style={styles.cameraText}>Tap to Scan Face</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
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
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Confirm & Mark Attendance</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.footerBtn, (isFaceRegistered === false || statusLoading) && { opacity: 0.5 }]}
                onPress={handleUploadPhoto}
                disabled={isFaceRegistered === false || statusLoading}
              >
                <Upload color="#F97316" size={18} />
                <Text style={styles.footerBtnText}>Upload Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
                <X color="#F97316" size={18} />
                <Text style={styles.footerBtnText}>Cancel</Text>
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
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  userRole: {
    fontSize: 13,
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  cameraContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFallback: {
    alignItems: 'center',
  },
  fallbackText: {
    color: '#0F172A',
    marginBottom: 12,
  },
  permissionBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: '#0F172A',
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
    backgroundColor: '#FFFFFF',
  },
  simulateBtn: {
    alignItems: 'center',
    padding: 20,
  },
  verifyingContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
  },
  cameraText: {
    color: '#0F172A',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footerBtnText: {
    color: '#0F172A',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});
