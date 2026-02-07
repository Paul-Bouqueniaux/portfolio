console.log("scripts.js chargé ✅");

/* -------------------------
   TABS / PANELS
------------------------- */
const tabs = document.querySelectorAll(".tab[data-tab]");
const panels = document.querySelectorAll(".panel[data-panel]");
const burger = document.querySelector(".burger");
const tabsWrap = document.querySelector(".tabs");

function showPanel(name) {
  tabs.forEach(t => t.classList.toggle("is-active", t.dataset.tab === name));
  panels.forEach(p => p.classList.toggle("is-visible", p.dataset.panel === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    showPanel(btn.dataset.tab);
    tabsWrap?.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
    // met à jour l'URL (optionnel)
    history.replaceState(null, "", `#${btn.dataset.tab}`);
  });
});

burger?.addEventListener("click", () => {
  const open = tabsWrap.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});

/* Bouton "Me contacter" (qui est un lien #contact dans ton HTML) */
document.querySelectorAll('a[href="#contact"]').forEach(a => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    showPanel("contact");
    history.replaceState(null, "", "#contact");
  });
});

/* Ouvrir un onglet si on arrive avec un #hash dans l’URL */
const hash = (location.hash || "").replace("#", "");
if (hash && document.querySelector(`.panel[data-panel="${hash}"]`)) {
  showPanel(hash);
} else {
  showPanel("home");
}

/* -------------------------
   YEAR
------------------------- */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* -------------------------
   CANVAS BACKGROUND
------------------------- */
const canvas = document.getElementById("bg");
const ctx = canvas?.getContext("2d");

if (!canvas || !ctx) {
  console.warn("Canvas #bg introuvable → fond animé désactivé");
} else {
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const N = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 18000));
  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: 1 + Math.random() * 1.5
  }));

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grd = ctx.createRadialGradient(
      canvas.width * 0.25, canvas.height * 0.15, 20,
      canvas.width * 0.25, canvas.height * 0.15, canvas.width * 0.7
    );
    grd.addColorStop(0, "rgba(124,92,255,0.18)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
      if (a.y < 0 || a.y > canvas.height) a.vy *= -1;

      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.50)";
      ctx.fill();

      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140) {
          const alpha = 1 - (Math.sqrt(d2) / 140);
          ctx.strokeStyle = `rgba(124,92,255,${alpha * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }
  step();
}
