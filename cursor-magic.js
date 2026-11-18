/* ⋆.° cursor-magic.js °.⋆
   Shiny glitter that sprinkles off the mouse as it moves.
   Tiny metallic flecks catch the light, flicker, and fall.
   Edit SETTINGS below to change colors and how much glitter there is.
*/

(function () {
  // ---------- SETTINGS (edit me!) ----------
  const SETTINGS = {
    // each glitter color is [light shine, darker edge] so it looks metallic
    colors: [
      ["#fff6c8", "#c9a227"], // gold
      ["#ffffff", "#9aa3ad"], // silver
      ["#ffe1ea", "#d77a9a"], // rose gold / pink
      ["#f3e6ff", "#a57bd6"], // lilac
      ["#e0fbff", "#5fb8c9"]  // aqua (a little ocean shimmer)
    ],
    amount: 4,         // glitter pieces per mouse movement (more = more glitter)
    minSize: 1.5,      // smallest piece, in pixels
    maxSize: 4,        // biggest piece, in pixels
    fallSpeed: 0.06,   // how fast it falls (gravity)
    life: 1100,        // how long each piece lasts, in milliseconds
    glintChance: 0.08  // how often a piece flashes a bright star glint
  };
  // -----------------------------------------

  if (window.matchMedia("(hover: none)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const glitter = [];
  let lastX = null, lastY = null;

  document.addEventListener("mousemove", function (e) {
    const now = performance.now();
    // spread pieces along the path so fast movements still look full
    const fromX = lastX === null ? e.clientX : lastX;
    const fromY = lastY === null ? e.clientY : lastY;
    for (let i = 0; i < SETTINGS.amount; i++) {
      const k = Math.random();
      const c = SETTINGS.colors[Math.floor(Math.random() * SETTINGS.colors.length)];
      glitter.push({
        x: fromX + (e.clientX - fromX) * k + (Math.random() * 10 - 5),
        y: fromY + (e.clientY - fromY) * k + (Math.random() * 10 - 5),
        vx: Math.random() * 1.2 - 0.6,
        vy: Math.random() * -1.2,
        t: now,
        life: SETTINGS.life * (0.6 + Math.random() * 0.6),
        size: SETTINGS.minSize + Math.random() * (SETTINGS.maxSize - SETTINGS.minSize),
        shine: c[0],
        edge: c[1],
        angle: Math.random() * Math.PI,
        spin: Math.random() * 0.2 - 0.1,
        flicker: 0.15 + Math.random() * 0.25,   // how fast it catches the light
        phase: Math.random() * Math.PI * 2,
        diamond: Math.random() < 0.5,           // half diamonds, half squares
        glint: Math.random() < SETTINGS.glintChance
      });
    }
    lastX = e.clientX;
    lastY = e.clientY;
  });

  // a bright 4-point flash, like light hitting glitter
  function drawGlint(x, y, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#fff6c8";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x + r * 0.12, y - r * 0.12, x + r, y);
    ctx.quadraticCurveTo(x + r * 0.12, y + r * 0.12, x, y + r);
    ctx.quadraticCurveTo(x - r * 0.12, y + r * 0.12, x - r, y);
    ctx.quadraticCurveTo(x - r * 0.12, y - r * 0.12, x, y - r);
    ctx.fill();
    ctx.restore();
  }

  let frameCount = 0;
  function frame() {
    const now = performance.now();
    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = glitter.length - 1; i >= 0; i--) {
      const g = glitter[i];
      const age = (now - g.t) / g.life;
      if (age >= 1) { glitter.splice(i, 1); continue; }

      g.vy += SETTINGS.fallSpeed;
      g.vx *= 0.98;
      g.x += g.vx;
      g.y += g.vy;
      g.angle += g.spin;

      // shimmer: each piece flips between dull and bright as it "turns"
      const shimmer = (Math.sin(frameCount * g.flicker + g.phase) + 1) / 2; // 0..1
      const fade = 1 - age;

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.angle);
      ctx.globalAlpha = fade;
      // squash it as it spins so it looks like a flat fleck turning in the light
      ctx.scale(1, 0.35 + shimmer * 0.65);

      const s = g.size;
      const grad = ctx.createLinearGradient(-s, -s, s, s);
      grad.addColorStop(0, g.shine);
      grad.addColorStop(1, g.edge);
      ctx.fillStyle = shimmer > 0.85 ? "#ffffff" : grad; // little white flash at peak
      if (shimmer > 0.7) { ctx.shadowColor = g.shine; ctx.shadowBlur = 6; }

      ctx.beginPath();
      if (g.diamond) {
        ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0);
      } else {
        ctx.rect(-s / 2, -s / 2, s, s);
      }
      ctx.fill();
      ctx.restore();

      if (g.glint && shimmer > 0.8) {
        drawGlint(g.x, g.y, s * 2.5 * shimmer, fade * shimmer);
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();