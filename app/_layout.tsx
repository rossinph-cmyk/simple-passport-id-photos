import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from "react-native";
import ErrorBoundary from "@/components/ErrorBoundary";
import PrivacyPolicyScreen from "@/components/PrivacyPolicyScreen";
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ headerShown: false }} />
      <Stack.Screen name="crop" options={{ headerShown: false }} />
      <Stack.Screen name="preview" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [permissionStep, setPermissionStep] = useState<'none' | 'camera' | 'storage' | 'complete'>('none');
  const [, requestCameraPermission] = useCameraPermissions();
  const [, requestStoragePermission] = ImagePicker.useMediaLibraryPermissions();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const hasAccepted = await AsyncStorage.getItem('privacy_policy_accepted');
      const permissionsGranted = await AsyncStorage.getItem('permissions_granted');
      
      if (hasAccepted === 'true') {
        setHasAcceptedPolicy(true);
        if (permissionsGranted === 'true') {
          setPermissionStep('complete');
        } else {
          setPermissionStep('camera');
        }
      }
      
      await SplashScreen.hideAsync();
    } catch (e) {
      console.log('Error initializing app:', e);
    } finally {
      setIsReady(true);
    }
  };

  const handleAcceptPolicy = async () => {
    try {
      await AsyncStorage.setItem('privacy_policy_accepted', 'true');
      setHasAcceptedPolicy(true);
      setPermissionStep('camera');
    } catch (e) {
      console.log('Error saving privacy policy acceptance:', e);
      setHasAcceptedPolicy(true);
      setPermissionStep('camera');
    }
  };

  const handleCameraPermission = async () => {
    try {
      const result = await requestCameraPermission();
      if (result.granted) {
        setPermissionStep('storage');
      } else {
        setPermissionStep('storage');
      }
    } catch {
      setPermissionStep('storage');
    }
  };

  const handleStoragePermission = async () => {
    try {
      const result = await requestStoragePermission();
      if (result.granted) {
        await AsyncStorage.setItem('permissions_granted', 'true');
        setPermissionStep('complete');
      } else {
        await AsyncStorage.setItem('permissions_granted', 'true');
        setPermissionStep('complete');
      }
    } catch {
      setPermissionStep('complete');
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#0038A8" />
      </View>
    );
  }

  if (!hasAcceptedPolicy) {
    return (
      <ErrorBoundary>
        <PrivacyPolicyScreen onAccept={handleAcceptPolicy} />
      </ErrorBoundary>
    );
  }

  if (permissionStep === 'camera') {
    return (
      <ErrorBoundary>
        <View style={permissionStyles.container}>
          <View style={permissionStyles.content}>
            <View style={permissionStyles.iconContainer}>
              <Camera color="#0038A8" size={48} strokeWidth={2} />
            </View>
            <Text style={permissionStyles.title}>Camera Access</Text>
            <Text style={permissionStyles.description}>
              We need access to your camera to take ID photos.
            </Text>
            <Text style={permissionStyles.subtitle}>
              You can take photos directly within the app for your ID documents.
            </Text>
            <TouchableOpacity
              style={permissionStyles.button}
              onPress={handleCameraPermission}
            >
              <Text style={permissionStyles.buttonText}>Allow Camera Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ErrorBoundary>
    );
  }

  if (permissionStep === 'storage') {
    return (
      <ErrorBoundary>
        <View style={permissionStyles.container}>
          <View style={permissionStyles.content}>
            <View style={permissionStyles.iconContainer}>
              <ImageIcon color="#0038A8" size={48} strokeWidth={2} />
            </View>
            <Text style={permissionStyles.title}>Photo Library Access</Text>
            <Text style={permissionStyles.description}>
              We need access to your photo library to select and save ID photos.
            </Text>
            <Text style={permissionStyles.subtitle}>
              You can choose existing photos from your gallery or save completed ID photos.
            </Text>
            <TouchableOpacity
              style={permissionStyles.button}
              onPress={handleStoragePermission}
            >
              <Text style={permissionStyles.buttonText}>Allow Photo Library Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }} testID="gesture-root">
          <RootLayoutNav />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const permissionStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    margin: 20,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0038A8',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0038A8',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
