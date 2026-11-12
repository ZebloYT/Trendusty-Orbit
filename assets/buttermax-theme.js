/**
 * TRENDUSTY ORBIT — BUTTERMAX THEME ENGINE
 * Implements the signature Buttermax yellow aesthetic, 3D floating hardware physics,
 * real-time mini screen HUD simulation, interactive audio synthesizer, and curtain peel reveal.
 */

(function() {
  'use strict';

  // State
  let isCurtainPeeled = false;
  let isThemeButtermax = true;
  let audioCtx = null;
  let isAudioPlaying = false;
  let synthGain = null;
  let synthNodes = [];

  // 3D Physics State
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let targetTransX = 0;
  let targetTransY = 0;
  let currentTransX = 0;
  let currentTransY = 0;
  let animFrameId = null;

  // DOM Elements
  let curtainEl, unpeelBtn, deviceEl, shadowEl, canvasEl, audioBtn;

  // Initialize theme on DOM ready
  function init() {
    curtainEl = document.getElementById('buttermax-hero-curtain');
    unpeelBtn = document.getElementById('buttermax-unpeel-btn');
    deviceEl = document.getElementById('bm-device-3d');
    shadowEl = document.getElementById('bm-drop-shadow');
    canvasEl = document.getElementById('bm-screen-canvas');
    audioBtn = document.getElementById('bm-audio-pill');

    // Check saved theme preference
    const savedTheme = localStorage.getItem('orbit_theme');
    if (savedTheme === 'obsidian') {
      setTheme(false, false);
    } else {
      setTheme(true, false);
    }

    // Attach listeners
    setupPeelTriggers();
    setup3DPhysics();
    setupMiniScreen();
    setupAudioSynthesizer();
    setupCloseButton();
    setupFluidBackground();
    setupBgTheme();
    setupPageTransitions();
    setupSmoothScroll();
    setupButtermaxCursor();

    // Check saved curtain peel state
    const savedPeeled = sessionStorage.getItem('orbit_curtain_peeled');
    if (savedPeeled === 'true' && curtainEl) {
      peelCurtain(false);
    }
  }

  // --- THEME SWITCHER ---
  window.toggleOrbitTheme = function() {
    setTheme(!isThemeButtermax, true);
  };

  function setTheme(buttermax, save) {
    isThemeButtermax = buttermax;
    if (buttermax) {
      document.documentElement.classList.add('theme-buttermax');
      document.body.classList.add('theme-buttermax');
      if (curtainEl) curtainEl.style.display = 'flex';
      updateThemeButtons('🟡 ORBIT GOLD');
    } else {
      document.documentElement.classList.remove('theme-buttermax');
      document.body.classList.remove('theme-buttermax');
      if (curtainEl) curtainEl.style.display = 'none';
      if (unpeelBtn) unpeelBtn.classList.remove('visible');
      updateThemeButtons('🌌 OBSIDIAN');
    }
    if (save) {
      localStorage.setItem('orbit_theme', buttermax ? 'buttermax' : 'obsidian');
    }
  }

  function updateThemeButtons(label) {
    const isObsidian = label.includes('OBSIDIAN');
    const icon = isObsidian ? '🌌' : '🟡';
    const text = isObsidian ? 'OBSIDIAN' : 'ORBIT GOLD';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.innerHTML = `<span>${icon}</span> <span class="theme-btn-label">${text}</span>`;
    });
  }

  // --- BACKGROUND THEME ENGINE (BUTTER / NOIR / AMBER) ---
  // Canonical Buttermax yellow theme is default (Solar Butter #ffdb15 - matching buttermax.net)
  let savedBgTheme = localStorage.getItem('orbit_bg_theme');
  if (!savedBgTheme || savedBgTheme === 'noir') {
    savedBgTheme = 'butter';
    try { localStorage.setItem('orbit_bg_theme', 'butter'); } catch(e) {}
  }
  let currentBgTheme = savedBgTheme;

  function setupBgTheme() {
    setBgTheme(currentBgTheme, false);
  }

  window.cycleBgTheme = function() {
    const themes = ['butter', 'noir', 'amber'];
    const nextIdx = (themes.indexOf(currentBgTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    window.triggerPageTransition(null, function() {
      setBgTheme(nextTheme, true);
    });
  };

  function setBgTheme(theme, save) {
    currentBgTheme = theme;
    ['bg-noir', 'bg-butter', 'bg-amber'].forEach(cls => {
      if (curtainEl) curtainEl.classList.remove(cls);
      document.body.classList.remove(cls);
      document.documentElement.classList.remove(cls);
    });

    const activeCls = 'bg-' + theme;
    if (curtainEl) curtainEl.classList.add(activeCls);
    document.body.classList.add(activeCls);
    document.documentElement.classList.add(activeCls);

    const nameEl = document.getElementById('bm-bg-name');
    if (nameEl) {
      nameEl.textContent = theme.toUpperCase();
    }

    if (save) {
      localStorage.setItem('orbit_bg_theme', theme);
    }
  }

  // --- BUTTERY PAGE & SECTION TRANSITION ENGINE ---
  let transitionOverlay = null;

  function setupPageTransitions() {
    transitionOverlay = document.getElementById('orbit-page-transition');
    if (!transitionOverlay) {
      transitionOverlay = document.createElement('div');
      transitionOverlay.id = 'orbit-page-transition';
      transitionOverlay.className = 'orbit-page-transition';
      transitionOverlay.innerHTML = `
        <div class="opt-curtain-layer">
          <div class="opt-brand-wrap">
            <div class="opt-symbol">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" stroke="#ffd600" stroke-dasharray="4 2"/>
                <path d="M12 3v18M3 12h18" stroke="#ffd600" opacity="0.6"/>
                <circle cx="12" cy="12" r="3" fill="#ffd600"/>
              </svg>
            </div>
            <div class="opt-title">ORBIT STUDIO</div>
            <div class="opt-sub">SOVEREIGN COMMON OPERATING PICTURE</div>
            <div class="opt-loader-bar"><span></span></div>
          </div>
        </div>
      `;
      document.body.appendChild(transitionOverlay);
    }

    // Intercept navigation links
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('javascript:')) return;
      if (link.getAttribute('download') || link.getAttribute('target') === '_blank') return;
      if (link.hasAttribute('onclick') && (link.getAttribute('onclick').includes('openAuthModal') || link.getAttribute('onclick').includes('openChromeExtensionModal'))) return;

      // Section anchor jumps
      if (href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          window.triggerPageTransition(null, function() {
            if (curtainEl && !isCurtainPeeled && href !== '#') {
              peelCurtain(false);
            }
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
        return;
      }

      // Internal page changes
      if (href.startsWith('/') || href.startsWith('../') || href.startsWith('./') || !href.includes('://')) {
        e.preventDefault();
        window.triggerPageTransition(href, null);
      }
    });
  }

  window.triggerPageTransition = function(targetUrl, callback) {
    if (!transitionOverlay) return;
    transitionOverlay.classList.remove('leaving');
    transitionOverlay.classList.add('active');
    void transitionOverlay.offsetWidth;
    transitionOverlay.classList.add('entering');

    setTimeout(() => {
      if (callback) callback();
      if (targetUrl) {
        window.location.href = targetUrl;
        return;
      }

      setTimeout(() => {
        transitionOverlay.classList.remove('entering');
        transitionOverlay.classList.add('leaving');

        setTimeout(() => {
          transitionOverlay.classList.remove('active', 'leaving');
        }, 500);
      }, 150);
    }, 360);
  };

  // --- CURTAIN PEEL REVEAL MECHANIC ---
  function setupPeelTriggers() {
    const peelBtn = document.getElementById('bm-peel-btn');
    if (peelBtn) {
      peelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        peelCurtain(true);
      });
    }

    if (unpeelBtn) {
      unpeelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        unpeelCurtain();
      });
    }

    // Wheel/Scroll over curtain trigger
    let wheelAcc = 0;
    if (curtainEl) {
      curtainEl.addEventListener('wheel', function(e) {
        if (!isCurtainPeeled && e.deltaY > 25) {
          wheelAcc += e.deltaY;
          if (wheelAcc > 70) {
            peelCurtain(true);
            wheelAcc = 0;
          }
        }
      }, { passive: true });
    }
  }

  function peelCurtain(smoothScroll) {
    if (!curtainEl) return;
    isCurtainPeeled = true;
    curtainEl.classList.add('peeled');
    if (unpeelBtn) unpeelBtn.classList.add('visible');
    sessionStorage.setItem('orbit_curtain_peeled', 'true');

    if (smoothScroll) {
      const interfaceSection = document.getElementById('interface') || document.querySelector('.showcase');
      if (interfaceSection) {
        setTimeout(() => {
          interfaceSection.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }

  function unpeelCurtain() {
    if (!curtainEl) return;
    isCurtainPeeled = false;
    curtainEl.classList.remove('peeled');
    if (unpeelBtn) unpeelBtn.classList.remove('visible');
    sessionStorage.setItem('orbit_curtain_peeled', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 3D FLOATING CONSOLE PHYSICS ---
  function setup3DPhysics() {
    const viewport = document.getElementById('bm-console-viewport');
    if (!viewport || !deviceEl) return;

    function handleMove(clientX, clientY) {
      const rect = viewport.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (clientX - centerX) / (rect.width / 2);
      const normY = (clientY - centerY) / (rect.height / 2);

      targetRotY = Math.max(-28, Math.min(28, normX * 24));
      targetRotX = Math.max(-22, Math.min(22, -normY * 20));
      targetTransX = normX * 22;
      targetTransY = normY * 18;
    }

    // Mouse movement
    window.addEventListener('mousemove', function(e) {
      if (isCurtainPeeled) return;
      handleMove(e.clientX, e.clientY);
    });

    // Touch support for mobile / tablets
    viewport.addEventListener('touchmove', function(e) {
      if (isCurtainPeeled || !e.touches[0]) return;
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // Gyroscope for Android / Mobile devices
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', function(e) {
        if (isCurtainPeeled || e.gamma === null) return;
        targetRotY = Math.max(-25, Math.min(25, e.gamma * 0.7));
        targetRotX = Math.max(-20, Math.min(20, (e.beta - 45) * 0.5));
      });
    }

    // Reset when leaving
    window.addEventListener('mouseleave', function() {
      targetRotX = 0;
      targetRotY = 0;
      targetTransX = 0;
      targetTransY = 0;
    });

    // Physics Loop
    let startTime = performance.now();
    function updatePhysics() {
      const time = performance.now() - startTime;

      // Organic hover float wave
      const floatOffsetY = Math.sin(time * 0.0022) * 8;
      const floatRotZ = Math.cos(time * 0.0018) * 1.8;

      // Spring Interpolation (Lerp)
      currentRotX += (targetRotX - currentRotX) * 0.085;
      currentRotY += (targetRotY - currentRotY) * 0.085;
      currentTransX += (targetTransX - currentTransX) * 0.085;
      currentTransY += (targetTransY - currentTransY) * 0.085;

      if (deviceEl) {
        deviceEl.style.transform = `
          translate3d(${currentTransX}px, ${currentTransY + floatOffsetY}px, 0)
          rotateX(${currentRotX}deg)
          rotateY(${currentRotY}deg)
          rotateZ(${floatRotZ}deg)
        `;
      }

      // Dynamic Contact Shadow on Floor
      if (shadowEl) {
        const shadowShiftX = currentRotY * 1.8;
        const shadowScale = 1 - Math.abs(currentRotX) * 0.01 + (floatOffsetY * 0.015);
        const shadowBlur = 12 + Math.abs(floatOffsetY) * 0.8;
        const shadowOpacity = 0.55 - (floatOffsetY * 0.012);

        shadowEl.style.transform = `
          translateX(${shadowShiftX}px)
          scale(${Math.max(0.7, shadowScale)})
        `;
        shadowEl.style.filter = `blur(${shadowBlur}px)`;
        shadowEl.style.opacity = Math.max(0.25, Math.min(0.7, shadowOpacity));
      }

      animFrameId = requestAnimationFrame(updatePhysics);
    }

    updatePhysics();
  }

  // --- MINI SCREEN HUD SIMULATION CANVAS ---
  function setupMiniScreen() {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    let width = canvasEl.width = 214;
    let height = canvasEl.height = 165;
    let angle = 0;
    let radarSweep = 0;

    function renderScreen() {
      if (isCurtainPeeled) {
        requestAnimationFrame(renderScreen);
        return;
      }

      ctx.fillStyle = '#060a10';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;
      const radius = 46;

      // Radar rings
      ctx.strokeStyle = 'rgba(0, 245, 184, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.75, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius - 8, cy); ctx.lineTo(cx + radius + 8, cy);
      ctx.moveTo(cx, cy - radius - 8); ctx.lineTo(cx, cy + radius + 8);
      ctx.strokeStyle = 'rgba(0, 245, 184, 0.22)';
      ctx.stroke();

      // 3D Wireframe Rotating Globe
      angle += 0.018;
      ctx.strokeStyle = '#00f5b8';
      ctx.lineWidth = 1.2;

      // Draw latitude ellipses
      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const rLat = radius * Math.cos(rad);
        const yLat = cy - radius * Math.sin(rad) * 0.35;
        ctx.beginPath();
        ctx.ellipse(cx, yLat, rLat, rLat * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 245, 184, 0.28)';
        ctx.stroke();
      }

      // Draw rotating longitude curves
      for (let lon = 0; lon < 6; lon++) {
        const lonAngle = angle + (lon * Math.PI) / 6;
        const rx = Math.abs(Math.cos(lonAngle)) * radius;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, radius, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 245, 184, 0.35)';
        ctx.stroke();
      }

      // Orbital Satellite Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.4);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.35, radius * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 71, 87, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Satellite blip
      const satT = angle * 2;
      const satX = Math.cos(satT) * radius * 1.35;
      const satY = Math.sin(satT) * radius * 0.5;
      ctx.fillStyle = '#ff4757';
      ctx.shadowColor = '#ff4757';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(satX, satY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Radar sweep cone
      radarSweep += 0.04;
      ctx.save();
      ctx.translate(cx, cy);
      const sweepGrad = ctx.createConicGradient(radarSweep, 0, 0);
      sweepGrad.addColorStop(0, 'rgba(0, 245, 184, 0.35)');
      sweepGrad.addColorStop(0.2, 'transparent');
      sweepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Telemetry HUD text
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00f5b8';
      ctx.fillText('COP: 60,042 CONTACTS', 8, 18);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('SAT: ISS // 418KM', 8, 30);
      ctx.fillText('FPS: 60 // SYNCED', 8, 42);

      requestAnimationFrame(renderScreen);
    }

    renderScreen();
  }

  // --- WEB AUDIO API AMBIENT SYNTHESIZER ---
  function setupAudioSynthesizer() {
    if (!audioBtn) return;

    audioBtn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleAudio();
    });
  }

  function toggleAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      startAmbientSynth();
      audioBtn.classList.add('playing');
      isAudioPlaying = true;
    } else {
      stopAmbientSynth();
      audioBtn.classList.remove('playing');
      isAudioPlaying = false;
    }
  }

  function startAmbientSynth() {
    if (!audioCtx) return;
    synthGain = audioCtx.createGain();
    synthGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    synthGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 1.2);
    synthGain.connect(audioCtx.destination);

    // Warm sub & ambient chords (Buttermax buttery chord: F major 9)
    const freqs = [87.31, 130.81, 174.61, 220.00, 261.63];
    synthNodes = freqs.map((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
      const filter = audioCtx.createBiquadFilter();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + idx * 80, audioCtx.currentTime);

      if (panner) {
        panner.pan.value = (idx - 2) * 0.35;
        osc.connect(filter);
        filter.connect(panner);
        panner.connect(synthGain);
      } else {
        osc.connect(filter);
        filter.connect(synthGain);
      }

      osc.start();
      return osc;
    });
  }

  function stopAmbientSynth() {
    if (!synthGain || !audioCtx) return;
    synthGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    setTimeout(() => {
      synthNodes.forEach(node => {
        try { node.stop(); node.disconnect(); } catch(e) {}
      });
      synthNodes = [];
    }, 850);
  }

  // ==========================================================================
  // BUTTERMAX SIGNATURE MOLTEN PUDDLE ENGINE (IMAGE 1 AUTHENTIC FIDELITY)
  // Features:
  // 1. Console-Grounded Molten Black Puddle resting on the floor beneath the 3D console
  // 2. Viscous inertia deformation reacting elastically to device tilt and cursor
  // 3. Pinch-off trailing droplet beads (● · · · · ·) matching buttermax.net
  // 4. Zero infinite looping worms/caterpillars (evaporating transient wake)
  // 5. Real-time SVG typography clipping & color inversion (#bm-blob-clip)
  // ==========================================================================
  let bgCanvas = null;
  let bgCtx = null;
  let bgWidth = 0;
  let bgHeight = 0;
  let bgBlobClipPath = null;

  // Elastic puddle state
  let currentStretchX = -135;
  let currentStretchY = 12;
  let targetStretchX = -135;
  let targetStretchY = 12;
  let pointerTargetX = -1000;
  let pointerTargetY = -1000;
  let prevPointerX = -1000;
  let prevPointerY = -1000;
  let isPointerActive = false;

  // Transient evaporating mouse splashes (max life 14 frames, dissolves into canvas)
  const transientSplashes = [];

  // Click shockwave ripples
  const bgRipples = [];

  // Viscous micro-droplets
  const bgEmbers = [];
  const TOTAL_EMBERS = 22;

  // Tactical starfield for Obsidian Mode
  const obsidianStars = [];
  const TOTAL_STARS = 65;

  function setupFluidBackground() {
    bgCanvas = document.getElementById('bm-bg-fluid-canvas');
    bgBlobClipPath = document.getElementById('bm-blob-clip-path');
    if (!bgCanvas) return;

    bgCtx = bgCanvas.getContext('2d');
    if (!bgCtx) return;

    function resizeBg() {
      if (!curtainEl || !bgCanvas) return;
      const rect = curtainEl.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      bgWidth = rect.width || window.innerWidth;
      bgHeight = rect.height || window.innerHeight;
      bgCanvas.width = bgWidth * dpr;
      bgCanvas.height = bgHeight * dpr;
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resizeBg);
    resizeBg();

    // Initialize micro-droplets
    for (let i = 0; i < TOTAL_EMBERS; i++) {
      bgEmbers.push({
        x: Math.random() * bgWidth,
        y: Math.random() * bgHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.35 - Math.random() * 0.65,
        radius: 1.5 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        color: 'rgba(18, 18, 18,'
      });
    }

    // Initialize Obsidian stars
    for (let i = 0; i < TOTAL_STARS; i++) {
      obsidianStars.push({
        x: Math.random() * bgWidth,
        y: Math.random() * bgHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7
      });
    }

    function addTransientSplash(x, y) {
      if (transientSplashes.length > 5) transientSplashes.shift();
      transientSplashes.push({
        x: x,
        y: y,
        r: 16,
        life: 14,
        maxLife: 14
      });
    }

    function onPointerMove(clientX, clientY) {
      if (isCurtainPeeled) return;
      const rect = curtainEl.getBoundingClientRect();
      pointerTargetX = clientX - rect.left;
      pointerTargetY = clientY - rect.top;
      isPointerActive = true;

      // Spawn subtle transient splash on fast movement
      if (prevPointerX !== -1000) {
        const dist = Math.hypot(pointerTargetX - prevPointerX, pointerTargetY - prevPointerY);
        if (dist > 32 && Math.random() > 0.5) {
          addTransientSplash(pointerTargetX, pointerTargetY);
        }
      }
      prevPointerX = pointerTargetX;
      prevPointerY = pointerTargetY;
    }

    window.addEventListener('mousemove', function(e) {
      onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    if (curtainEl) {
      curtainEl.addEventListener('touchmove', function(e) {
        if (e.touches[0]) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      // Click / Tap Ripple & Splash
      curtainEl.addEventListener('pointerdown', function(e) {
        if (e.target.closest('button, a, input, select, .bm-controls-row')) return;
        const rect = curtainEl.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        addTransientSplash(px, py);
        bgRipples.push({
          x: px,
          y: py,
          radius: 0,
          maxRadius: Math.max(bgWidth, bgHeight) * 0.4,
          amplitude: 22,
          speed: 6.5
        });
      });
    }

    // Helper to append circle to SVG path string
    function addCircleToSvg(cx, cy, r) {
      return ' M ' + (cx - r).toFixed(1) + ' ' + cy.toFixed(1) +
             ' a ' + r.toFixed(1) + ',' + r.toFixed(1) + ' 0 1,0 ' + (r * 2).toFixed(1) + ',0' +
             ' a ' + r.toFixed(1) + ',' + r.toFixed(1) + ' 0 1,0 -' + (r * 2).toFixed(1) + ',0';
    }

    // Dynamic console anchor getter (grounds puddle directly under floating device)
    function getConsoleAnchor() {
      if (deviceEl && curtainEl) {
        const dRect = deviceEl.getBoundingClientRect();
        const cRect = curtainEl.getBoundingClientRect();
        return {
          x: (dRect.left + dRect.width * 0.5) - cRect.left,
          y: (dRect.top + dRect.height * 0.86) - cRect.top
        };
      }
      return {
        x: bgWidth * 0.5,
        y: bgHeight * 0.525
      };
    }

    // --- BUTTERY LIQUID PUDDLE ANIMATION LOOP ---
    const animStartTime = performance.now();

    function renderLiquidTrail(timestamp) {
      if (isCurtainPeeled) {
        requestAnimationFrame(renderLiquidTrail);
        return;
      }

      const time = timestamp - animStartTime;
      bgCtx.clearRect(0, 0, bgWidth, bgHeight);

      if (isThemeButtermax) {
        const anchor = getConsoleAnchor();

        // Base ellipse dimensions
        const baseRx = Math.min(220, Math.max(140, bgWidth * 0.17));
        const baseRy = Math.min(65, Math.max(38, bgHeight * 0.075));

        // Puddle center shifts with device float translation
        const pCenterX = anchor.x + currentTransX * 0.45;
        const pCenterY = anchor.y + currentTransY * 0.35;

        // Target stretch offset (natural left-leaning signature puddle from Image 1)
        let targetX = -135 + (-currentRotY * 5.2) + (isPointerActive ? (pointerTargetX - anchor.x) * 0.14 : 0);
        let targetY = 12 + (currentRotX * 3.4) + (isPointerActive ? (pointerTargetY - anchor.y) * 0.08 : 0);

        // Organic harmonic breathing when resting
        targetX += Math.sin(time * 0.0016) * 14;
        targetY += Math.cos(time * 0.0022) * 6;

        // Viscous spring lerp
        currentStretchX += (targetX - currentStretchX) * 0.085;
        currentStretchY += (targetY - currentStretchY) * 0.085;

        // Neck tip parameters
        const neckTipX = pCenterX + currentStretchX;
        const neckTipY = pCenterY + currentStretchY;
        const stretchDist = Math.hypot(currentStretchX, currentStretchY);
        const stretchAngle = Math.atan2(currentStretchY, currentStretchX);
        const neckRadius = Math.max(13, Math.min(26, 22 - stretchDist * 0.035));

        // Perpendicular unit vector
        const perpAngle = stretchAngle + Math.PI / 2;
        const nx = Math.cos(perpAngle);
        const ny = Math.sin(perpAngle);

        // Base ellipse tangent anchors
        const topAngle = stretchAngle + 1.25;
        const botAngle = stretchAngle - 1.25;
        const topBaseX = pCenterX + Math.cos(topAngle) * baseRx;
        const topBaseY = pCenterY + Math.sin(topAngle) * baseRy;
        const botBaseX = pCenterX + Math.cos(botAngle) * baseRx;
        const botBaseY = pCenterY + Math.sin(botAngle) * baseRy;

        // Neck tip boundaries
        const neckTopX = neckTipX + nx * neckRadius;
        const neckTopY = neckTipY + ny * neckRadius;
        const neckBotX = neckTipX - nx * neckRadius;
        const neckBotY = neckTipY - ny * neckRadius;

        // Waist interpolation
        const waistT = 0.48;
        const waistX = neckTipX * (1 - waistT) + pCenterX * waistT;
        const waistY = neckTipY * (1 - waistT) + pCenterY * waistT;
        const waistRadius = neckRadius * 0.82;
        const waistTopX = waistX + nx * waistRadius;
        const waistTopY = waistY + ny * waistRadius;
        const waistBotX = waistX - nx * waistRadius;
        const waistBotY = waistY - ny * waistRadius;

        // Rounded forward nose
        const forwardNoseX = neckTipX + Math.cos(stretchAngle) * (neckRadius * 1.35);
        const forwardNoseY = neckTipY + Math.sin(stretchAngle) * (neckRadius * 1.35);

        // Build continuous closed puddle path
        bgCtx.beginPath();
        bgCtx.moveTo(topBaseX, topBaseY);
        let pathD = 'M ' + topBaseX.toFixed(1) + ' ' + topBaseY.toFixed(1);

        const sweepEnd = botAngle + 2 * Math.PI;
        const N = 12;
        for (let i = 1; i <= N; i++) {
          const ang = topAngle + (sweepEnd - topAngle) * (i / N);
          const ex = pCenterX + Math.cos(ang) * baseRx;
          const ey = pCenterY + Math.sin(ang) * baseRy;
          bgCtx.lineTo(ex, ey);
          pathD += ' L ' + ex.toFixed(1) + ' ' + ey.toFixed(1);
        }

        // Curve to neck bottom
        bgCtx.quadraticCurveTo(waistBotX, waistBotY, neckBotX, neckBotY);
        pathD += ' Q ' + waistBotX.toFixed(1) + ' ' + waistBotY.toFixed(1) + ' ' + neckBotX.toFixed(1) + ' ' + neckBotY.toFixed(1);

        // Rounded nose forward cap
        bgCtx.quadraticCurveTo(forwardNoseX, forwardNoseY, neckTopX, neckTopY);
        pathD += ' Q ' + forwardNoseX.toFixed(1) + ' ' + forwardNoseY.toFixed(1) + ' ' + neckTopX.toFixed(1) + ' ' + neckTopY.toFixed(1);

        // Curve back to top base
        bgCtx.quadraticCurveTo(waistTopX, waistTopY, topBaseX, topBaseY);
        pathD += ' Q ' + waistTopX.toFixed(1) + ' ' + waistTopY.toFixed(1) + ' ' + topBaseX.toFixed(1) + ' ' + topBaseY.toFixed(1) + ' Z';
        bgCtx.closePath();

        // Render puddle body according to current background palette
        let puddleFill = '#111111';
        let rimColor = 'rgba(255, 219, 21, 0.35)';

        if (currentBgTheme === 'noir') {
          puddleFill = '#ffd600';
          rimColor = 'rgba(255, 255, 255, 0.7)';
          bgCtx.fillStyle = puddleFill;
          bgCtx.fill();
          bgCtx.save();
          bgCtx.shadowColor = '#ffd600';
          bgCtx.shadowBlur = 24;
          bgCtx.strokeStyle = 'rgba(255, 214, 0, 0.95)';
          bgCtx.lineWidth = 3;
          bgCtx.stroke();
          bgCtx.restore();
        } else if (currentBgTheme === 'amber') {
          puddleFill = '#fb8500';
          rimColor = 'rgba(255, 220, 100, 0.8)';
          bgCtx.fillStyle = puddleFill;
          bgCtx.fill();
          bgCtx.save();
          bgCtx.shadowColor = '#fb8500';
          bgCtx.shadowBlur = 24;
          bgCtx.strokeStyle = 'rgba(251, 133, 0, 0.95)';
          bgCtx.lineWidth = 3;
          bgCtx.stroke();
          bgCtx.restore();
        } else {
          // Canonical Solar Butter: deep rich molten charcoal on butter yellow (#ffdb15)
          const radGrad = bgCtx.createRadialGradient(pCenterX, pCenterY - 10, 15, pCenterX, pCenterY, baseRx * 1.15);
          radGrad.addColorStop(0, '#1c1c1c');
          radGrad.addColorStop(0.7, '#111111');
          radGrad.addColorStop(1, '#090909');
          puddleFill = radGrad;
          bgCtx.fillStyle = puddleFill;
          bgCtx.fill();

          bgCtx.strokeStyle = rimColor;
          bgCtx.lineWidth = 1.4;
          bgCtx.stroke();

          // Subtle gloss arc on puddle body
          bgCtx.save();
          bgCtx.beginPath();
          bgCtx.arc(pCenterX - baseRx * 0.18, pCenterY - baseRy * 0.22, baseRy * 0.42, 0, Math.PI * 2);
          bgCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          bgCtx.fill();
          bgCtx.restore();
        }

        // ====================================================================
        // PINCH-OFF TRAILING DROPLET BEADS (● · · · · ·) — MATCHING IMAGE 1
        // ====================================================================
        const beadDirX = Math.cos(stretchAngle);
        const beadDirY = Math.sin(stretchAngle);
        const primaryGap = 58 + Math.min(42, stretchDist * 0.26);

        // Primary Detached Satellite Bead ●
        const primaryBeadX = neckTipX + beadDirX * primaryGap;
        const primaryBeadY = neckTipY + beadDirY * primaryGap;
        const primaryBeadR = 12.5 + Math.sin(time * 0.0028) * 1.4;

        bgCtx.beginPath();
        bgCtx.arc(primaryBeadX, primaryBeadY, primaryBeadR, 0, Math.PI * 2);
        bgCtx.fillStyle = (currentBgTheme === 'butter') ? '#111111' : (currentBgTheme === 'noir' ? '#ffd600' : '#fb8500');
        bgCtx.fill();

        if (currentBgTheme === 'butter') {
          bgCtx.strokeStyle = rimColor;
          bgCtx.lineWidth = 1.4;
          bgCtx.stroke();

          // Specular reflection on primary bead
          bgCtx.save();
          bgCtx.beginPath();
          bgCtx.arc(primaryBeadX - primaryBeadR * 0.3, primaryBeadY - primaryBeadR * 0.3, primaryBeadR * 0.32, 0, Math.PI * 2);
          bgCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
          bgCtx.fill();
          bgCtx.restore();
        }
        pathD += addCircleToSvg(primaryBeadX, primaryBeadY, primaryBeadR);

        // Chain of Micro-Bead Droplets · · · · ·
        const numMicroBeads = 5;
        for (let k = 0; k < numMicroBeads; k++) {
          const t = (k + 1) / (numMicroBeads + 1.2);
          const mx = neckTipX + beadDirX * (primaryGap * t);
          const my = neckTipY + beadDirY * (primaryGap * t);
          const mr = 2.2 + Math.sin(t * Math.PI) * 2.3;

          bgCtx.beginPath();
          bgCtx.arc(mx, my, mr, 0, Math.PI * 2);
          bgCtx.fillStyle = (currentBgTheme === 'butter') ? '#111111' : (currentBgTheme === 'noir' ? '#ffd600' : '#fb8500');
          bgCtx.fill();
          pathD += addCircleToSvg(mx, my, mr);
        }

        // ====================================================================
        // TRANSIENT EVAPORATING MOUSE SPLASHES (Dissolves in 0.25s)
        // ====================================================================
        for (let i = transientSplashes.length - 1; i >= 0; i--) {
          const sp = transientSplashes[i];
          sp.life--;
          if (sp.life <= 0) {
            transientSplashes.splice(i, 1);
            continue;
          }
          const t = sp.life / sp.maxLife;
          const curR = sp.r * Math.pow(t, 1.4);
          bgCtx.beginPath();
          bgCtx.arc(sp.x, sp.y, curR, 0, Math.PI * 2);
          bgCtx.fillStyle = (currentBgTheme === 'butter') ? '#111111' : (currentBgTheme === 'noir' ? '#ffd600' : '#fb8500');
          bgCtx.fill();
          pathD += addCircleToSvg(sp.x, sp.y, curR);
        }

        // Update Typography Inversion Mask in SVG in real-time
        if (bgBlobClipPath) {
          bgBlobClipPath.setAttribute('d', pathD);
        }

        // Floating Viscous Micro-Embers
        bgEmbers.forEach(emb => {
          emb.y += emb.vy;
          emb.x += emb.vx + Math.sin(time * 0.0018 + emb.phase) * 0.4;
          emb.alpha = 0.22 + Math.sin(time * 0.0025 + emb.phase) * 0.18;

          if (emb.y < -20) {
            emb.y = bgHeight + 10;
            emb.x = (primaryBeadX || bgWidth * 0.5) + (Math.random() - 0.5) * 200;
          }

          bgCtx.beginPath();
          bgCtx.arc(emb.x, emb.y, emb.radius, 0, Math.PI * 2);
          const colorBase = (currentBgTheme === 'butter')
            ? 'rgba(18, 18, 18,'
            : ((currentBgTheme === 'amber') ? 'rgba(255, 183, 3,' : 'rgba(255, 214, 0,');
          bgCtx.fillStyle = colorBase + emb.alpha + ')';
          bgCtx.fill();
        });

      } else {
        // Obsidian Mode: Tactical Starfield & Radar Sweep
        obsidianStars.forEach((s, i) => {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < 0) s.x = bgWidth;
          if (s.x > bgWidth) s.x = 0;
          if (s.y < 0) s.y = bgHeight;
          if (s.y > bgHeight) s.y = 0;

          bgCtx.beginPath();
          bgCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          bgCtx.fillStyle = 'rgba(0, 245, 184, ' + s.alpha + ')';
          bgCtx.fill();

          for (let j = i + 1; j < obsidianStars.length; j++) {
            const s2 = obsidianStars[j];
            const dist = Math.hypot(s.x - s2.x, s.y - s2.y);
            if (dist < 110) {
              bgCtx.beginPath();
              bgCtx.moveTo(s.x, s.y);
              bgCtx.lineTo(s2.x, s2.y);
              bgCtx.strokeStyle = 'rgba(0, 245, 184, ' + ((1 - dist / 110) * 0.22) + ')';
              bgCtx.lineWidth = 0.8;
              bgCtx.stroke();
            }
          }
        });

        // Tactical Radar Scan Ring
        const sweepAngle = (time * 0.0012) % (Math.PI * 2);
        const rCx = bgWidth * 0.5;
        const rCy = bgHeight * 0.42;
        const rRadius = Math.min(bgWidth, bgHeight) * 0.32;
        bgCtx.save();
        bgCtx.strokeStyle = 'rgba(0, 245, 184, 0.2)';
        bgCtx.beginPath();
        bgCtx.arc(rCx, rCy, rRadius, 0, Math.PI * 2);
        bgCtx.lineWidth = 1;
        bgCtx.stroke();

        bgCtx.beginPath();
        bgCtx.moveTo(rCx, rCy);
        bgCtx.lineTo(rCx + Math.cos(sweepAngle) * rRadius, rCy + Math.sin(sweepAngle) * rRadius);
        bgCtx.strokeStyle = 'rgba(0, 245, 184, 0.7)';
        bgCtx.lineWidth = 2;
        bgCtx.stroke();
        bgCtx.restore();
      }

      // Shockwave Ripples
      for (let i = bgRipples.length - 1; i >= 0; i--) {
        const rip = bgRipples[i];
        rip.radius += rip.speed;
        rip.amplitude *= 0.94;

        bgCtx.save();
        bgCtx.beginPath();
        bgCtx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        bgCtx.strokeStyle = isThemeButtermax
          ? 'rgba(255, 107, 74, ' + Math.max(0, rip.amplitude / 24) + ')'
          : 'rgba(0, 245, 184, ' + Math.max(0, rip.amplitude / 24) + ')';
        bgCtx.lineWidth = 2;
        bgCtx.stroke();
        bgCtx.restore();

        if (rip.radius > rip.maxRadius || rip.amplitude < 0.2) {
          bgRipples.splice(i, 1);
        }
      }

      requestAnimationFrame(renderLiquidTrail);
    }

    requestAnimationFrame(renderLiquidTrail);
  }

  // --- CLOSE BUTTON ---
  function setupCloseButton() {
    const closeBtn = document.getElementById('bm-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        peelCurtain(true);
      });
    }
  }


  // ==========================================================================
  // BUTTERMAX-GRADE LENIS SMOOTH MOMENTUM SCROLL ENGINE
  // ==========================================================================
  let smoothScrollTarget = window.scrollY;
  let smoothScrollCurrent = window.scrollY;
  let isSmoothScrolling = false;
  const SCROLL_LERP = 0.088; // Silky butter momentum

  function setupSmoothScroll() {
    window.addEventListener('wheel', function(e) {
      if (document.body.classList.contains('auth-modal-open')) return;

      // When over curtain: scroll peels curtain smoothly
      if (curtainEl && !isCurtainPeeled && e.deltaY > 15) {
        e.preventDefault();
        peelCurtain(true);
        return;
      }

      e.preventDefault();
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      smoothScrollTarget = Math.max(0, Math.min(maxScroll, smoothScrollTarget + e.deltaY * 1.05));

      if (!isSmoothScrolling) {
        isSmoothScrolling = true;
        requestAnimationFrame(updateSmoothScrollPhysics);
      }
    }, { passive: false });

    window.addEventListener('scroll', function() {
      if (!isSmoothScrolling) {
        smoothScrollCurrent = window.scrollY;
        smoothScrollTarget = window.scrollY;
      }
    }, { passive: true });
  }

  function updateSmoothScrollPhysics() {
    const diff = smoothScrollTarget - smoothScrollCurrent;
    if (Math.abs(diff) < 0.6) {
      smoothScrollCurrent = smoothScrollTarget;
      window.scrollTo(0, smoothScrollCurrent);
      isSmoothScrolling = false;
      return;
    }

    smoothScrollCurrent += diff * SCROLL_LERP;
    window.scrollTo(0, smoothScrollCurrent);
    requestAnimationFrame(updateSmoothScrollPhysics);
  }

  // ==========================================================================
  // BUTTERMAX SILKY CIRCULAR LENS & MAGNETIC HOVER CONTROLLER (ZERO JITTER)
  // ==========================================================================
  function setupButtermaxCursor() {
    const cursorRing = document.getElementById('orbit-cursor-ring');
    const cursorDot = document.getElementById('orbit-cursor-dot');
    if (!cursorRing) return;

    // Magnetic lens hover expansion over interactive targets
    document.addEventListener('mouseover', function(e) {
      const target = e.target.closest('a, button, .btn, .app-rect-card, .cop-btn, .theme-toggle-btn, .bm-pill-btn, .bm-peel-btn');
      if (target && cursorRing) {
        cursorRing.classList.add('is-hovering');
        if (cursorDot) cursorDot.classList.add('is-hovering');
      }
    }, { passive: true });

    document.addEventListener('mouseout', function(e) {
      const target = e.target.closest('a, button, .btn, .app-rect-card, .cop-btn, .theme-toggle-btn, .bm-pill-btn, .bm-peel-btn');
      if (target && cursorRing) {
        cursorRing.classList.remove('is-hovering');
        if (cursorDot) cursorDot.classList.remove('is-hovering');
      }
    }, { passive: true });

    // Active click response
    window.addEventListener('mousedown', function() {
      if (cursorRing) cursorRing.classList.add('is-active');
      if (cursorDot) cursorDot.classList.add('is-active');
    }, { passive: true });

    window.addEventListener('mouseup', function() {
      if (cursorRing) cursorRing.classList.remove('is-active');
      if (cursorDot) cursorDot.classList.remove('is-active');
    }, { passive: true });
  }

  // Auto-init when document ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
