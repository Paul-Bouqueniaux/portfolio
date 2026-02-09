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

   if (name === "skills") {
    renderSkillsRadar(); 
  }
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

/* =========================
   RADAR SKILLS (SVG)
========================= */

function renderSkillsRadar() {
  const svg = document.getElementById("skillsRadar");
  if (!svg) return; // radar absent -> rien à faire

  // (Optionnel) si tu as un conteneur de légende à remplir dynamiquement
  const legend = document.getElementById("skillsLegend");

  // Tes notes
  const skills = [
    { label: "SQL & Modélisation", value: 3.5 },
    { label: "Data Eng & Orchestration", value: 3.5 },
    { label: "BI & Exposition", value: 3.5 },
    { label: "Gouvernance & Qualité", value: 3.5 },
    { label: "Statistiques", value: 3 }
  ];

  const letters = ["A", "B", "C", "D", "E"]; // correspondance visuelle
  const maxValue = 5;

  // Dimensions
  const size = 320;
  const center = size / 2;
  const radius = 120;
  const levels = 5;

  // Reset SVG
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

  const ns = "http://www.w3.org/2000/svg";
  const angleStep = (Math.PI * 2) / skills.length;

  // Grille circulaire
  for (let level = 1; level <= levels; level++) {
    const r = (radius / levels) * level;
    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", center);
    circle.setAttribute("cy", center);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "rgba(255,255,255,0.08)");
    svg.appendChild(circle);
  }

  // Axes + lettres A-E autour
  skills.forEach((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    const axis = document.createElementNS(ns, "line");
    axis.setAttribute("x1", center);
    axis.setAttribute("y1", center);
    axis.setAttribute("x2", x);
    axis.setAttribute("y2", y);
    axis.setAttribute("stroke", "rgba(255,255,255,0.15)");
    svg.appendChild(axis);

    // Lettre un peu à l'extérieur
    const lx = center + (radius + 18) * Math.cos(angle);
    const ly = center + (radius + 18) * Math.sin(angle);

    const t = document.createElementNS(ns, "text");
    t.textContent = letters[i] || "";
    t.setAttribute("x", lx);
    t.setAttribute("y", ly);
    t.setAttribute("fill", "rgba(255,255,255,0.85)");
    t.setAttribute("font-size", "12");
    t.setAttribute("font-weight", "800");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    svg.appendChild(t);
  });

  // Graduations 1..5 sur la branche verticale (axe du haut)
  for (let v = 1; v <= maxValue; v++) {
    const r = (v / maxValue) * radius;
    const tx = center + 8;           // léger décalage à droite de l’axe
    const ty = center - r;           // axe vertical vers le haut

    const tick = document.createElementNS(ns, "text");
    tick.textContent = String(v);
    tick.setAttribute("x", tx);
    tick.setAttribute("y", ty);
    tick.setAttribute("fill", "rgba(255,255,255,0.55)");
    tick.setAttribute("font-size", "11");
    tick.setAttribute("font-weight", "700");
    tick.setAttribute("text-anchor", "start");
    tick.setAttribute("dominant-baseline", "middle");
    svg.appendChild(tick);
  }

  // Polygone de compétences
  let points = "";
  skills.forEach((skill, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (skill.value / maxValue) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    points += `${x},${y} `;
  });

  const polygon = document.createElementNS(ns, "polygon");
  polygon.setAttribute("points", points.trim());
  polygon.setAttribute("fill", "rgba(130,100,255,0.35)");
  polygon.setAttribute("stroke", "#8b7cff");
  polygon.setAttribute("stroke-width", "2");
  svg.appendChild(polygon);

  // Points (dots)
  skills.forEach((skill, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (skill.value / maxValue) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);

    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", 4);
    dot.setAttribute("fill", "#6fffe9");
    svg.appendChild(dot);
  });

  // Légende (si tu as un #skillsLegend)
  if (legend) {
    legend.innerHTML = skills
      .map((s, i) => {
        const letter = letters[i] || "";
        return `
          <div class="radarRow">
            <span class="radarKey">${letter} : ${s.label}</span>
            <span class="radarVal">${s.value} / 5</span>
          </div>
        `;
      })
      .join("");
  }
}

// Rend le radar quand le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
  renderSkillsRadar();
});
