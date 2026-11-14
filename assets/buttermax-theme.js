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

    // Orbit Studio is always the permanent First Scene of the page!
    isCurtainPeeled = false;
    sessionStorage.removeItem('orbit_curtain_peeled');
    if (curtainEl) {
      curtainEl.classList.remove('peeled');
      curtainEl.style.display = 'flex';
      curtainEl.style.transform = 'none';
    }
    if (unpeelBtn) {
      unpeelBtn.classList.remove('visible');
      unpeelBtn.style.display = 'none';
    }

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

  // --- FIRST SCENE / SCROLL NAVIGATION (ORBIT STUDIO NEVER PEELS AWAY) ---
  function setupPeelTriggers() {
    const peelBtn = document.getElementById('bm-peel-btn');
    if (peelBtn) {
      peelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const nextTarget = document.querySelector('header') || document.getElementById('features') || document.getElementById('interface');
        if (nextTarget) nextTarget.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      });
    }

    if (unpeelBtn) {
      unpeelBtn.style.display = 'none';
    }
  }

  function peelCurtain(smoothScroll) {
    // Orbit Studio is the permanent first scene of the page, never hidden or peeled away!
    if (smoothScroll) {
      const nextTarget = document.querySelector('header') || document.getElementById('features') || document.getElementById('interface');
      if (nextTarget) nextTarget.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  }

  function unpeelCurtain() {
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
  // BUTTERMAX SIGNATURE MOLTEN LIQUID PSEUDOPOD (EXACT OBS VIDEO FIDELITY)
  // Features:
  // 1. Rooted dynamically under 3D console center (behind hardware centerpiece)
  // 2. Thick, luscious molten black liquid body with multi-harmonic surface tension
  // 3. Living, undulating fluid pool that organically breathes and stretches towards cursor
  // 4. Zero frozen lines, ZERO static dots or beads in front of links/titles
  // 5. Dynamic fluid wake line following the cursor on the background
  // 6. Real-time SVG typography clipping & color inversion (#bm-blob-clip)
  // ==========================================================================
  let bgCanvas = null;
  let bgCtx = null;
  let bgWidth = 0;
  let bgHeight = 0;
  let bgBlobClipPath = null;

  let pointerTargetX = -1000;
  let pointerTargetY = -1000;
  let prevPointerX = -1000;
  let prevPointerY = -1000;
  let isPointerActive = false;
  let idleTimer = 0;

  // Dynamic fluid wake points following the cursor on the background
  const heroWakePoints = [];

  // Click shockwave ripples
  const bgRipples = [];

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

      initChain();
    }

    function getConsoleCenter() {
      if (deviceEl && curtainEl) {
        const dRect = deviceEl.getBoundingClientRect();
        const cRect = curtainEl.getBoundingClientRect();
        return {
          x: (dRect.left + dRect.width * 0.5) - cRect.left,
          y: (dRect.top + dRect.height * 0.48) - cRect.top
        };
      }
      return {
        x: bgWidth * 0.5,
        y: bgHeight * 0.46
      };
    }

    function initChain() {
      const anchor = getConsoleCenter();
      pointerTargetX = anchor.x;
      pointerTargetY = anchor.y;
      prevPointerX = anchor.x;
      prevPointerY = anchor.y;
    }

    window.addEventListener('resize', resizeBg);
    resizeBg();

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

    function onPointerMove(clientX, clientY) {
      if (isCurtainPeeled) return;
      const rect = curtainEl.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;

      prevPointerX = pointerTargetX;
      prevPointerY = pointerTargetY;
      pointerTargetX = px;
      pointerTargetY = py;
      isPointerActive = true;
      idleTimer = 0;

      // Add to heroWakePoints to draw smooth liquid wake following cursor on the background
      const now = performance.now();
      const dist = Math.hypot(px - prevPointerX, py - prevPointerY);
      const wakeR = Math.min(38, Math.max(16, 20 + dist * 0.3));

      // Interpolate points for fast motion
      if (dist > 16 && prevPointerX > -500) {
        const steps = Math.min(6, Math.floor(dist / 16));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          heroWakePoints.push({
            x: prevPointerX + (px - prevPointerX) * t,
            y: prevPointerY + (py - prevPointerY) * t,
            radius: wakeR,
            maxRadius: wakeR,
            createdAt: now
          });
        }
      }
      heroWakePoints.push({
        x: px,
        y: py,
        radius: wakeR,
        maxRadius: wakeR,
        createdAt: now
      });
      if (heroWakePoints.length > 50) heroWakePoints.shift();
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

      // Click / Tap Ripple
      curtainEl.addEventListener('pointerdown', function(e) {
        if (e.target.closest('button, a, input, select, .bm-controls-row')) return;
        const rect = curtainEl.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        bgRipples.push({
          x: px,
          y: py,
          radius: 0,
          maxRadius: Math.max(bgWidth, bgHeight) * 0.38,
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

    // --- BUTTERY LIQUID TRAIL ANIMATION LOOP ---
    const animStartTime = performance.now();

    function renderLiquidTrail(timestamp) {
      if (isCurtainPeeled) {
        requestAnimationFrame(renderLiquidTrail);
        return;
      }

      const time = timestamp - animStartTime;
      bgCtx.clearRect(0, 0, bgWidth, bgHeight);

      if (isThemeButtermax) {
        idleTimer++;

        // Root position anchored at 3D console center
        const anchor = getConsoleCenter();
        const rootX = anchor.x + currentTransX * 0.25;
        const rootY = anchor.y + currentTransY * 0.20;

        // Base pool radius around console
        const baseRadius = Math.min(155, Math.max(110, bgWidth * 0.11));

        // Living, undulating viscous molten fluid pool with 36 harmonic nodes
        const numNodes = 36;
        const poolPoints = [];

        for (let i = 0; i < numNodes; i++) {
          const th = (i / numNodes) * Math.PI * 2;
          const w1 = Math.sin(th * 3 + time * 0.0022) * 14;
          const w2 = Math.cos(th * 5 - time * 0.0017) * 9;
          const w3 = Math.sin(th * 2 + time * 0.0031) * 7;

          // Dynamic elastic stretch towards pointer position
          let stretch = 0;
          if (pointerTargetX > -500) {
            const pAngle = Math.atan2(pointerTargetY - rootY, pointerTargetX - rootX);
            const diff = Math.cos(th - pAngle);
            if (diff > 0) {
              const pDist = Math.hypot(pointerTargetX - rootX, pointerTargetY - rootY);
              const influence = Math.max(0, 1 - pDist / 550);
              stretch = Math.pow(diff, 2.5) * influence * 60;
            }
          }

          const r = baseRadius + w1 + w2 + w3 + stretch;
          poolPoints.push({
            x: rootX + Math.cos(th) * r,
            y: rootY + Math.sin(th) * r
          });
        }

        // Draw smooth closed cardinal spline / Bezier pool
        bgCtx.beginPath();
        const pMid0 = {
          x: (poolPoints[0].x + poolPoints[poolPoints.length - 1].x) * 0.5,
          y: (poolPoints[0].y + poolPoints[poolPoints.length - 1].y) * 0.5
        };
        bgCtx.moveTo(pMid0.x, pMid0.y);
        let pathD = 'M ' + pMid0.x.toFixed(1) + ' ' + pMid0.y.toFixed(1);

        for (let i = 0; i < poolPoints.length; i++) {
          const next = poolPoints[(i + 1) % poolPoints.length];
          const midX = (poolPoints[i].x + next.x) * 0.5;
          const midY = (poolPoints[i].y + next.y) * 0.5;
          bgCtx.quadraticCurveTo(poolPoints[i].x, poolPoints[i].y, midX, midY);
          pathD += ' Q ' + poolPoints[i].x.toFixed(1) + ' ' + poolPoints[i].y.toFixed(1) + ' ' + midX.toFixed(1) + ' ' + midY.toFixed(1);
        }
        bgCtx.closePath();
        pathD += ' Z';

        // Palette rendering for central pool
        if (currentBgTheme === 'noir') {
          const noirGrad = bgCtx.createRadialGradient(rootX, rootY, 20, rootX, rootY, baseRadius * 1.5);
          noirGrad.addColorStop(0, '#ffd600');
          noirGrad.addColorStop(0.6, '#ffaa00');
          noirGrad.addColorStop(1, '#ff6b4a');
          bgCtx.fillStyle = noirGrad;
          bgCtx.fill();
          bgCtx.save();
          bgCtx.shadowColor = '#ffd600';
          bgCtx.shadowBlur = 24;
          bgCtx.strokeStyle = 'rgba(255, 214, 0, 0.95)';
          bgCtx.lineWidth = 3;
          bgCtx.stroke();
          bgCtx.restore();
        } else if (currentBgTheme === 'amber') {
          const amberGrad = bgCtx.createRadialGradient(rootX, rootY, 20, rootX, rootY, baseRadius * 1.5);
          amberGrad.addColorStop(0, '#ffb703');
          amberGrad.addColorStop(0.6, '#fb8500');
          amberGrad.addColorStop(1, '#d90429');
          bgCtx.fillStyle = amberGrad;
          bgCtx.fill();
          bgCtx.save();
          bgCtx.shadowColor = '#fb8500';
          bgCtx.shadowBlur = 24;
          bgCtx.strokeStyle = 'rgba(251, 133, 0, 0.95)';
          bgCtx.lineWidth = 3;
          bgCtx.stroke();
          bgCtx.restore();
        } else {
          // Canonical Buttermax Solar Yellow Mode: rich glossy molten charcoal on solar yellow
          const butterGrad = bgCtx.createRadialGradient(rootX, rootY, 25, rootX, rootY, baseRadius * 1.6);
          butterGrad.addColorStop(0, '#1c1c1c');
          butterGrad.addColorStop(0.65, '#121212');
          butterGrad.addColorStop(1, '#080808');
          bgCtx.fillStyle = butterGrad;
          bgCtx.fill();

          bgCtx.strokeStyle = 'rgba(255, 219, 21, 0.45)';
          bgCtx.lineWidth = 1.6;
          bgCtx.stroke();

          // Specular gloss highlight on molten crown
          bgCtx.save();
          bgCtx.beginPath();
          bgCtx.arc(rootX - baseRadius * 0.25, rootY - baseRadius * 0.25, baseRadius * 0.35, 0, Math.PI * 2);
          bgCtx.fillStyle = 'rgba(255, 255, 255, 0.16)';
          bgCtx.fill();
          bgCtx.restore();
        }

        // ====================================================================
        // DYNAMIC FLUID WAKE LINE FOLLOWING CURSOR ON BACKGROUND
        // ====================================================================
        const now = performance.now();
        const activeWake = [];
        for (let i = 0; i < heroWakePoints.length; i++) {
          const pt = heroWakePoints[i];
          const age = now - pt.createdAt;
          if (age < 1200) {
            const decay = 1 - age / 1200;
            pt.alpha = decay;
            pt.radius = pt.maxRadius * (0.3 + 0.7 * decay);
            activeWake.push(pt);
          }
        }
        heroWakePoints.length = 0;
        heroWakePoints.push(...activeWake);

        if (heroWakePoints.length > 1) {
          bgCtx.save();
          for (let i = 0; i < heroWakePoints.length; i++) {
            const pt = heroWakePoints[i];
            bgCtx.beginPath();
            bgCtx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            if (currentBgTheme === 'noir') {
              bgCtx.fillStyle = `rgba(255, 214, 0, ${pt.alpha * 0.75})`;
            } else if (currentBgTheme === 'amber') {
              bgCtx.fillStyle = `rgba(251, 133, 0, ${pt.alpha * 0.75})`;
            } else {
              bgCtx.fillStyle = `rgba(18, 18, 18, ${pt.alpha * 0.85})`;
            }
            bgCtx.fill();
            pathD += addCircleToSvg(pt.x, pt.y, pt.radius);
          }

          // Smooth fluid stream ribbon connecting wake nodes
          bgCtx.beginPath();
          bgCtx.moveTo(heroWakePoints[0].x, heroWakePoints[0].y);
          for (let i = 1; i < heroWakePoints.length; i++) {
            const prev = heroWakePoints[i - 1];
            const curr = heroWakePoints[i];
            const mx = (prev.x + curr.x) * 0.5;
            const my = (prev.y + curr.y) * 0.5;
            bgCtx.quadraticCurveTo(prev.x, prev.y, mx, my);
          }
          if (currentBgTheme === 'noir') {
            bgCtx.strokeStyle = 'rgba(255, 214, 0, 0.45)';
          } else if (currentBgTheme === 'amber') {
            bgCtx.strokeStyle = 'rgba(251, 133, 0, 0.45)';
          } else {
            bgCtx.strokeStyle = 'rgba(18, 18, 18, 0.55)';
          }
          bgCtx.lineWidth = 14;
          bgCtx.lineCap = 'round';
          bgCtx.lineJoin = 'round';
          bgCtx.stroke();
          bgCtx.restore();
        }

        // ====================================================================
        // CLICK SHOCKWAVE RIPPLES
        // ====================================================================
        for (let i = bgRipples.length - 1; i >= 0; i--) {
          const rip = bgRipples[i];
          rip.radius += rip.speed;
          const prog = rip.radius / rip.maxRadius;
          if (prog >= 1) {
            bgRipples.splice(i, 1);
            continue;
          }
          const alpha = (1 - prog) * 0.45;
          bgCtx.beginPath();
          bgCtx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          bgCtx.strokeStyle = (currentBgTheme === 'butter') ? `rgba(18, 18, 18, ${alpha})` : `rgba(255, 214, 0, ${alpha})`;
          bgCtx.lineWidth = 2.5 * (1 - prog);
          bgCtx.stroke();
        }

        // Update Typography Inversion Mask in SVG in real-time
        if (bgBlobClipPath) {
          bgBlobClipPath.setAttribute('d', pathD);
        }

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
  const SCROLL_LERP = 0.22; // Snappy, responsive momentum without delay

  function setupSmoothScroll() {
    if (document.body.dataset.scroll === 'native' || (window.location && window.location.pathname.includes('/ofaa/'))) return;

    window.addEventListener('wheel', function(e) {
      if (document.body.classList.contains('auth-modal-open') || document.body.classList.contains('modal-open') || document.body.dataset.scroll === 'native' || (window.location && window.location.pathname.includes('/ofaa/'))) return;
      if (e.target && e.target.closest && e.target.closest('select, textarea, input, .modal-body, #feedback-modal-backdrop, .auth-modal-backdrop, .auth-modal-window')) return;

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (maxScroll <= 0) return;

      e.preventDefault();
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
  function applyActiveCursorColor() {
    let hex = '#EE00FF';
    try {
      const stored = localStorage.getItem('orbit_temp_cursor_color');
      if (stored && stored.startsWith('#')) hex = stored.toUpperCase();
    } catch(e) {}

    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const r = parseInt(c.substring(0, 2), 16) || 238;
    const g = parseInt(c.substring(2, 4), 16) || 0;
    const b = parseInt(c.substring(4, 6), 16) || 255;

    let styleEl = document.getElementById('orbit-cursor-color-dynamic');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'orbit-cursor-color-dynamic';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      body.theme-buttermax #orbit-cursor-dot, #orbit-cursor-dot {
        background: ${hex} !important;
        border-radius: 50% !important;
        width: 8px !important;
        height: 8px !important;
        box-shadow: 0 0 12px ${hex}, 0 0 24px rgba(${r}, ${g}, ${b}, 0.85), 0 0 3px #ffffff !important;
      }
      body.theme-buttermax #orbit-cursor-ring, #orbit-cursor-ring {
        border-radius: 50% !important;
        border-color: ${hex} !important;
        background: rgba(${r}, ${g}, ${b}, 0.08) !important;
        box-shadow: 0 0 16px rgba(${r}, ${g}, ${b}, 0.45) !important;
      }
      body.theme-buttermax #orbit-cursor-ring.is-hovering, #orbit-cursor-ring.is-hovering {
        border-radius: 50% !important;
        border-color: ${hex} !important;
        background: rgba(${r}, ${g}, ${b}, 0.20) !important;
        box-shadow: 0 0 28px rgba(${r}, ${g}, ${b}, 0.75) !important;
      }
      body.theme-buttermax #orbit-cursor-ring.is-active, #orbit-cursor-ring.is-active {
        border-radius: 50% !important;
        border-color: ${hex} !important;
        background: rgba(${r}, ${g}, ${b}, 0.40) !important;
      }
      body.theme-buttermax #orbit-cursor-dot.is-active, #orbit-cursor-dot.is-active {
        border-radius: 50% !important;
        background: ${hex} !important;
        box-shadow: 0 0 24px rgba(${r}, ${g}, ${b}, 1) !important;
      }
    `;
  }

  function setupButtermaxCursor() {
    applyActiveCursorColor();
    window.addEventListener('storage', function(e) {
      if (e.key === 'orbit_temp_cursor_color') applyActiveCursorColor();
    });

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
