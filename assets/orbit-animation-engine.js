/**
 * TRENDUSTY ORBIT — ANIMATION & INTERACTION ENGINE
 * Premium Buttermax-inspired Animation Architecture:
 * - Clean Magnetic Circle Cursor in #EE00FF (No mouse particle clutter)
 * - 4.2 Interactive Liquid Ink Background on the BG of the WHOLE website pages
 * - 4.1 Mouse-Following Ambient Spotlight
 * - 3.4 Interactive Hover States & 3.5 Click Shockwave Ring
 * - 5.0 Buttermax-Inspired Organic Blob Page Transitions
 * - 10.0 Magnetic Buttons & Interactive Cards
 * - 13.0 Responsive & 15.0 Accessibility Controls
 */

(function() {
  'use strict';

  const isTouchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.OrbitAnimationEngine = {
    initialized: false,
    cursorColor: '#EE00FF',
    cursorRgb: { r: 238, g: 0, b: 255 },
    mouse: { x: -1000, y: -1000, prevX: -1000, prevY: -1000, vx: 0, vy: 0, speed: 0 },
    liquidTrail: [], // Flowing liquid stream following cursor on the background
    liquidBlobs: [], // Organic floating background liquid ink pools
    canvas: null,
    ctx: null,
    animFrameId: null,
    width: window.innerWidth,
    height: window.innerHeight,
    scrollY: window.scrollY
  };

  const Engine = window.OrbitAnimationEngine;

  // ---------------------------------------------------------------------------
  // COLOR & THEME SYNC
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
  // PHASE 4.2: INTERACTIVE LIQUID INK BACKGROUND (WHOLE WEBSITE PAGES)
  // ---------------------------------------------------------------------------
  function setupLiquidBackground() {
    if (prefersReducedMotion) return;

    let canvas = document.getElementById('orbit-liquid-bg-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'orbit-liquid-bg-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0'; // Sits cleanly on fixed viewport background, visible behind glass cards
      canvas.style.opacity = '1';
      document.body.prepend(canvas);
    }

    Engine.canvas = canvas;
    Engine.ctx = canvas.getContext('2d');

    function resizeCanvas() {
      if (!Engine.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      Engine.width = window.innerWidth;
      Engine.height = window.innerHeight;
      Engine.canvas.width = Engine.width * dpr;
      Engine.canvas.height = Engine.height * dpr;
      Engine.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initLiquidBlobs();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }

  // Initialize organic background liquid blob shapes
  function initLiquidBlobs() {
    Engine.liquidBlobs = [
      {
        baseX: Engine.width * 0.18,
        baseY: Engine.height * 0.28,
        x: Engine.width * 0.18,
        y: Engine.height * 0.28,
        radius: Math.min(230, Engine.width * 0.16),
        speedFactor: 0.0008,
        phase: 0,
        nodes: 12
      },
      {
        baseX: Engine.width * 0.82,
        baseY: Engine.height * 0.35,
        x: Engine.width * 0.82,
        y: Engine.height * 0.35,
        radius: Math.min(270, Engine.width * 0.18),
        speedFactor: 0.0006,
        phase: 2.1,
        nodes: 12
      },
      {
        baseX: Engine.width * 0.48,
        baseY: Engine.height * 0.76,
        x: Engine.width * 0.48,
        y: Engine.height * 0.76,
        radius: Math.min(220, Engine.width * 0.15),
        speedFactor: 0.0009,
        phase: 4.2,
        nodes: 12
      },
      {
        baseX: Engine.width * 0.08,
        baseY: Engine.height * 0.82,
        x: Engine.width * 0.08,
        y: Engine.height * 0.82,
        radius: Math.min(190, Engine.width * 0.13),
        speedFactor: 0.0007,
        phase: 1.2,
        nodes: 12
      },
      {
        baseX: Engine.width * 0.90,
        baseY: Engine.height * 0.80,
        x: Engine.width * 0.90,
        y: Engine.height * 0.80,
        radius: Math.min(200, Engine.width * 0.14),
        speedFactor: 0.00085,
        phase: 3.4,
        nodes: 12
      }
    ];
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
    wave.style.width = '14px';
    wave.style.height = '14px';
    wave.style.marginLeft = '-7px';
    wave.style.marginTop = '-7px';
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
    // Clear any leftover transition overlays on fresh load
    const stale = document.getElementById('orbit-page-transition-layer');
    if (stale) stale.remove();

    document.addEventListener('click', function(e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      // Do NOT intercept downloads or file packages!
      if (link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
      if (link.getAttribute('target') === '_blank' || e.metaKey || e.ctrlKey) return;
      if (href.match(/\.(zip|apk|exe|bat|msi|tar|gz|json|kdbx)($|\?)/i)) return;

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

    // Safety timeout: auto remove after 1.2s so page is never permanently blocked
    setTimeout(() => {
      if (layer && layer.parentNode) {
        layer.style.opacity = '0';
        layer.style.transition = 'opacity 0.25s ease';
        setTimeout(() => { if (layer && layer.parentNode) layer.parentNode.removeChild(layer); }, 250);
      }
    }, 1200);

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
    const duration = 500;

    function expand(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      circle.setAttribute('r', (maxDist * ease).toFixed(1));

      if (progress < 1) {
        requestAnimationFrame(expand);
      } else {
        sessionStorage.setItem('orbit_nav_from_button', 'true');
        window.location.href = targetUrl;
      }
    }

    requestAnimationFrame(expand);
  }

  // ---------------------------------------------------------------------------
  // MAIN RAF ANIMATION LOOP: LIQUID INK BACKGROUND (WHOLE WEBSITE)
  // ---------------------------------------------------------------------------
  function startEngineLoop() {
    if (Engine.animFrameId) cancelAnimationFrame(Engine.animFrameId);

    const startTime = performance.now();

    function loop(now) {
      Engine.animFrameId = requestAnimationFrame(loop);

      if (prefersReducedMotion || !Engine.ctx || !Engine.canvas) return;

      const time = now - startTime;
      Engine.ctx.clearRect(0, 0, Engine.width, Engine.height);

      const isObsidian = document.documentElement.classList.contains('theme-obsidian') || document.body.classList.contains('theme-obsidian');

      // 1. Draw each organic liquid ink blob in the background
      Engine.liquidBlobs.forEach((blob, bIdx) => {
        // Slow organic drift
        const driftX = Math.sin(time * blob.speedFactor + blob.phase) * 35;
        const driftY = Math.cos(time * (blob.speedFactor * 0.8) + blob.phase) * 25;

        // Interaction with pointer: stretch towards / slosh away with surface tension
        let deformX = 0;
        let deformY = 0;
        if (Engine.mouse.x > -500) {
          const distX = Engine.mouse.x - (blob.baseX + driftX);
          const distY = Engine.mouse.y - (blob.baseY + driftY);
          const dist = Math.hypot(distX, distY);
          if (dist < 420 && dist > 1) {
            const pull = (1 - dist / 420) * 55;
            deformX = (distX / dist) * pull;
            deformY = (distY / dist) * pull;
          }
        }

        blob.x += ((blob.baseX + driftX + deformX) - blob.x) * 0.08;
        blob.y += ((blob.baseY + driftY + deformY) - blob.y) * 0.08;

        // Generate organic wavy contour
        const points = [];
        for (let i = 0; i < blob.nodes; i++) {
          const angle = (i / blob.nodes) * Math.PI * 2;
          const wobble = Math.sin(time * 0.0022 + i * 1.4 + blob.phase) * 20;
          const r = blob.radius + wobble;
          points.push({
            x: blob.x + Math.cos(angle) * r,
            y: blob.y + Math.sin(angle) * r
          });
        }

        // Draw closed smooth cardinal spline / Bezier contour
        Engine.ctx.beginPath();
        const firstMid = {
          x: (points[0].x + points[points.length - 1].x) * 0.5,
          y: (points[0].y + points[points.length - 1].y) * 0.5
        };
        Engine.ctx.moveTo(firstMid.x, firstMid.y);

        for (let i = 0; i < points.length; i++) {
          const next = points[(i + 1) % points.length];
          const midX = (points[i].x + next.x) * 0.5;
          const midY = (points[i].y + next.y) * 0.5;
          Engine.ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
        }
        Engine.ctx.closePath();

        // High-contrast, rich styling based on active theme
        if (isObsidian) {
          // Cybernetic Obsidian theme: luminous cyan/magenta liquid aura
          const grad = Engine.ctx.createRadialGradient(blob.x, blob.y, 25, blob.x, blob.y, blob.radius * 1.3);
          grad.addColorStop(0, 'rgba(0, 245, 184, 0.22)');
          grad.addColorStop(0.65, 'rgba(238, 0, 255, 0.14)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          Engine.ctx.fillStyle = grad;
          Engine.ctx.fill();

          Engine.ctx.strokeStyle = 'rgba(0, 245, 184, 0.40)';
          Engine.ctx.lineWidth = 1.6;
          Engine.ctx.stroke();
        } else {
          // Canonical Buttermax Solar Yellow theme: rich, clearly visible molten amber/charcoal liquid
          const grad = Engine.ctx.createRadialGradient(blob.x, blob.y, 20, blob.x, blob.y, blob.radius * 1.35);
          grad.addColorStop(0, 'rgba(18, 18, 18, 0.25)');
          grad.addColorStop(0.65, 'rgba(255, 170, 0, 0.20)');
          grad.addColorStop(1, 'rgba(255, 219, 21, 0)');
          Engine.ctx.fillStyle = grad;
          Engine.ctx.fill();

          Engine.ctx.strokeStyle = 'rgba(18, 18, 18, 0.32)';
          Engine.ctx.lineWidth = 1.8;
          Engine.ctx.stroke();
        }
      });

      // 2. Draw dynamic fluid wake stream following cursor on the background
      const activeTrail = [];
      for (let i = 0; i < Engine.liquidTrail.length; i++) {
        const pt = Engine.liquidTrail[i];
        const age = now - pt.createdAt;
        if (age < 2200) {
          const decay = 1 - age / 2200;
          pt.alpha = decay;
          pt.radius = pt.maxRadius * (0.35 + 0.65 * decay);
          activeTrail.push(pt);
        }
      }
      Engine.liquidTrail = activeTrail;

      if (Engine.liquidTrail.length > 1) {
        Engine.ctx.save();
        for (let i = 0; i < Engine.liquidTrail.length; i++) {
          const pt = Engine.liquidTrail[i];
          Engine.ctx.beginPath();
          Engine.ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          if (isObsidian) {
            Engine.ctx.fillStyle = `rgba(0, 245, 184, ${pt.alpha * 0.45})`;
          } else {
            Engine.ctx.fillStyle = `rgba(18, 18, 18, ${pt.alpha * 0.65})`;
          }
          Engine.ctx.fill();
        }

        // Smooth fluid stream ribbon connecting wake nodes
        Engine.ctx.beginPath();
        Engine.ctx.moveTo(Engine.liquidTrail[0].x, Engine.liquidTrail[0].y);
        for (let i = 1; i < Engine.liquidTrail.length; i++) {
          const prev = Engine.liquidTrail[i - 1];
          const curr = Engine.liquidTrail[i];
          const mx = (prev.x + curr.x) * 0.5;
          const my = (prev.y + curr.y) * 0.5;
          Engine.ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
        }
        if (isObsidian) {
          Engine.ctx.shadowColor = '#EE00FF';
          Engine.ctx.shadowBlur = 16;
          Engine.ctx.strokeStyle = 'rgba(0, 245, 184, 0.75)';
        } else {
          Engine.ctx.shadowColor = 'rgba(18, 18, 18, 0.35)';
          Engine.ctx.shadowBlur = 10;
          Engine.ctx.strokeStyle = 'rgba(18, 18, 18, 0.70)';
        }
        Engine.ctx.lineWidth = 22;
        Engine.ctx.lineCap = 'round';
        Engine.ctx.lineJoin = 'round';
        Engine.ctx.stroke();
        Engine.ctx.restore();
      }
    }

    loop(performance.now());
  }

  // ---------------------------------------------------------------------------
  // INPUT LISTENERS
  // ---------------------------------------------------------------------------
  function attachEventListeners() {
    function addLiquidPoint(x, y, now) {
      const baseR = Math.min(38, Math.max(16, 20 + Engine.mouse.speed * 0.28));
      Engine.liquidTrail.push({
        x: x,
        y: y,
        radius: baseR,
        maxRadius: baseR,
        alpha: 1.0,
        createdAt: now
      });
      if (Engine.liquidTrail.length > 55) {
        Engine.liquidTrail.shift();
      }
    }

    window.addEventListener('mousemove', function(e) {
      const now = performance.now();
      Engine.mouse.prevX = Engine.mouse.x;
      Engine.mouse.prevY = Engine.mouse.y;
      Engine.mouse.x = e.clientX;
      Engine.mouse.y = e.clientY;
      Engine.mouse.vx = Engine.mouse.x - Engine.mouse.prevX;
      Engine.mouse.vy = Engine.mouse.y - Engine.mouse.prevY;
      Engine.mouse.speed = Math.hypot(Engine.mouse.vx, Engine.mouse.vy);

      // Record smooth fluid stream following cursor on the background
      const dist = Math.hypot(e.clientX - Engine.mouse.prevX, e.clientY - Engine.mouse.prevY);
      if (dist > 14 && Engine.mouse.prevX > -500) {
        const steps = Math.min(6, Math.floor(dist / 14));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          addLiquidPoint(
            Engine.mouse.prevX + (e.clientX - Engine.mouse.prevX) * t,
            Engine.mouse.prevY + (e.clientY - Engine.mouse.prevY) * t,
            now
          );
        }
      }
      addLiquidPoint(e.clientX, e.clientY, now);

      updateAmbientSpotlight(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointerdown', function(e) {
      triggerClickShockwave(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('storage', function(e) {
      if (e.key === 'orbit_temp_cursor_color') {
        syncCursorColor();
      }
    });

    window.addEventListener('scroll', function() {
      Engine.scrollY = window.scrollY;
    }, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------
  function init() {
    if (Engine.initialized) return;
    Engine.initialized = true;

    syncCursorColor();
    setupLiquidBackground();
    setupMagneticElements();
    setupPageTransitions();
    attachEventListeners();
    startEngineLoop();

    setTimeout(setupMagneticElements, 800);
    setTimeout(setupMagneticElements, 2200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
