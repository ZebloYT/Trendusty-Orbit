/**
 * Trendusty Orbit Universal Sovereign i18n & URL Locale Router Engine
 * Standardizes URL parameter matching Google/Gemini (?hl=en-IN, ?hl=ar, ?hl=es, ?hl=fr)
 * Supports dynamic locale switching, per-language file mirrors, and persistent navigation propagation.
 */
(function() {
  'use strict';

  // Locale configuration mapping
  const LOCALE_MAP = {
    'en': { code: 'en', hl: 'en-IN', name: 'EN English', dir: 'ltr' },
    'es': { code: 'es', hl: 'es', name: 'ES Español', dir: 'ltr' },
    'fr': { code: 'fr', hl: 'fr', name: 'FR Français', dir: 'ltr' },
    'ar': { code: 'ar', hl: 'ar', name: 'AR العربية', dir: 'rtl' }
  };

  // Common UI Dictionary
  const COMMON_I18N = {
    'en': {
      'nav_main': '&larr; Main Operations Center',
      'nav_jarvis': '🤖 JARVIS',
      'nav_gestube': 'GESTUBE',
      'nav_echonode': '⛏️ EchoNode',
      'nav_cursors': '🕹️ Cursors',
      'nav_share': '📤 Share',
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
    'es': {
      'nav_main': '&larr; Centro de Operaciones Principal',
      'nav_jarvis': '🤖 JARVIS',
      'nav_gestube': 'GESTUBE',
      'nav_echonode': '⛏️ EchoNode',
      'nav_cursors': '🕹️ Cursores',
      'nav_share': '📤 Compartir',
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
      'filter_desktop': '💻 Estaciones de Escritorio',
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
      'nav_share': '📤 Partage',
      'nav_feedback': '⭐ Retours / Rapport de bogue',
      'nav_login': '👤 Connexion / S\'inscrire',
      'modal_cancel': 'Annuler',
      'modal_submit': 'Transmettre le Rapport ⚡',
      'ofaa_eyebrow': '⚡ RÉPERTOIRE DE L\'ÉCOSYSTÈME SOUVERAIN',
      'ofaa_title': 'Autres Fonctionnalités et Applications',
      'ofaa_desc': 'Catalogue complet de compagnons IA autonomes, stations de travail de bureau autonomes, contrôleurs mobiles à distance, extensions de navigateur personnalisées et chaînes d\'outils utilitaires cloud — conçus selon une architecture zéro télémétrie.',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">Autorisation de téléchargement :</strong> La navigation sur le site et l\'exploration des fonctionnalités sont ouvertes à tous. Un compte d\'opérateur authentifié est requis pour télécharger les installateurs et archives binaires.',
      'ofaa_search_placeholder': 'Rechercher des applications, fonctionnalités, extensions ou tags...',
      'filter_all': 'Toutes les Apps & Fonctions (8)',
      'filter_ai': '🤖 IA & Intelligence',
      'filter_desktop': '💻 Postes de Travail',
      'filter_mobile': '📱 Mobile & À Distance',
      'filter_extensions': '🧩 Extensions de Navigateur',
      'filter_cloud': '☁️ Cloud et Utilitaires',
      'dir': 'ltr'
    },
    'ar': {
      'nav_main': '&rarr; مركز العمليات الرئيسي',
      'nav_jarvis': '🤖 جارفيس',
      'nav_gestube': 'جيستيوب',
      'nav_echonode': '⛏️ إيكونود',
      'nav_cursors': '🕹️ المؤشرات',
      'nav_share': '📤 مشاركة',
      'nav_feedback': '⭐ الملاحظات / تقرير الأخطاء',
      'nav_login': '👤 تسجيل الدخول / حساب جديد',
      'modal_cancel': 'إلغاء',
      'modal_submit': 'إرسال التقرير ⚡',
      'ofaa_eyebrow': '⚡ دليل المنظومة السيادية الشاملة',
      'ofaa_title': 'الميزات والتطبيقات الأخرى',
      'ofaa_desc': 'كتالوج شامل للمساعدين الذاتيين المدعومين بالذكاء الاصطناعي، محطات العمل المكتبية المستقلة، أجهزة التحكم المحمولة، إضافات المتصفح المخصصة وسلاسل الأدوات السحابية — مصممة تحت معمارية واحدة خالية تماماً من تتبع البيانات.',
      'ofaa_auth_banner': '🔒 <strong style="color: #ffffff !important;">تصريح التنزيل:</strong> التصفح واستكشاف الميزات متاح للجميع. يلزم تسجيل حساب لتنزيل برامج التثبيت والحزم البرمجية.',
      'ofaa_search_placeholder': 'ابحث في التطبيقات، الميزات، الإضافات أو التصنيفات...',
      'filter_all': 'كافة التطبيقات والميزات (8)',
      'filter_ai': '🤖 الذكاء الاصطناعي',
      'filter_desktop': '💻 محطات العمل المكتبية',
      'filter_mobile': '📱 المحمول والتحكم عن بعد',
      'filter_extensions': '🧩 إضافات المتصفح',
      'filter_cloud': '☁️ السحابة والأدوات',
      'dir': 'rtl'
    }
  };

  /**
   * Resolves language code from URL ?hl=... or ?lang=... or current filename
   */
  function resolveTargetLocale() {
    try {
      const search = window.location.search || '';
      // Support ?hl=en-IN, ?hl=ar, ?lang=es, etc.
      const hlMatch = search.match(/[?&]hl=([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)/i);
      if (hlMatch && hlMatch[1]) {
        const prefix = hlMatch[1].substring(0, 2).toLowerCase();
        if (LOCALE_MAP[prefix]) return LOCALE_MAP[prefix];
      }

      const langMatch = search.match(/[?&]lang=([a-zA-Z]{2})/i);
      if (langMatch && langMatch[1]) {
        const prefix = langMatch[1].toLowerCase();
        if (LOCALE_MAP[prefix]) return LOCALE_MAP[prefix];
      }

      // Detect from filename like index-ar.html or download-es.html
      const path = window.location.pathname || '';
      for (const code of ['ar', 'es', 'fr', 'en']) {
        if (path.includes(`-${code}.html`) || path.includes(`-${code}`) || path.endsWith(`/${code}`) || path.endsWith(`/${code}/`)) {
          return LOCALE_MAP[code];
        }
      }

      // Check localStorage
      const savedHl = localStorage.getItem('orbit_hl');
      if (savedHl) {
        const prefix = savedHl.substring(0, 2).toLowerCase();
        if (LOCALE_MAP[prefix]) return LOCALE_MAP[prefix];
      }
      const savedLang = localStorage.getItem('orbit_lang');
      if (savedLang && LOCALE_MAP[savedLang]) {
        return LOCALE_MAP[savedLang];
      }

      // Default: en with hl=en-IN as requested
      return LOCALE_MAP['en'];
    } catch (e) {
      return LOCALE_MAP['en'];
    }
  }

  /**
   * Updates browser address bar query param to ?hl=<value> without reloading
   */
  function syncUrlParam(localeObj) {
    try {
      if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        const url = new URL(window.location.href);
        const currentHl = url.searchParams.get('hl');
        if (currentHl !== localeObj.hl) {
          url.searchParams.set('hl', localeObj.hl);
          url.searchParams.delete('lang'); // clean legacy lang
          window.history.replaceState({ hl: localeObj.hl, lang: localeObj.code }, '', url.toString());
        }
      }
    } catch (e) {}
  }

  /**
   * Automatically rewrites internal links so that clicking preserves ?hl=...
   */
  function propagateHlToInternalLinks(hlVal) {
    if (!hlVal) return;
    try {
      const links = document.querySelectorAll('a[href]');
      links.forEach(a => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (href.startsWith('http://') || href.startsWith('https://')) {
          if (!href.includes('trendustyorbit.online') && !href.startsWith(window.location.origin)) return;
        }

        try {
          const targetUrl = new URL(href, window.location.href);
          targetUrl.searchParams.set('hl', hlVal);
          targetUrl.searchParams.delete('lang');
          
          if (href.startsWith('/')) {
            a.setAttribute('href', targetUrl.pathname + targetUrl.search + targetUrl.hash);
          } else if (href.startsWith('./') || href.startsWith('../')) {
            a.setAttribute('href', targetUrl.pathname + targetUrl.search + targetUrl.hash);
          } else if (!href.startsWith('http')) {
            a.setAttribute('href', targetUrl.pathname + targetUrl.search + targetUrl.hash);
          } else {
            a.setAttribute('href', targetUrl.toString());
          }
        } catch (err) {}
      });
    } catch (e) {}
  }

  /**
   * Applies translations and language changes to the document
   */
  function applyOrbitLanguage(langKey, updateUrl = true) {
    const prefix = (langKey || 'en').substring(0, 2).toLowerCase();
    const loc = LOCALE_MAP[prefix] || LOCALE_MAP['en'];
    const dict = COMMON_I18N[loc.code] || COMMON_I18N['en'];

    document.documentElement.setAttribute('lang', loc.code);
    document.documentElement.setAttribute('dir', loc.dir);

    // Sync all language dropdowns on the page
    document.querySelectorAll('.lang-select, #lang-select, #orbit-lang-select').forEach(sel => {
      sel.value = loc.code;
    });

    // Update common top nav pill elements if present
    const mainPill = document.querySelector('.nav-links a[href*="/home/"]');
    if (mainPill && dict.nav_main) {
      mainPill.innerHTML = dict.nav_main;
    }
    const fbBtn = document.querySelector('.nav-links button[onclick*="Feedback"], .nav-links a[href*="feedback"]');
    if (fbBtn && dict.nav_feedback) {
      fbBtn.innerHTML = dict.nav_feedback;
    }

    // Translate OFAA specific elements if present
    const eyebrow = document.querySelector('.hero-eyebrow span');
    if (eyebrow && dict.ofaa_eyebrow) eyebrow.textContent = dict.ofaa_eyebrow;

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && dict.ofaa_title && window.location.pathname.includes('ofaa')) heroTitle.textContent = dict.ofaa_title;

    const heroDesc = document.querySelector('.hero-desc');
    if (heroDesc && dict.ofaa_desc && window.location.pathname.includes('ofaa')) heroDesc.textContent = dict.ofaa_desc;

    const authBannerText = document.querySelector('.auth-banner-box span');
    if (authBannerText && dict.ofaa_auth_banner) authBannerText.innerHTML = dict.ofaa_auth_banner;

    const ofaaSearch = document.getElementById('ofaa-search-input');
    if (ofaaSearch && dict.ofaa_search_placeholder) ofaaSearch.placeholder = dict.ofaa_search_placeholder;

    // Filter buttons on OFAA
    const filterAll = document.querySelector('.filter-btn[data-filter="all"]');
    if (filterAll && dict.filter_all) filterAll.textContent = dict.filter_all;
    const filterAi = document.querySelector('.filter-btn[data-filter="ai"]');
    if (filterAi && dict.filter_ai) filterAi.textContent = dict.filter_ai;
    const filterDesk = document.querySelector('.filter-btn[data-filter="desktop"]');
    if (filterDesk && dict.filter_desktop) filterDesk.textContent = dict.filter_desktop;
    const filterMob = document.querySelector('.filter-btn[data-filter="mobile"]');
    if (filterMob && dict.filter_mobile) filterMob.textContent = dict.filter_mobile;
    const filterExt = document.querySelector('.filter-btn[data-filter="extensions"]');
    if (filterExt && dict.filter_extensions) filterExt.textContent = dict.filter_extensions;
    const filterCloud = document.querySelector('.filter-btn[data-filter="cloud"]');
    if (filterCloud && dict.filter_cloud) filterCloud.textContent = dict.filter_cloud;

    // Call page-specific dictionary if present (e.g. I18N_DICTS on home or DL_I18N_DICTS on download)
    if (window.I18N_DICTS && window.I18N_DICTS[loc.code]) {
      const pDict = window.I18N_DICTS[loc.code];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (pDict[k]) {
          if (pDict[k].includes('<') || pDict[k].includes('&')) el.innerHTML = pDict[k];
          else el.textContent = pDict[k];
        }
      });
    } else if (window.DL_I18N_DICTS && window.DL_I18N_DICTS[loc.code]) {
      const pDict = window.DL_I18N_DICTS[loc.code];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (pDict[k]) {
          if (pDict[k].includes('<') || pDict[k].includes('&')) el.innerHTML = pDict[k];
          else el.textContent = pDict[k];
        }
      });
    }

    // Save preference
    localStorage.setItem('orbit_lang', loc.code);
    localStorage.setItem('orbit_hl', loc.hl);

    // Sync address bar parameter
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
    const prefix = (langKey || 'en').substring(0, 2).toLowerCase();
    const loc = LOCALE_MAP[prefix] || LOCALE_MAP['en'];

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
    sel.innerHTML = `
      <option value="en">EN English</option>
      <option value="es">ES Español</option>
      <option value="fr">FR Français</option>
      <option value="ar">AR العربية</option>
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
