/**
 * TRENDUSTY ORBIT — ANIMATION & INTERACTION ENGINE
 * Premium Buttermax-inspired animation architecture (Phases 3 - 15)
 * - 3.1 Custom Cursor with Smooth Interpolation & Idle Breathing
 * - 3.2 Liquid Ink Cursor Trail (Particle Pooling, Velocity-Governed, Gooey Filter)
 * - 3.3 Organic Cursor Blob (Velocity-based Elastic Stretching)
 * - 3.4 Hover States & Click Shockwave Ring
 * - 4.1 Mouse-Following Ambient Spotlight
 * - 5.0 Buttermax-Inspired Organic Blob Page Transitions
 * - 10.0 Magnetic Buttons & Interactive Cards
 * - 13.0 Responsive & 15.0 Accessibility Controls
 */

(function() {
  'use strict';

  // Ignore touch/coarse pointer devices (Phase 13: Mobile/Tablet Protection)
  const isTouchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Global Engine Object
  window.OrbitAnimationEngine = {
    initialized: false,
    cursorColor: '#EE00FF',
    cursorRgb: { r: 238, g: 0, b: 255 },
    activeParticles: [],
    particlePool: [],
    mouse: { x: -1000, y: -1000, prevX: -1000, prevY: -1000, vx: 0, vy: 0, speed: 0 },
    cursorTarget: { x: -1000, y: -1000 },
    blobPos: { x: -1000, y: -1000, vx: 0, vy: 0, angle: 0, stretch: 1 },
    idleFrames: 0,
    maxParticles: 55,
    canvas: null,
    ctx: null,
    animFrameId: null
  };

  const Engine = window.OrbitAnimationEngine;

  // ---------------------------------------------------------------------------
  // COLOR MANAGEMENT
  // ---------------------------------------------------------------------------
  function syncCursorColor() {
    let hex = '#EE00FF';
    try {
      const stored = localStorage.getItem('orbit_temp_cursor_color');
      if (stored && stored.startsWith('#')) hex = stored.toUpperCase();
    } catch (e) {}
    Engine.cursorColor = hex;

    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    Engine.cursorRgb = {
      r: parseInt(c.substring(0, 2), 16) || 238,
      g: parseInt(c.substring(2, 4), 16) || 0,
      b: parseInt(c.substring(4, 6), 16) || 255
    };
  }

  // ---------------------------------------------------------------------------
  // PHASE 3.2: LIQUID INK CANVAS & SVG GOOEY FILTER SETUP
  // ---------------------------------------------------------------------------
  function setupLiquidTrailCanvas() {
    if (isTouchDevice || prefersReducedMotion) return;

    // Inject SVG Gooey / Liquid Threshold Filter if not already present
    if (!document.getElementById('orbit-liquid-gooey-svg')) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'orbit-liquid-gooey-svg';
      svg.setAttribute('style', 'position:fixed;width:0;height:0;pointer-events:none;z-index:-1;');
      svg.innerHTML = `
        <defs>
          <filter id="orbit-gooey-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 22 -9" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      `;
      document.body.appendChild(svg);
    }

    // Create 2D Overlay Canvas for Liquid Trail
    let canvas = document.getElementById('orbit-cursor-fluid-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'orbit-cursor-fluid-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '2147483645'; // Directly underneath the cursor ring/dot
      canvas.style.filter = 'url(#orbit-gooey-filter)';
      document.body.appendChild(canvas);
    }

    Engine.canvas = canvas;
    Engine.ctx = canvas.getContext('2d');

    function resizeCanvas() {
      if (!Engine.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      Engine.canvas.width = window.innerWidth * dpr;
      Engine.canvas.height = window.innerHeight * dpr;
      Engine.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Pre-allocate particle pool (Zero allocation during high-speed animation loop)
    Engine.particlePool = [];
    for (let i = 0; i < Engine.maxParticles; i++) {
      Engine.particlePool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        initialRadius: 0,
        alpha: 1,
        life: 0,
        maxLife: 26
      });
    }
  }

  // Particle Spawner from Pool
  function spawnFluidParticle(x, y, vx, vy, size) {
    if (Engine.activeParticles.length >= Engine.maxParticles) return;

    // Find inactive particle from pool
    let p = null;
    for (let i = 0; i < Engine.particlePool.length; i++) {
      if (!Engine.particlePool[i].active) {
        p = Engine.particlePool[i];
        break;
      }
    }
    if (!p) return;

    p.active = true;
    p.x = x + (Math.random() - 0.5) * 4;
    p.y = y + (Math.random() - 0.5) * 4;
    p.vx = vx * 0.18 + (Math.random() - 0.5) * 1.5;
    p.vy = vy * 0.18 + (Math.random() - 0.5) * 1.5;
    p.radius = size;
    p.initialRadius = size;
    p.alpha = 1;
    p.life = 0;
    p.maxLife = 20 + Math.floor(Math.random() * 10);
    Engine.activeParticles.push(p);
  }

  // ---------------------------------------------------------------------------
  // PHASE 3.3: ORGANIC CURSOR BLOB SETUP
  // ---------------------------------------------------------------------------
  function setupOrganicCursorBlob() {
    if (isTouchDevice || prefersReducedMotion) return;

    let blob = document.getElementById('orbit-cursor-organic-blob');
    if (!blob) {
      blob = document.createElement('div');
      blob.id = 'orbit-cursor-organic-blob';
      blob.style.position = 'fixed';
      blob.style.top = '0';
      blob.style.left = '0';
      blob.style.width = '24px';
      blob.style.height = '24px';
      blob.style.marginLeft = '-12px';
      blob.style.marginTop = '-12px';
      blob.style.borderRadius = '50%';
      blob.style.background = Engine.cursorColor;
      blob.style.boxShadow = `0 0 20px rgba(${Engine.cursorRgb.r}, ${Engine.cursorRgb.g}, ${Engine.cursorRgb.b}, 0.65)`;
      blob.style.opacity = '0.55';
      blob.style.pointerEvents = 'none';
      blob.style.zIndex = '2147483646';
      blob.style.willChange = 'transform, opacity';
      blob.style.transition = 'opacity 0.25s ease, background 0.3s ease';
      document.body.appendChild(blob);
    }
  }

  // ---------------------------------------------------------------------------
  // PHASE 3.5: CLICK SHOCKWAVE RING
  // ---------------------------------------------------------------------------
  function triggerClickShockwave(x, y) {
    if (isTouchDevice || prefersReducedMotion) return;

    const wave = document.createElement('div');
    wave.className = 'orbit-click-shockwave';
    wave.style.position = 'fixed';
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    wave.style.width = '12px';
    wave.style.height = '12px';
    wave.style.marginLeft = '-6px';
    wave.style.marginTop = '-6px';
    wave.style.borderRadius = '50%';
    wave.style.border = `2px solid ${Engine.cursorColor}`;
    wave.style.boxShadow = `0 0 16px ${Engine.cursorColor}`;
    wave.style.pointerEvents = 'none';
    wave.style.zIndex = '2147483648';
    wave.style.transform = 'scale(0.8)';
    wave.style.opacity = '1';
    wave.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease';
    document.body.appendChild(wave);

    requestAnimationFrame(() => {
      wave.style.transform = 'scale(4.8)';
      wave.style.opacity = '0';
    });

    setTimeout(() => {
      if (wave.parentNode) wave.parentNode.removeChild(wave);
    }, 480);
  }

  // ---------------------------------------------------------------------------
  // PHASE 4.1: MOUSE-FOLLOWING AMBIENT SPOTLIGHT
  // ---------------------------------------------------------------------------
  function updateAmbientSpotlight(x, y) {
    document.documentElement.style.setProperty('--orbit-spotlight-x', x + 'px');
    document.documentElement.style.setProperty('--orbit-spotlight-y', y + 'px');
  }

  // ---------------------------------------------------------------------------
  // PHASE 10.0: MAGNETIC BUTTONS & INTERACTIVE HOVER CONTROLS
  // ---------------------------------------------------------------------------
  function setupMagneticElements() {
    if (isTouchDevice || prefersReducedMotion) return;

    const targets = document.querySelectorAll('button, a.btn, a.cop-btn, a.bm-pill-btn, .theme-toggle-btn');
    targets.forEach(el => {
      if (el.dataset.magneticAttached) return;
      el.dataset.magneticAttached = 'true';

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width * 0.5;
        const centerY = rect.top + rect.height * 0.5;
        const distX = (e.clientX - centerX) * 0.28;
        const distY = (e.clientY - centerY) * 0.28;

        el.style.transform = `translate3d(${distX}px, ${distY}px, 0)`;
        el.style.transition = 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate3d(0, 0, 0)';
        el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  // ---------------------------------------------------------------------------
  // PHASE 5.0: BUTTERMAX-INSPIRED ORGANIC BLOB PAGE TRANSITIONS
  // ---------------------------------------------------------------------------
  function setupPageTransitions() {
    // Intercept clicks on internal links
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      if (link.getAttribute('target') === '_blank' || e.metaKey || e.ctrlKey) return;

      // Internal route detected
      const isInternal = href.startsWith('/') || href.startsWith('./') || href.startsWith('../') || href.includes('trendustyorbit.online') || !href.includes('://');
      if (!isInternal) return;

      e.preventDefault();
      executeOrganicTransition(href, e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
    });
  }

  function executeOrganicTransition(targetUrl, clickX, clickY) {
    if (prefersReducedMotion) {
      window.location.href = targetUrl;
      return;
    }

    // Create Organic Blob Transition Layer
    let layer = document.getElementById('orbit-page-transition-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'orbit-page-transition-layer';
      layer.style.position = 'fixed';
      layer.style.inset = '0';
      layer.style.pointerEvents = 'all';
      layer.style.zIndex = '2147483640';
      layer.style.overflow = 'hidden';
      document.body.appendChild(layer);
    }

    // Calculate maximum radius to cover all 4 viewport corners from click position
    const maxDist = Math.hypot(
      Math.max(clickX, window.innerWidth - clickX),
      Math.max(clickY, window.innerHeight - clickY)
    ) + 60;

    layer.innerHTML = `
      <svg width="100%" height="100%" style="display:block;">
        <defs>
          <clipPath id="orbit-trans-clip">
            <circle id="orbit-trans-circle" cx="${clickX}" cy="${clickY}" r="0" />
          </clipPath>
        </defs>
        <rect width="100%" height="100%" fill="#ffdb15" clip-path="url(#orbit-trans-clip)" />
      </svg>
    `;

    const circle = layer.querySelector('#orbit-trans-circle');
    let startTime = performance.now();
    const duration = 520; // 520ms smooth expansion

    function expand(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      circle.setAttribute('r', (maxDist * ease).toFixed(1));

      if (progress < 1) {
        requestAnimationFrame(expand);
      } else {
        // Navigate
        sessionStorage.setItem('orbit_nav_from_button', 'true');
        window.location.href = targetUrl;
      }
    }

    requestAnimationFrame(expand);
  }

  // ---------------------------------------------------------------------------
  // MAIN RAF ANIMATION LOOP (FLUID TRAIL & ORGANIC BLOB)
  // ---------------------------------------------------------------------------
  function startEngineLoop() {
    if (Engine.animFrameId) cancelAnimationFrame(Engine.animFrameId);

    const blobEl = document.getElementById('orbit-cursor-organic-blob');
    const ringEl = document.getElementById('orbit-cursor-ring');
    const dotEl = document.getElementById('orbit-cursor-dot');

    function loop() {
      Engine.animFrameId = requestAnimationFrame(loop);

      if (isTouchDevice || prefersReducedMotion) return;

      // Update Cursor Blob Position with Smooth Lerp
      if (Engine.mouse.x > -500) {
        Engine.idleFrames++;

        // Interpolation
        Engine.blobPos.x += (Engine.mouse.x - Engine.blobPos.x) * 0.16;
        Engine.blobPos.y += (Engine.mouse.y - Engine.blobPos.y) * 0.16;

        // Velocity & Stretch calculation
        const dx = Engine.mouse.x - Engine.blobPos.x;
        const dy = Engine.mouse.y - Engine.blobPos.y;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        const targetStretch = Math.min(2.1, 1 + dist * 0.024);
        Engine.blobPos.stretch += (targetStretch - Engine.blobPos.stretch) * 0.22;

        if (blobEl) {
          blobEl.style.transform = `translate3d(${Engine.blobPos.x}px, ${Engine.blobPos.y}px, 0) rotate(${angle}rad) scale(${Engine.blobPos.stretch}, ${1 / Math.sqrt(Engine.blobPos.stretch)})`;
          blobEl.style.background = Engine.cursorColor;
          blobEl.style.boxShadow = `0 0 16px rgba(${Engine.cursorRgb.r}, ${Engine.cursorRgb.g}, ${Engine.cursorRgb.b}, 0.75)`;
        }

        // Spawn fluid particles along pointer path when moving
        if (Engine.mouse.speed > 1.8 && Engine.idleFrames < 180) {
          const particleCount = Math.min(3, Math.max(1, Math.floor(Engine.mouse.speed * 0.12)));
          for (let i = 0; i < particleCount; i++) {
            const frac = i / particleCount;
            const px = Engine.mouse.prevX + (Engine.mouse.x - Engine.mouse.prevX) * frac;
            const py = Engine.mouse.prevY + (Engine.mouse.y - Engine.mouse.prevY) * frac;
            const pSize = Math.min(14, Math.max(5, 10 - Engine.mouse.speed * 0.08));
            spawnFluidParticle(px, py, Engine.mouse.vx, Engine.mouse.vy, pSize);
          }
        }
      }

      // Render Liquid Particles on Canvas
      if (Engine.ctx && Engine.canvas) {
        Engine.ctx.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);

        if (Engine.activeParticles.length > 0) {
          const rgb = Engine.cursorRgb;

          for (let i = Engine.activeParticles.length - 1; i >= 0; i--) {
            const p = Engine.activeParticles[i];
            p.life++;
            if (p.life >= p.maxLife || p.radius <= 0.6) {
              p.active = false;
              Engine.activeParticles.splice(i, 1);
              continue;
            }

            // Velocity & Friction
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.92;
            p.vy *= 0.92;

            // Decay
            const progress = p.life / p.maxLife;
            p.radius = p.initialRadius * (1 - progress * 0.88);
            p.alpha = Math.max(0, 1 - progress * 1.05);

            // Draw fluid droplet
            Engine.ctx.beginPath();
            Engine.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            Engine.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`;
            Engine.ctx.fill();
          }

          // Connect adjacent particles with smooth Bézier liquid ribbons (metaball bridges)
          for (let i = 0; i < Engine.activeParticles.length - 1; i++) {
            const p1 = Engine.activeParticles[i];
            const p2 = Engine.activeParticles[i + 1];
            const pDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (pDist < 48 && pDist > 2) {
              Engine.ctx.beginPath();
              Engine.ctx.moveTo(p1.x, p1.y);
              Engine.ctx.lineTo(p2.x, p2.y);
              Engine.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(p1.alpha + p2.alpha) * 0.35})`;
              Engine.ctx.lineWidth = Math.min(p1.radius, p2.radius) * 1.6;
              Engine.ctx.lineCap = 'round';
              Engine.ctx.stroke();
            }
          }
        }
      }
    }

    loop();
  }

  // ---------------------------------------------------------------------------
  // INPUT EVENT LISTENERS
  // ---------------------------------------------------------------------------
  function attachEventListeners() {
    window.addEventListener('mousemove', function(e) {
      if (Engine.mouse.prevX === -1000) {
        Engine.mouse.prevX = e.clientX;
        Engine.mouse.prevY = e.clientY;
      } else {
        Engine.mouse.prevX = Engine.mouse.x;
        Engine.mouse.prevY = Engine.mouse.y;
      }

      Engine.mouse.x = e.clientX;
      Engine.mouse.y = e.clientY;
      Engine.mouse.vx = Engine.mouse.x - Engine.mouse.prevX;
      Engine.mouse.vy = Engine.mouse.y - Engine.mouse.prevY;
      Engine.mouse.speed = Math.hypot(Engine.mouse.vx, Engine.mouse.vy);
      Engine.idleFrames = 0;

      // Update ambient spotlight
      updateAmbientSpotlight(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointerdown', function(e) {
      triggerClickShockwave(e.clientX, e.clientY);
    }, { passive: true });

    // Live color sync when changed in /temp
    window.addEventListener('storage', function(e) {
      if (e.key === 'orbit_temp_cursor_color') {
        syncCursorColor();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------
  function init() {
    if (Engine.initialized) return;
    Engine.initialized = true;

    syncCursorColor();
    setupLiquidTrailCanvas();
    setupOrganicCursorBlob();
    setupMagneticElements();
    setupPageTransitions();
    attachEventListeners();
    startEngineLoop();

    // Re-check dynamic buttons when DOM updates
    setTimeout(setupMagneticElements, 800);
    setTimeout(setupMagneticElements, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
