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
      updateThemeButtons('🟡 BUTTERMAX');
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
    const text = isObsidian ? 'OBSIDIAN' : 'BUTTERMAX';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.innerHTML = `<span>${icon}</span> <span class="theme-btn-label">${text}</span>`;
    });
  }

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
  // BACKGROUND VISCOUS LIQUID TRAIL ENGINE (PERMANENT CENTER ANCHOR)
  // ==========================================================================
  let bgCanvas = null;
  let bgCtx = null;
  let bgWidth = 0;
  let bgHeight = 0;
  let bgBlobClipPath = null;

  // Center starting point & dynamic pointer
  let centerX = 0, centerY = 0;
  let pointerX = 0, pointerY = 0;
  let targetPointerX = 0, targetPointerY = 0;
  let idleTimer = 0;
  let lastMoveTime = performance.now();

  // Viscous node chain permanently anchored at center
  const NUM_TRAIL_NODES = 24;
  const trailNodes = [];

  // Click shockwave ripples
  const bgRipples = [];

  // Viscous micro-droplets
  const bgEmbers = [];
  const TOTAL_EMBERS = 32;

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

      centerX = bgWidth * 0.5;
      centerY = bgHeight * 0.40;

      if (pointerX === 0 && pointerY === 0) {
        pointerX = centerX;
        pointerY = centerY;
        targetPointerX = centerX;
        targetPointerY = centerY;
      }

      initCenterChain();
    }

    // Initialize chain anchored permanently at center origin
    function initCenterChain() {
      trailNodes.length = 0;
      const baseR = Math.min(bgWidth, bgHeight) * 0.20;
      for (let i = 0; i < NUM_TRAIL_NODES; i++) {
        const u = i / (NUM_TRAIL_NODES - 1);
        trailNodes.push({
          x: centerX + (pointerX - centerX) * u,
          y: centerY + (pointerY - centerY) * u,
          baseRadius: baseR * (1 - u * 0.62) + 24,
          radius: baseR * (1 - u * 0.62) + 24,
          wobblePhase: i * 0.48
        });
      }
    }

    window.addEventListener('resize', resizeBg);
    resizeBg();

    // Initialize viscous floating micro-droplets
    for (let i = 0; i < TOTAL_EMBERS; i++) {
      bgEmbers.push({
        x: centerX + (Math.random() - 0.5) * (bgWidth * 0.4),
        y: centerY + (Math.random() - 0.5) * (bgHeight * 0.35),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.4 - Math.random() * 0.8,
        radius: 1.5 + Math.random() * 2.8,
        alpha: 0.2 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? 'rgba(255, 107, 74,' : 'rgba(255, 219, 21,'
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

    // Handle pointer movements
    function onPointerMove(clientX, clientY) {
      if (isCurtainPeeled) return;
      const rect = curtainEl.getBoundingClientRect();
      targetPointerX = clientX - rect.left;
      targetPointerY = clientY - rect.top;
      idleTimer = 0;
      lastMoveTime = performance.now();
    }

    window.addEventListener('mousemove', function(e) {
      onPointerMove(e.clientX, e.clientY);
    });

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
        bgRipples.push({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          radius: 0,
          maxRadius: Math.max(bgWidth, bgHeight) * 0.45,
          amplitude: 24,
          speed: 7
        });
      });
    }

    // --- ANIMATION LOOP ---
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

        // Idle organic sway from center if user hasn't moved mouse recently
        if (idleTimer > 100) {
          const swayRadiusX = Math.min(bgWidth * 0.22, 240);
          const swayRadiusY = Math.min(bgHeight * 0.12, 130);
          targetPointerX = centerX + Math.sin(time * 0.0014) * swayRadiusX + Math.cos(time * 0.0009) * 40;
          targetPointerY = centerY + Math.cos(time * 0.0018) * swayRadiusY + Math.sin(time * 0.0011) * 25;
        }

        // Pointer lerp toward target with smooth gliding deceleration
        pointerX += (targetPointerX - pointerX) * 0.16;
        pointerY += (targetPointerY - pointerY) * 0.16;

        // Base central molten pool radius with breathing harmonics
        const basePoolRadius = Math.min(bgWidth, bgHeight) * 0.20;
        const rBase = basePoolRadius + Math.sin(time * 0.0022) * 12 + Math.cos(time * 0.0031) * 6;

        // Anchor node 0 permanently to center
        if (trailNodes.length === 0) initCenterChain();
        trailNodes[0].x = centerX;
        trailNodes[0].y = centerY;
        trailNodes[0].radius = rBase;

        // Pointer head is the final node
        const headNodeIdx = NUM_TRAIL_NODES - 1;
        trailNodes[headNodeIdx].x = pointerX;
        trailNodes[headNodeIdx].y = pointerY;
        trailNodes[headNodeIdx].radius = Math.max(34, rBase * 0.36);

        // Chain relaxation: intermediate nodes stretch elastically from center to pointer
        for (let i = headNodeIdx - 1; i > 0; i--) {
          const u = i / headNodeIdx;
          const targetNodeX = trailNodes[i + 1].x;
          const targetNodeY = trailNodes[i + 1].y;
          const anchorX = centerX + (pointerX - centerX) * u;
          const anchorY = centerY + (pointerY - centerY) * u;

          // Blend of direct line tension and trailing node ease
          trailNodes[i].x += ((targetNodeX + anchorX) * 0.5 - trailNodes[i].x) * 0.38;
          trailNodes[i].y += ((targetNodeY + anchorY) * 0.5 - trailNodes[i].y) * 0.38;

          // Multi-harmonic fluid wave undulations along the liquid body
          const wave = Math.sin(time * 0.0032 + trailNodes[i].wobblePhase) * 11
                     + Math.cos(time * 0.0021 + i * 0.42) * 7;
          const taper = 1 - u * 0.60;
          trailNodes[i].radius = Math.max(26, (rBase * taper) + wave);
        }

        // Build continuous watertight fluid boundary
        const phi = Math.atan2(trailNodes[1].y - trailNodes[0].y, trailNodes[1].x - trailNodes[0].x);

        // 1. Center base harmonic arc (32-vertex organic molten waves around center anchor)
        const baseArcPoints = [];
        const baseArcSteps = 20;
        const startAngle = phi + Math.PI * 0.45;
        const endAngle = phi + Math.PI * 1.55;

        for (let s = 0; s <= baseArcSteps; s++) {
          const theta = startAngle + (endAngle - startAngle) * (s / baseArcSteps);
          const waveUndulation = Math.sin(theta * 2 + time * 0.0018) * 16
                               + Math.cos(theta * 3 - time * 0.0024) * 12
                               + Math.sin(theta * 5 + time * 0.0035) * 8;
          const rad = rBase + waveUndulation;
          baseArcPoints.push({
            x: centerX + Math.cos(theta) * rad,
            y: centerY + Math.sin(theta) * rad
          });
        }

        // 2. Left and right flanks along the extending liquid trail
        const leftSide = [];
        const rightSide = [];

        for (let i = 0; i < NUM_TRAIL_NODES; i++) {
          const curr = trailNodes[i];
          let tx = 0, ty = 0;
          if (i === 0) {
            tx = trailNodes[1].x - curr.x;
            ty = trailNodes[1].y - curr.y;
          } else if (i === NUM_TRAIL_NODES - 1) {
            tx = curr.x - trailNodes[i - 1].x;
            ty = curr.y - trailNodes[i - 1].y;
          } else {
            tx = trailNodes[i + 1].x - trailNodes[i - 1].x;
            ty = trailNodes[i + 1].y - trailNodes[i - 1].y;
          }

          const mag = Math.hypot(tx, ty) || 1;
          const nx = -ty / mag;
          const ny = tx / mag;
          const r = curr.radius;

          leftSide.push({ x: curr.x + nx * r, y: curr.y + ny * r });
          rightSide.push({ x: curr.x - nx * r, y: curr.y - ny * r });
        }

        // 3. Assemble Unified Fluid Hull Path (Canvas & SVG ClipPath)
        bgCtx.beginPath();
        let pathD = '';

        // Start at first base arc point
        const p0 = baseArcPoints[0];
        bgCtx.moveTo(p0.x, p0.y);
        pathD = 'M ' + p0.x.toFixed(1) + ' ' + p0.y.toFixed(1);

        // Arc around center pool
        for (let i = 1; i < baseArcPoints.length; i++) {
          const curr = baseArcPoints[i];
          bgCtx.lineTo(curr.x, curr.y);
          pathD += ' L ' + curr.x.toFixed(1) + ' ' + curr.y.toFixed(1);
        }

        // Left flank from center pool to cursor head
        for (let i = 0; i < leftSide.length - 1; i++) {
          const curr = leftSide[i];
          const next = leftSide[i + 1];
          const mx = (curr.x + next.x) * 0.5;
          const my = (curr.y + next.y) * 0.5;
          bgCtx.quadraticCurveTo(curr.x, curr.y, mx, my);
          pathD += ' Q ' + curr.x.toFixed(1) + ' ' + curr.y.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
        }

        // Pointer Head Rounded Cap
        const headLeft = leftSide[leftSide.length - 1];
        const headRight = rightSide[rightSide.length - 1];
        const headCenter = trailNodes[headNodeIdx];

        bgCtx.quadraticCurveTo(headLeft.x, headLeft.y, headCenter.x, headCenter.y);
        bgCtx.quadraticCurveTo(headCenter.x, headCenter.y, headRight.x, headRight.y);
        pathD += ' Q ' + headLeft.x.toFixed(1) + ' ' + headLeft.y.toFixed(1) + ' ' + headCenter.x.toFixed(1) + ' ' + headCenter.y.toFixed(1);
        pathD += ' Q ' + headCenter.x.toFixed(1) + ' ' + headCenter.y.toFixed(1) + ' ' + headRight.x.toFixed(1) + ' ' + headRight.y.toFixed(1);

        // Right flank from cursor head back to center pool
        for (let i = rightSide.length - 1; i > 0; i--) {
          const curr = rightSide[i];
          const prev = rightSide[i - 1];
          const mx = (curr.x + prev.x) * 0.5;
          const my = (curr.y + prev.y) * 0.5;
          bgCtx.quadraticCurveTo(curr.x, curr.y, mx, my);
          pathD += ' Q ' + curr.x.toFixed(1) + ' ' + curr.y.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
        }

        // Close smoothly back to p0
        bgCtx.quadraticCurveTo(rightSide[0].x, rightSide[0].y, p0.x, p0.y);
        pathD += ' Q ' + rightSide[0].x.toFixed(1) + ' ' + rightSide[0].y.toFixed(1) + ' ' + p0.x.toFixed(1) + ' ' + p0.y.toFixed(1);
        bgCtx.closePath();
        pathD += ' Z';

        // Synchronize SVG ClipPath in real-time for Headline Typography Inversion
        if (bgBlobClipPath) {
          bgBlobClipPath.setAttribute('d', pathD);
        }

        // Molten Viscous Charcoal-to-Black Gradient Fill
        const trailGrad = bgCtx.createLinearGradient(centerX, centerY, pointerX, pointerY);
        trailGrad.addColorStop(0, '#222222');
        trailGrad.addColorStop(0.5, '#121212');
        trailGrad.addColorStop(1, '#080808');

        bgCtx.fillStyle = trailGrad;
        bgCtx.fill();

        // Luminous Fiery Molten Coral Rim
        bgCtx.save();
        bgCtx.shadowColor = '#ff6b4a';
        bgCtx.shadowBlur = 28;
        bgCtx.strokeStyle = 'rgba(255, 107, 74, 0.92)';
        bgCtx.lineWidth = 4;
        bgCtx.stroke();

        // Inner Golden Flare
        bgCtx.shadowColor = 'transparent';
        bgCtx.strokeStyle = 'rgba(255, 219, 21, 0.85)';
        bgCtx.lineWidth = 1.8;
        bgCtx.stroke();
        bgCtx.restore();

        // Specular highlight on Center Anchor
        bgCtx.save();
        bgCtx.beginPath();
        bgCtx.arc(centerX - 14, centerY - 14, 20, 0, Math.PI * 2);
        bgCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        bgCtx.fill();

        // Specular highlight on Pointer Head
        bgCtx.beginPath();
        bgCtx.arc(pointerX - 7, pointerY - 7, 12, 0, Math.PI * 2);
        bgCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        bgCtx.fill();
        bgCtx.restore();

        // Floating Viscous Micro-Embers
        bgEmbers.forEach(emb => {
          emb.y += emb.vy;
          emb.x += emb.vx + Math.sin(time * 0.002 + emb.phase) * 0.5;
          emb.alpha = 0.25 + Math.sin(time * 0.003 + emb.phase) * 0.2;

          if (emb.y < -20) {
            emb.y = bgHeight + 10;
            emb.x = centerX + (Math.random() - 0.5) * (basePoolRadius * 2);
          }

          bgCtx.beginPath();
          bgCtx.arc(emb.x, emb.y, emb.radius, 0, Math.PI * 2);
          bgCtx.fillStyle = emb.color + emb.alpha + ')';
          bgCtx.fill();
        });

      } else {
        // --- OBSIDIAN MODE: TACTICAL STARFIELD & RADAR SWEEP ---
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

  // Auto-init when document ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
