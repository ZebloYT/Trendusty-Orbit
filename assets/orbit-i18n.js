/**
 * Trendusty Orbit Universal Sovereign i18n & URL Locale Router Engine
 * Standardizes URL parameter matching Google/Gemini (?hl=en-IN, ?hl=ar, ?hl=hi-IN, ?hl=es, ?hl=fr, etc.)
 * Supports 195 World Countries & 36 Indian States & UTs.
 * Dynamic locale switching, per-language file mirrors, and persistent navigation propagation.
 */
(function() {
  'use strict';

  // Major standardized locales
  const LOCALE_MAP = {
    // English & Default
    'en': { code: 'en', hl: 'en-IN', name: 'EN English (India / Global)', native: 'English', dir: 'ltr', flag: '🌐' },
    'en-in': { code: 'en', hl: 'en-IN', name: 'EN English (India)', native: 'English (IN)', dir: 'ltr', flag: '🇮🇳' },
    
    // Indian Scheduled & Major Regional Languages
    'hi': { code: 'hi', hl: 'hi-IN', name: 'HI हिन्दी (Hindi)', native: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
    'hi-in': { code: 'hi', hl: 'hi-IN', name: 'HI हिन्दी (Hindi - India)', native: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
    'bn': { code: 'bn', hl: 'bn', name: 'BN বাংলা (Bengali)', native: 'বাংলা', dir: 'ltr', flag: '🇮🇳' },
    'te': { code: 'te', hl: 'te', name: 'TE తెలుగు (Telugu)', native: 'తెలుగు', dir: 'ltr', flag: '🇮🇳' },
    'mr': { code: 'mr', hl: 'mr', name: 'MR मराठी (Marathi)', native: 'मराठी', dir: 'ltr', flag: '🇮🇳' },
    'ta': { code: 'ta', hl: 'ta', name: 'TA தமிழ் (Tamil)', native: 'தமிழ்', dir: 'ltr', flag: '🇮🇳' },
    'gu': { code: 'gu', hl: 'gu', name: 'GU ગુજરાતી (Gujarati)', native: 'ગુજરાતી', dir: 'ltr', flag: '🇮🇳' },
    'ur': { code: 'ur', hl: 'ur', name: 'UR اردو (Urdu)', native: 'اردو', dir: 'rtl', flag: '🇮🇳' },
    'kn': { code: 'kn', hl: 'kn', name: 'KN ಕನ್ನಡ (Kannada)', native: 'ಕನ್ನಡ', dir: 'ltr', flag: '🇮🇳' },
    'ml': { code: 'ml', hl: 'ml', name: 'ML മലയാളം (Malayalam)', native: 'മലയാളം', dir: 'ltr', flag: '🇮🇳' },
    'pa': { code: 'pa', hl: 'pa', name: 'PA ਪੰਜਾਬੀ (Punjabi)', native: 'ਪੰਜਾਬੀ', dir: 'ltr', flag: '🇮🇳' },
    'or': { code: 'or', hl: 'or', name: 'OR ଓଡ଼ିଆ (Odia)', native: 'ଓଡ଼ିଆ', dir: 'ltr', flag: '🇮🇳' },
    'as': { code: 'as', hl: 'as', name: 'AS অসমীয়া (Assamese)', native: 'অসমীয়া', dir: 'ltr', flag: '🇮🇳' },
    'sa': { code: 'sa', hl: 'sa', name: 'SA संस्कृतम् (Sanskrit)', native: 'संस्कृतम्', dir: 'ltr', flag: '🇮🇳' },
    'ne': { code: 'ne', hl: 'ne', name: 'NE नेपाली (Nepali)', native: 'नेपाली', dir: 'ltr', flag: '🇳🇵' },
    'kok': { code: 'kok', hl: 'kok', name: 'KOK कोंकणी (Konkani)', native: 'कोंकणी', dir: 'ltr', flag: '🇮🇳' },
    'ks': { code: 'ks', hl: 'ks', name: 'KS كٲشُر (Kashmiri)', native: 'كٲشُر', dir: 'rtl', flag: '🇮🇳' },
    'bho': { code: 'bho', hl: 'bho', name: 'BHO भोजपुरी (Bhojpuri)', native: 'भोजपुरी', dir: 'ltr', flag: '🇮🇳' },
    'mai': { code: 'mai', hl: 'mai', name: 'MAI मैथिली (Maithili)', native: 'मैथिली', dir: 'ltr', flag: '🇮🇳' },
    'sd': { code: 'sd', hl: 'sd', name: 'SD سنڌي (Sindhi)', native: 'سنڌي', dir: 'rtl', flag: '🇮🇳' },

    // Major Global Languages
    'es': { code: 'es', hl: 'es', name: 'ES Español (Spanish)', native: 'Español', dir: 'ltr', flag: '🇪🇸' },
    'fr': { code: 'fr', hl: 'fr', name: 'FR Français (French)', native: 'Français', dir: 'ltr', flag: '🇫🇷' },
    'ar': { code: 'ar', hl: 'ar', name: 'AR العربية (Arabic)', native: 'العربية', dir: 'rtl', flag: '🇸🇦' },
    'zh': { code: 'zh', hl: 'zh-CN', name: 'ZH 中文 (Mandarin Chinese)', native: '简体中文', dir: 'ltr', flag: '🇨🇳' },
    'zh-cn': { code: 'zh', hl: 'zh-CN', name: 'ZH 简体中文', native: '简体中文', dir: 'ltr', flag: '🇨🇳' },
    'ja': { code: 'ja', hl: 'ja', name: 'JA 日本語 (Japanese)', native: '日本語', dir: 'ltr', flag: '🇯🇵' },
    'ru': { code: 'ru', hl: 'ru', name: 'RU Русский (Russian)', native: 'Русский', dir: 'ltr', flag: '🇷🇺' },
    'de': { code: 'de', hl: 'de', name: 'DE Deutsch (German)', native: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
    'pt': { code: 'pt', hl: 'pt', name: 'PT Português (Portuguese)', native: 'Português', dir: 'ltr', flag: '🇧🇷' },
    'it': { code: 'it', hl: 'it', name: 'IT Italiano (Italian)', native: 'Italiano', dir: 'ltr', flag: '🇮🇹' },
    'nl': { code: 'nl', hl: 'nl', name: 'NL Nederlands (Dutch)', native: 'Nederlands', dir: 'ltr', flag: '🇳🇱' },
    'tr': { code: 'tr', hl: 'tr', name: 'TR Türkçe (Turkish)', native: 'Türkçe', dir: 'ltr', flag: '🇹🇷' },
    'ko': { code: 'ko', hl: 'ko', name: 'KO 한국어 (Korean)', native: '한국어', dir: 'ltr', flag: '🇰🇷' },
    'fa': { code: 'fa', hl: 'fa', name: 'FA فارسی (Persian / Farsi)', native: 'فارسی', dir: 'rtl', flag: '🇮🇷' },
    'ps': { code: 'ps', hl: 'ps', name: 'PS پښتو (Pashto)', native: 'پښتو', dir: 'rtl', flag: '🇦🇫' },
    'he': { code: 'he', hl: 'he', name: 'HE עברית (Hebrew)', native: 'עברית', dir: 'rtl', flag: '🇮🇱' },
    'vi': { code: 'vi', hl: 'vi', name: 'VI Tiếng Việt (Vietnamese)', native: 'Tiếng Việt', dir: 'ltr', flag: '🇻🇳' },
    'th': { code: 'th', hl: 'th', name: 'TH ไทย (Thai)', native: 'ไทย', dir: 'ltr', flag: '🇹🇭' },
    'id': { code: 'id', hl: 'id', name: 'ID Bahasa Indonesia', native: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩' },
    'ms': { code: 'ms', hl: 'ms', name: 'MS Bahasa Melayu (Malay)', native: 'Bahasa Melayu', dir: 'ltr', flag: '🇲🇾' },
    'sw': { code: 'sw', hl: 'sw', name: 'SW Kiswahili (Swahili)', native: 'Kiswahili', dir: 'ltr', flag: '🇰🇪' },
    'pl': { code: 'pl', hl: 'pl', name: 'PL Polski (Polish)', native: 'Polski', dir: 'ltr', flag: '🇵🇱' },
    'uk': { code: 'uk', hl: 'uk', name: 'UK Українська (Ukrainian)', native: 'Українська', dir: 'ltr', flag: '🇺🇦' },
    'el': { code: 'el', hl: 'el', name: 'EL Ελληνικά (Greek)', native: 'Ελληνικά', dir: 'ltr', flag: '🇬🇷' },
    'sv': { code: 'sv', hl: 'sv', name: 'SV Svenska (Swedish)', native: 'Svenska', dir: 'ltr', flag: '🇸🇪' },
    'cs': { code: 'cs', hl: 'cs', name: 'CS Čeština (Czech)', native: 'Čeština', dir: 'ltr', flag: '🇨🇿' },
    'ro': { code: 'ro', hl: 'ro', name: 'RO Română (Romanian)', native: 'Română', dir: 'ltr', flag: '🇷🇴' },
    'hu': { code: 'hu', hl: 'hu', name: 'HU Magyar (Hungarian)', native: 'Magyar', dir: 'ltr', flag: '🇭🇺' },
    'fil': { code: 'fil', hl: 'fil', name: 'FIL Filipino / Tagalog', native: 'Filipino', dir: 'ltr', flag: '🇵🇭' },
    'am': { code: 'am', hl: 'am', name: 'AM አማርኛ (Amharic)', native: 'አማርኛ', dir: 'ltr', flag: '🇪🇹' },
    'my': { code: 'my', hl: 'my', name: 'MY မြန်မာ (Burmese)', native: 'မြန်မာ', dir: 'ltr', flag: '🇲🇲' },
    'km': { code: 'km', hl: 'km', name: 'KM ភាសាខ្មែរ (Khmer)', native: 'ភាសាខ្មែរ', dir: 'ltr', flag: '🇰🇭' },
    'si': { code: 'si', hl: 'si', name: 'SI සිංහල (Sinhala)', native: 'සිංහල', dir: 'ltr', flag: '🇱🇰' }
  };

  const RTL_SET = new Set(['ar', 'fa', 'ur', 'ps', 'prs', 'he', 'sd', 'bal', 'ug', 'ku', 'arc', 'ks']);

  // Common UI Dictionary
  const COMMON_I18N = {
    'en': {
      'nav_main': '&larr; Main Operations Center',
      'nav_jarvis': '🤖 JARVIS',
      'nav_gestube': 'GESTUBE',
      'nav_echonode': '⛏️ EchoNode',
      'nav_cursors': '🕹️ Cursors',
      'nav_share': '📤 Share',
      'nav_languages': '🌐 Languages',
      'nav_feedback': '⭐ Feedback / Bug Report',
      'nav_login': '👤 Login / Sign Up',
      'modal_cancel': 'Cancel',
      'modal_submit': 'Transmit Report ⚡',
      'ofaa_eyebrow': '⚡ SOVEREIGN ECOSYSTEM DIRECTORY',
      'ofaa_title': 'Other Features & Applications',
      'ofaa_desc': 'Complete catalog of autonomous AI companions, standalone desktop workstations, mobile remote controllers, custom browser extensions, and cloud utility toolchains — built under one zero-telemetry architecture.',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">Download Authorization:</strong> Website browsing & feature explorations are open for everyone. An authenticated operative account is required to download application installers and binary archives.',
      'ofaa_search_placeholder': 'Search applications, features, extensions, or tags...',
      'filter_all': 'All Apps & Features (8)',
      'filter_ai': '🤖 AI & Intelligence',
      'filter_desktop': '💻 Desktop Workstations',
      'filter_mobile': '📱 Mobile & Remote',
      'filter_extensions': '🧩 Browser Extensions',
      'filter_cloud': '☁️ Cloud & Utilities',
      'dir': 'ltr'
    },
    'hi': {
      'nav_main': '&larr; मुख्य संचालन केंद्र',
      'nav_jarvis': '🤖 जार्विस (JARVIS)',
      'nav_gestube': 'जेस्ट्यूब (GESTUBE)',
      'nav_echonode': '⛏️ इकोनोड (EchoNode)',
      'nav_cursors': '🕹️ कर्सर (Cursors)',
      'nav_share': '📤 शेयर (Share)',
      'nav_languages': '🌐 भाषाएं (Languages)',
      'nav_feedback': '⭐ प्रतिक्रिया / बग रिपोर्ट',
      'nav_login': '👤 लॉगिन / साइन अप',
      'modal_cancel': 'रद्द करें',
      'modal_submit': 'रिपोर्ट भेजें ⚡',
      'ofaa_eyebrow': '⚡ संप्रभु पारिस्थितिकी तंत्र निर्देशिका',
      'ofaa_title': 'अन्य सुविधाएं और अनुप्रयोग (OFAA)',
      'ofaa_desc': 'स्वायत्त एआई साथियों, स्टैंडअलोन डेस्कटॉप वर्कस्टेशन, मोबाइल रिमोट कंट्रोलर, कस्टम ब्राउज़र एक्सटेंशन और क्लाउड टूलचेन की संपूर्ण सूची — शून्य टेलीमेट्री वास्तुकला पर निर्मित।',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">डाउनलोड प्राधिकरण:</strong> वेबसाइट ब्राउज़िंग और सुविधाओं की खोज सभी के लिए खुली है। इंस्टॉलर और बाइनरी डाउनलोड करने के लिए एक प्रमाणित खाते की आवश्यकता होती है।',
      'ofaa_search_placeholder': 'अनुप्रयोग, सुविधाएं, एक्सटेंशन या टैग खोजें...',
      'filter_all': 'सभी ऐप्स और सुविधाएं (8)',
      'filter_ai': '🤖 एआई और इंटेलिजेंस',
      'filter_desktop': '💻 डेस्कटॉप वर्कस्टेशन',
      'filter_mobile': '📱 मोबाइल और रिमोट',
      'filter_extensions': '🧩 ब्राउज़र एक्सटेंशन',
      'filter_cloud': '☁️ क्लाउड और उपयोगिताएं',
      'dir': 'ltr'
    },
    'es': {
      'nav_main': '&larr; Centro de Operaciones Principal',
      'nav_jarvis': '🤖 JARVIS',
      'nav_gestube': 'GESTUBE',
      'nav_echonode': '⛏️ EchoNode',
      'nav_cursors': '🕹️ Cursores',
      'nav_share': '📤 Compartir',
      'nav_languages': '🌐 Idiomas',
      'nav_feedback': '⭐ Comentarios / Errores',
      'nav_login': '👤 Iniciar Sesión / Registro',
      'modal_cancel': 'Cancelar',
      'modal_submit': 'Transmitir Informe ⚡',
      'ofaa_eyebrow': '⚡ DIRECTORIO DEL ECOSISTEMA SOBERANO',
      'ofaa_title': 'Otras Características y Aplicaciones',
      'ofaa_desc': 'Catálogo completo de compañeros de IA autónomos, estaciones de trabajo de escritorio independientes, controladores móviles remotos, extensiones de navegador personalizadas y cadenas de herramientas en la nube, construidos bajo una arquitectura de cero telemetría.',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">Autorización de descarga:</strong> La navegación por el sitio y la exploración de funciones están abiertas a todos. Se requiere una cuenta de operativo autenticado para descargar instaladores y archivos binarios.',
      'ofaa_search_placeholder': 'Buscar aplicaciones, características, extensiones o etiquetas...',
      'filter_all': 'Todas las Apps y Funciones (8)',
      'filter_ai': '🤖 IA e Inteligencia',
      'filter_desktop': '💻 Estaciones de Trabajo',
      'filter_mobile': '📱 Móvil y Remoto',
      'filter_extensions': '🧩 Extensiones de Navegador',
      'filter_cloud': '☁️ Nube y Utilidades',
      'dir': 'ltr'
    },
    'fr': {
      'nav_main': '&larr; Centre d\'Opérations Principal',
      'nav_jarvis': '🤖 JARVIS',
      'nav_gestube': 'GESTUBE',
      'nav_echonode': '⛏️ EchoNode',
      'nav_cursors': '🕹️ Curseurs',
      'nav_share': '📤 Partager',
      'nav_languages': '🌐 Langues',
      'nav_feedback': '⭐ Retour / Rapport de Bug',
      'nav_login': '👤 Connexion / S\'inscrire',
      'modal_cancel': 'Annuler',
      'modal_submit': 'Transmettre le Rapport ⚡',
      'ofaa_eyebrow': '⚡ RÉPERTOIRE DE L\'ÉCOSYSTÈME SOUVERAIN',
      'ofaa_title': 'Autres Fonctionnalités et Applications',
      'ofaa_desc': 'Catalogue complet de compagnons IA autonomes, stations de travail de bureau autonomes, contrôleurs mobiles distants, extensions de navigateur personnalisées et chaînes d\'outils cloud — construits sous une architecture sans télémétrie.',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">Autorisation de Téléchargement:</strong> La navigation et l\'exploration des fonctionnalités sont ouvertes à tous. Un compte opérationnel authentifié est requis pour télécharger les installateurs et archives binaires.',
      'ofaa_search_placeholder': 'Rechercher des applications, fonctionnalités, extensions ou balises...',
      'filter_all': 'Toutes les Applications (8)',
      'filter_ai': '🤖 IA & Intelligence',
      'filter_desktop': '💻 Stations de Bureau',
      'filter_mobile': '📱 Mobile & Télécommande',
      'filter_extensions': '🧩 Extensions de Navigateur',
      'filter_cloud': '☁️ Cloud & Utilitaires',
      'dir': 'ltr'
    },
    'ar': {
      'nav_main': '&larr; مركز العمليات الرئيسي',
      'nav_jarvis': '🤖 جارفيس (JARVIS)',
      'nav_gestube': 'جيستوب (GESTUBE)',
      'nav_echonode': '⛏️ إيكونود (EchoNode)',
      'nav_cursors': '🕹️ المؤشرات (Cursors)',
      'nav_share': '📤 مشاركة (Share)',
      'nav_languages': '🌐 اللغات (Languages)',
      'nav_feedback': '⭐ الملاحظات / تقرير الأخطاء',
      'nav_login': '👤 تسجيل الدخول / حساب جديد',
      'modal_cancel': 'إلغاء',
      'modal_submit': 'إرسال التقرير ⚡',
      'ofaa_eyebrow': '⚡ دليل المنظومة السيادية',
      'ofaa_title': 'الميزات والتطبيقات الأخرى (OFAA)',
      'ofaa_desc': 'الكتالوج الكامل للمساعدين الذاتيين المدعومين بالذكاء الاصطناعي، ومحطات العمل المكتبية المستقلة، وأجهزة التحكم عن بعد عبر الهاتف المحمول، وإضافات المتصفح المخصصة وسلاسل أدوات السحابة — مبنية تحت بنية برمجية خالية من القياس عن بعد.',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">تفويض التنزيل:</strong> تصفح الموقع واستكشاف الميزات متاح للجميع. يلزم حساب تشغيلي مصادق عليه لتنزيل برامج التثبيت والأرشيفات الثنائية.',
      'ofaa_search_placeholder': 'ابحث عن التطبيقات والميزات والإضافات أو الوسوم...',
      'filter_all': 'جميع التطبيقات والميزات (8)',
      'filter_ai': '🤖 الذكاء الاصطناعي',
      'filter_desktop': '💻 محطات سطح المكتب',
      'filter_mobile': '📱 الهاتف والتحكم عن بعد',
      'filter_extensions': '🧩 إضافات المتصفح',
      'filter_cloud': '☁️ السحابة والأدوات',
      'dir': 'rtl'
    },
    'zh': {
      'nav_main': '&larr; 主运营控制中心',
      'nav_jarvis': '🤖 JARVIS 贾维斯',
      'nav_gestube': 'GESTUBE 油管优化',
      'nav_echonode': '⛏️ EchoNode 节点',
      'nav_cursors': '🕹️ 光标套件 (Cursors)',
      'nav_share': '📤 安全共享 (Share)',
      'nav_languages': '🌐 全球语言 (Languages)',
      'nav_feedback': '⭐ 反馈与缺陷报告',
      'nav_login': '👤 登录 / 注册',
      'modal_cancel': '取消',
      'modal_submit': '发送反馈 ⚡',
      'ofaa_eyebrow': '⚡ 主权生态应用目录',
      'ofaa_title': '其他特性与应用套件 (OFAA)',
      'ofaa_desc': '自主 AI 伙伴、独立桌面工作站、移动远程控制器、自定义浏览器扩展和云端实用工具链的完整目录——构建于零遥测架构之上。',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">下载授权说明：</strong> 网站浏览与功能探索面向所有人开放。下载应用程序安装包与二进制文件需要认证特工账户。',
      'ofaa_search_placeholder': '搜索应用程序、功能、扩展或标签...',
      'filter_all': '所有应用与功能 (8)',
      'filter_ai': '🤖 人工智能',
      'filter_desktop': '💻 桌面工作站',
      'filter_mobile': '📱 移动与远程控制',
      'filter_extensions': '🧩 浏览器扩展',
      'filter_cloud': '☁️ 云端与实用工具',
      'dir': 'ltr'
    },
    'ru': {
      'nav_main': '&larr; Главный центр операций',
      'nav_jarvis': '🤖 JARVIS',
      'nav_gestube': 'GESTUBE',
      'nav_echonode': '⛏️ EchoNode',
      'nav_cursors': '🕹️ Курсоры',
      'nav_share': '📤 Поделиться',
      'nav_languages': '🌐 Языки',
      'nav_feedback': '⭐ Отзыв / Сообщить об ошибке',
      'nav_login': '👤 Войти / Регистрация',
      'modal_cancel': 'Отмена',
      'modal_submit': 'Отправить отчет ⚡',
      'ofaa_eyebrow': '⚡ КАТАЛОГ СУВЕРЕННОЙ ЭКОСИСТЕМЫ',
      'ofaa_title': 'Другие функции и приложения (OFAA)',
      'ofaa_desc': 'Полный каталог автономных ИИ-ассистентов, изолированных рабочих станций, мобильных пультов управления, расширений браузера и облачных инструментов с нулевой телеметрией.',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">Авторизация загрузки:</strong> Просмотр сайта и изучение функций открыты для всех. Для скачивания установщиков требуется учетная запись.',
      'ofaa_search_placeholder': 'Поиск приложений, функций, расширений...',
      'filter_all': 'Все приложения (8)',
      'filter_ai': '🤖 ИИ и интеллект',
      'filter_desktop': '💻 Рабочие станции',
      'filter_mobile': '📱 Мобильные пульты',
      'filter_extensions': '🧩 Расширения браузера',
      'filter_cloud': '☁️ Облачные утилиты',
      'dir': 'ltr'
    },
    'de': {
      'nav_main': '&larr; Hauptbetriebszentrum',
      'nav_jarvis': '🤖 JARVIS',
      'nav_gestube': 'GESTUBE',
      'nav_echonode': '⛏️ EchoNode',
      'nav_cursors': '🕹️ Cursor-Pakete',
      'nav_share': '📤 Teilen (Share)',
      'nav_languages': '🌐 Sprachen',
      'nav_feedback': '⭐ Feedback / Fehler melden',
      'nav_login': '👤 Anmelden / Registrieren',
      'modal_cancel': 'Abbrechen',
      'modal_submit': 'Bericht übermitteln ⚡',
      'ofaa_eyebrow': '⚡ SOUVERÄNES ÖKOSYSTEM-VERZEICHNIS',
      'ofaa_title': 'Weitere Funktionen und Anwendungen (OFAA)',
      'ofaa_desc': 'Vollständiger Katalog autonomer KI-Begleiter, eigenständiger Desktop-Workstations, mobiler Fernbedienungen, Browser-Erweiterungen und Cloud-Dienstprogramme.',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">Download-Autorisierung:</strong> Das Durchsuchen der Website ist für alle offen. Für Installationsprogramme ist ein authentifiziertes Konto erforderlich.',
      'ofaa_search_placeholder': 'Anwendungen, Funktionen, Erweiterungen suchen...',
      'filter_all': 'Alle Apps & Funktionen (8)',
      'filter_ai': '🤖 KI & Intelligenz',
      'filter_desktop': '💻 Desktop-Workstations',
      'filter_mobile': '📱 Mobil & Remote',
      'filter_extensions': '🧩 Browser-Erweiterungen',
      'filter_cloud': '☁️ Cloud & Dienstprogramme',
      'dir': 'ltr'
    },
    'ja': {
      'nav_main': '&larr; メインオペレーションセンター',
      'nav_jarvis': '🤖 JARVIS',
      'nav_gestube': 'GESTUBE',
      'nav_echonode': '⛏️ EchoNode',
      'nav_cursors': '🕹️ カーソル (Cursors)',
      'nav_share': '📤 共有 (Share)',
      'nav_languages': '🌐 言語 (Languages)',
      'nav_feedback': '⭐ フィードバック / バグ報告',
      'nav_login': '👤 ログイン / 新規登録',
      'modal_cancel': 'キャンセル',
      'modal_submit': 'レポート送信 ⚡',
      'ofaa_eyebrow': '⚡ 主権エコシステムディレクトリ',
      'ofaa_title': 'その他の機能とアプリケーション (OFAA)',
      'ofaa_desc': '自律型AIコンパニオン、スタンドアロンデスクトップワークステーション、モバイルリモートコントローラー、カスタムブラウザ拡張機能、クラウドユーティリティの完全なカタログ。',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">ダウンロード認証：</strong> サイトの閲覧と機能の探索はどなたでも可能です。インストーラーをダウンロードするには認証アカウントが必要です。',
      'ofaa_search_placeholder': 'アプリ、機能、拡張機能、タグを検索...',
      'filter_all': 'すべてのアプリと機能 (8)',
      'filter_ai': '🤖 AIとインテリジェンス',
      'filter_desktop': '💻 デスクトップワークステーション',
      'filter_mobile': '📱 モバイル＆リモート',
      'filter_extensions': '🧩 ブラウザ拡張機能',
      'filter_cloud': '☁️ クラウド＆ユーティリティ',
      'dir': 'ltr'
    }
  };

  /**
   * Resolves target locale from URL param (?hl=..., ?lang=...), filename, or localStorage
   */
  function resolveTargetLocale() {
    const params = new URLSearchParams(window.location.search);
    const hlParam = params.get('hl') || params.get('lang');
    if (hlParam) {
      const cleanHl = hlParam.trim().toLowerCase();
      if (LOCALE_MAP[cleanHl]) return LOCALE_MAP[cleanHl];
      const prefix = cleanHl.split(/[-_]/)[0];
      if (LOCALE_MAP[prefix]) return LOCALE_MAP[prefix];
      
      // Dynamic fallback for any world language
      const isRtl = RTL_SET.has(prefix);
      return { code: prefix, hl: hlParam.trim(), name: hlParam.toUpperCase(), native: hlParam, dir: isRtl ? 'rtl' : 'ltr', flag: '🌐' };
    }

    // Check filename for -lang markers
    const path = window.location.pathname.toLowerCase();
    for (const key of Object.keys(LOCALE_MAP)) {
      if (path.includes(`-${key}.`) || path.endsWith(`-${key}`)) {
        return LOCALE_MAP[key];
      }
    }

    // Check localStorage
    try {
      const storedHl = localStorage.getItem('orbit_hl');
      if (storedHl) {
        const cleanHl = storedHl.trim().toLowerCase();
        if (LOCALE_MAP[cleanHl]) return LOCALE_MAP[cleanHl];
        const prefix = cleanHl.split(/[-_]/)[0];
        if (LOCALE_MAP[prefix]) return LOCALE_MAP[prefix];
      }
      const stored = localStorage.getItem('orbit_lang');
      if (stored && LOCALE_MAP[stored.toLowerCase()]) {
        return LOCALE_MAP[stored.toLowerCase()];
      }
    } catch (e) {}

    return LOCALE_MAP['en'];
  }

  /**
   * Synchronizes URL query parameter ?hl=... without reloading page
   */
  function syncUrlParam(localeObj) {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('hl') !== localeObj.hl) {
        url.searchParams.set('hl', localeObj.hl);
        window.history.replaceState({ orbit_hl: localeObj.hl }, '', url.toString());
      }
    } catch (e) {}
  }

  /**
   * Propagate ?hl=... to all internal links across navigation bar and page
   */
  function propagateHlToInternalLinks(hlVal) {
    if (!hlVal) return;
    const links = document.querySelectorAll('a[href]');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      if (href.match(/\.(zip|apk|exe|bat|msi|tar|gz|json|kdbx)($|\?)/i)) return;
      if (href.startsWith('http') && !href.includes(window.location.hostname)) return;

      try {
        const url = new URL(href, window.location.href);
        url.searchParams.set('hl', hlVal);
        a.setAttribute('href', url.pathname + url.search + url.hash);
      } catch (err) {}
    });
  }

  /**
   * Translates elements matching data-i18n attributes or fallback IDs
   */
  function translatePageContent(langCode) {
    const dict = COMMON_I18N[langCode] || COMMON_I18N['en'];

    // Update text for data-i18n tags
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Translate common top navbar buttons if they exist
    const mainOpsBtn = document.querySelector('.top-nav a[href*="home"], .top-nav a[href="/"], .top-nav a[href="../"]');
    if (mainOpsBtn && !mainOpsBtn.getAttribute('data-i18n')) {
      if (dict['nav_main']) mainOpsBtn.innerHTML = dict['nav_main'];
    }

    const fbBtn = document.querySelector('.top-nav button.nav-pill-fb');
    if (fbBtn && !fbBtn.getAttribute('data-i18n')) {
      if (dict['nav_feedback']) fbBtn.innerHTML = dict['nav_feedback'];
    }
  }

  /**
   * Core function to apply language across the document
   */
  function applyOrbitLanguage(langKey, updateUrl = true) {
    let loc = LOCALE_MAP[langKey.toLowerCase()];
    if (!loc) {
      const prefix = langKey.split(/[-_]/)[0].toLowerCase();
      loc = LOCALE_MAP[prefix];
    }
    if (!loc) {
      const isRtl = RTL_SET.has(langKey.toLowerCase());
      loc = { code: langKey, hl: langKey, name: langKey.toUpperCase(), native: langKey, dir: isRtl ? 'rtl' : 'ltr', flag: '🌐' };
    }

    // Set document language and direction
    document.documentElement.lang = loc.code;
    document.documentElement.dir = loc.dir;
    document.body.dir = loc.dir;
    if (loc.dir === 'rtl') {
      document.documentElement.classList.add('orbit-rtl');
      document.body.classList.add('orbit-rtl');
    } else {
      document.documentElement.classList.remove('orbit-rtl');
      document.body.classList.remove('orbit-rtl');
    }

    // Save preferences
    try {
      localStorage.setItem('orbit_hl', loc.hl);
      localStorage.setItem('orbit_lang', loc.code);
    } catch (e) {}

    // Translate UI
    translatePageContent(loc.code);

    // Update select UI
    const sel = document.getElementById('orbit-lang-select') || document.querySelector('.lang-select');
    if (sel) {
      sel.value = loc.code;
    }

    // Update URL parameter
    if (updateUrl) {
      syncUrlParam(loc);
    }

    // Propagate parameter to links
    propagateHlToInternalLinks(loc.hl);
  }

  /**
   * Global language switcher function accessible by dropdowns
   */
  window.changeLanguage = function(langKey, navigateToFile = false) {
    const loc = LOCALE_MAP[langKey.toLowerCase()] || LOCALE_MAP[langKey.split(/[-_]/)[0].toLowerCase()] || { code: langKey, hl: langKey, dir: RTL_SET.has(langKey) ? 'rtl' : 'ltr' };

    if (navigateToFile) {
      const p = window.location.pathname;
      let targetFile = `index-${loc.code}.html`;
      if (p.includes('download')) {
        targetFile = `download-${loc.code}.html`;
      }
      window.location.href = targetFile + `?hl=${loc.hl}`;
      return;
    }

    applyOrbitLanguage(loc.code, true);
  };

  /**
   * Injects language selector into navigation bar if missing
   */
  function ensureLangSelectUI() {
    if (document.getElementById('lang-select') || document.querySelector('.lang-select') || document.getElementById('orbit-lang-select')) return;
    const navLinks = document.querySelector('.nav-links') || document.querySelector('.top-nav') || document.querySelector('.navbar');
    if (!navLinks) return;

    const sel = document.createElement('select');
    sel.className = 'lang-select';
    sel.id = 'orbit-lang-select';
    sel.setAttribute('aria-label', 'Select Language');
    sel.style.cssText = 'background: rgba(12, 16, 23, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); color: #f8fafc; padding: 6px 10px; border-radius: 8px; font-size: 11.5px; font-family: monospace; cursor: pointer; margin-right: 4px;';
    
    // Grouped language selector options
    sel.innerHTML = `
      <optgroup label="🌐 Global Languages">
        <option value="en">EN English</option>
        <option value="es">ES Español</option>
        <option value="fr">FR Français</option>
        <option value="ar">AR العربية (RTL)</option>
        <option value="zh">ZH 中文 (Mandarin)</option>
        <option value="ja">JA 日本語 (Japanese)</option>
        <option value="ru">RU Русский (Russian)</option>
        <option value="de">DE Deutsch (German)</option>
        <option value="pt">PT Português</option>
        <option value="it">IT Italiano</option>
        <option value="nl">NL Nederlands</option>
        <option value="tr">TR Türkçe</option>
        <option value="ko">KO 한국어 (Korean)</option>
        <option value="fa">FA فارسی (RTL)</option>
        <option value="vi">VI Tiếng Việt</option>
        <option value="id">ID Bahasa Indonesia</option>
      </optgroup>
      <optgroup label="🇮🇳 Indian Languages (22 Scheduled & Spoken)">
        <option value="hi">HI हिन्दी (Hindi)</option>
        <option value="bn">BN বাংলা (Bengali)</option>
        <option value="te">TE తెలుగు (Telugu)</option>
        <option value="mr">MR मराठी (Marathi)</option>
        <option value="ta">TA தமிழ் (Tamil)</option>
        <option value="gu">GU ગુજરાતી (Gujarati)</option>
        <option value="ur">UR اردو (Urdu - RTL)</option>
        <option value="kn">KN ಕನ್ನಡ (Kannada)</option>
        <option value="ml">ML മലയാളം (Malayalam)</option>
        <option value="pa">PA ਪੰਜਾਬੀ (Punjabi)</option>
        <option value="or">OR ଓଡ଼ିଆ (Odia)</option>
        <option value="as">AS অসমীয়া (Assamese)</option>
        <option value="sa">SA संस्कृतम् (Sanskrit)</option>
        <option value="ne">NE नेपाली (Nepali)</option>
        <option value="bho">BHO भोजपुरी (Bhojpuri)</option>
        <option value="mai">MAI मैथिली (Maithili)</option>
        <option value="kok">KOK कोंकणी (Konkani)</option>
      </optgroup>
    `;
    sel.onchange = function() { window.changeLanguage(this.value); };

    // Insert as first item in nav-links
    if (navLinks.firstChild) {
      navLinks.insertBefore(sel, navLinks.firstChild);
    } else {
      navLinks.appendChild(sel);
    }
  }

  // Initialization
  function initOrbitI18n() {
    ensureLangSelectUI();
    const loc = resolveTargetLocale();
    applyOrbitLanguage(loc.code, true);

    // Re-propagate on dynamic DOM updates
    setTimeout(() => propagateHlToInternalLinks(loc.hl), 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrbitI18n);
  } else {
    initOrbitI18n();
  }

  window.OrbitI18n = {
    LOCALE_MAP,
    applyLanguage: applyOrbitLanguage,
    resolveTargetLocale,
    syncUrlParam
  };
})();
