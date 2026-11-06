/**
 * TRENDUSTY ORBIT // SWARM BUILDER PRELOADER ENGINE
 * Inspired by Figma / Canva collaborative multiplayer canvas assembly
 * Features:
 * 1. Direct URL visit:
 *    - User's mouse is not shown (feels disconnected) but interactable.
 *    - User sees prompt: CLICK OR PRESS "ENTER" TO START.
 *    - On Enter / Click: Orbit AI swoops in and designs / calrates their mouse cursor live.
 *    - Mouse control is granted, custom cursor becomes active and movable.
 *    - User moves their mouse for 2 seconds.
 *    - Swarm of 5 cursors flies in and constructs the website from scratch!
 * 2. Directed by a button / internal link:
 *    - Skips the "Enter" prompt and calibration.
 *    - Directly begins constructing the website with the swarm.
 * 3. Instant bypass via Escape key or [Skip Intro] button.
 * 4. Replayable via floating [⚡ Replay Intro] pill.
 */

(function () {
  'use strict';

  // Ignore touch/coarse devices
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  const SESSION_KEY = 'orbit_swarm_intro_played';
  const forceReplay = window.location.search.includes('replay_intro=true');
  const alreadySeen = sessionStorage.getItem(SESSION_KEY) === 'true';

  // Global navigation tracker: any click on an interactive link or button flags button navigation
  window.addEventListener('click', (e) => {
    const btn = e.target.closest('a, button, [role="button"], [onclick], [data-href]');
    if (btn) {
      try {
        sessionStorage.setItem('orbit_nav_from_button', 'true');
      } catch (err) {}
    }
  }, true);

  // Audio tone synthesizer for laser forge & calibration feedback
  function playSynthTone(freq, type = 'sine', duration = 0.12, gainVal = 0.08) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  // Find relative assets path
  function getAssetPath(filename) {
    const isSubdir = window.location.pathname.includes('/echonode') ||
                     window.location.pathname.includes('/home') ||
                     window.location.pathname.includes('/download') ||
                     window.location.pathname.includes('/windows') ||
                     window.location.pathname.includes('/apps');
    const prefix = isSubdir ? '../assets/' : 'assets/';
    return prefix + filename;
  }

  class SwarmBuilderLoader {
    constructor() {
      this.container = null;
      this.cursors = {};
      this.isSkipped = false;
      this.timelineTimers = [];
      this.isMouseConnected = false;
      this.isFromButton = false;

      this.cursorConfigs = [
        { id: 'amogh', name: 'Amogh', color: '#00f5b8', textColor: '#041610', startX: 120, startY: 80 },
        { id: 'orbit', name: 'Orbit AI', color: '#a855f7', textColor: '#ffffff', startX: -80, startY: 150 },
        { id: 'elena', name: 'Elena', color: '#ec4899', textColor: '#ffffff', startX: 950, startY: 200 },
        { id: 'alex', name: 'Alex', color: '#f59e0b', textColor: '#ffffff', startX: 850, startY: 600 },
        { id: 'kai', name: 'Kai', color: '#06b6d4', textColor: '#ffffff', startX: 60, startY: 550 }
      ];
    }

    init() {
      // Check whether this visit was triggered by clicking a button/link
      try {
        this.isFromButton = sessionStorage.getItem('orbit_nav_from_button') === 'true';
        sessionStorage.removeItem('orbit_nav_from_button'); // Consume flag
      } catch (e) {
        this.isFromButton = false;
      }

      this.createDOM();
      this.bindEvents();
      this.injectReplayPill();

      if (alreadySeen && !forceReplay && !this.isFromButton) {
        // Skip animation seamlessly if already watched in this tab and not explicitly requested
        this.enableUserMouse();
        this.finish(true);
        return;
      }

      if (this.isFromButton) {
        // Directed by a button/link: Skip "Enter" prompt, mouse is already calibrated, directly start website builder!
        this.hideEnterOverlay(true);
        this.enableUserMouse();
        this.startChoreography();
      } else {
        // Direct URL visit: User mouse is invisible (feels disconnected) -> Wait for Enter/Click -> Forge mouse -> Wait 2s -> Start builder!
        this.disableUserMouse();
        this.showEnterPrompt();
      }
    }

    createDOM() {
      const old = document.getElementById('swarm-builder-preloader');
      if (old) old.remove();

      this.container = document.createElement('div');
      this.container.id = 'swarm-builder-preloader';
      this.container.setAttribute('aria-label', 'Building Trendusty Orbit');

      const logoSrc = getAssetPath('trendusty-orbit-icon.png');

      this.container.innerHTML = `
        <div class="sb-blueprint-grid"></div>
        <div class="sb-ambient-glow"></div>
        
        <!-- Top HUD -->
        <div class="sb-top-hud">
          <div class="sb-hud-status">
            <span class="sb-pulse-dot"></span>
            <span id="sb-status-banner">LIVE COLLABORATION • 5 DESIGNERS</span>
          </div>
          
          <div class="sb-progress-wrap">
            <span id="sb-progress-text">BUILDING 0%</span>
            <div class="sb-progress-bar">
              <div id="sb-progress-fill" class="sb-progress-fill"></div>
            </div>
          </div>
          
          <button id="sb-skip-btn" class="sb-skip-btn" type="button" title="Skip Intro (Esc)">
            <span>Skip Intro</span>
            <kbd style="opacity:0.6; font-size:10px; background:rgba(255,255,255,0.12); padding:1px 5px; border-radius:3px;">ESC</kbd>
          </button>
        </div>
        
        <!-- Dynamic Alignment Guides -->
        <div id="sb-guide-x" class="sb-guide-line-x"></div>
        <div id="sb-guide-y" class="sb-guide-line-y"></div>

        <!-- Figma Staging Canvas Area -->
        <div class="sb-canvas-stage" id="sb-canvas-stage">
          <div class="sb-crop-mark sb-crop-tl"></div>
          <div class="sb-crop-mark sb-crop-tr"></div>
          <div class="sb-crop-mark sb-crop-bl"></div>
          <div class="sb-crop-mark sb-crop-br"></div>
          
          <!-- 1. Draggable Image Element -->
          <div id="sb-image-element" class="sb-element-image">
            <img id="sb-img" src="${logoSrc}" alt="Trendusty Orbit Logo" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><circle cx=\\'50\\' cy=\\'50\\' r=\\'42\\' fill=\\'none\\' stroke=\\'%2300f5b8\\' stroke-width=\\'8\\'/><circle cx=\\'50\\' cy=\\'50\\' r=\\'18\\' fill=\\'%2338bdf8\\'/></svg>'">
            <div class="sb-handle sb-handle-tl"></div>
            <div class="sb-handle sb-handle-tr"></div>
            <div class="sb-handle sb-handle-bl"></div>
            <div class="sb-handle sb-handle-br" id="sb-handle-img-br"></div>
          </div>
          
          <!-- 2. Draggable Headline Text Box -->
          <div id="sb-text-element" class="sb-element-headline">
            <span id="sb-typed-headline"></span><span id="sb-headline-caret" class="sb-caret" style="display:none;"></span>
            <div class="sb-handle sb-handle-tl"></div>
            <div class="sb-handle sb-handle-tr"></div>
            <div class="sb-handle sb-handle-bl"></div>
            <div class="sb-handle sb-handle-br"></div>
          </div>
          
          <!-- 3. Subtitle Text Box -->
          <div id="sb-subtext-element" class="sb-element-subtitle">
            <span id="sb-typed-subtitle"></span><span id="sb-subtext-caret" class="sb-caret" style="display:none;"></span>
          </div>
          
          <!-- 4. Draggable Action Button -->
          <div id="sb-button-element" class="sb-element-button">
            <span id="sb-btn-icon" style="display:none;">⚡</span>
            <span id="sb-typed-button"></span><span id="sb-button-caret" class="sb-caret" style="display:none;"></span>
            <div class="sb-handle sb-handle-tl"></div>
            <div class="sb-handle sb-handle-tr" id="sb-handle-btn-radius"></div>
            <div class="sb-handle sb-handle-bl"></div>
            <div class="sb-handle sb-handle-br"></div>
          </div>
          
          <!-- 5. Feature Badges Container -->
          <div id="sb-badges-element" class="sb-element-badges">
            <div class="sb-badge-chip" id="sb-badge-1">✦ 99.9% Uptime</div>
            <div class="sb-badge-chip" id="sb-badge-2">✦ 0ms Latency Engine</div>
            <div class="sb-badge-chip" id="sb-badge-3">✦ DDoS Shield Active</div>
          </div>
        </div>

        <!-- Click Ripple Wave -->
        <div id="sb-click-ripple" class="sb-click-ripple"></div>

        <!-- Multiplayer Cursors Layer -->
        <div id="sb-cursors-layer" style="position:absolute; inset:0; pointer-events:none; z-index:500;"></div>

        <!-- Interactive Direct URL Hardware Enter Prompt Overlay -->
        <div id="sb-enter-overlay" class="sb-enter-overlay">
          <div class="sb-enter-box">
            <span class="sb-enter-tag">HARDWARE LINK REQUIRED</span>
            <button id="sb-enter-btn" class="sb-enter-pill" type="button">
              <span>⚡ CLICK OR PRESS <kbd>ENTER</kbd> TO START</span>
            </button>
            <div class="sb-enter-status">
              <span class="sb-status-dot-blink" id="sb-enter-dot"></span>
              <span id="sb-status-desc">MOUSE DISCONNECTED • PENDING CALIBRATION</span>
            </div>
          </div>
        </div>

        <!-- Center Mouse Forge Reticle -->
        <div id="sb-forge-container" class="sb-forge-container">
          <div class="sb-forge-ring" id="sb-forge-ring"></div>
          <div class="sb-forge-core-dot" id="sb-forge-dot"></div>
        </div>

        <!-- 2-Second Movable Wait Notification -->
        <div id="sb-wait-banner" class="sb-wait-banner">
          <span>⚡ MOUSE CONNECTED • LAUNCHING SITE BUILDER IN <strong id="sb-wait-seconds">2.0s</strong></span>
        </div>
      `;

      document.body.prepend(this.container);

      // Build cursor elements
      const cursorsLayer = document.getElementById('sb-cursors-layer');
      this.cursorConfigs.forEach(cfg => {
        const cur = document.createElement('div');
        cur.className = 'sb-cursor';
        cur.id = `sb-cursor-${cfg.id}`;
        cur.innerHTML = `
          <svg class="sb-cursor-pointer" viewBox="0 0 24 24" fill="none" style="transform: rotate(-10deg);">
            <path d="M4 2L20 10L11.5 13L8 21.5L4 2Z" fill="${cfg.color}" stroke="#06080e" stroke-width="1.6" stroke-linejoin="round"/>
          </svg>
          <div class="sb-cursor-tag" style="background:${cfg.color}; color:${cfg.textColor};">
            <span>${cfg.name}</span>
          </div>
          <div class="sb-speech-bubble" id="sb-bubble-${cfg.id}"></div>
        `;
        cursorsLayer.appendChild(cur);
        this.cursors[cfg.id] = cur;

        this.moveCursor(cfg.id, cfg.startX, cfg.startY, 0);
      });
    }

    bindEvents() {
      // Escape key to skip instantly
      this.keyHandler = (e) => {
        if (e.key === 'Escape') this.finish(false);
      };
      window.addEventListener('keydown', this.keyHandler);

      // Skip button click
      const skipBtn = document.getElementById('sb-skip-btn');
      if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.finish(false);
        });
      }

      // Background click to finish if already running builder
      this.container.addEventListener('click', (e) => {
        if (this.isMouseConnected && (e.target === this.container || e.target.classList.contains('sb-blueprint-grid') || e.target.classList.contains('sb-ambient-glow'))) {
          this.finish(false);
        }
      });
    }

    disableUserMouse() {
      this.isMouseConnected = false;
      document.body.classList.add('sb-mouse-disconnected');
      document.documentElement.classList.add('sb-mouse-disconnected');

      const dot = document.getElementById('orbit-cursor-dot');
      const ring = document.getElementById('orbit-cursor-ring');
      const customImg = document.getElementById('custom-img-cursor');
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
      if (customImg) customImg.style.opacity = '0';
    }

    enableUserMouse() {
      this.isMouseConnected = true;
      document.body.classList.remove('sb-mouse-disconnected');
      document.documentElement.classList.remove('sb-mouse-disconnected');

      const dot = document.getElementById('orbit-cursor-dot');
      const ring = document.getElementById('orbit-cursor-ring');
      const customImg = document.getElementById('custom-img-cursor');
      if (dot) dot.style.opacity = '1';
      if (ring) ring.style.opacity = '1';
      if (customImg && customImg.style.display !== 'none') customImg.style.opacity = '1';
    }

    hideEnterOverlay(instant = false) {
      const overlay = document.getElementById('sb-enter-overlay');
      if (!overlay) return;
      if (instant) {
        overlay.classList.add('is-hidden');
        overlay.remove();
      } else {
        overlay.classList.add('is-hidden');
        setTimeout(() => overlay.remove(), 400);
      }
    }

    showEnterPrompt() {
      const overlay = document.getElementById('sb-enter-overlay');
      const btn = document.getElementById('sb-enter-btn');
      const desc = document.getElementById('sb-status-desc');
      const dot = document.getElementById('sb-enter-dot');
      if (!overlay || !btn) return;

      let triggered = false;

      const triggerCalibration = () => {
        if (triggered) return;
        triggered = true;

        playSynthTone(480, 'triangle', 0.15);
        playSynthTone(640, 'sine', 0.2);

        btn.style.transform = 'scale(0.95)';
        btn.innerHTML = `<span>⚙ CALIBRATING HARDWARE...</span>`;
        if (desc) desc.textContent = 'DESIGNING MOUSE CURSOR LIVE...';
        if (dot) {
          dot.style.background = '#38bdf8';
          dot.style.boxShadow = '0 0 10px #38bdf8';
        }

        // Orbit AI swoops down to design the user's cursor
        this.runMouseForgeAnimation();
      };

      // Listen for Enter key
      this.enterKeyHandler = (e) => {
        if (e.key === 'Enter') {
          triggerCalibration();
        }
      };
      window.addEventListener('keydown', this.enterKeyHandler);

      // Listen for Click on the button or anywhere on the overlay
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerCalibration();
      });
      overlay.addEventListener('click', () => {
        triggerCalibration();
      });
    }

    runMouseForgeAnimation() {
      if (window.removeEventListener && this.enterKeyHandler) {
        window.removeEventListener('keydown', this.enterKeyHandler);
      }

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const forgeContainer = document.getElementById('sb-forge-container');
      const forgeDot = document.getElementById('sb-forge-dot');
      const desc = document.getElementById('sb-status-desc');

      if (forgeContainer) forgeContainer.classList.add('is-active');

      // Orbit AI cursor swoops to center stage
      this.moveCursor('orbit', cx + 30, cy + 20, 0.45);
      this.showBubble('orbit', 'Forging custom mouse cursor 🛠️', 2000);

      // Laser forge audio tone
      this.schedule(() => {
        playSynthTone(750, 'sawtooth', 0.12, 0.06);
      }, 350);

      // Pop the central core dot into existence
      this.schedule(() => {
        if (forgeDot) forgeDot.classList.add('is-forged');
        playSynthTone(880, 'sine', 0.15, 0.08);
      }, 700);

      // Connect mouse hardware & grant control to user
      this.schedule(() => {
        playSynthTone(1046, 'sine', 0.25, 0.1); // High C chime

        if (desc) desc.innerHTML = `<span style="color:#00f5b8;">🟢 HARDWARE SYNCHRONIZED • MOUSE CONNECTED!</span>`;
        this.showBubble('orbit', 'Mouse connected! Control granted ✨', 2200);

        this.hideEnterOverlay(false);
        if (forgeContainer) {
          forgeContainer.classList.remove('is-active');
          setTimeout(() => forgeContainer.remove(), 400);
        }

        // Transfer control to user: mouse is now movable!
        this.enableUserMouse();

        // 2-Second Movable Wait Sequence
        this.startTwoSecondWait();
      }, 1250);
    }

    startTwoSecondWait() {
      const banner = document.getElementById('sb-wait-banner');
      const secEl = document.getElementById('sb-wait-seconds');
      if (banner) banner.classList.add('is-active');

      let remaining = 20; // 2.0s in 100ms intervals
      const interval = setInterval(() => {
        if (this.isSkipped) {
          clearInterval(interval);
          if (banner) banner.remove();
          return;
        }
        remaining -= 1;
        if (secEl) secEl.textContent = (remaining / 10).toFixed(1) + 's';

        if (remaining <= 0) {
          clearInterval(interval);
          if (banner) {
            banner.classList.remove('is-active');
            setTimeout(() => banner.remove(), 300);
          }
          // Now start constructing the website with the swarm!
          this.startChoreography();
        }
      }, 100);
    }

    injectReplayPill() {
      if (document.getElementById('sb-replay-pill')) return;
      const pill = document.createElement('button');
      pill.id = 'sb-replay-pill';
      pill.className = 'sb-replay-pill';
      pill.type = 'button';
      pill.innerHTML = `<span>⚡</span><span>Replay Intro</span>`;
      pill.title = 'Watch website builder swarm animation again';
      pill.addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('orbit_nav_from_button');
        const l = new SwarmBuilderLoader();
        l.init();
      });
      document.body.appendChild(pill);
    }

    moveCursor(id, x, y, duration = 0.45) {
      const cur = this.cursors[id];
      if (!cur) return;
      cur.style.transition = `transform ${duration}s cubic-bezier(0.2, 0.9, 0.3, 1.1)`;
      cur.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    showBubble(id, text, duration = 1800) {
      const b = document.getElementById(`sb-bubble-${id}`);
      if (!b) return;
      b.textContent = text;
      b.classList.add('is-active');
      this.schedule(() => {
        b.classList.remove('is-active');
      }, duration);
    }

    setProgress(percent, statusText) {
      const fill = document.getElementById('sb-progress-fill');
      const text = document.getElementById('sb-progress-text');
      const banner = document.getElementById('sb-status-banner');
      if (fill) fill.style.width = `${percent}%`;
      if (text) text.textContent = `BUILDING ${Math.round(percent)}%`;
      if (banner && statusText) banner.textContent = statusText;
    }

    flashGuides(x = null, y = null) {
      const gx = document.getElementById('sb-guide-x');
      const gy = document.getElementById('sb-guide-y');
      if (y !== null && gx) {
        gx.style.top = `${y}px`;
        gx.style.opacity = '1';
        this.schedule(() => { gx.style.opacity = '0'; }, 350);
      }
      if (x !== null && gy) {
        gy.style.left = `${x}px`;
        gy.style.opacity = '1';
        this.schedule(() => { gy.style.opacity = '0'; }, 350);
      }
    }

    schedule(fn, delay) {
      if (this.isSkipped) return null;
      const t = setTimeout(() => {
        if (!this.isSkipped) fn();
      }, delay);
      this.timelineTimers.push(t);
      return t;
    }

    typeText(elemId, caretId, fullText, startDelay, charSpeed = 48, onComplete = null) {
      const elem = document.getElementById(elemId);
      const caret = document.getElementById(caretId);
      if (!elem) return;

      this.schedule(() => {
        if (caret) caret.style.display = 'inline-block';
        let i = 0;
        const interval = setInterval(() => {
          if (this.isSkipped) {
            clearInterval(interval);
            elem.textContent = fullText;
            if (caret) caret.style.display = 'none';
            if (onComplete) onComplete();
            return;
          }
          if (i <= fullText.length) {
            elem.textContent = fullText.slice(0, i);
            i++;
          } else {
            clearInterval(interval);
            if (caret) {
              setTimeout(() => {
                caret.style.display = 'none';
              }, 400);
            }
            if (onComplete) onComplete();
          }
        }, charSpeed);
      }, startDelay);
    }

    // =========================================================================
    // MULTIPLAYER SWARM CHOREOGRAPHY TIMELINE
    // =========================================================================
    startChoreography() {
      const stage = document.getElementById('sb-canvas-stage');
      if (!stage) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      // STAGE 0: Initial Fly-in (0ms - 600ms)
      this.setProgress(5, 'INITIALIZING MULTIPLAYER WORKSPACE...');
      this.schedule(() => {
        this.moveCursor('orbit', cx - 260, cy - 200, 0.6);
        this.moveCursor('amogh', cx - 180, cy - 80, 0.65);
        this.moveCursor('elena', cx + 220, cy - 120, 0.7);
        this.moveCursor('alex', cx + 180, cy + 140, 0.75);
        this.moveCursor('kai', cx - 240, cy + 180, 0.8);
      }, 100);

      this.schedule(() => {
        this.showBubble('elena', 'Ready! Dragging in brand assets...');
      }, 550);

      // =======================================================================
      // STAGE 1: Dragging & Resizing the Picture / Logo (800ms - 2400ms)
      // =======================================================================
      this.schedule(() => {
        this.setProgress(18, 'PLACING & RESIZING BRAND LOGO...');
        const imgElem = document.getElementById('sb-image-element');
        if (!imgElem) return;

        this.moveCursor('orbit', cx - 190, cy - 230, 0.4);

        this.schedule(() => {
          imgElem.style.opacity = '1';
          imgElem.classList.add('is-selected');
          imgElem.style.transform = 'translate(-180px, -210px) scale(0.7)';
          
          this.schedule(() => {
            this.moveCursor('orbit', cx - 45, cy - 185, 0.6);
            imgElem.style.transform = 'translate(-50%, 0) scale(0.85)';
          }, 350);

          this.schedule(() => {
            this.moveCursor('kai', cx + 15, cy - 135, 0.4);
            this.showBubble('kai', 'Scaling to 100px 📐');
          }, 700);

          this.schedule(() => {
            this.moveCursor('kai', cx + 38, cy - 110, 0.35);
            imgElem.style.transform = 'translate(-50%, 0) scale(1.05)';
            this.flashGuides(cx, cy - 170);
          }, 1050);

          this.schedule(() => {
            imgElem.style.transform = 'translate(-50%, 0) scale(1)';
            imgElem.classList.remove('is-selected');
            this.showBubble('orbit', 'Logo snapped! 🎯');
          }, 1350);

        }, 400);
      }, 750);

      // =======================================================================
      // STAGE 2: Dragging Text Box & Live Letter-by-Letter Typing (2400ms - 4600ms)
      // =======================================================================
      this.schedule(() => {
        this.setProgress(42, 'TYPESETTING HERO HEADLINE...');
        const textElem = document.getElementById('sb-text-element');
        if (!textElem) return;

        this.moveCursor('amogh', cx - 140, cy - 80, 0.4);

        this.schedule(() => {
          textElem.style.opacity = '1';
          textElem.classList.add('is-selected');
          this.showBubble('amogh', 'Typing headline live ✍️');

          this.moveCursor('amogh', cx + 80, cy - 70, 1.2);

          this.typeText('sb-typed-headline', 'sb-headline-caret', 'TRENDUSTY ORBIT', 100, 52, () => {
            this.moveCursor('elena', cx - 10, cy - 75, 0.35);
            this.showBubble('elena', 'Applying neon gradient ✨');
            this.schedule(() => {
              textElem.classList.add('sb-headline-gradient');
              textElem.classList.remove('is-selected');
              this.flashGuides(cx, cy - 65);
            }, 300);
          });
        }, 400);

        this.schedule(() => {
          const subElem = document.getElementById('sb-subtext-element');
          if (!subElem) return;
          this.moveCursor('alex', cx - 160, cy - 20, 0.4);
          subElem.style.opacity = '1';
          subElem.classList.add('is-selected');
          
          this.typeText('sb-typed-subtitle', 'sb-subtext-caret', 'Next-Gen Cloud & High Performance Game Nodes', 100, 22, () => {
            subElem.classList.remove('is-selected');
          });
        }, 1100);

      }, 2350);

      // =======================================================================
      // STAGE 3: Adjusting the Button & Live Corner Radius Morphing (4600ms - 6900ms)
      // =======================================================================
      this.schedule(() => {
        this.setProgress(68, 'ENGINEERING CTA BUTTON & RADIUS...');
        const btnElem = document.getElementById('sb-button-element');
        if (!btnElem) return;

        this.moveCursor('elena', cx - 110, cy + 45, 0.45);

        this.schedule(() => {
          btnElem.style.opacity = '1';
          btnElem.classList.add('is-selected');
          btnElem.style.borderRadius = '2px';
          btnElem.style.background = '#334155';
          btnElem.style.minWidth = '130px';

          this.schedule(() => {
            this.moveCursor('alex', cx + 55, cy + 42, 0.35);
            this.showBubble('alex', 'Morphing to sleek pill! 💊');
          }, 350);

          this.schedule(() => {
            btnElem.style.borderRadius = '6px';
            this.moveCursor('alex', cx + 48, cy + 46, 0.15);
          }, 650);

          this.schedule(() => {
            btnElem.style.borderRadius = '16px';
            this.moveCursor('alex', cx + 40, cy + 48, 0.15);
          }, 850);

          this.schedule(() => {
            btnElem.style.borderRadius = '9999px';
            this.moveCursor('alex', cx + 32, cy + 50, 0.15);
            this.flashGuides(cx, cy + 55);
          }, 1050);

          this.schedule(() => {
            this.moveCursor('orbit', cx - 40, cy + 55, 0.35);
            this.showBubble('orbit', 'Adding neon cyan gradient 🎨');
            btnElem.classList.add('is-styled');
          }, 1300);

          this.schedule(() => {
            this.moveCursor('amogh', cx - 20, cy + 55, 0.3);
            const icon = document.getElementById('sb-btn-icon');
            if (icon) icon.style.display = 'inline-block';

            this.typeText('sb-typed-button', 'sb-button-caret', 'START FREE SERVER', 50, 36, () => {
              btnElem.classList.remove('is-selected');

              this.moveCursor('alex', cx + 10, cy + 55, 0.25);
              this.schedule(() => {
                btnElem.style.transform = 'translate(-50%, 0) scale(0.94)';
                const rip = document.getElementById('sb-click-ripple');
                if (rip) {
                  rip.style.left = `${cx + 10}px`;
                  rip.style.top = `${cy + 55}px`;
                  rip.classList.add('is-clicking');
                  setTimeout(() => rip.classList.remove('is-clicking'), 400);
                }
                setTimeout(() => {
                  btnElem.style.transform = 'translate(-50%, 0) scale(1)';
                  this.showBubble('alex', 'Responsive test passed! ⚡');
                }, 160);
              }, 300);
            });
          }, 1700);

        }, 400);

      }, 4550);

      // =======================================================================
      // STAGE 4: Feature Badges Alignment & Chat Celebration (6900ms - 8000ms)
      // =======================================================================
      this.schedule(() => {
        this.setProgress(90, 'SNAPPING PERFORMANCE MATRIX...');
        const badgesContainer = document.getElementById('sb-badges-element');
        if (badgesContainer) badgesContainer.style.opacity = '1';

        const b1 = document.getElementById('sb-badge-1');
        const b2 = document.getElementById('sb-badge-2');
        const b3 = document.getElementById('sb-badge-3');

        this.moveCursor('kai', cx - 180, cy + 125, 0.3);
        this.schedule(() => {
          if (b1) b1.classList.add('is-snapped');
        }, 150);

        this.schedule(() => {
          this.moveCursor('elena', cx, cy + 125, 0.3);
          if (b2) b2.classList.add('is-snapped');
          this.flashGuides(cx, cy + 125);
        }, 350);

        this.schedule(() => {
          this.moveCursor('alex', cx + 180, cy + 125, 0.3);
          if (b3) b3.classList.add('is-snapped');
        }, 550);

        this.schedule(() => {
          this.showBubble('amogh', 'Build verified! Ready for launch 🚀');
          this.showBubble('orbit', 'All systems 100% operational 🔥');
        }, 800);

        this.schedule(() => {
          this.setProgress(100, 'DEPLOYED • LAUNCHING SITE');
        }, 950);

      }, 6850);

      // =======================================================================
      // STAGE 5: Coordinated Orbit Swirl & Seamless Reveal (8000ms - 8700ms)
      // =======================================================================
      this.schedule(() => {
        const r = 180;
        const cursorsList = ['amogh', 'orbit', 'elena', 'alex', 'kai'];
        cursorsList.forEach((id, idx) => {
          const angle = (idx / cursorsList.length) * Math.PI * 2;
          const targetX = cx + Math.cos(angle) * r;
          const targetY = cy + Math.sin(angle) * r;
          this.moveCursor(id, targetX, targetY, 0.4);
        });

        this.schedule(() => {
          this.moveCursor('amogh', -200, -200, 0.5);
          this.moveCursor('orbit', window.innerWidth + 200, -200, 0.5);
          this.moveCursor('elena', window.innerWidth + 200, window.innerHeight + 200, 0.5);
          this.moveCursor('alex', -200, window.innerHeight + 200, 0.5);
          this.moveCursor('kai', cx, -300, 0.5);
        }, 400);

        this.schedule(() => {
          this.finish(false);
        }, 700);

      }, 7950);
    }

    finish(instant = false) {
      if (this.isSkipped) return;
      this.isSkipped = true;

      this.enableUserMouse();

      this.timelineTimers.forEach(t => clearTimeout(t));
      this.timelineTimers = [];

      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch (e) {}

      if (window.removeEventListener && this.keyHandler) {
        window.removeEventListener('keydown', this.keyHandler);
      }
      if (window.removeEventListener && this.enterKeyHandler) {
        window.removeEventListener('keydown', this.enterKeyHandler);
      }

      if (!this.container) return;

      if (instant) {
        this.container.classList.add('is-hidden');
        setTimeout(() => {
          if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
          }
        }, 50);
      } else {
        this.container.classList.add('is-hidden');
        setTimeout(() => {
          if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
          }
        }, 700);
      }
    }
  }

  function boot() {
    const loader = new SwarmBuilderLoader();
    loader.init();
    window.__orbitSwarmLoader = loader;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
