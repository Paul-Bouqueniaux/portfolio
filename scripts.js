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

/* =========================
   RADAR SKILLS (SVG) — ÉCHELLE 7
========================= */

function renderSkillsRadar() {
  const svg = document.getElementById("skillsRadar");
  const legend = document.getElementById("skillsLegend");
  if (!svg) return;

  // ====== DONNÉES (SUR 7) ======
  const skills = [
    {
      letter: "A",
      label: "SQL & Modélisation analytique",
      value: 4,
      phrase: "Capacité à comprendre et exploiter des modèles analytiques existants pour les industrialiser et les rendre robustes en production."
    },
    {
      letter: "B",
      label: "Data Engineering & Orchestration",
      value: 5,
      phrase: "Industrialisation via Git/Airflow/Shell/Terraform : versioning, orchestration, déploiement et maintenabilité."
    },
    {
      letter: "C",
      label: "BI & Exposition de données",
      value: 4.5,
      phrase: "Mise à disposition de données/KPIs fiables (Looker/Looker Studio), en lien avec usages et contraintes d’exploitation."
    },
    {
      letter: "D",
      label: "Gouvernance & Qualité data",
      value: 3.5,
      phrase: "Fiabilisation : contrôles, traçabilité, droits & accès, conventions et qualité pour une donnée exploitable."
    },
    {
      letter: "E",
      label: "Analyse & Modélisation",
      value: 3,
      phrase: "Analyse exploratoire et interprétation statistique, mobilisées surtout en contexte académique ou ponctuel."
    }
  ];

  const maxValue = 7;
  const levels = 7;

  // ====== HELPERS (niveau “progression visuelle”) ======
  function levelLabel(v) {
    if (v >= 7) return "Expert";
    if (v >= 6) return "Avancé";
    if (v >= 5) return "Confirmé";
    if (v >= 4) return "Autonome (cas courants)";
    if (v >= 3) return "Intermédiaire";
    if (v >= 2) return "Bases";
    return "Notions";
  }

  // ====== DIMENSIONS ======
  const size = 320;
  const center = size / 2;
  const radius = 120;
  const ns = "http://www.w3.org/2000/svg";
  const angleStep = (Math.PI * 2) / skills.length;

  // Reset SVG
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.classList.remove("radar-animate");

  // Tooltip (créé une fois)
  let tooltip = document.querySelector(".radar-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "radar-tooltip";
    document.body.appendChild(tooltip);
  }

  function showTooltip(text, clientX, clientY) {
    tooltip.textContent = text;
    tooltip.classList.add("is-visible");
    moveTooltip(clientX, clientY);
  }
  function hideTooltip() {
    tooltip.classList.remove("is-visible");
  }
  function moveTooltip(clientX, clientY) {
    const pad = 12;
    tooltip.style.left = `${clientX + pad}px`;
    tooltip.style.top = `${clientY + pad}px`;
  }

  // Maps pour highlight
  const dotNodes = new Map();
  const letterNodes = new Map();

  function clearActive() {
    dotNodes.forEach(n => {
      n.classList.remove("is-active");
      n.setAttribute("r", "4");
      n.setAttribute("fill", "#6fffe9");
    });
    letterNodes.forEach(n => n.classList.remove("is-active"));
    legend?.querySelectorAll(".legend-row").forEach(r => r.classList.remove("is-active"));
  }

  function setActive(letter) {
    clearActive();
    const dot = dotNodes.get(letter);
    if (dot) {
      dot.classList.add("is-active");
      dot.setAttribute("r", "6");
      dot.setAttribute("fill", "#ffffff");
    }
    letterNodes.get(letter)?.classList.add("is-active");
    legend?.querySelector(`.legend-row[data-letter="${letter}"]`)?.classList.add("is-active");
  }

  // ====== GRILLE (cercles) ======
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

  // ====== AXES + LETTRES ======
  skills.forEach((s, i) => {
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

    const lx = center + (radius + 18) * Math.cos(angle);
    const ly = center + (radius + 18) * Math.sin(angle);

    const t = document.createElementNS(ns, "text");
    t.textContent = s.letter;
    t.setAttribute("x", lx);
    t.setAttribute("y", ly);
    t.setAttribute("fill", "rgba(255,255,255,0.85)");
    t.setAttribute("font-size", "12");
    t.setAttribute("font-weight", "800");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    t.classList.add("radar-letter");
    t.dataset.letter = s.letter;

    t.addEventListener("mouseenter", (e) => {
      setActive(s.letter);
      showTooltip(`${s.letter} — ${s.label} (${s.value} / ${maxValue}) · ${levelLabel(s.value)}\n${s.phrase}`, e.clientX, e.clientY);
    });
    t.addEventListener("mousemove", (e) => moveTooltip(e.clientX, e.clientY));
    t.addEventListener("mouseleave", () => { clearActive(); hideTooltip(); });

    svg.appendChild(t);
    letterNodes.set(s.letter, t);
  });

  // ====== GRADUATIONS 1..7 SUR AXE VERTICAL ======
  for (let v = 1; v <= maxValue; v++) {
    const r = (v / maxValue) * radius;
    const tx = center + 8;
    const ty = center - r;

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

  // ====== POLYGONE ======
  let points = "";
  const vertices = [];

  skills.forEach((s, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (s.value / maxValue) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    points += `${x},${y} `;
    vertices.push({ letter: s.letter, x, y, skill: s });
  });

  const polygon = document.createElementNS(ns, "polygon");
  polygon.setAttribute("points", points.trim());
  polygon.classList.add("radar-shape");
  svg.appendChild(polygon);

  // ====== DOTS ======
  vertices.forEach((v) => {
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", v.x);
    dot.setAttribute("cy", v.y);
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", "#6fffe9");
    dot.classList.add("radar-dot");
    dot.dataset.letter = v.letter;

    dot.addEventListener("mouseenter", (e) => {
      setActive(v.letter);
      showTooltip(`${v.skill.letter} — ${v.skill.label} (${v.skill.value} / ${maxValue}) · ${levelLabel(v.skill.value)}\n${v.skill.phrase}`, e.clientX, e.clientY);
    });
    dot.addEventListener("mousemove", (e) => moveTooltip(e.clientX, e.clientY));
    dot.addEventListener("mouseleave", () => { clearActive(); hideTooltip(); });

    svg.appendChild(dot);
    dotNodes.set(v.letter, dot);
  });

  // ====== LÉGENDE (auto) + hover ======
  if (legend) {
    legend.innerHTML = skills.map(s => `
      <div class="legend-row" data-letter="${s.letter}">
        <span><b>${s.letter}</b> : ${s.label}</span>
        <span class="legend-right">
          <b>${s.value} / ${maxValue}</b>
          <em class="legend-badge">${levelLabel(s.value)}</em>
        </span>
      </div>
    `).join("");

    legend.querySelectorAll(".legend-row").forEach(row => {
      const letter = row.dataset.letter;
      row.addEventListener("mouseenter", () => setActive(letter));
      row.addEventListener("mouseleave", () => clearActive());
    });
  }

  // Animation légère à l’apparition
  requestAnimationFrame(() => svg.classList.add("radar-animate"));
}

document.addEventListener("DOMContentLoaded", renderSkillsRadar);

// Rend le radar quand le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
  renderSkillsRadar();
});


