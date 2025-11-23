import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Download, Image as ImageIcon } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const isWeb = Platform.select({ web: true, default: false });
const isNative = Platform.select({ web: false, default: true });

// ID and Paper size configurations
const ID_SIZES = [
  { label: '1x1 inch', value: '1x1', widthInch: 1, heightInch: 1 },
  { label: '1x1.5 inch', value: '1x1.5', widthInch: 1, heightInch: 1.5 },
  { label: '1x2 inch', value: '1x2', widthInch: 1, heightInch: 2 },
  { label: '2x2 inch', value: '2x2', widthInch: 2, heightInch: 2 },
  { label: '2x3 inch', value: '2x3', widthInch: 2, heightInch: 3 },
];

const PAPER_SIZES = [
  { label: 'A4', value: 'A4', widthInch: 8.27, heightInch: 11.69 },
  { label: 'Letter', value: 'Letter', widthInch: 8.5, heightInch: 11 },
  { label: 'Long', value: 'Long', widthInch: 4, heightInch: 12 },
];

export default function PreviewScreen() {
  const { imageUri, cropX, cropY, cropWidth, cropHeight, originalWidth, originalHeight, idSize, paperSize, previewType } = useLocalSearchParams<{
    imageUri: string;
    cropX: string;
    cropY: string;
    cropWidth: string;
    cropHeight: string;
    originalWidth?: string;
    originalHeight?: string;
    idSize?: string;
    paperSize?: string;
    previewType?: string;
  }>();


  const [croppedImageUri, setCroppedImageUri] = useState<string | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(true);

  const cropImage = useCallback(async () => {
    if (!imageUri || !cropX || !cropY || !cropWidth || !cropHeight) {
      setIsProcessingCrop(false);
      return;
    }

    try {
      const cropParams = {
        originX: Math.max(0, parseInt(cropX)),
        originY: Math.max(0, parseInt(cropY)),
        width: Math.max(50, parseInt(cropWidth)),
        height: Math.max(50, parseInt(cropHeight)),
      };
      


      if (isWeb) {
        // For web, we'll handle cropping in the WebCroppedImage component
        setCroppedImageUri(imageUri);
        setIsProcessingCrop(false);
      } else {
        // For mobile, use ImageManipulator with better error handling
        try {
          // First, check if the image file exists
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          if (!fileInfo.exists) {

            Alert.alert(
              'Image Not Found',
              'The selected image could not be found. Please select a new image.',
              [
                {
                  text: 'Select New Image',
                  onPress: () => router.replace('/')
                }
              ]
            );
            return;
          }
          
          // Use provided original dimensions or get them from the image
          let actualWidth: number;
          let actualHeight: number;
          
          if (originalWidth && originalHeight) {
            actualWidth = parseInt(originalWidth);
            actualHeight = parseInt(originalHeight);

          } else {
            // Get actual image dimensions
            const imageInfo = await ImageManipulator.manipulateAsync(
              imageUri,
              [],
              { format: ImageManipulator.SaveFormat.JPEG }
            );
            actualWidth = imageInfo.width;
            actualHeight = imageInfo.height;

          }
          
          // Use the crop parameters directly as they should already be calculated correctly
          const safeCropParams = {
            originX: Math.max(0, Math.min(cropParams.originX, actualWidth - 10)),
            originY: Math.max(0, Math.min(cropParams.originY, actualHeight - 10)),
            width: Math.max(10, Math.min(cropParams.width, actualWidth - cropParams.originX)),
            height: Math.max(10, Math.min(cropParams.height, actualHeight - cropParams.originY)),
          };
          

          
          const result = await ImageManipulator.manipulateAsync(
            imageUri,
            [
              {
                crop: safeCropParams,
              },
            ],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );
          

          setCroppedImageUri(result.uri);
          setIsProcessingCrop(false);
        } catch (manipulatorError) {

          // Check if it's a file not found error
          if (manipulatorError instanceof Error && manipulatorError.message && 
              (manipulatorError.message.includes('Could not load the image') || 
               manipulatorError.message.includes('Loading bitmap failed'))) {
            Alert.alert(
              'Image Processing Error',
              'The image file could not be processed. It may have been moved or deleted. Please select a new image.',
              [
                {
                  text: 'Select New Image',
                  onPress: () => router.replace('/')
                }
              ]
            );
            return;
          }
          // Fallback: use original image if cropping fails for other reasons

          setCroppedImageUri(imageUri);
          setIsProcessingCrop(false);
        }
      }
    } catch (error) {

      Alert.alert(
        'Processing Error',
        'There was an error processing the image. Please try again with a different image.',
        [
          {
            text: 'Try Again',
            onPress: () => router.replace('/')
          }
        ]
      );
    }
  }, [imageUri, cropX, cropY, cropWidth, cropHeight, originalWidth, originalHeight]);

  useEffect(() => {
    cropImage();
  }, [cropImage]);



  const handleSave = async (type: 'single' | 'sheet') => {
    if (!type?.trim() || type.length > 10) {

      return;
    }
    
    // Request permissions for mobile platforms
    if (isNative) {
      try {
        // First check current permission status
        const currentPermissions = await MediaLibrary.getPermissionsAsync();

        
        let finalPermissions = currentPermissions;
        
        // If not granted, request permissions
        if (currentPermissions.status !== 'granted') {
          finalPermissions = await MediaLibrary.requestPermissionsAsync();
        }
        
        // Check if we have the required permissions
        if (finalPermissions.status !== 'granted') {

          
          let message = 'This app needs permission to save photos to your gallery.';
          if (finalPermissions.canAskAgain === false) {
            message += ' Please enable gallery permissions in your device settings.';
          }
          
          Alert.alert(
            'Permission Required',
            message,
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: finalPermissions.canAskAgain ? 'Try Again' : 'OK',
                onPress: finalPermissions.canAskAgain ? () => handleSave(type) : undefined
              }
            ]
          );
          return;
        }
        

      } catch (permissionError) {

        const errorMessage = permissionError instanceof Error ? permissionError.message : 'Unknown error';
        Alert.alert(
          'Permission Error',
          `Unable to access gallery permissions: ${errorMessage}. Please check your device settings.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (isNative) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        
      }
    }

    (async () => {
      try {
        if (!croppedImageUri) {
          Alert.alert('Error', 'No processed image available to save.');
          return;
        }
        


        let finalImageUri = croppedImageUri;
        
        if (type === 'single') {
          if (isWeb) {
            await createSinglePhotoPDFWeb(croppedImageUri);
            return;
          } else {
            const pdfUri = await createSinglePhotoPDF(croppedImageUri);
            try {
              const canShare = await Sharing.isAvailableAsync();
              if (canShare) {
                await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf' });
              } else {
                Alert.alert('Saved PDF', 'Your single photo PDF is ready.', [{ text: 'OK' }]);
              }
            } catch (shareErr) {

            }
            return;
          }
        } else if (type === 'sheet') {
          if (isWeb) {
            await createPhotoSheetPDFWeb(croppedImageUri);
            return;
          } else {
            const pdfUri = await createPhotoSheetPDF(croppedImageUri);
            try {
              const canShare = await Sharing.isAvailableAsync();
              if (canShare) {
                await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf' });
              } else {
                Alert.alert('Saved PDF', 'Your 3-photo sheet PDF is ready.', [{ text: 'OK' }]);
              }
            } catch (shareErr) {

            }
            return; // Stop further image saving flow for PDF path
          }
        }

        if (isWeb) {
          // Web flow handled above by creating/printing a PDF page
          return;
        } else {
          // Save to gallery with better error handling
          try {

            
            // Check if the file exists before trying to save
            const fileInfo = await FileSystem.getInfoAsync(finalImageUri);
            if (!fileInfo.exists) {
              throw new Error('Generated image file does not exist');
            }
            

            
            // Save the final image to gallery
            const asset = await MediaLibrary.createAssetAsync(finalImageUri);

            
            // Try to create album, but don't fail if it already exists
            try {
              await MediaLibrary.createAlbumAsync('Photo ID Maker 2', asset, false);

            } catch (albumError) {

            }
            

          } catch (saveError) {

            const errorMessage = saveError instanceof Error ? saveError.message : 'Unknown error';
            throw new Error(`Failed to save image to gallery: ${errorMessage}`);
          }
        }
        
        if (isNative) {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {
            
          }
        }
        
        const message = type === 'single' 
          ? 'Your single photo PDF is ready to share.'
          : 'Your 3-photo sheet PDF is ready to share.';
            
        Alert.alert(
          'Saved Successfully!',
          message,
          [
            {
              text: 'Take Another',
              onPress: () => router.push('/'),
            },
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      } catch (error) {

        Alert.alert(
          'Save Error',
          'Failed to save the image to your gallery. Please try again.',
          [{ text: 'OK' }]
        );
      }
    })();
  };

  const createSinglePhotoWithBackground = async (imageUri: string): Promise<string> => {
    try {
      // Get selected ID size
      const selectedIdSize = ID_SIZES.find(size => size.value === idSize) || ID_SIZES[0];
      const selectedPaperSize = PAPER_SIZES.find(size => size.value === paperSize) || PAPER_SIZES[0];
      
      // Calculate pixels (assuming 300 DPI for print quality)
      const DPI = 300;
      const idWidthPx = Math.round(selectedIdSize.widthInch * DPI);
      const idHeightPx = Math.round(selectedIdSize.heightInch * DPI);
      const paperWidthPx = Math.round(selectedPaperSize.widthInch * DPI);
      const paperHeightPx = Math.round(selectedPaperSize.heightInch * DPI);
      
      if (isWeb) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          return imageUri;
        }
        
        // Set canvas size to paper dimensions
        canvas.width = paperWidthPx;
        canvas.height = paperHeightPx;
        
        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, paperWidthPx, paperHeightPx);
        
        // Load and draw the image centered
        return new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            // Center the photo on the canvas
            const x = (paperWidthPx - idWidthPx) / 2;
            const y = (paperHeightPx - idHeightPx) / 2;
            
            // Draw the image at ID size
            ctx.drawImage(img, 0, 0, img.width, img.height, x, y, idWidthPx, idHeightPx);
            
            // Add a subtle border
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, idWidthPx, idHeightPx);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve(dataUrl);
          };
          
          img.onerror = () => {
            resolve(imageUri);
          };
          
          img.src = imageUri;
        });
      } else {
        // For mobile, resize to ID size
        const result = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            {
              resize: { width: idWidthPx, height: idHeightPx },
            },
          ],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
      }
    } catch (error) {

      return imageUri;
    }
  };

  const createSinglePhotoPDF = async (processedImageUri: string): Promise<string> => {
    const selectedId = ID_SIZES.find(size => size.value === idSize) || ID_SIZES[0];
    const selectedPaper = PAPER_SIZES.find(size => size.value === paperSize) || PAPER_SIZES[0];
    const DPI = 300;
    const idWIn = selectedId.widthInch;
    const idHIn = selectedId.heightInch;
    const paperWIn = selectedPaper.widthInch;
    const paperHIn = selectedPaper.heightInch;

    const base64 = await convertImageToBase64(processedImageUri);
    const imgData = `data:image/jpeg;base64,${base64}`;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <style>
      @page { size: ${paperWIn}in ${paperHIn}in; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .page { position: relative; width: ${paperWIn}in; height: ${paperHIn}in; background: #ffffff; }
      .photo { position: absolute; left: ${(paperWIn - idWIn)/2}in; top: ${(paperHIn - idHIn)/2}in; width: ${idWIn}in; height: ${idHIn}in; border: 0.01in solid #e0e0e0; }
    </style>
  </head>
  <body>
    <div class=\"page\">
      <img class=\"photo\" src=\"${imgData}\" />
    </div>
  </body>
</html>`;

    const { uri } = await Print.printToFileAsync({ html });

    return uri;
  };

  const createSinglePhotoPDFWeb = async (processedImageUri: string) => {
    try {
      const selectedId = ID_SIZES.find(size => size.value === idSize) || ID_SIZES[0];
      const selectedPaper = PAPER_SIZES.find(size => size.value === paperSize) || PAPER_SIZES[0];
      const DPI = 300;
      const idWIn = selectedId.widthInch;
      const idHIn = selectedId.heightInch;
      const paperWIn = selectedPaper.widthInch;
      const paperHIn = selectedPaper.heightInch;

      let imgSrc = processedImageUri;
      // If it's a local blob url, we can't read; try drawing to canvas to get dataURL
      if (!/^data:image\//.test(imgSrc)) {
        const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new window.Image();
          (i as any).crossOrigin = 'anonymous';
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = src;
        });
        try {
          const img = await loadImg(processedImageUri);
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const ctx = c.getContext('2d');
          if (ctx) { ctx.drawImage(img, 0, 0); imgSrc = c.toDataURL('image/jpeg', 0.92); }
        } catch (_e) {}
      }

      const html = `<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <title>PH-ID Single Photo PDF</title>
    <style>
      @page { size: ${paperWIn}in ${paperHIn}in; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .page { position: relative; width: ${paperWIn}in; height: ${paperHIn}in; background: #ffffff; }
      .photo { position: absolute; left: ${(paperWIn - idWIn)/2}in; top: ${(paperHIn - idHIn)/2}in; width: ${idWIn}in; height: ${idHIn}in; border: 0.01in solid #e0e0e0; }
      @media print { .print-btn { display: none; } }
    </style>
  </head>
  <body>
    <div class=\"page\">
      <img class=\"photo\" src=\"${imgSrc}\" />
    </div>
    <button class=\"print-btn\" onclick=\"window.print()\" style=\"position:fixed;right:16px;bottom:16px;padding:12px 16px;font-size:16px;\">Print/Save as PDF</button>
  </body>
</html>`;
      const w = window.open('', '_blank');
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    } catch (e) {
      
    }
  };

  const createPhotoSheetPDFWeb = async (processedImageUri: string) => {
    try {
      const selectedId = ID_SIZES.find(size => size.value === idSize) || ID_SIZES[0];
      const selectedPaper = PAPER_SIZES.find(size => size.value === paperSize) || PAPER_SIZES[0];
      const DPI = 300;
      const idWIn = selectedId.widthInch;
      const idHIn = selectedId.heightInch;
      const paperWIn = selectedPaper.widthInch;
      const paperHIn = selectedPaper.heightInch;
      const padIn = 0.2;

      let imgSrc = processedImageUri;
      if (!/^data:image\//.test(imgSrc)) {
        const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new window.Image();
          (i as any).crossOrigin = 'anonymous';
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = src;
        });
        try {
          const img = await loadImg(processedImageUri);
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const ctx = c.getContext('2d');
          if (ctx) { ctx.drawImage(img, 0, 0); imgSrc = c.toDataURL('image/jpeg', 0.92); }
        } catch (_e) {}
      }

      const startXIn = (paperWIn - idWIn)/2;
      const totalHIn = 3 * idHIn + 2 * padIn;
      const startYIn = (paperHIn - totalHIn)/2;

      const imgTags = [0,1,2].map(i => {
        const topIn = startYIn + i * (idHIn + padIn);
        return `<img src=\"${imgSrc}\" style=\"position:absolute;left:${startXIn}in;top:${topIn}in;width:${idWIn}in;height:${idHIn}in;border:0.01in solid #e0e0e0;\"/>`;
      }).join('');

      const html = `<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <title>PH-ID 3 Photo Sheet PDF</title>
    <style>
      @page { size: ${paperWIn}in ${paperHIn}in; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .page { position: relative; width: ${paperWIn}in; height: ${paperHIn}in; background: #ffffff; }
      @media print { .print-btn { display: none; } }
    </style>
  </head>
  <body>
    <div class=\"page\">${imgTags}</div>
    <button class=\"print-btn\" onclick=\"window.print()\" style=\"position:fixed;right:16px;bottom:16px;padding:12px 16px;font-size:16px;\">Print/Save as PDF</button>
  </body>
</html>`;
      const w = window.open('', '_blank');
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    } catch (e) {
      
    }
  };

  const createPhotoSheet = async (imageUri: string): Promise<string> => {
    try {
      const selectedIdSize = ID_SIZES.find(size => size.value === idSize) || ID_SIZES[0];
      const selectedPaperSize = PAPER_SIZES.find(size => size.value === paperSize) || PAPER_SIZES[0];
      const DPI = 300;
      const idWidthPx = Math.round(selectedIdSize.widthInch * DPI);
      const idHeightPx = Math.round(selectedIdSize.heightInch * DPI);
      const paperWidthPx = Math.round(selectedPaperSize.widthInch * DPI);
      const paperHeightPx = Math.round(selectedPaperSize.heightInch * DPI);



      if (isWeb) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return imageUri;
        }
        canvas.width = paperWidthPx;
        canvas.height = paperHeightPx;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, paperWidthPx, paperHeightPx);
        return new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const padding = Math.round(DPI * 0.2);
            const totalWidth = idWidthPx;
            const totalHeight = 3 * idHeightPx + 2 * padding;
            const startX = (paperWidthPx - totalWidth) / 2;
            const startY = (paperHeightPx - totalHeight) / 2;
            for (let i = 0; i < 3; i++) {
              const x = startX;
              const y = startY + i * (idHeightPx + padding);
              ctx.drawImage(img, 0, 0, img.width, img.height, x, y, idWidthPx, idHeightPx);
              ctx.strokeStyle = '#e0e0e0';
              ctx.lineWidth = 2;
              ctx.strokeRect(x, y, idWidthPx, idHeightPx);
            }
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve(dataUrl);
          };
          img.onerror = () => {
            resolve(imageUri);
          };
          img.src = imageUri;
        });
      } else {
        try {
          const resizedImage = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: idWidthPx, height: idHeightPx } }],
            { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
          );
          const padding = Math.round(DPI * 0.2);
          const whiteSourceUrl = 'https://singlecolorimage.com/get/ffffff/10x10.png';
          const targetPath = `${FileSystem.cacheDirectory}white_${Date.now()}.png`;
          const dl = await FileSystem.downloadAsync(whiteSourceUrl, targetPath);
          const whiteBackground = await ImageManipulator.manipulateAsync(
            dl.uri,
            [{ resize: { width: paperWidthPx, height: paperHeightPx } }],
            { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG }
          );
          const availableWidth = paperWidthPx - (2 * padding);
          const availableHeight = paperHeightPx - (2 * padding);
          let photosPerRow = 1;
          let photosPerCol = 3;
          if ((3 * idWidthPx + 2 * padding) <= availableWidth) {
            photosPerRow = 3;
            photosPerCol = 1;
          } else if ((2 * idWidthPx + padding) <= availableWidth && (2 * idHeightPx + padding) <= availableHeight) {
            photosPerRow = 2;
            photosPerCol = 2;
          }
          const actualPhotosInFirstRow = Math.min(photosPerRow, 3);
          const totalWidth = actualPhotosInFirstRow * idWidthPx + (actualPhotosInFirstRow - 1) * padding;
          const totalHeight = photosPerCol > 1 ? (2 * idHeightPx + padding) : idHeightPx;
          const startX = Math.round((paperWidthPx - totalWidth) / 2);
          const startY = Math.round((paperHeightPx - totalHeight) / 2);
          const positions: Array<{ x: number; y: number }> = [];
          for (let i = 0; i < 3; i++) {
            if (photosPerRow === 3) {
              positions.push({ x: startX + i * (idWidthPx + padding), y: startY });
            } else if (photosPerRow === 2) {
              if (i < 2) positions.push({ x: startX + i * (idWidthPx + padding), y: startY });
              else positions.push({ x: startX + Math.round((idWidthPx + padding) / 2), y: startY + idHeightPx + padding });
            } else {
              positions.push({ x: startX, y: startY + i * (idHeightPx + padding) });
            }
          }
          let composed = whiteBackground;
          try {
            const overlays: Array<{ uri: string; position: { x: number; y: number } }> = [];
            for (let i = 0; i < positions.length; i++) {
              if (i === 0) {
                overlays.push({ uri: resizedImage.uri, position: { x: Math.max(0, Math.round(positions[i].x)), y: Math.max(0, Math.round(positions[i].y)) } });
              } else {
                const resized = await ImageManipulator.manipulateAsync(
                  imageUri,
                  [{ resize: { width: idWidthPx, height: idHeightPx } }],
                  { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
                );
                overlays.push({ uri: resized.uri, position: { x: Math.max(0, Math.round(positions[i].x)), y: Math.max(0, Math.round(positions[i].y)) } });
              }
            }

            throw new Error('Overlay not supported in Expo Go; using PDF route.');
          } catch (composeErr) {

            const pdfUri = await createPhotoSheetPDF(resizedImage.uri);
            return pdfUri;
          }
        } catch (err) {

          try {
            const fallbackImage = await ImageManipulator.manipulateAsync(
              imageUri,
              [{ resize: { width: idWidthPx, height: idHeightPx } }],
              { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
            );
            return fallbackImage.uri;
          } catch (ultimateFallbackError) {

            return imageUri;
          }
        }
      }
    } catch (error) {

      return imageUri;
    }
  };

  // Helper function to convert image to base64
  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {

      throw error;
    }
  };

  const createPhotoSheetPDF = async (processedImageUri: string): Promise<string> => {
    const selectedIdSize = ID_SIZES.find(size => size.value === idSize) || ID_SIZES[0];
    const selectedPaperSize = PAPER_SIZES.find(size => size.value === paperSize) || PAPER_SIZES[0];
    const DPI = 300;
    const idWIn = selectedIdSize.widthInch;
    const idHIn = selectedIdSize.heightInch;
    const paddingIn = 0.2;
    const paperWIn = selectedPaperSize.widthInch;
    const paperHIn = selectedPaperSize.heightInch;

    const base64 = await convertImageToBase64(processedImageUri);
    const imgData = `data:image/jpeg;base64,${base64}`;

    // Compute layout like in canvas version
    const idWpx = Math.round(idWIn * DPI);
    const idHpx = Math.round(idHIn * DPI);
    const paperWpx = Math.round(paperWIn * DPI);
    const paperHpx = Math.round(paperHIn * DPI);
    const padPx = Math.round(paddingIn * DPI);
    const totalW = idWpx;
    const totalH = 3 * idHpx + 2 * padPx;
    const startX = Math.round((paperWpx - totalW) / 2);
    const startY = Math.round((paperHpx - totalH) / 2);

    const positions: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 3; i++) {
      positions.push({ x: startX, y: startY + i * (idHpx + padPx) });
    }

    // Build absolutely-positioned HTML in inches to guarantee print fidelity
    const pxToIn = (px: number) => (px / DPI).toFixed(4) + 'in';
    const photosHtml = positions.map((p, idx) => (
      `<img src="${imgData}" alt="id${idx}" style="position:absolute; left:${pxToIn(p.x)}; top:${pxToIn(p.y)}; width:${idWIn}in; height:${idHIn}in; border:0.01in solid #e0e0e0;" />`
    )).join('');

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: ${paperWIn}in ${paperHIn}in; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .page { position: relative; width: ${paperWIn}in; height: ${paperHIn}in; background: #ffffff; }
      .content { position: absolute; left: ${paddingIn}in; top: ${paddingIn}in; right: ${paddingIn}in; bottom: ${paddingIn}in; }
      /* Centering block using computed positions above */
      .canvas { position: absolute; left: ${pxToIn(startX)}; top: ${pxToIn(startY)}; width: ${pxToIn(totalW)}; height: ${pxToIn(totalH)}; }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="canvas">
        ${photosHtml}
      </div>
    </div>
  </body>
</html>`;

    const { uri } = await Print.printToFileAsync({ html });

    return uri;
  };

  const goBack = () => {
    if (isNative) {
      try {
        Haptics.selectionAsync();
      } catch (e) {
        
      }
    }
    router.back();
  };

  if (!imageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No image data</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.push('/')}>
            <Text style={styles.errorButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isProcessingCrop) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Processing crop...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={goBack}>
            <X color="#333" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preview & Save</Text>
          <View style={styles.headerButton} />
        </View>

        {/* Preview Section */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>
            {previewType === 'sheet' ? '3-Photo Sheet Preview' : 'Single Photo Preview'}
          </Text>
          <View style={styles.previewContainer}>
            <View style={styles.previewBox}>
              {previewType === 'sheet' ? (
                Platform.select({
                  web: (
                    <WebSheetPreview
                      imageUri={imageUri}
                      cropX={Math.max(0, parseInt(cropX || '0'))}
                      cropY={Math.max(0, parseInt(cropY || '0'))}
                      cropWidth={Math.max(50, parseInt(cropWidth || '200'))}
                      cropHeight={Math.max(50, parseInt(cropHeight || '200'))}
                      originalWidth={parseInt(originalWidth || '0')}
                      originalHeight={parseInt(originalHeight || '0')}
                      idSizeValue={idSize || '1x1'}
                      paperSizeValue={paperSize || 'A4'}
                    />
                  ),
                  default: (
                    <MobileSheetPreview
                      processedUri={croppedImageUri || imageUri}
                      idSizeValue={idSize || '1x1'}
                      paperSizeValue={paperSize || 'A4'}
                    />
                  )
                })
              ) : (
                isWeb ? (
                  <WebCroppedImage
                    imageUri={imageUri}
                    cropX={Math.max(0, parseInt(cropX || '0'))}
                    cropY={Math.max(0, parseInt(cropY || '0'))}
                    cropWidth={Math.max(50, parseInt(cropWidth || '200'))}
                    cropHeight={Math.max(50, parseInt(cropHeight || '200'))}
                    originalWidth={parseInt(originalWidth || '0')}
                    originalHeight={parseInt(originalHeight || '0')}
                  />
                ) : (
                  <Image
                    source={{ uri: croppedImageUri || imageUri }}
                    style={styles.previewImage}
                    contentFit="cover"
                    onError={(error) => {

                      Alert.alert(
                        'Preview Error',
                        'Cannot display the processed image. Please try again.',
                        [
                          {
                            text: 'Try Again',
                            onPress: () => router.replace('/')
                          }
                        ]
                      );
                    }}
                  />
                )
              )}
              <View style={styles.watermark}>
                <Text style={styles.watermarkText}>PHOTO ID</Text>
                <Text style={styles.watermarkText}>MAKER 2</Text>
              </View>
            </View>
          </View>
          
          {/* Preview Type Info */}
          <View style={styles.previewInfo}>
            <Text style={styles.previewInfoText}>
              {previewType === 'sheet' 
                ? `Preview: 3 photos of ${ID_SIZES.find(s => s.value === idSize)?.label || '1x1 inch'} on ${PAPER_SIZES.find(s => s.value === paperSize)?.label || 'A4'}`
                : `Preview: Single ${ID_SIZES.find(s => s.value === idSize)?.label || '1x1 inch'} photo`
              }
            </Text>
          </View>
        </View>

        {/* Save Options */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Save Options</Text>
          
          {previewType === 'single' ? (
            <TouchableOpacity
              style={[styles.previewOptionButton, styles.primarySaveButton]}
              onPress={() => handleSave('single')}
            >
              <View style={styles.previewOptionIcon}>
                <View style={styles.singlePhotoIcon} />
              </View>
              <View style={styles.previewOptionContent}>
                <Text style={styles.previewOptionTitle}>Save Single Photo</Text>
                <Text style={styles.previewOptionDescription}>Save one ID photo at selected size</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.previewOptionButton, styles.primarySaveButton]}
              onPress={() => handleSave('sheet')}
            >
              <View style={styles.previewOptionIcon}>
                <View style={styles.threePhotoIcon}>
                  <View style={styles.miniPhotoIcon} />
                  <View style={styles.miniPhotoIcon} />
                  <View style={styles.miniPhotoIcon} />
                </View>
              </View>
              <View style={styles.previewOptionContent}>
                <Text style={styles.previewOptionTitle}>Save 3-Photo Sheet</Text>
                <Text style={styles.previewOptionDescription}>Save three photos arranged on selected paper size</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {/* Alternative option */}
          {previewType === 'single' ? (
            <TouchableOpacity
              style={styles.previewOptionButton}
              onPress={() => handleSave('sheet')}
            >
              <View style={styles.previewOptionIcon}>
                <View style={styles.threePhotoIcon}>
                  <View style={styles.miniPhotoIcon} />
                  <View style={styles.miniPhotoIcon} />
                  <View style={styles.miniPhotoIcon} />
                </View>
              </View>
              <View style={styles.previewOptionContent}>
                <Text style={styles.previewOptionTitle}>Also Save 3-Photo Sheet</Text>
                <Text style={styles.previewOptionDescription}>Save three photos arranged on paper</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.previewOptionButton}
              onPress={() => handleSave('single')}
            >
              <View style={styles.previewOptionIcon}>
                <View style={styles.singlePhotoIcon} />
              </View>
              <View style={styles.previewOptionContent}>
                <Text style={styles.previewOptionTitle}>Also Save Single Photo</Text>
                <Text style={styles.previewOptionDescription}>Save one individual ID photo</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Layout Preview */}
        <View style={styles.layoutSection}>
          <Text style={styles.sectionTitle}>Layout Options</Text>
          
          {/* Single Photo */}
          <View style={styles.layoutOption}>
            <View style={styles.layoutPreview}>
              <View style={styles.singlePhotoLayout}>
                <View style={styles.miniPhoto} />
              </View>
            </View>
            <View style={styles.layoutInfo}>
              <Text style={styles.layoutTitle}>Single Photo</Text>
              <Text style={styles.layoutDescription}>One ID photo optimized for printing</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSave('single')}
              >
                <Download color="white" size={16} />
                <Text style={styles.saveButtonText}>Save Single</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sheet Layout */}
          <View style={styles.layoutOption}>
            <View style={styles.layoutPreview}>
              <View style={styles.sheetPhotoLayout}>
                <View style={styles.miniPhoto} />
                <View style={styles.miniPhoto} />
                <View style={styles.miniPhoto} />
              </View>
            </View>
            <View style={styles.layoutInfo}>
              <Text style={styles.layoutTitle}>3-Photo Sheet</Text>
              <Text style={styles.layoutDescription}>Three photos arranged on selected paper size</Text>
              <TouchableOpacity
                style={[styles.saveButton, styles.saveButtonSecondary]}
                onPress={() => handleSave('sheet')}
              >
                <ImageIcon color="#0038A8" size={16} />
                <Text style={styles.saveButtonSecondaryText}>Save Sheet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  previewSection: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewBox: {
    width: 200,
    height: 240,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  watermark: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.7,
  },
  watermarkText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  previewOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  primarySaveButton: {
    borderColor: '#0038A8',
    backgroundColor: '#f8f9ff',
  },
  previewInfo: {
    marginTop: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  previewInfoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  previewOptionIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  singlePhotoIcon: {
    width: 24,
    height: 30,
    backgroundColor: '#0038A8',
    borderRadius: 4,
  },
  threePhotoIcon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPhotoIcon: {
    width: 8,
    height: 10,
    backgroundColor: '#0038A8',
    borderRadius: 2,
  },
  previewOptionContent: {
    flex: 1,
  },
  previewOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  previewOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  layoutSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  layoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  layoutPreview: {
    width: 80,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  singlePhotoLayout: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetPhotoLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPhoto: {
    width: 12,
    height: 15,
    backgroundColor: '#0038A8',
    borderRadius: 2,
  },
  layoutInfo: {
    flex: 1,
  },
  layoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  layoutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#0038A8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  saveButtonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0038A8',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonSecondaryText: {
    color: '#0038A8',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
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
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
});

const webCroppedImageStyles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

// Web-specific components for previews
function WebCroppedImage({ 
  imageUri, 
  cropX, 
  cropY, 
  cropWidth, 
  cropHeight,
  originalWidth,
  originalHeight
}: {
  imageUri: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  originalWidth: number;
  originalHeight: number;
}) {
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const cropImageOnWeb = async () => {
      try {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              setCroppedDataUrl(imageUri);
              return;
            }
            
            // Use provided original dimensions if available, otherwise use natural dimensions
            const imageWidth = originalWidth > 0 ? originalWidth : img.naturalWidth;
            const imageHeight = originalHeight > 0 ? originalHeight : img.naturalHeight;
            
            // Ensure crop parameters are valid
            const safeCropX = Math.max(0, Math.min(cropX, imageWidth - 10));
            const safeCropY = Math.max(0, Math.min(cropY, imageHeight - 10));
            const safeCropWidth = Math.max(10, Math.min(cropWidth, imageWidth - safeCropX));
            const safeCropHeight = Math.max(10, Math.min(cropHeight, imageHeight - safeCropY));
            

            
            // Set canvas size to crop dimensions
            canvas.width = safeCropWidth;
            canvas.height = safeCropHeight;
            
            // If using provided dimensions that differ from natural dimensions, scale the crop
            let scaledCropX = safeCropX;
            let scaledCropY = safeCropY;
            let scaledCropWidth = safeCropWidth;
            let scaledCropHeight = safeCropHeight;
            
            if (originalWidth > 0 && originalHeight > 0 && 
                (originalWidth !== img.naturalWidth || originalHeight !== img.naturalHeight)) {
              const scaleX = img.naturalWidth / originalWidth;
              const scaleY = img.naturalHeight / originalHeight;
              
              scaledCropX = safeCropX * scaleX;
              scaledCropY = safeCropY * scaleY;
              scaledCropWidth = safeCropWidth * scaleX;
              scaledCropHeight = safeCropHeight * scaleY;
              

            }
            
            // Draw the cropped portion
            ctx.drawImage(
              img,
              scaledCropX, // source x
              scaledCropY, // source y
              scaledCropWidth, // source width
              scaledCropHeight, // source height
              0, // destination x
              0, // destination y
              safeCropWidth, // destination width (use original for output size)
              safeCropHeight // destination height (use original for output size)
            );
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCroppedDataUrl(dataUrl);
          } catch (canvasError) {

            setCroppedDataUrl(imageUri);
          }
        };
        
        img.onerror = () => {
          setCroppedDataUrl(imageUri);
        };
        
        img.src = imageUri;
      } catch (error) {

        setCroppedDataUrl(imageUri);
      }
    };

    if (isWeb) {
      cropImageOnWeb();
    }
  }, [imageUri, cropX, cropY, cropWidth, cropHeight, originalWidth, originalHeight]);

  return (
    <Image
      source={{ uri: croppedDataUrl || imageUri }}
      style={webCroppedImageStyles.image}
      contentFit="cover"
    />
  );
}

function WebSheetPreview({
  imageUri,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  originalWidth,
  originalHeight,
  idSizeValue,
  paperSizeValue,
}: {
  imageUri: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  originalWidth: number;
  originalHeight: number;
  idSizeValue: string;
  paperSizeValue: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    const run = async () => {
      try {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) { setDataUrl(imageUri); return; }
          const DPI = 300;
          const idSize = ID_SIZES.find(s => s.value === idSizeValue) || ID_SIZES[0];
          const paper = PAPER_SIZES.find(p => p.value === paperSizeValue) || PAPER_SIZES[0];
          const idW = Math.round(idSize.widthInch * DPI);
          const idH = Math.round(idSize.heightInch * DPI);
          const paperW = Math.round(paper.widthInch * DPI);
          const paperH = Math.round(paper.heightInch * DPI);
          canvas.width = paperW;
          canvas.height = paperH;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, paperW, paperH);
          // compute crop scaling for the source
          const imgW = originalWidth > 0 ? originalWidth : img.naturalWidth;
          const imgH = originalHeight > 0 ? originalHeight : img.naturalHeight;
          const safeX = Math.max(0, Math.min(cropX, imgW - 10));
          const safeY = Math.max(0, Math.min(cropY, imgH - 10));
          const safeW = Math.max(10, Math.min(cropWidth, imgW - safeX));
          const safeH = Math.max(10, Math.min(cropHeight, imgH - safeY));
          // Layout
          const padding = Math.round(DPI * 0.2);
          const totalW = idW;
          const totalH = 3 * idH + 2 * padding;
          const startX = (paperW - totalW) / 2;
          const startY = (paperH - totalH) / 2;
          for (let i = 0; i < 3; i++) {
            const x = startX;
            const y = startY + i * (idH + padding);
            ctx.drawImage(img, safeX, safeY, safeW, safeH, x, y, idW, idH);
            ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 2; ctx.strokeRect(x, y, idW, idH);
          }
          setDataUrl(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => setDataUrl(null);
        img.src = imageUri;
      } catch (e) { 
      setDataUrl(null); 
    }
    };
    if (isWeb) run();
  }, [imageUri, cropX, cropY, cropWidth, cropHeight, originalWidth, originalHeight, idSizeValue, paperSizeValue]);
  return (
    <Image source={{ uri: dataUrl || imageUri }} style={webCroppedImageStyles.image} contentFit="cover" />
  );
}

function MobileSheetPreview({ processedUri, idSizeValue, paperSizeValue }: { processedUri: string; idSizeValue: string; paperSizeValue: string; }) {
  const [paperLayout, setPaperLayout] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const DPI = 300;
  const idSize = ID_SIZES.find(s => s.value === idSizeValue) || ID_SIZES[0];
  const paper = PAPER_SIZES.find(p => p.value === paperSizeValue) || PAPER_SIZES[0];
  const idW = Math.round(idSize.widthInch * DPI);
  const idH = Math.round(idSize.heightInch * DPI);
  const paperW = Math.round(paper.widthInch * DPI);
  const paperH = Math.round(paper.heightInch * DPI);
  const padding = Math.round(DPI * 0.2);
  const availableWidth = paperW - (2 * padding);
  const availableHeight = paperH - (2 * padding);
  const totalW = idW;
  const totalH = 3 * idH + 2 * padding;
  const startX = (paperW - totalW) / 2;
  const startY = (paperH - totalH) / 2;

  const positions: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 3; i++) {
    positions.push({ x: startX, y: startY + i * (idH + padding) });
  }

  const scaleX = paperLayout.width > 0 ? paperLayout.width / paperW : 0;
  const scaleY = paperLayout.height > 0 ? paperLayout.height / paperH : 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setPaperLayout({ width, height });
          }}
          style={{
            width: '100%',
            aspectRatio: paperW / paperH,
            backgroundColor: 'white',
            borderColor: '#dee2e6',
            borderWidth: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {paperLayout.width > 0 && positions.map((pos, i) => (
            <Image
              key={`p-${i}`}
              source={{ uri: processedUri }}
              style={{
                position: 'absolute',
                left: Math.round(pos.x * scaleX),
                top: Math.round(pos.y * scaleY),
                width: Math.round(idW * scaleX),
                height: Math.round(idH * scaleY),
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}
              contentFit="cover"
            />
          ))}
        </View>
      </View>
    </View>
  );
}