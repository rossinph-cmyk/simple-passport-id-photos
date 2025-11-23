import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface DisplayDimensions {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

interface ContainerLayout {
  width: number;
  height: number;
  x: number;
  y: number;
}

export default function CropScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState<DisplayDimensions>({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
  const containerRef = useRef<View | null>(null);
  const [containerOffset, setContainerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [containerLayout, setContainerLayout] = useState<ContainerLayout | null>(null);
  const lastLayoutRef = useRef<ContainerLayout | null>(null);
  const lastOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [cropArea, setCropArea] = useState<CropArea>({
    x: (screenWidth - 240) / 2 - 60,
    y: (screenHeight - 240) / 2,
    width: 240,
    height: 240,
  });

  const [imageTranslate, setImageTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scaleValue, setScaleValue] = useState<number>(1);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const translateRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x0: number; y0: number; tx: number; ty: number }>({ x0: 0, y0: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const loadImage = async () => {
      if (!imageUri || !containerLayout) return;
      try {
        if (Platform.OS !== 'web') {
          try {
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
              Alert.alert('Image Not Found', 'The selected image could not be found. Please select a new image.', [
                { text: 'Select New Image', onPress: () => router.replace('/') },
              ]);
              return;
            }
          } catch (err) {
            
          }
        }

        const containerWidth = containerLayout.width;
        const containerHeight = containerLayout.height;

        if (Platform.select({ web: true, default: false })) {
          const img = new window.Image();
          img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let displayWidth = containerWidth;
            let displayHeight = containerWidth / aspectRatio;
            let offsetX = 0;
            let offsetY = (containerHeight - displayHeight) / 2;
            if (displayHeight > containerHeight) {
              displayHeight = containerHeight;
              displayWidth = containerHeight * aspectRatio;
              offsetX = (containerWidth - displayWidth) / 2;
            } else {
              offsetY = (containerHeight - displayHeight) / 2;
            }
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            setDisplayDimensions({ width: displayWidth, height: displayHeight, offsetX, offsetY });
            const cropSize = Math.min(240, containerWidth * 0.7, containerHeight * 0.7);
            setCropArea({
              x: Math.max(0, (containerWidth - cropSize) / 2 - 60),
              y: (containerHeight - cropSize) / 2,
              width: cropSize,
              height: cropSize,
            });
            setImageLoaded(true);
          };
          img.onerror = () => {
            Alert.alert('Error', 'Failed to load image. Please try again.');
            router.back();
          };
          img.src = imageUri;
        } else {
          try {
            const info = await ImageManipulator.manipulateAsync(imageUri, [], { format: ImageManipulator.SaveFormat.JPEG });
            const aspectRatio = info.width / info.height;
            let displayWidth = containerWidth;
            let displayHeight = containerWidth / aspectRatio;
            let offsetX = 0;
            let offsetY = (containerHeight - displayHeight) / 2;
            if (displayHeight > containerHeight) {
              displayHeight = containerHeight;
              displayWidth = containerHeight * aspectRatio;
              offsetX = (containerWidth - displayWidth) / 2;
            } else {
              offsetY = (containerHeight - displayHeight) / 2;
            }
            setImageDimensions({ width: info.width, height: info.height });
            setDisplayDimensions({ width: displayWidth, height: displayHeight, offsetX, offsetY });
            const cropSize = Math.min(240, containerWidth * 0.7, containerHeight * 0.7);
            setCropArea({
              x: Math.max(0, (containerWidth - cropSize) / 2 - 60),
              y: (containerHeight - cropSize) / 2,
              width: cropSize,
              height: cropSize,
            });
            setImageLoaded(true);
          } catch (_e) {
            const displayWidth = containerWidth;
            const displayHeight = containerHeight;
            const offsetX = (containerWidth - displayWidth) / 2;
            const offsetY = (containerHeight - displayHeight) / 2;
            setDisplayDimensions({ width: displayWidth, height: displayHeight, offsetX, offsetY });
            const cropSize = Math.min(240, containerWidth * 0.7, containerHeight * 0.7);
            setCropArea({
              x: Math.max(0, (containerWidth - cropSize) / 2 - 60),
              y: (containerHeight - cropSize) / 2,
              width: cropSize,
              height: cropSize,
            });
            setImageLoaded(true);
          }
        }
      } catch (error) {
        Alert.alert('Image Loading Error', 'There was a problem loading the image. Please try selecting a different image.', [
          { text: 'Try Again', onPress: () => router.replace('/') },
        ]);
      }
    };
    loadImage();
  }, [imageUri, containerLayout]);

  const isPointInCrop = (px: number, py: number) => {
    const cx = px;
    const cy = py;
    return cx >= cropArea.x && cx <= cropArea.x + cropArea.width && cy >= cropArea.y && cy <= cropArea.y + cropArea.height;
  };

  const imagePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e: GestureResponderEvent) => {
        const px = (e.nativeEvent as any).locationX ?? 0;
        const py = (e.nativeEvent as any).locationY ?? 0;
        const insideCrop = isPointInCrop(px, py);
        return !insideCrop;
      },
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (e: GestureResponderEvent, gs: PanResponderGestureState) => {
        const px = (e.nativeEvent as any).locationX ?? 0;
        const py = (e.nativeEvent as any).locationY ?? 0;
        const insideCrop = isPointInCrop(px, py);
        if (insideCrop) return false;
        return Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        const px = (e.nativeEvent as any).locationX ?? 0;
        const py = (e.nativeEvent as any).locationY ?? 0;
        const insideCrop = isPointInCrop(px, py);
        if (insideCrop) return;
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
        panStartRef.current = { x0: px, y0: py, tx: translateRef.current.x, ty: translateRef.current.y };
      },
      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        const nx = panStartRef.current.tx + gs.dx;
        const ny = panStartRef.current.ty + gs.dy;
        translateRef.current = { x: nx, y: ny };
        setImageTranslate({ x: nx, y: ny });
      },
      onPanResponderRelease: () => {
        setImageTranslate({ x: translateRef.current.x, y: translateRef.current.y });
      },
      onPanResponderTerminate: () => {
        setImageTranslate({ x: translateRef.current.x, y: translateRef.current.y });
      },
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  const cropPanStartRef = useRef<{ x0: number; y0: number; cx: number; cy: number }>({ x0: 0, y0: 0, cx: 0, cy: 0 });
  const cropPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true;
      },
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        return Math.abs(gs.dx) > 1 || Math.abs(gs.dy) > 1;
      },
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
        const pageX = (e.nativeEvent as any).pageX ?? 0;
        const pageY = (e.nativeEvent as any).pageY ?? 0;
        cropPanStartRef.current = { x0: pageX, y0: pageY, cx: cropArea.x, cy: cropArea.y };
      },
      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        const nx = cropPanStartRef.current.cx + gs.dx;
        const ny = cropPanStartRef.current.cy + gs.dy;
        const cW = containerLayout?.width ?? screenWidth;
        const cH = containerLayout?.height ?? screenHeight;
        const boundedX = Math.max(0, Math.min(nx, cW - cropArea.width));
        const boundedY = Math.max(0, Math.min(ny, cH - cropArea.height));
        setCropArea(prev => ({ ...prev, x: boundedX, y: boundedY }));
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  const scaledDims = useMemo(() => ({
    width: displayDimensions.width * scaleValue,
    height: displayDimensions.height * scaleValue,
  }), [displayDimensions.width, displayDimensions.height, scaleValue]);

  const sliderMin = 0;
  const sliderMax = 100;
  const minScale = 0.5;
  const maxScale = 3;

  const sliderToScale = (val: number) => {
    const clamped = Math.max(sliderMin, Math.min(sliderMax, val));
    const s = minScale + (clamped / (sliderMax - sliderMin)) * (maxScale - minScale);
    return s;
  };

  const scaleToSlider = (s: number) => {
    const clamped = Math.max(minScale, Math.min(maxScale, s));
    const v = ((clamped - minScale) / (maxScale - minScale)) * (sliderMax - sliderMin);
    return v;
  };

  useEffect(() => {
    setSliderValue(scaleToSlider(scaleValue));
  }, [scaleValue]);

  const sliderStartRef = useRef<{ y0: number; v0: number }>({ y0: 0, v0: 0 });
  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, gs) => Math.abs(gs.dy) > 1,
      onPanResponderGrant: (e) => {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
        const pageY = (e.nativeEvent as any).pageY ?? 0;
        sliderStartRef.current = { y0: pageY, v0: sliderValue };
      },
      onPanResponderMove: (_e, gs) => {
        const newVal = sliderStartRef.current.v0 - gs.dy * 0.3;
        const clamped = Math.max(sliderMin, Math.min(sliderMax, newVal));
        if (clamped !== sliderValue) {
          setSliderValue(clamped);
        }
        const newScale = sliderToScale(clamped);
        setScaleValue((prev) => (prev !== newScale ? newScale : prev));
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleCropConfirm = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      let actualImageWidth: number;
      let actualImageHeight: number;
      if (Platform.select({ web: true, default: false }) && imageDimensions.width > 0) {
        actualImageWidth = imageDimensions.width;
        actualImageHeight = imageDimensions.height;
      } else {
        const imageInfo = await ImageManipulator.manipulateAsync(imageUri!, [], { format: ImageManipulator.SaveFormat.JPEG });
        actualImageWidth = imageInfo.width;
        actualImageHeight = imageInfo.height;
      }

      const scaledWidth = displayDimensions.width * scaleValue;
      const scaledHeight = displayDimensions.height * scaleValue;
      const displayedLeft = displayDimensions.offsetX + (translateRef.current.x ?? imageTranslate.x);
      const displayedTop = displayDimensions.offsetY + (translateRef.current.y ?? imageTranslate.y);

      const relativeX = (cropArea.x - displayedLeft) / scaledWidth;
      const relativeY = (cropArea.y - displayedTop) / scaledHeight;
      const relativeWidth = cropArea.width / scaledWidth;
      const relativeHeight = cropArea.height / scaledHeight;

      let finalCropX = Math.round(relativeX * actualImageWidth);
      let finalCropY = Math.round(relativeY * actualImageHeight);
      let finalCropWidth = Math.round(relativeWidth * actualImageWidth);
      let finalCropHeight = Math.round(relativeHeight * actualImageHeight);

      finalCropX = Math.max(0, Math.min(finalCropX, actualImageWidth - 10));
      finalCropY = Math.max(0, Math.min(finalCropY, actualImageHeight - 10));
      finalCropWidth = Math.max(10, Math.min(finalCropWidth, actualImageWidth - finalCropX));
      finalCropHeight = Math.max(10, Math.min(finalCropHeight, actualImageHeight - finalCropY));

      router.push({
        pathname: '/preview',
        params: {
          imageUri,
          cropX: finalCropX.toString(),
          cropY: finalCropY.toString(),
          cropWidth: finalCropWidth.toString(),
          cropHeight: finalCropHeight.toString(),
          originalWidth: actualImageWidth.toString(),
          originalHeight: actualImageHeight.toString(),
        },
      });
    } catch (_err) {
      Alert.alert('Error', 'Failed to process crop parameters. Please try again.');
    }
  };

  const goBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    router.back();
  };

  if (!imageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No image selected</Text>
          <TouchableOpacity style={styles.errorButton} onPress={goBack}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!imageLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading image...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={goBack} testID="btn-back">
          <X color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reposition Photo</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleCropConfirm} testID="btn-confirm">
          <Check color="white" size={24} />
        </TouchableOpacity>
      </View>

      <View
        style={styles.imageContainer}
        testID="image-pan-surface"
        collapsable={false}
        ref={containerRef}
        {...imagePanResponder.panHandlers}
        onLayout={(e) => {
          try {
            const { x, y, width, height } = e.nativeEvent.layout;
            if (!lastLayoutRef.current ||
                lastLayoutRef.current.x !== x ||
                lastLayoutRef.current.y !== y ||
                lastLayoutRef.current.width !== width ||
                lastLayoutRef.current.height !== height) {
              const nextLayout = { x, y, width, height } as const;
              setContainerLayout(nextLayout);
              lastLayoutRef.current = nextLayout;

              containerRef.current?.measureInWindow?.((wx: number, wy: number) => {
                const nx = (wx ?? 0);
                const ny = (wy ?? 0);
                if (!lastOffsetRef.current || lastOffsetRef.current.x !== nx || lastOffsetRef.current.y !== ny) {
                  const nextOffset = { x: nx, y: ny } as const;
                  setContainerOffset(nextOffset);
                  lastOffsetRef.current = nextOffset;
                }
              });
            }
          } catch (er) {
            
          }
        }}
      >
        <View
          style={[
            styles.imageWrapper,
            {
              width: scaledDims.width,
              height: scaledDims.height,
              left: displayDimensions.offsetX + imageTranslate.x,
              top: displayDimensions.offsetY + imageTranslate.y,
            },
          ]}
          testID="image-wrapper"
          accessible
          accessibilityLabel="Draggable image area"
          collapsable={false}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            pointerEvents="none"
            onError={(error) => {
              Alert.alert('Display Error', 'Cannot display the selected image.');
            }}
          />
        </View>

        <View
          style={[
            styles.sliderContainer,
            { top: (containerLayout?.height ?? screenHeight) * 0.1, height: (containerLayout?.height ?? screenHeight) * 0.8 },
          ]}
          {...sliderPanResponder.panHandlers}
          testID="zoom-slider"
          accessible
          accessibilityLabel="Zoom slider"
        >
          <View style={styles.sliderTrack} />
          <View style={[styles.sliderFill, { height: `${sliderValue}%` }]} />
          <View style={[styles.sliderThumb, { bottom: `${sliderValue}%` }]} />
          <View style={styles.sliderLabels} pointerEvents="none">
            <Text style={styles.sliderLabelText}>100</Text>
            <Text style={styles.sliderLabelText}>0</Text>
          </View>
        </View>

        <View style={styles.overlay} pointerEvents="none">
          <View style={[styles.overlayPart, { height: Math.max(0, cropArea.y) }]} />
          <View style={styles.overlayRow}>
            <View style={[styles.overlayPart, { width: Math.max(0, cropArea.x), height: cropArea.height }]} />
            <View style={[styles.cropTransparent, { width: cropArea.width, height: cropArea.height }]} />
            <View style={[styles.overlayPart, { width: Math.max(0, (containerLayout?.width ?? screenWidth) - cropArea.x - cropArea.width), height: cropArea.height }]} />
          </View>
          <View style={[styles.overlayPart, { height: Math.max(0, (containerLayout?.height ?? screenHeight) - cropArea.y - cropArea.height) }]} />
        </View>

        <View
          style={[
            styles.cropArea,
            { left: cropArea.x, top: cropArea.y, width: cropArea.width, height: cropArea.height },
          ]}
          {...cropPanResponder.panHandlers}
          pointerEvents="box-only"
          testID="crop-frame"
          accessible
          accessibilityLabel="Movable crop frame"
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <View style={styles.gridContainer}>
            <View style={[styles.gridLine, { left: '33%' }]} />
            <View style={[styles.gridLine, { left: '66%' }]} />
            <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33%' }]} />
            <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66%' }]} />
          </View>
          <View style={styles.centerIndicator} />
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>Drag the photo with one finger to reposition the background</Text>
        <Text style={styles.instructionSubtext}>Drag the blue square to move the crop box. Use the left slider to zoom.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  imageWrapper: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  sliderContainer: {
    position: 'absolute',
    left: 12,
    width: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  sliderTrack: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sliderFill: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#0038A8',
  },
  sliderThumb: {
    position: 'absolute',
    left: 6,
    right: 6,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CE1126',
    borderWidth: 2,
    borderColor: 'white',
    transform: [{ translateY: 12 }],
  },
  sliderLabels: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  overlayPart: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayRow: {
    flexDirection: 'row',
  },
  cropArea: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#0038A8',
    borderStyle: 'solid',
    zIndex: 10,
  },
  gridContainer: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 1,
  },
  centerIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 8,
    height: 8,
    backgroundColor: '#CE1126',
    borderRadius: 4,
    marginTop: -4,
    marginLeft: -4,
    opacity: 0.8,
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  instructionSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#0038A8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  cropTransparent: {
    backgroundColor: 'transparent',
  },
});