/* =========================
   ENTREPRISE : FLIP CARDS (clic)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".flip-card").forEach((card) => {
    const inner = card.querySelector(".flip-inner");
    const back = card.querySelector(".flip-back");

    const toggle = () => {
      const flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", flipped ? "true" : "false");
      if (back) back.setAttribute("aria-hidden", flipped ? "false" : "true");
    };

    card.addEventListener("click", toggle);

    // Accessibilité clavier (Entrée / Espace)
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
});

document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const name = el.getAttribute("data-goto");
    showPanel(name);
    history.replaceState(null, "", `#${name}`);
  });
});

document.addEventListener("DOMContentLoaded", () => {

  const repoOwner = "paul-bouqueniaux";
  const repoName = "portfolio";

  fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits`)
    .then(response => response.json())
    .then(data => {
      const lastCommitDate = new Date(data[0].commit.committer.date);
      const today = new Date();

      const diffTime = Math.abs(today - lastCommitDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let message = "";

      if (diffDays <= 7) {
        message = `✅ Portfolio mis à jour récemment (${diffDays} jour(s)).`;
      } else if (diffDays <= 30) {
        message = `ℹ️ Dernière mise à jour il y a ${diffDays} jours.`;
      } else {
        message = `⚠️ Dernière mise à jour il y a ${diffDays} jours. Des améliorations sont peut-être en cours.`;
      }

      document.getElementById("updateMessage").innerText = message;
    })
    .catch(() => {
      document.getElementById("updateMessage").innerText =
        "Impossible de vérifier la dernière mise à jour.";
    });

  document.getElementById("closeUpdate").addEventListener("click", () => {
    document.getElementById("updateModal").style.display = "none";
  });

});