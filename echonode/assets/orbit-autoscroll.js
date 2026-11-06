/**
 * TRENDUSTY ORBIT // AUTO-SCROLL MIDDLE MOUSE BUTTON (MMB) ENGINE
 * Activates futuristic cyber auto-scroll cursor on middle click (wheel click)
 * Pins glowing cyber anchor at click position and scrolls smoothly proportional to distance.
 */

(function () {
  'use strict';

  // Ignore touch/coarse devices
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  class OrbitAutoScroller {
    constructor() {
      this.isActive = false;
      this.originX = 0;
      this.originY = 0;
      this.currentX = 0;
      this.currentY = 0;
      this.speedX = 0;
      this.speedY = 0;
      this.scrollTarget = null;
      this.rafId = null;

      this.anchorEl = null;
      this.cursorEl = null;
      this.DEADZONE = 10; // Pixels deadzone around origin

      this.init();
    }

    init() {
      this.createDOM();
      this.bindEvents();
    }

    createDOM() {
      // 1. Pinned Origin Anchor
      let anchor = document.getElementById('orbit-autoscroll-anchor');
      if (!anchor) {
        anchor = document.createElement('div');
        anchor.id = 'orbit-autoscroll-anchor';
        anchor.className = 'orbit-autoscroll-anchor';
        anchor.setAttribute('aria-hidden', 'true');
        anchor.innerHTML = `
          <svg viewBox="0 0 32 32" width="34" height="34" fill="none">
            <circle cx="16" cy="16" r="14" fill="#070b14" fill-opacity="0.88" stroke="#38bdf8" stroke-width="1.4" stroke-opacity="0.75" />
            <circle cx="16" cy="16" r="9" stroke="#00f5b8" stroke-width="1.5" stroke-dasharray="3 2" />
            <circle cx="16" cy="16" r="3.5" fill="#00f5b8" />
            <circle cx="16" cy="16" r="1.5" fill="#ffffff" />
          </svg>
        `;
        document.body.appendChild(anchor);
      }
      this.anchorEl = anchor;

      // 2. Dynamic Floating Auto-Scroll Cursor
      let cursor = document.getElementById('orbit-autoscroll-cursor');
      if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'orbit-autoscroll-cursor';
        cursor.className = 'orbit-autoscroll-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        cursor.innerHTML = `
          <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
            <circle cx="24" cy="24" r="22" fill="#070a12" fill-opacity="0.92" stroke="#00f5b8" stroke-width="1.8" stroke-opacity="0.7" />
            <circle cx="24" cy="24" r="16" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="2 3" />
            <circle cx="24" cy="24" r="3.5" fill="#00f5b8" />
            <circle cx="24" cy="24" r="1.5" fill="#ffffff" />
            <!-- Directional chevrons -->
            <path id="arrow-up" d="M19 12 L24 6 L29 12" stroke="#00f5b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="arrow-down" d="M19 36 L24 42 L29 36" stroke="#00f5b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="arrow-left" d="M12 19 L6 24 L12 29" stroke="#00f5b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="arrow-right" d="M36 19 L42 24 L36 29" stroke="#00f5b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        `;
        document.body.appendChild(cursor);
      }
      this.cursorEl = cursor;
    }

    bindEvents() {
      // Middle click activates / toggles auto-scroll
      window.addEventListener('mousedown', (e) => {
        // Never activate if mouse is disconnected / pending calibration
        if (document.documentElement.classList.contains('sb-mouse-disconnected') || document.body.classList.contains('sb-mouse-disconnected')) {
          return;
        }

        if (e.button === 1) { // Middle mouse button
          e.preventDefault();
          e.stopPropagation();
          if (this.isActive) {
            this.stop();
          } else {
            this.start(e.clientX, e.clientY, e.target);
          }
        } else if (this.isActive) {
          // Any other button (left or right click) cancels
          this.stop();
        }
      }, { passive: false });

      // Prevent default browser auxclick paste or autoscroll popup
      window.addEventListener('auxclick', (e) => {
        if (e.button === 1) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false });

      // Mouse movement calculates distance and directional speed
      window.addEventListener('mousemove', (e) => {
        if (!this.isActive) return;
        this.currentX = e.clientX;
        this.currentY = e.clientY;

        // Position cursor exactly under mouse
        this.cursorEl.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) translate(-50%, -50%)`;

        const dx = this.currentX - this.originX;
        const dy = this.currentY - this.originY;

        // Reset highlight states
        this.cursorEl.classList.remove('is-scrolling-up', 'is-scrolling-down', 'is-scrolling-left', 'is-scrolling-right');

        // Y-axis velocity
        if (Math.abs(dy) > this.DEADZONE) {
          const distY = Math.abs(dy) - this.DEADZONE;
          this.speedY = Math.sign(dy) * Math.min(38, Math.pow(distY, 1.25) * 0.075);
          if (dy < 0) this.cursorEl.classList.add('is-scrolling-up');
          else this.cursorEl.classList.add('is-scrolling-down');
        } else {
          this.speedY = 0;
        }

        // X-axis velocity (for horizontally scrollable tables / panes)
        if (Math.abs(dx) > this.DEADZONE) {
          const distX = Math.abs(dx) - this.DEADZONE;
          this.speedX = Math.sign(dx) * Math.min(26, Math.pow(distX, 1.2) * 0.055);
          if (dx < 0) this.cursorEl.classList.add('is-scrolling-left');
          else this.cursorEl.classList.add('is-scrolling-right');
        } else {
          this.speedX = 0;
        }
      }, { passive: true });

      // Wheel movement cancels auto-scroll
      window.addEventListener('wheel', () => {
        if (this.isActive) this.stop();
      }, { passive: true });

      // Escape key cancels
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isActive) {
          this.stop();
        }
      });

      // Window blur or mouseleave cancels
      window.addEventListener('blur', () => {
        if (this.isActive) this.stop();
      });
      document.addEventListener('mouseleave', () => {
        if (this.isActive) this.stop();
      });
    }

    findScrollableParent(el) {
      let current = el;
      while (current && current !== document.body && current !== document.documentElement) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY || '';
        const overflowX = style.overflowX || '';
        const isScrollableY = (overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight;
        const isScrollableX = (overflowX === 'auto' || overflowX === 'scroll') && current.scrollWidth > current.clientWidth;

        if (isScrollableY || isScrollableX) {
          return current;
        }
        current = current.parentElement;
      }
      return window;
    }

    start(x, y, targetEl) {
      this.isActive = true;
      this.originX = x;
      this.originY = y;
      this.currentX = x;
      this.currentY = y;
      this.speedX = 0;
      this.speedY = 0;

      // Find scroll target (element under mouse or window)
      this.scrollTarget = this.findScrollableParent(targetEl);

      // Pin anchor to screen
      this.anchorEl.style.left = `${x}px`;
      this.anchorEl.style.top = `${y}px`;
      this.anchorEl.classList.add('is-active');

      // Place cursor
      this.cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      this.cursorEl.classList.add('is-active');

      // Hide default dot and ring while auto-scrolling
      const dot = document.getElementById('orbit-cursor-dot');
      const ring = document.getElementById('orbit-cursor-ring');
      const customImg = document.getElementById('custom-img-cursor');
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
      if (customImg) customImg.style.opacity = '0';

      // Start smooth requestAnimationFrame loop
      this.tick();
    }

    tick() {
      if (!this.isActive) return;

      if (this.speedX !== 0 || this.speedY !== 0) {
        if (this.scrollTarget === window || this.scrollTarget === document.documentElement || this.scrollTarget === document.body) {
          window.scrollBy({
            left: this.speedX,
            top: this.speedY,
            behavior: 'instant'
          });
        } else {
          this.scrollTarget.scrollTop += this.speedY;
          this.scrollTarget.scrollLeft += this.speedX;
        }
      }

      this.rafId = requestAnimationFrame(() => this.tick());
    }

    stop() {
      if (!this.isActive) return;
      this.isActive = false;

      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }

      this.anchorEl.classList.remove('is-active');
      this.cursorEl.classList.remove('is-active', 'is-scrolling-up', 'is-scrolling-down', 'is-scrolling-left', 'is-scrolling-right');

      // Restore normal cursor dot/ring
      const dot = document.getElementById('orbit-cursor-dot');
      const ring = document.getElementById('orbit-cursor-ring');
      const customImg = document.getElementById('custom-img-cursor');
      if (dot) dot.style.opacity = '1';
      if (ring) ring.style.opacity = '1';
      if (customImg && customImg.style.display !== 'none') customImg.style.opacity = '1';
    }
  }

  // Auto-boot when DOM is loaded
  function boot() {
    window.__orbitAutoScroller = new OrbitAutoScroller();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
