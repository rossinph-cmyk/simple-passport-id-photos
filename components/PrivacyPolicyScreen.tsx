import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Shield, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface PrivacyPolicyScreenProps {
  onAccept: () => void;
}

export default function PrivacyPolicyScreen({ onAccept }: PrivacyPolicyScreenProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
      }
    }
    onAccept();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Shield color="#0038A8" size={40} strokeWidth={2} />
        </View>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.headerSubtitle}>Please read carefully before using the app</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.policyContent}>
          <Text style={styles.effectiveDate}>Effective Date: 10/08/2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.sectionText}>
              {'Photo For ID Maker ("the App") is developed and published by Moore Technologies ("we," "our," or "us"). We value your privacy and are committed to being transparent about how we handle information. This Privacy Policy explains what data is collected, how it is used, and your choices.'}
            </Text>
            <Text style={styles.sectionText}>
              By using the App, you agree to the terms outlined below.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.sectionText}>
              We do not collect, store, or share any personal information from users. Specifically:
            </Text>
            <Text style={styles.bulletPoint}>• We do not ask for names, email addresses, or contact details.</Text>
            <Text style={styles.bulletPoint}>• We do not access your contacts, messages, or other device files.</Text>
            <Text style={styles.bulletPoint}>• No background data tracking or user profiling is performed.</Text>
            <Text style={styles.sectionText}>
              The App only uses the permissions necessary for its core function: creating, cropping, and exporting ID photos.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Use of Images</Text>
            <Text style={styles.sectionText}>
              The App allows you to select, crop, and resize your own images to create ID photos.
            </Text>
            <Text style={styles.bulletPoint}>• All photo editing and processing happens locally on your device.</Text>
            <Text style={styles.bulletPoint}>• We do not upload, transmit, or store your images on any external server.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Ads and Third-Party Services</Text>
            <Text style={styles.sectionText}>
              The App uses Google AdMob to display advertisements.
            </Text>
            <Text style={styles.bulletPoint}>• AdMob may collect certain device information (such as advertising IDs) for personalized ads and analytics.</Text>
            <Text style={styles.bulletPoint}>• You can opt out of personalized ads by adjusting your device settings.</Text>
            <Text style={styles.bulletPoint}>{'• For more details, please review Google\'s Privacy Policy.'}</Text>
            <Text style={styles.sectionText}>
              If you unlock the premium (ad-free) version of the App, no ad-related data will be requested or shared.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. In-App Purchases and Payments</Text>
            <Text style={styles.sectionText}>
              The App may include a one-time purchase option to remove watermarks and ads.
            </Text>
            <Text style={styles.bulletPoint}>• Payments are processed securely through Google Play.</Text>
            <Text style={styles.bulletPoint}>• We do not have access to your credit card, banking details, or payment credentials.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{'6. Children\'s Privacy'}</Text>
            <Text style={styles.sectionText}>
              This App is not directed toward children under 13. We do not knowingly collect information from children. If you believe a child has provided information, please contact us immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Security</Text>
            <Text style={styles.sectionText}>
              Since no personal data or images leave your device, there is no risk of breaches on our end. However, we recommend that users manage their device securely (e.g., strong PINs, password protection).
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Your Choices</Text>
            <Text style={styles.bulletPoint}>• You can disable personalized ads in your device settings.</Text>
            <Text style={styles.bulletPoint}>• You may uninstall the App at any time to stop all use.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              {'We may update this Privacy Policy as needed. Any updates will be reflected with a new "Effective Date."'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions or concerns about this Privacy Policy, you may contact us at:
            </Text>
            <Text style={styles.contactInfo}>Email: Moorestonetechnologies@gmail.com</Text>
            <Text style={styles.contactInfo}>Developer Name: Ross Moore</Text>
          </View>

          <View style={styles.scrollIndicator}>
            {!hasScrolledToBottom && (
              <Text style={styles.scrollIndicatorText}>↓ Please scroll to the bottom ↓</Text>
            )}
            {hasScrolledToBottom && (
              <View style={styles.completedIndicator}>
                <CheckCircle color="#10b981" size={20} />
                <Text style={styles.completedText}>{"You've read the policy"}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.acceptButton, !hasScrolledToBottom && styles.acceptButtonDisabled]}
          onPress={handleAccept}
          disabled={!hasScrolledToBottom}
        >
          <Text style={styles.acceptButtonText}>
            {hasScrolledToBottom ? 'Accept & Continue' : 'Scroll to Accept'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0038A8',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  policyContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  effectiveDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0038A8',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginLeft: 10,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 15,
    color: '#0038A8',
    fontWeight: '600',
    marginBottom: 6,
  },
  scrollIndicator: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  scrollIndicatorText: {
    fontSize: 14,
    color: '#CE1126',
    fontWeight: '600',
    textAlign: 'center',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  acceptButton: {
    backgroundColor: '#0038A8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
