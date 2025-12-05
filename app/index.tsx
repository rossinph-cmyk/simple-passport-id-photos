import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Image as ImageIcon, ChevronDown, Info, Eye, Heart, Globe } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { AmericanThemedBackground, IndianThemedBackground } from '../components/ThemedBackgrounds';

const { width: screenWidth } = Dimensions.get('window');

const ID_SIZES = [
  { label: '1x1 inch (25x25 mm)', value: '1x1', width: 25, height: 25 },
  { label: '1x1.5 inch (25x38 mm)', value: '1x1.5', width: 25, height: 38 },
  { label: '1x2 inch (25x51 mm)', value: '1x2', width: 25, height: 51 },
  { label: '2x2 inch (51x51 mm)', value: '2x2', width: 51, height: 51 },
  { label: '2x3 inch (51x76 mm)', value: '2x3', width: 51, height: 76 },
] as const;

type IdSize = typeof ID_SIZES[number];

const MAX_LONG_SIDE_MM = Math.max(
  ...ID_SIZES.map((s) => Math.max(s.width, s.height))
);

const PAPER_SIZES = [
  { label: 'A4 (210x297 mm)', value: 'A4' },
  { label: 'Letter (216x279 mm)', value: 'Letter' },
  { label: 'Long Photo Paper (102x305 mm)', value: 'Long' },
];

interface ImageDimensions { width: number; height: number; }
interface DisplayDimensions { width: number; height: number; offsetX: number; offsetY: number; }
interface CropArea { x: number; y: number; width: number; height: number; }
interface ImageTransform { translateX: number; translateY: number; }



