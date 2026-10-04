import re
import glob

files = glob.glob("/mnt/d/Ghub Downloads/gods-eye-view/website/index*.html")

for filepath in files:
    with open(filepath, "r") as f:
        html = f.read()

    # 1. Fix the custom cursor (make outer circle bigger and lighter)
    html = html.replace("width: 44px;\n      height: 44px;\n      border: 1px solid rgba(0, 245, 184, 0.38);", "width: 56px;\n      height: 56px;\n      border: 1px solid rgba(0, 245, 184, 0.5);")

    # 2. Add mouse trail CSS
    if ".mouse-trail-dot" not in html:
        trail_css = """
    .mouse-trail-dot {
      position: fixed;
      width: 4px;
      height: 4px;
      background: #00f5b8;
      border-radius: 50%;
      pointer-events: none !important;
      z-index: 2147483645 !important;
      opacity: 0.8;
      transform: translate(-50%, -50%);
      transition: opacity 0.4s ease, transform 0.4s ease;
      box-shadow: 0 0 6px #00f5b8;
    }
"""
        html = html.replace("</style>", trail_css + "\n  </style>")

    # 3. Add mouse trail JS logic
    if "const trails = [];" not in html:
        trail_js = """
      // Mouse Trail Logic
      const trails = [];
      const MAX_TRAILS = 12;
      let trailIndex = 0;
      
      for (let i = 0; i < MAX_TRAILS; i++) {
        const t = document.createElement('div');
        t.className = 'mouse-trail-dot';
        t.style.opacity = '0';
        document.body.appendChild(t);
        trails.push(t);
      }
      
      window.addEventListener('mousemove', (e) => {
        const t = trails[trailIndex];
        t.style.left = e.clientX + 'px';
        t.style.top = e.clientY + 'px';
        t.style.opacity = '0.6';
        t.style.transform = 'translate(-50%, -50%) scale(1)';
        
        setTimeout(() => {
          t.style.opacity = '0';
          t.style.transform = 'translate(-50%, -50%) scale(0.2)';
        }, 50);
        
        trailIndex = (trailIndex + 1) % MAX_TRAILS;
      }, { passive: true });
"""
        html = html.replace("      window.addEventListener('mousedown', () => {", trail_js + "\n      window.addEventListener('mousedown', () => {")

    # 4. Clip the Waypoint and Radar Sweep properly
    old_radar_code = """
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        const sweepX = cx + Math.cos(radarAngle) * radius;
        const sweepY = cy + Math.sin(radarAngle) * radius;

        ctx.strokeStyle = pal.accentGlow;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sweepX, sweepY);
        ctx.stroke();
        ctx.restore();

        if (state.userWaypoint) {
          const wp = project(state.userWaypoint.lat, state.userWaypoint.lon, radius, cx, cy);
          if (wp.visible) {
            const ping = (Date.now() * 0.003) % 1;
            ctx.strokeStyle = 'rgba(0, 245, 184, ' + (1 - ping) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 4 + ping * 18, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#00f5b8';
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '9px monospace';
            ctx.fillStyle = '#00f5b8';
            ctx.fillText('WAYPOINT', wp.x + 8, wp.y - 4);
          }
        }
"""

    new_radar_code = """
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip(); // Ensure everything below is clipped to the globe's edge so it doesn't bleed out

        // 1. Radar Sweep Line
        const sweepX = cx + Math.cos(radarAngle) * radius;
        const sweepY = cy + Math.sin(radarAngle) * radius;

        ctx.strokeStyle = pal.accentGlow;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sweepX, sweepY);
        ctx.stroke();
        
        // 2. Radar Sweep Glow Cone (The big green shape the user might be referring to!)
        ctx.fillStyle = 'rgba(0, 245, 184, 0.15)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, radarAngle - 0.4, radarAngle, false);
        ctx.lineTo(cx, cy);
        ctx.fill();

        // 3. Waypoint Ping (Clipped so it doesn't hang off the edge)
        if (state.userWaypoint) {
          const wp = project(state.userWaypoint.lat, state.userWaypoint.lon, radius, cx, cy);
          if (wp.visible) {
            const ping = (Date.now() * 0.003) % 1;
            ctx.strokeStyle = 'rgba(0, 245, 184, ' + (1 - ping) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 4 + ping * 18, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#00f5b8';
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '9px monospace';
            ctx.fillStyle = '#00f5b8';
            ctx.fillText('WAYPOINT', wp.x + 8, wp.y - 4);
          }
        }
        
        ctx.restore(); // End globe clipping
"""
    if "Radar Sweep Glow Cone" not in html:
        html = html.replace(old_radar_code, new_radar_code)

    with open(filepath, "w") as f:
        f.write(html)

print("Patched all variants!")
