import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { X, RotateCcw, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (e) {
        
      }
    }
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        if (Platform.OS !== 'web') {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (e) {
            
          }
        }
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
        });
        
        if (photo) {
          let imageUri = photo.uri;
          
          // For mobile, copy to permanent location to prevent file not found errors
          if (Platform.OS !== 'web') {
            try {
              const fileName = `camera_${Date.now()}.jpg`;
              const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
              
              await FileSystem.copyAsync({
                from: imageUri,
                to: permanentUri
              });
              
              // Verify the copy was successful
              const fileInfo = await FileSystem.getInfoAsync(permanentUri);
              if (fileInfo.exists) {
                imageUri = permanentUri;

              }
            } catch (copyError) {

              // Continue with original URI if copy fails
            }
          }
          
          // Navigate back to home with the image URI as a parameter
          router.replace({
            pathname: '/',
            params: { capturedImageUri: imageUri }
          });
        }
      } catch (error) {

        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const goBack = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (e) {
        
      }
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={goBack}>
            <X color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Take ID Photo</Text>
          <TouchableOpacity style={styles.headerButton} onPress={toggleCameraFacing}>
            <RotateCcw color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Guide Overlay */}
        <View style={styles.guideOverlay}>
          <View style={styles.guideFrame}>
            <View style={[styles.guideCorner, styles.topLeft]} />
            <View style={[styles.guideCorner, styles.topRight]} />
            <View style={[styles.guideCorner, styles.bottomLeft]} />
            <View style={[styles.guideCorner, styles.bottomRight]} />
          </View>
          <Text style={styles.guideText}>Position your face within the frame</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlsInner}>
            <View style={styles.controlsSpacer} />
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner}>
                <Circle color="white" size={32} fill="white" />
              </View>
            </TouchableOpacity>
            <View style={styles.controlsSpacer} />
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#0038A8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  guideOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  guideFrame: {
    width: 250,
    height: 300,
    position: 'relative',
  },
  guideCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  guideText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controls: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  controlsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlsSpacer: {
    width: 80,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});