export default function HomeScreen() {
  const { capturedImageUri } = useLocalSearchParams<{ capturedImageUri?: string }>();
  const theme = useThemeStore(s => s.theme);
  const setTheme = useThemeStore(s => s.setTheme);
  const loadTheme = useThemeStore(s => s.loadTheme);
  const themeColors = React.useMemo(() => getThemeColors(theme), [theme]);

  const [selectedIdSize, setSelectedIdSize] = useState<IdSize>(ID_SIZES[0]);
  const [selectedPaperSize, setSelectedPaperSize] = useState(PAPER_SIZES[0]);
  const [showIdSizeModal, setShowIdSizeModal] = useState(false);
  const [showPaperSizeModal, setShowPaperSizeModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState<DisplayDimensions>({ width: 0, height: 0, offsetX: 0, offsetY: 0 });

  const [imageTransform, setImageTransform] = useState<ImageTransform>({ translateX: 0, translateY: 0 });
  const [scaleValue, setScaleValue] = useState<number>(1);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 150, height: 180 });

  const [isPanningImage, setIsPanningImage] = useState<boolean>(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const updateImageTransform = (transform: ImageTransform) => {
    setImageTransform(transform);
  };

  useEffect(() => {
    if (capturedImageUri && !selectedImage) {
      handleImageSelected(capturedImageUri);
    }
  }, [capturedImageUri]);


  const handleTakePicture = async () => {
    try {
      if (Platform.OS !== 'web') {
        try {
          await Haptics.selectionAsync();
        } catch (e) {
          
        }
      }
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { 
        Alert.alert('Permission needed', 'Camera permission is required to take photos.'); 
        return; 
      }
      
      router.push('/camera');
    } catch (error) {
      
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      if (Platform.OS !== 'web') {
        try {
          await Haptics.selectionAsync();
        } catch (e) {
          
        }
      }
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { 
        Alert.alert('Permission needed', 'Gallery permission is required to select photos.'); 
        return; 
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: false, 
        quality: 1, 
        exif: false 
      });
      
      if (!result.canceled && result.assets[0]) { 
        await handleImageSelected(result.assets[0].uri); 
      }
    } catch (error) {
      
      Alert.alert('Error', 'Failed to select image from gallery. Please try again.');
    }
  };

  const handleImageSelected = async (imageUri: string) => {
    try {
      setSelectedImage(imageUri);
      setImageLoaded(false);
      setScaleValue(1);
      await loadImageDimensions(imageUri);
    } catch (error) { Alert.alert('Error', 'Failed to load selected image. Please try again.'); }
  };

  const loadImageDimensions = async (imageUri: string) => {
    try {
      const previewBoxHeight = 300;
      const previewBoxWidth = screenWidth - 40;
      if (Platform.OS === 'web') {
        const img = new window.Image();
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          let displayWidth = previewBoxWidth;
          let displayHeight = previewBoxWidth / aspectRatio;
          let offsetX = 20; let offsetY = 0;
          if (displayHeight > previewBoxHeight) { displayHeight = previewBoxHeight; displayWidth = previewBoxHeight * aspectRatio; offsetX = 20 + (previewBoxWidth - displayWidth) / 2; } else { offsetY = (previewBoxHeight - displayHeight) / 2; }
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          setDisplayDimensions({ width: displayWidth, height: displayHeight, offsetX, offsetY });
          initializeCropArea(displayWidth, displayHeight, offsetX, offsetY, selectedIdSize);
          setImageTransform({ translateX: 0, translateY: 0 });
          setImageLoaded(true);
        };
        img.onerror = () => { Alert.alert('Error', 'Failed to load image. Please try again.'); };
        img.src = imageUri;
      } else {
        try {
          const info = await ImageManipulator.manipulateAsync(imageUri, [], { format: ImageManipulator.SaveFormat.JPEG });
          const aspectRatio = info.width / info.height;
          let displayWidth = previewBoxWidth;
          let displayHeight = previewBoxWidth / aspectRatio;
          let offsetX = 20; let offsetY = 0;
          if (displayHeight > previewBoxHeight) { displayHeight = previewBoxHeight; displayWidth = previewBoxHeight * aspectRatio; offsetX = 20 + (previewBoxWidth - displayWidth) / 2; } else { offsetY = (previewBoxHeight - displayHeight) / 2; }
          setImageDimensions({ width: info.width, height: info.height });
          setDisplayDimensions({ width: displayWidth, height: displayHeight, offsetX, offsetY });
          initializeCropArea(displayWidth, displayHeight, offsetX, offsetY, selectedIdSize);
          setImageTransform({ translateX: 0, translateY: 0 });
          setImageLoaded(true);
        } catch (_e) {
          const displayWidth = previewBoxWidth; const displayHeight = previewBoxHeight; const offsetX = 20; const offsetY = 0;
          setDisplayDimensions({ width: displayWidth, height: displayHeight, offsetX, offsetY });
          initializeCropArea(displayWidth, displayHeight, offsetX, offsetY, selectedIdSize);
          setImageTransform({ translateX: 0, translateY: 0 });
          setImageLoaded(true);
        }
      }
    } catch (error) { Alert.alert('Error', 'Failed to load image. Please try again.'); }
  };

  const initializeCropArea = (
    imageWidth: number,
    imageHeight: number,
    offsetX: number,
    offsetY: number,
    size: IdSize = selectedIdSize,
  ) => {
    const previewBoxWidth = screenWidth - 40;
    const previewBoxHeight = 300;

    const aspect = size.width / size.height;
    const longMm = Math.max(size.width, size.height);

    const targetLongPxBase = previewBoxHeight * 0.8;
    const targetLongPx = (longMm / MAX_LONG_SIDE_MM) * targetLongPxBase;

    let cropW: number;
    let cropH: number;
    if (aspect >= 1) {
      cropW = targetLongPx;
      cropH = cropW / aspect;
    } else {
      cropH = targetLongPx;
      cropW = cropH * aspect;
    }

    const maxW = previewBoxWidth * 0.9;
    const maxH = previewBoxHeight * 0.9;
    const scale = Math.min(1, maxW / cropW, maxH / cropH);
    cropW *= scale;
    cropH *= scale;

    const minSize = 80;
    if (cropW < minSize || cropH < minSize) {
      const up = Math.max(minSize / cropW, minSize / cropH);
      cropW *= up;
      cropH *= up;
      const clampDown = Math.min(1, maxW / cropW, maxH / cropH);
      cropW *= clampDown;
      cropH *= clampDown;
    }

    const cropX = (previewBoxWidth - cropW) / 2;
    const cropY = (previewBoxHeight - cropH) / 2;
    setCropArea({ x: cropX, y: cropY, width: cropW, height: cropH });
  };

  useEffect(() => {
    if (!imageLoaded) return;
    initializeCropArea(
      displayDimensions.width,
      displayDimensions.height,
      displayDimensions.offsetX,
      displayDimensions.offsetY,
      selectedIdSize
    );
  }, [selectedIdSize, imageLoaded]);

  const handlePreview = async (previewType: 'single' | 'sheet') => {
    if (!selectedImage) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        
      }
    }
    try {
      const transformedImageWidth = displayDimensions.width * scaleValue;
      const transformedImageHeight = displayDimensions.height * scaleValue;
      const imageLeft = displayDimensions.offsetX + imageTransform.translateX;
      const imageTop = displayDimensions.offsetY + imageTransform.translateY;
      const relativeX = (cropArea.x - imageLeft) / transformedImageWidth;
      const relativeY = (cropArea.y - imageTop) / transformedImageHeight;
      const relativeWidth = cropArea.width / transformedImageWidth;
      const relativeHeight = cropArea.height / transformedImageHeight;
      let actualImageWidth: number; let actualImageHeight: number;
      if (Platform.OS === 'web' && imageDimensions.width > 0) { actualImageWidth = imageDimensions.width; actualImageHeight = imageDimensions.height; }
      else { const info = await ImageManipulator.manipulateAsync(selectedImage, [], { format: ImageManipulator.SaveFormat.JPEG }); actualImageWidth = info.width; actualImageHeight = info.height; }
      const finalCropX = Math.max(0, Math.round(relativeX * actualImageWidth));
      const finalCropY = Math.max(0, Math.round(relativeY * actualImageHeight));
      const finalCropWidth = Math.max(50, Math.round(relativeWidth * actualImageWidth));
      const finalCropHeight = Math.max(50, Math.round(relativeHeight * actualImageHeight));
      router.push({ pathname: '/preview', params: { imageUri: selectedImage, cropX: String(finalCropX), cropY: String(finalCropY), cropWidth: String(finalCropWidth), cropHeight: String(finalCropHeight), originalWidth: String(actualImageWidth), originalHeight: String(actualImageHeight), idSize: selectedIdSize.value, paperSize: selectedPaperSize.value, previewType } });
    } catch (error: unknown) { 
       
      Alert.alert('Error', 'Failed to preview. Please try again.'); 
    }
  };

  const handleClearImage = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (e) {
        
      }
    }
    setSelectedImage(null);
    setImageLoaded(false);
  };

  return (
    <View style={styles.container}>
      {/* Themed background overlay */}
      <View style={styles.backgroundOverlay}>
        {theme === 'american' ? <AmericanThemedBackground /> : <IndianThemedBackground />}
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} scrollEnabled={!isPanningImage}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.flagContainer}>
              {theme === 'american' ? (
                <View style={styles.flag}>
                  {/* Red and white stripes */}
                  {[...Array(7)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.americanStripe,
                        { backgroundColor: i % 2 === 0 ? '#DC143C' : '#FFFFFF' }
                      ]}
                    />
                  ))}
                  {/* Blue canton with white stars */}
                  <View style={styles.americanCanton}>
                    {[...Array(6)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.miniStar,
                          {
                            top: Math.floor(i / 3) * 6 + 2,
                            left: (i % 3) * 5 + 2
                          }
                        ]}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.flag}>
                  <View style={styles.indianFlagSaffron} />
                  <View style={styles.indianFlagWhite}>
                    {/* Ashoka Chakra in center */}
                    <View style={styles.miniChakra}>
                      {[...Array(8)].map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.miniSpoke,
                            {
                              transform: [{ rotate: `${i * 45}deg` }]
                            }
                          ]}
                        />
                      ))}
                      <View style={styles.miniChakraCenter} />
                    </View>
                  </View>
                  <View style={styles.indianFlagGreen} />
                </View>
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: themeColors.primary }]}>Simple Passport ID & Photos</Text>
              <Text style={styles.subtitle}>Professional ID Photos Made Easy</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.heartButton}>
            <Heart color={themeColors.primary} size={24} fill={themeColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Instruction Banner */}
        <View style={styles.instructionBanner}>
          <Text style={styles.bannerText}>📸 Please take a selfie or upload a picture on a plain white background</Text>
        </View>

        {/* Theme Toggle Button */}
        <TouchableOpacity style={styles.themeButton} onPress={() => setShowThemeModal(true)}>
          <Globe color={themeColors.primary} size={20} />
          <Text style={[styles.themeButtonText, { color: themeColors.primary }]}>Background Theme: {theme === 'american' ? '🇺🇸 American' : '🕉️ Hindu'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featuresButton} onPress={() => setShowFeaturesModal(true)}>
          <LinearGradient colors={[themeColors.buttonGradient[0], themeColors.buttonGradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.featuresGradient}>
            <Info color="white" size={20} />
            <Text style={styles.featuresButtonText}>Features</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.sizeSection}>
          <View style={styles.sizeRow}>
            <View style={styles.sizeColumn}>
              <Text style={styles.sizeLabel}>ID Size</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowIdSizeModal(true)}>
                <Text style={styles.dropdownText}>{selectedIdSize.label}</Text>
                <ChevronDown color="#666" size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles.sizeColumn}>
              <Text style={styles.sizeLabel}>Paper Size</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowPaperSizeModal(true)}>
                <Text style={styles.dropdownText}>{selectedPaperSize.label}</Text>
                <ChevronDown color="#666" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Photo Cropping</Text>
          <View style={styles.previewContainer}>
            <View style={styles.previewBox}>
              {selectedImage && imageLoaded ? (
                <CroppingInterface
                  imageUri={selectedImage}
                  displayDimensions={displayDimensions}
                  imageTransform={imageTransform}
                  setImageTransform={updateImageTransform}
                  scaleValue={scaleValue}
                  setScaleValue={setScaleValue}
                  cropArea={cropArea}
                  setCropArea={setCropArea}
                  setParentPanning={setIsPanningImage}
                  theme={theme}
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <View style={styles.gridOverlay}><View style={styles.gridLine} /><View style={[styles.gridLine, styles.gridLineHorizontal]} /></View>
                  <View style={styles.watermark}><Text style={styles.watermarkText}>PHOTO ID</Text><Text style={styles.watermarkText}>MAKER 2</Text></View>
                  <Text style={styles.previewPlaceholder}>No photo selected</Text>
                </View>
              )}
            </View>
          </View>
          {selectedImage && imageLoaded && (
            <View style={styles.cropInstructions}>
              <Text style={styles.instructionText}>Drag the photo with one finger to reposition. Release to set.</Text>
            </View>
          )}
        </View>

        <View style={styles.actionSection}>
          {!selectedImage ? (
            <>
              <TouchableOpacity style={styles.actionButtonWrapper} onPress={handleTakePicture}>
                <LinearGradient colors={[themeColors.buttonGradient[0], themeColors.buttonGradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionButton}>
                  <Camera color="white" size={24} />
                  <Text style={styles.actionButtonText}>Take Picture</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButtonSecondary, { borderColor: themeColors.primary }]} onPress={handleSelectFromGallery}>
                <ImageIcon color={themeColors.primary} size={24} />
                <Text style={[styles.actionButtonSecondaryText, { color: themeColors.primary }]}>Gallery</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.actionButtonWrapper} onPress={() => handlePreview('single')}>
                <LinearGradient colors={[themeColors.buttonGradient[0], themeColors.buttonGradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionButton}>
                  <Eye color="white" size={24} />
                  <Text style={styles.actionButtonText}>Preview Single Photo</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonWrapper} onPress={() => handlePreview('sheet')}>
                <LinearGradient colors={[themeColors.buttonGradient[0], themeColors.buttonGradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionButton}>
                  <Eye color="white" size={24} />
                  <Text style={styles.actionButtonText}>Preview 3 Photos</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButtonSecondary, { borderColor: themeColors.primary }]} onPress={handleClearImage}>
                <ImageIcon color={themeColors.primary} size={24} />
                <Text style={[styles.actionButtonSecondaryText, { color: themeColors.primary }]}>Select New Photo</Text>
              </TouchableOpacity>
            </>
          )}
        </View>


      </ScrollView>


      {/* ID Size Modal */}
      <Modal visible={showIdSizeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Select ID Size</Text>{ID_SIZES.map((size) => (<TouchableOpacity key={size.value} style={[styles.modalOption, selectedIdSize.value === size.value && styles.modalOptionSelected]} onPress={() => { setSelectedIdSize(size); setShowIdSizeModal(false); }}><Text style={[styles.modalOptionText, selectedIdSize.value === size.value && styles.modalOptionTextSelected]}>{size.label}</Text></TouchableOpacity>))}<TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowIdSizeModal(false)}><Text style={styles.modalCloseText}>Cancel</Text></TouchableOpacity></View></View>
      </Modal>

      {/* Paper Size Modal */}
      <Modal visible={showPaperSizeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Select Paper Size</Text>{PAPER_SIZES.map((size) => (<TouchableOpacity key={size.value} style={[styles.modalOption, selectedPaperSize.value === size.value && styles.modalOptionSelected]} onPress={() => { setSelectedPaperSize(size); setShowPaperSizeModal(false); }}><Text style={[styles.modalOptionText, selectedPaperSize.value === size.value && styles.modalOptionTextSelected]}>{size.label}</Text></TouchableOpacity>))}<TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPaperSizeModal(false)}><Text style={styles.modalCloseText}>Cancel</Text></TouchableOpacity></View></View>
      </Modal>

      {/* Features Modal */}
      <Modal visible={showFeaturesModal} transparent animationType="fade">
        <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>App Features</Text><View style={styles.featuresList}><Text style={styles.featureItem}>• Multiple ID sizes (1x1, 1x1.5, 1x2, 2x2, 2x3 inches)</Text><Text style={styles.featureItem}>• Various paper sizes (A4, Letter, Long photo paper)</Text><Text style={styles.featureItem}>• Simple, precise photo positioning</Text><Text style={styles.featureItem}>• Grid overlay for perfect alignment</Text><Text style={styles.featureItem}>• Single photo or 3-photo sheet layouts</Text><Text style={styles.featureItem}>• Save directly to shareable PDF format</Text></View><TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowFeaturesModal(false)}><Text style={styles.modalCloseText}>Close</Text></TouchableOpacity></View></View>
      </Modal>

      {/* Theme Modal */}
      <Modal visible={showThemeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Background Theme</Text>
            <TouchableOpacity
              style={[styles.modalOption, theme === 'american' && { backgroundColor: '#DC143C' }]}
              onPress={async () => {
                await setTheme('american');
                setShowThemeModal(false);
              }}
            >
              <Text style={[styles.modalOptionText, theme === 'american' && styles.modalOptionTextSelected]}>
                🇺🇸 American Theme
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, theme === 'indian' && { backgroundColor: '#FF9933' }]}
              onPress={async () => {
                await setTheme('indian');
                setShowThemeModal(false);
              }}
            >
              <Text style={[styles.modalOptionText, theme === 'indian' && styles.modalOptionTextSelected]}>
                🕉️ Hindu Theme
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowThemeModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </View>
  );
}

