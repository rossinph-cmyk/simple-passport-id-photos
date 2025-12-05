import { AppTheme } from '../store/themeStore';

type TranslationKey =
  | 'appTitle'
  | 'appSubtitle'
  | 'instructionBanner'
  | 'backgroundTheme'
  | 'features'
  | 'idSize'
  | 'paperSize'
  | 'photoCropping'
  | 'noPhotoSelected'
  | 'dragInstruction'
  | 'takePicture'
  | 'gallery'
  | 'previewSinglePhoto'
  | 'preview3Photos'
  | 'selectNewPhoto'
  | 'selectIdSize'
  | 'selectPaperSize'
  | 'cancel'
  | 'appFeatures'
  | 'close'
  | 'selectBackgroundTheme'
  | 'feature1'
  | 'feature2'
  | 'feature3'
  | 'feature4'
  | 'feature5'
  | 'feature6';

type Translations = {
  [key in AppTheme]: {
    [key in TranslationKey]: string;
  };
};

export const translations: Translations = {
  american: {
    appTitle: 'Simple Passport ID & Photos',
    appSubtitle: 'Professional ID Photos Made Easy',
    instructionBanner: '📸 Please take a selfie or upload a picture on a plain white background',
    backgroundTheme: 'Background Theme: 🇺🇸 American',
    features: 'Features',
    idSize: 'ID Size',
    paperSize: 'Paper Size',
    photoCropping: 'Photo Cropping',
    noPhotoSelected: 'No photo selected',
    dragInstruction: 'Drag the photo with one finger to reposition. Release to set.',
    takePicture: 'Take Picture',
    gallery: 'Gallery',
    previewSinglePhoto: 'Preview Single Photo',
    preview3Photos: 'Preview 3 Photos',
    selectNewPhoto: 'Select New Photo',
    selectIdSize: 'Select ID Size',
    selectPaperSize: 'Select Paper Size',
    cancel: 'Cancel',
    appFeatures: 'App Features',
    close: 'Close',
    selectBackgroundTheme: 'Select Background Theme',
    feature1: '• Multiple ID sizes (1x1, 1x1.5, 1x2, 2x2, 2x3 inches)',
    feature2: '• Various paper sizes (A4, Letter, Long photo paper)',
    feature3: '• Simple, precise photo positioning',
    feature4: '• Grid overlay for perfect alignment',
    feature5: '• Single photo or 3-photo sheet layouts',
    feature6: '• Save directly to shareable PDF format',
  },
  indian: {
    appTitle: 'सरल पासपोर्ट आईडी और फोटो',
    appSubtitle: 'पेशेवर आईडी फोटो आसानी से बनाएं',
    instructionBanner: '📸 कृपया एक सादे सफेद पृष्ठभूमि पर एक सेल्फी लें या चित्र अपलोड करें',
    backgroundTheme: 'Background Theme: 🇮🇳 Indian',
    features: 'विशेषताएँ',
    idSize: 'आईडी आकार',
    paperSize: 'कागज का आकार',
    photoCropping: 'फोटो क्रॉपिंग',
    noPhotoSelected: 'कोई फोटो नहीं चुनी गई',
    dragInstruction: 'फोटो को स्थानांतरित करने के लिए एक उंगली से खींचें। सेट करने के लिए छोड़ें।',
    takePicture: 'तस्वीर लें',
    gallery: 'गैलरी',
    previewSinglePhoto: 'एकल फोटो पूर्वावलोकन',
    preview3Photos: '3 फोटो पूर्वावलोकन',
    selectNewPhoto: 'नई फोटो चुनें',
    selectIdSize: 'आईडी आकार चुनें',
    selectPaperSize: 'कागज का आकार चुनें',
    cancel: 'रद्द करें',
    appFeatures: 'ऐप सुविधाएँ',
    close: 'बंद करें',
    selectBackgroundTheme: 'पृष्ठभूमि थीम चुनें',
    feature1: '• कई आईडी आकार (1x1, 1x1.5, 1x2, 2x2, 2x3 इंच)',
    feature2: '• विभिन्न कागज के आकार (A4, Letter, लंबा फोटो पेपर)',
    feature3: '• सरल, सटीक फोटो स्थिति',
    feature4: '• सही संरेखण के लिए ग्रिड ओवरले',
    feature5: '• एकल फोटो या 3-फोटो शीट लेआउट',
    feature6: '• साझा करने योग्य पीडीएफ प्रारूप में सीधे सहेजें',
  },
  filipino: {
    appTitle: 'Simple Passport ID & Photos',
    appSubtitle: 'Madaling Gumawa ng Propesyonal na ID Photos',
    instructionBanner: '📸 Mangyaring kumuha ng selfie o mag-upload ng larawan sa puting background',
    backgroundTheme: 'Background Theme: 🇵🇭 Filipino',
    features: 'Mga Tampok',
    idSize: 'Laki ng ID',
    paperSize: 'Laki ng Papel',
    photoCropping: 'Pag-crop ng Larawan',
    noPhotoSelected: 'Walang napiling larawan',
    dragInstruction: 'I-drag ang larawan gamit ang isang daliri upang ilipat. Bitawan upang itakda.',
    takePicture: 'Kumuha ng Larawan',
    gallery: 'Gallery',
    previewSinglePhoto: 'Preview ng Isang Larawan',
    preview3Photos: 'Preview ng 3 Larawan',
    selectNewPhoto: 'Pumili ng Bagong Larawan',
    selectIdSize: 'Pumili ng Laki ng ID',
    selectPaperSize: 'Pumili ng Laki ng Papel',
    cancel: 'Kanselahin',
    appFeatures: 'Mga Tampok ng App',
    close: 'Isara',
    selectBackgroundTheme: 'Pumili ng Background Theme',
    feature1: '• Maraming laki ng ID (1x1, 1x1.5, 1x2, 2x2, 2x3 pulgada)',
    feature2: '• Iba\'t ibang laki ng papel (A4, Letter, Mahabang photo paper)',
    feature3: '• Simple at tumpak na pag-position ng larawan',
    feature4: '• Grid overlay para sa perpektong alignment',
    feature5: '• Isang larawan o 3-larawan na sheet layouts',
    feature6: '• I-save direkta sa shareable PDF format',
  },
  chinese: {
    appTitle: 'Simple Passport ID & Photos',
    appSubtitle: '轻松制作专业证件照',
    instructionBanner: '📸 请在纯白色背景上自拍或上传照片',
    backgroundTheme: 'Background Theme: 🇨🇳 Chinese',
    features: '功能',
    idSize: '证件尺寸',
    paperSize: '纸张尺寸',
    photoCropping: '照片裁剪',
    noPhotoSelected: '未选择照片',
    dragInstruction: '用一根手指拖动照片以重新定位。松开以设置。',
    takePicture: '拍照',
    gallery: '相册',
    previewSinglePhoto: '预览单张照片',
    preview3Photos: '预览3张照片',
    selectNewPhoto: '选择新照片',
    selectIdSize: '选择证件尺寸',
    selectPaperSize: '选择纸张尺寸',
    cancel: '取消',
    appFeatures: '应用功能',
    close: '关闭',
    selectBackgroundTheme: '选择背景主题',
    feature1: '• 多种证件尺寸 (1x1, 1x1.5, 1x2, 2x2, 2x3 英寸)',
    feature2: '• 各种纸张尺寸 (A4, Letter, 长相纸)',
    feature3: '• 简单、精确的照片定位',
    feature4: '• 网格覆盖以实现完美对齐',
    feature5: '• 单张照片或3张照片表格布局',
    feature6: '• 直接保存为可共享的PDF格式',
  },
  spanish: {
    appTitle: 'Simple Passport ID & Photos',
    appSubtitle: 'Fotos de ID Profesionales Fácilmente',
    instructionBanner: '📸 Por favor, toma un selfie o sube una foto en un fondo blanco liso',
    backgroundTheme: 'Background Theme: 🇪🇸 Spanish',
    features: 'Características',
    idSize: 'Tamaño de ID',
    paperSize: 'Tamaño de Papel',
    photoCropping: 'Recorte de Foto',
    noPhotoSelected: 'No se seleccionó ninguna foto',
    dragInstruction: 'Arrastra la foto con un dedo para reposicionar. Suelta para establecer.',
    takePicture: 'Tomar Foto',
    gallery: 'Galería',
    previewSinglePhoto: 'Vista Previa de Foto Individual',
    preview3Photos: 'Vista Previa de 3 Fotos',
    selectNewPhoto: 'Seleccionar Nueva Foto',
    selectIdSize: 'Seleccionar Tamaño de ID',
    selectPaperSize: 'Seleccionar Tamaño de Papel',
    cancel: 'Cancelar',
    appFeatures: 'Características de la App',
    close: 'Cerrar',
    selectBackgroundTheme: 'Seleccionar Tema de Fondo',
    feature1: '• Múltiples tamaños de ID (1x1, 1x1.5, 1x2, 2x2, 2x3 pulgadas)',
    feature2: '• Varios tamaños de papel (A4, Carta, Papel fotográfico largo)',
    feature3: '• Posicionamiento simple y preciso de fotos',
    feature4: '• Superposición de cuadrícula para alineación perfecta',
    feature5: '• Diseños de una foto o de 3 fotos',
    feature6: '• Guardar directamente en formato PDF compartible',
  },
  arabic: {
    appTitle: 'Simple Passport ID & Photos',
    appSubtitle: 'صور هوية احترافية بسهولة',
    instructionBanner: '📸 الرجاء التقاط صورة شخصية أو تحميل صورة على خلفية بيضاء عادية',
    backgroundTheme: 'Background Theme: 🇸🇦 Arabic',
    features: 'الميزات',
    idSize: 'حجم الهوية',
    paperSize: 'حجم الورق',
    photoCropping: 'قص الصورة',
    noPhotoSelected: 'لم يتم اختيار صورة',
    dragInstruction: 'اسحب الصورة بإصبع واحد لإعادة الموضع. حرر للتعيين.',
    takePicture: 'التقاط صورة',
    gallery: 'المعرض',
    previewSinglePhoto: 'معاينة صورة واحدة',
    preview3Photos: 'معاينة 3 صور',
    selectNewPhoto: 'اختر صورة جديدة',
    selectIdSize: 'اختر حجم الهوية',
    selectPaperSize: 'اختر حجم الورق',
    cancel: 'إلغاء',
    appFeatures: 'ميزات التطبيق',
    close: 'إغلاق',
    selectBackgroundTheme: 'اختر موضوع الخلفية',
    feature1: '• أحجام هوية متعددة (1x1, 1x1.5, 1x2, 2x2, 2x3 بوصة)',
    feature2: '• أحجام ورق مختلفة (A4, Letter, ورق صور طويل)',
    feature3: '• وضع صورة بسيط ودقيق',
    feature4: '• تراكب الشبكة للمحاذاة المثالية',
    feature5: '• تخطيطات صورة واحدة أو 3 صور',
    feature6: '• حفظ مباشرة بتنسيق PDF قابل للمشاركة',
  },
};

export function getTranslation(theme: AppTheme, key: TranslationKey): string {
  return translations[theme][key];
}
