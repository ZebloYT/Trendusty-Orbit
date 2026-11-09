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
  // BACKGROUND VISCOUS LIQUID TRAIL & MOLTEN RIBBON ENGINE
  // ==========================================================================
  let bgCanvas = null;
  let bgCtx = null;
  let bgWidth = 0;
  let bgHeight = 0;
  let bgBlobClipPath = null;

  // Liquid trail history
  const liquidTrail = [];
  const MAX_TRAIL_LENGTH = 75;
  let lastRecordedX = 0, lastRecordedY = 0;
  let lastMoveTime = performance.now();
  let idleTimer = 0;

  // Click shockwave ripples
  const bgRipples = [];

  // Viscous micro-droplets
  const bgEmbers = [];
  const TOTAL_EMBERS = 30;

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

      // Seed initial baseline S-curve liquid trail if empty
      if (liquidTrail.length === 0) {
        initBaselineTrail();
      }
    }

    // Seed continuous natural molten butter ribbon across center
    function initBaselineTrail() {
      liquidTrail.length = 0;
      const count = 42;
      const startX = bgWidth * 0.18;
      const endX = bgWidth * 0.82;
      const cy = bgHeight * 0.40;

      for (let i = 0; i < count; i++) {
        const u = i / (count - 1);
        const x = startX + (endX - startX) * u;
        const y = cy + Math.sin(u * Math.PI * 2.1) * (bgHeight * 0.13) + Math.cos(u * Math.PI * 1.2) * (bgHeight * 0.05);
        const rad = 65 - Math.abs(u - 0.45) * 28;
        liquidTrail.push({
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          radius: Math.max(38, rad),
          wobblePhase: i * 0.42,
          isIdle: true
        });
      }
      lastRecordedX = liquidTrail[0].x;
      lastRecordedY = liquidTrail[0].y;
    }

    window.addEventListener('resize', resizeBg);
    resizeBg();

    // Initialize micro-droplets
    for (let i = 0; i < TOTAL_EMBERS; i++) {
      bgEmbers.push({
        x: Math.random() * bgWidth,
        y: Math.random() * bgHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.7,
        radius: 1.5 + Math.random() * 2.5,
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

    // Add point to liquid ribbon trail with Hermite interpolation
    function addLiquidTrailPoint(targetX, targetY) {
      idleTimer = 0;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      const dist = Math.hypot(targetX - lastRecordedX, targetY - lastRecordedY);
      const speed = dist / dt;
      lastMoveTime = now;

      // Dynamic viscous thickness based on speed
      const pointRadius = Math.max(42, Math.min(82, 78 - speed * 10));

      if (dist > 12) {
        // Interpolate smooth intermediate points so there are no angular breaks
        const steps = Math.min(5, Math.floor(dist / 14));
        for (let s = 1; s <= steps; s++) {
          const t = s / (steps + 1);
          liquidTrail.unshift({
            x: lastRecordedX + (targetX - lastRecordedX) * t,
            y: lastRecordedY + (targetY - lastRecordedY) * t,
            baseX: targetX,
            baseY: targetY,
            radius: pointRadius,
            wobblePhase: Math.random() * Math.PI * 2,
            isIdle: false
          });
        }

        liquidTrail.unshift({
          x: targetX,
          y: targetY,
          baseX: targetX,
          baseY: targetY,
          radius: pointRadius,
          wobblePhase: Math.random() * Math.PI * 2,
          isIdle: false
        });

        lastRecordedX = targetX;
        lastRecordedY = targetY;

        // Maintain maximum trail length
        if (liquidTrail.length > MAX_TRAIL_LENGTH) {
          liquidTrail.pop();
        }
      }
    }

    // Pointer move listener across hero curtain
    function onPointerMove(clientX, clientY) {
      if (isCurtainPeeled) return;
      const rect = curtainEl.getBoundingClientRect();
      const mX = clientX - rect.left;
      const mY = clientY - rect.top;
      addLiquidTrailPoint(mX, mY);
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
          maxRadius: Math.max(bgWidth, bgHeight) * 0.5,
          amplitude: 25,
          speed: 8
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

        // Age active trail points gracefully
        for (let i = 0; i < liquidTrail.length; i++) {
          const pt = liquidTrail[i];
          if (!pt.isIdle) {
            pt.radius *= 0.993;
            // Float gently
            pt.y += Math.sin(time * 0.0025 + pt.wobblePhase) * 0.35;
          } else {
            // Harmonic wave float for idle baseline ribbon
            pt.y = pt.baseY + Math.sin(time * 0.002 + pt.wobblePhase) * 14;
            pt.x = pt.baseX + Math.cos(time * 0.0016 + pt.wobblePhase) * 8;
          }
        }

        // Clean up withered tail points if user has drawn active trail
        while (liquidTrail.length > 32 && liquidTrail[liquidTrail.length - 1].radius < 12) {
          liquidTrail.pop();
        }

        // If trail withered down in idle, replenish baseline curve smoothly
        if (idleTimer > 180 && liquidTrail.length < 35) {
          initBaselineTrail();
        }

        const len = liquidTrail.length;
        if (len > 1) {
          const leftSide = [];
          const rightSide = [];

          // Compute continuous ribbon normals along the liquid path
          for (let i = 0; i < len; i++) {
            const curr = liquidTrail[i];
            let tx = 0, ty = 0;

            if (i === 0) {
              tx = curr.x - liquidTrail[1].x;
              ty = curr.y - liquidTrail[1].y;
            } else if (i === len - 1) {
              tx = liquidTrail[len - 2].x - curr.x;
              ty = liquidTrail[len - 2].y - curr.y;
            } else {
              tx = liquidTrail[i - 1].x - liquidTrail[i + 1].x;
              ty = liquidTrail[i - 1].y - liquidTrail[i + 1].y;
            }

            const mag = Math.hypot(tx, ty) || 1;
            const nx = -ty / mag;
            const ny = tx / mag;

            // Fluid surface tension harmonics
            const wave = Math.sin(time * 0.0035 + curr.wobblePhase) * (curr.radius * 0.16)
                       + Math.cos(time * 0.0024 + i * 0.3) * (curr.radius * 0.10);
            
            // Taper tail naturally
            const taper = Math.max(0.2, 1 - (i / len) * 0.65);
            let r = Math.max(8, (curr.radius + wave) * taper);

            // Apply ripples
            for (let k = 0; k < bgRipples.length; k++) {
              const rip = bgRipples[k];
              const d = Math.hypot(curr.x - rip.x, curr.y - rip.y);
              const diff = Math.abs(d - rip.radius);
              if (diff < 50) {
                r += rip.amplitude * Math.cos(diff * 0.12);
              }
            }

            leftSide.push({ x: curr.x + nx * r, y: curr.y + ny * r });
            rightSide.push({ x: curr.x - nx * r, y: curr.y - ny * r });
          }

          // Build Smooth Closed Liquid Ribbon Polygon
          bgCtx.beginPath();
          let pathD = '';

          const headLeft = leftSide[0];
          const headRight = rightSide[0];
          const headCenter = liquidTrail[0];

          bgCtx.moveTo(headLeft.x, headLeft.y);
          pathD = `M ${headLeft.x.toFixed(1)} ${headLeft.y.toFixed(1)}`;

          // Left spline (head -> tail)
          for (let i = 0; i < leftSide.length - 1; i++) {
            const curr = leftSide[i];
            const next = leftSide[i + 1];
            const mx = (curr.x + next.x) / 2;
            const my = (curr.y + next.y) / 2;
            bgCtx.quadraticCurveTo(curr.x, curr.y, mx, my);
            pathD += ` Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
          }

          // Tail cap
          const lastLeft = leftSide[leftSide.length - 1];
          const lastRight = rightSide[rightSide.length - 1];
          const tailCenter = liquidTrail[len - 1];
          bgCtx.quadraticCurveTo(lastLeft.x, lastLeft.y, tailCenter.x, tailCenter.y);
          bgCtx.quadraticCurveTo(tailCenter.x, tailCenter.y, lastRight.x, lastRight.y);
          pathD += ` Q ${lastLeft.x.toFixed(1)} ${lastLeft.y.toFixed(1)} ${tailCenter.x.toFixed(1)} ${tailCenter.y.toFixed(1)}`;
          pathD += ` Q ${tailCenter.x.toFixed(1)} ${tailCenter.y.toFixed(1)} ${lastRight.x.toFixed(1)} ${lastRight.y.toFixed(1)}`;

          // Right spline (tail -> head)
          for (let i = rightSide.length - 1; i > 0; i--) {
            const curr = rightSide[i];
            const prev = rightSide[i - 1];
            const mx = (curr.x + prev.x) / 2;
            const my = (curr.y + prev.y) / 2;
            bgCtx.quadraticCurveTo(curr.x, curr.y, mx, my);
            pathD += ` Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
          }

          // Round head cap connecting back to headLeft
          bgCtx.quadraticCurveTo(headRight.x, headRight.y, headCenter.x, headCenter.y);
          bgCtx.quadraticCurveTo(headCenter.x, headCenter.y, headLeft.x, headLeft.y);
          pathD += ` Q ${headRight.x.toFixed(1)} ${headRight.y.toFixed(1)} ${headCenter.x.toFixed(1)} ${headCenter.y.toFixed(1)}`;
          pathD += ` Q ${headCenter.x.toFixed(1)} ${headCenter.y.toFixed(1)} ${headLeft.x.toFixed(1)} ${headLeft.y.toFixed(1)}`;
          bgCtx.closePath();
          pathD += ' Z';

          // Update Typography Inversion Mask in SVG
          if (bgBlobClipPath) {
            bgBlobClipPath.setAttribute('d', pathD);
          }

          // Liquid Gradient Fill
          const trailGrad = bgCtx.createLinearGradient(
            liquidTrail[0].x, liquidTrail[0].y,
            liquidTrail[len - 1].x, liquidTrail[len - 1].y
          );
          trailGrad.addColorStop(0, '#222222');
          trailGrad.addColorStop(0.5, '#121212');
          trailGrad.addColorStop(1, '#080808');

          bgCtx.fillStyle = trailGrad;
          bgCtx.fill();

          // Luminous Fiery Molten Rim
          bgCtx.save();
          bgCtx.shadowColor = '#ff6b4a';
          bgCtx.shadowBlur = 26;
          bgCtx.strokeStyle = 'rgba(255, 107, 74, 0.92)';
          bgCtx.lineWidth = 4;
          bgCtx.stroke();

          // Inner Golden Flare
          bgCtx.shadowColor = 'transparent';
          bgCtx.strokeStyle = 'rgba(255, 219, 21, 0.85)';
          bgCtx.lineWidth = 1.8;
          bgCtx.stroke();
          bgCtx.restore();

          // Head Droplet Specular Reflection
          bgCtx.save();
          bgCtx.beginPath();
          bgCtx.arc(headCenter.x - 8, headCenter.y - 8, 14, 0, Math.PI * 2);
          bgCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          bgCtx.fill();
          bgCtx.restore();
        }

        // Floating Viscous Micro-Embers
        bgEmbers.forEach(emb => {
          emb.y -= emb.vy;
          emb.x += Math.sin(time * 0.002 + emb.phase) * 0.7 + emb.vx;

          if (emb.y < -20) {
            emb.y = bgHeight + 10;
            emb.x = (liquidTrail[0] ? liquidTrail[0].x : bgWidth * 0.5) + (Math.random() - 0.5) * 220;
          }

          bgCtx.beginPath();
          bgCtx.arc(emb.x, emb.y, emb.radius, 0, Math.PI * 2);
          bgCtx.fillStyle = `${emb.color}${emb.alpha})`;
          bgCtx.fill();
        });

      } else {
        // --- OBSIDIAN CYBER RADAR MATRIX ---
        for (let i = 0; i < obsidianStars.length; i++) {
          const s = obsidianStars[i];
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < 0) s.x = bgWidth;
          if (s.x > bgWidth) s.x = 0;
          if (s.y < 0) s.y = bgHeight;
          if (s.y > bgHeight) s.y = 0;

          bgCtx.beginPath();
          bgCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          bgCtx.fillStyle = `rgba(0, 245, 184, ${s.alpha})`;
          bgCtx.fill();

          for (let j = i + 1; j < obsidianStars.length; j++) {
            const s2 = obsidianStars[j];
            const dist = Math.hypot(s.x - s2.x, s.y - s2.y);
            if (dist < 110) {
              bgCtx.beginPath();
              bgCtx.moveTo(s.x, s.y);
              bgCtx.lineTo(s2.x, s2.y);
              bgCtx.strokeStyle = `rgba(0, 245, 184, ${(1 - dist / 110) * 0.22})`;
              bgCtx.lineWidth = 0.8;
              bgCtx.stroke();
            }
          }
        }

        const rCx = bgWidth * 0.5;
        const rCy = bgHeight * 0.42;
        const rRadius = Math.min(bgWidth, bgHeight) * 0.32;
        bgCtx.save();
        bgCtx.beginPath();
        bgCtx.arc(rCx, rCy, rRadius, 0, Math.PI * 2);
        bgCtx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        bgCtx.lineWidth = 1;
        bgCtx.stroke();

        const sweepAngle = (time * 0.0018) % (Math.PI * 2);
        bgCtx.beginPath();
        bgCtx.moveTo(rCx, rCy);
        bgCtx.lineTo(rCx + Math.cos(sweepAngle) * rRadius, rCy + Math.sin(sweepAngle) * rRadius);
        bgCtx.strokeStyle = 'rgba(0, 245, 184, 0.7)';
        bgCtx.lineWidth = 1.5;
        bgCtx.stroke();
        bgCtx.restore();
      }

      // Update shockwave ripples
      for (let i = bgRipples.length - 1; i >= 0; i--) {
        const rip = bgRipples[i];
        rip.radius += rip.speed;
        rip.amplitude *= 0.94;
        if (rip.radius > rip.maxRadius || rip.amplitude < 0.5) {
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