function CroppingInterface({
  imageUri,
  displayDimensions,
  imageTransform,
  setImageTransform,
  scaleValue,
  setScaleValue,
  cropArea,
  setCropArea,
  setParentPanning,
  theme,
}: {
  imageUri: string;
  displayDimensions: DisplayDimensions;
  imageTransform: ImageTransform;
  setImageTransform: (t: ImageTransform) => void;
  scaleValue: number;
  setScaleValue: React.Dispatch<React.SetStateAction<number>>;
  cropArea: CropArea;
  setCropArea: React.Dispatch<React.SetStateAction<CropArea>>;
  setParentPanning: (panning: boolean) => void;
  theme: 'american' | 'indian';
}) {
  const startRef = useRef<{ tx: number; ty: number } | null>(null);

  const sliderMin = 0;
  const sliderMax = 100;
  const minScale = 0.5;
  const maxScale = 3;

  const sliderToScale = (val: number) => {
    const clamped = Math.max(sliderMin, Math.min(sliderMax, val));
    return minScale + (clamped / (sliderMax - sliderMin)) * (maxScale - minScale);
  };
  const scaleToSlider = (s: number) => {
    const clamped = Math.max(minScale, Math.min(maxScale, s));
    return ((clamped - minScale) / (maxScale - minScale)) * (sliderMax - sliderMin);
  };

  const [sliderValue, setSliderValue] = React.useState<number>(scaleToSlider(scaleValue));
  React.useEffect(() => { setSliderValue(scaleToSlider(scaleValue)); }, [scaleValue]);

  const sliderStartRef = useRef<{ y0: number; v0: number }>({ y0: 0, v0: 0 });
  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, gs) => Math.abs(gs.dy) > 1,
      onPanResponderGrant: (e) => {
        const pageY = (e.nativeEvent as any).pageY ?? 0;
        sliderStartRef.current = { y0: pageY, v0: sliderValue };
      },
      onPanResponderMove: (_e, gs) => {
        const newVal = sliderStartRef.current.v0 - gs.dy * 0.3;
        const clamped = Math.max(sliderMin, Math.min(sliderMax, newVal));
        setSliderValue(clamped);
        setScaleValue(sliderToScale(clamped));
      },
    })
  ).current;

  const isPointInCrop = (px: number, py: number) => {
    return px >= cropArea.x && px <= cropArea.x + cropArea.width && py >= cropArea.y && py <= cropArea.y + cropArea.height;
  };

  const imagePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e: GestureResponderEvent) => {
        const px = (e.nativeEvent as any).locationX ?? 0;
        const py = (e.nativeEvent as any).locationY ?? 0;
        return !isPointInCrop(px, py);
      },
      onMoveShouldSetPanResponder: (e: GestureResponderEvent, gs: PanResponderGestureState) => {
        const px = (e.nativeEvent as any).locationX ?? 0;
        const py = (e.nativeEvent as any).locationY ?? 0;
        if (isPointInCrop(px, py)) return false;
        return Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2;
      },
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const px = (e.nativeEvent as any).locationX ?? 0;
        const py = (e.nativeEvent as any).locationY ?? 0;
        if (isPointInCrop(px, py)) return;
        setParentPanning(true);
        startRef.current = { tx: imageTransform.translateX, ty: imageTransform.translateY };
      },
      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        const baseTX = startRef.current?.tx ?? 0;
        const baseTY = startRef.current?.ty ?? 0;
        const newTX = baseTX + gs.dx;
        const newTY = baseTY + gs.dy;
        setImageTransform({ translateX: newTX, translateY: newTY });

      },
      onPanResponderRelease: () => { setParentPanning(false); },
      onPanResponderTerminate: () => { setParentPanning(false); },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const cropPanStartRef = useRef<{ x0: number; y0: number; cx: number; cy: number }>({ x0: 0, y0: 0, cx: 0, cy: 0 });
  const cropPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, gs) => Math.abs(gs.dx) > 1 || Math.abs(gs.dy) > 1,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const pageX = (e.nativeEvent as any).pageX ?? 0;
        const pageY = (e.nativeEvent as any).pageY ?? 0;
        cropPanStartRef.current = { x0: pageX, y0: pageY, cx: cropArea.x, cy: cropArea.y };
      },
      onPanResponderMove: (_e, gs) => {
        const nx = cropPanStartRef.current.cx + gs.dx;
        const ny = cropPanStartRef.current.cy + gs.dy;
        const previewW = screenWidth - 40;
        const previewH = 300;
        const boundedX = Math.max(0, Math.min(nx, previewW - cropArea.width));
        const boundedY = Math.max(0, Math.min(ny, previewH - cropArea.height));
        setCropArea(prev => ({ ...prev, x: boundedX, y: boundedY }));
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  useEffect(() => { return () => {}; }, []);

  return (
    <View style={croppingStyles.container}>
      {/* Themed Background */}
      {theme === 'american' ? <AmericanThemedBackground /> : <IndianThemedBackground />}

      <View style={croppingStyles.imageContainer} pointerEvents="box-none" {...imagePanResponder.panHandlers}>
        <Image
          source={{ uri: imageUri }}
          style={[
            croppingStyles.image,
            {
              width: displayDimensions.width * scaleValue,
              height: displayDimensions.height * scaleValue,
              left: displayDimensions.offsetX + imageTransform.translateX,
              top: displayDimensions.offsetY + imageTransform.translateY,

            },
          ]}
          contentFit="cover"
        />
      </View>

      {/* Zoom slider outside gray area (left) */}
      <View
        style={[
          croppingStyles.sliderContainer,
          { top: 0, bottom: 0 },
        ]}
        pointerEvents="box-none"
      >
        <View
          style={croppingStyles.sliderBody}
          {...sliderPanResponder.panHandlers}
          testID="zoom-slider"
          accessible
          accessibilityLabel="Zoom slider"
        >
          <View style={croppingStyles.sliderTrack} />
          <View style={[croppingStyles.sliderFill, { height: `${sliderValue}%` }]} />
          <View style={[croppingStyles.sliderThumb, { bottom: `${sliderValue}%` }]} />
          <View style={croppingStyles.sliderLabels} pointerEvents="none">
            <Text style={croppingStyles.sliderLabelText}>100</Text>
            <Text style={croppingStyles.sliderLabelText}>0</Text>
          </View>
        </View>
      </View>

      <View style={croppingStyles.overlay} pointerEvents="none">
        <View style={[croppingStyles.overlayPart, { height: Math.max(0, cropArea.y) }]} />
        <View style={croppingStyles.overlayRow}>
          <View style={[croppingStyles.overlayPart, { width: Math.max(0, cropArea.x), height: cropArea.height }]} />
          <View style={[croppingStyles.cropTransparent, { width: cropArea.width, height: cropArea.height }]} />
          <View style={[croppingStyles.overlayPart, { width: Math.max(0, screenWidth - 40 - cropArea.x - cropArea.width), height: cropArea.height }]} />
        </View>
        <View style={[croppingStyles.overlayPart, { height: Math.max(0, 300 - cropArea.y - cropArea.height) }]} />
      </View>

      <View style={[croppingStyles.cropArea, { left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height }]} pointerEvents="box-only" {...cropPanResponder.panHandlers}>
        <View style={croppingStyles.gridContainer}>
          <View style={[croppingStyles.gridLine, { left: '33%' }]} />
          <View style={[croppingStyles.gridLine, { left: '66%' }]} />
          <View style={[croppingStyles.gridLine, croppingStyles.gridLineHorizontal, { top: '33%' }]} />
          <View style={[croppingStyles.gridLine, croppingStyles.gridLineHorizontal, { top: '66%' }]} />
        </View>
      </View>
    </View>
  );
}

const croppingStyles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  imageContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  image: { position: 'absolute' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  overlayPart: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  overlayRow: { flexDirection: 'row' },
  cropTransparent: { backgroundColor: 'transparent' },
  cropArea: { position: 'absolute', borderWidth: 2, borderColor: '#0000FF', borderStyle: 'solid' },
  gridContainer: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: 1, height: '100%' },
  gridLineHorizontal: { width: '100%', height: 1 },
  sliderContainer: { position: 'absolute', left: 6, width: 48, zIndex: 20, justifyContent: 'center', alignItems: 'center' },
  sliderBody: { position: 'absolute', top: 10, bottom: 10, width: 40, alignItems: 'center', justifyContent: 'flex-end' },
  sliderTrack: { position: 'absolute', left: 16, right: 16, top: 0, bottom: 0, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.2)' },
  sliderFill: { position: 'absolute', left: 16, right: 16, bottom: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#0000FF' },
  sliderThumb: { position: 'absolute', left: 6, right: 6, height: 20, borderRadius: 10, backgroundColor: '#DC143C', borderWidth: 2, borderColor: '#fff', transform: [{ translateY: 10 }] },
  sliderLabels: { position: 'absolute', top: -18, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 },
  sliderLabelText: { color: '#0000FF', fontSize: 10, fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  backgroundOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  scrollView: { flex: 1 },
  header: { backgroundColor: 'rgba(255, 255, 255, 0.92)', paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#e9ecef', position: 'relative' },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  flagContainer: { marginRight: 15 },
  flag: { width: 40, height: 24, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd', flexDirection: 'column', position: 'relative' },
  americanStripe: { flex: 1, width: '100%' },
  americanCanton: { position: 'absolute', top: 0, left: 0, width: '45%', height: '60%', backgroundColor: '#0000FF' },
  miniStar: { position: 'absolute', width: 2, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1 },
  indianFlagSaffron: { flex: 1, backgroundColor: '#FF9933' },
  indianFlagWhite: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  indianFlagGreen: { flex: 1, backgroundColor: '#138808' },
  miniChakra: { width: 8, height: 8, borderRadius: 4, borderWidth: 0.5, borderColor: '#000080', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  miniSpoke: { position: 'absolute', width: 0.5, height: 3.5, backgroundColor: '#000080', top: '50%', left: '50%', marginLeft: -0.25, marginTop: -1.75 },
  miniChakraCenter: { width: 1, height: 1, borderRadius: 0.5, backgroundColor: '#000080' },
  titleContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0038A8', marginBottom: 2 },
  subtitle: { fontSize: 14, color: '#666' },
  heartButton: { position: 'absolute', top: 20, right: 20, padding: 5 },
  instructionBanner: { backgroundColor: '#fff3cd', marginHorizontal: 20, marginBottom: 15, padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#ffc107' },
  bannerText: { fontSize: 14, color: '#856404', fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  themeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginBottom: 15, paddingVertical: 12, paddingHorizontal: 15, backgroundColor: 'rgba(255, 255, 255, 0.92)', borderRadius: 12, borderWidth: 1, borderColor: '#dee2e6', gap: 8 },
  themeButtonText: { fontSize: 14, fontWeight: '600', color: '#0038A8' },
  featuresButton: { margin: 20, borderRadius: 12, overflow: 'hidden' },
  featuresGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 20 },
  featuresButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  sizeSection: { backgroundColor: 'rgba(255, 255, 255, 0.92)', marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 20 },
  sizeRow: { flexDirection: 'row', gap: 15 },
  sizeColumn: { flex: 1 },
  sizeLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
  dropdownText: { fontSize: 14, color: '#333', flex: 1 },
  previewSection: { backgroundColor: 'rgba(255, 255, 255, 0.92)', marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 20 },
  previewTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 15 },
  previewContainer: { alignItems: 'center' },
  previewBox: { width: '100%', height: 300, backgroundColor: '#f8f9fa', borderWidth: 2, borderColor: '#dee2e6', borderStyle: 'dashed', borderRadius: 8, position: 'relative', overflow: 'hidden' },
  placeholderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gridOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  gridLine: { position: 'absolute', backgroundColor: '#0000FF', opacity: 0.3, width: 1, height: '100%', left: '50%', marginLeft: -0.5 },
  gridLineHorizontal: { width: '100%', height: 1, top: '50%', left: 0, marginTop: -0.5 },
  watermark: { position: 'absolute', top: 10, right: 10, opacity: 0.3 },
  watermarkText: { fontSize: 8, fontWeight: 'bold', color: '#0000FF', textAlign: 'center' },
  previewPlaceholder: { fontSize: 14, color: '#666', textAlign: 'center' },
  cropInstructions: { marginTop: 10, paddingHorizontal: 10 },
  instructionText: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 16 },
  actionSection: { paddingHorizontal: 20, paddingBottom: 30, gap: 15 },
  actionButtonWrapper: { borderRadius: 12, overflow: 'hidden' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  actionButtonSecondary: { backgroundColor: 'rgba(255, 255, 255, 0.92)', borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 10 },
  actionButtonSecondaryText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, margin: 20, maxHeight: '80%', minWidth: 300, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  modalOption: { paddingVertical: 15, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  modalOptionSelected: { backgroundColor: '#0000FF' },
  modalOptionText: { fontSize: 16, color: '#333' },
  modalOptionTextSelected: { color: 'white', fontWeight: '600' },
  modalCloseButton: { marginTop: 20, paddingVertical: 12, alignItems: 'center' },
  modalCloseText: { fontSize: 16, color: '#666', fontWeight: '600' },
  featuresList: { gap: 12 },
  featureItem: { fontSize: 16, color: '#333', lineHeight: 24 },
});
