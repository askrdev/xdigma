/* ==========================================================================
   DOM references and runtime state
   ========================================================================== */

const canvas = document.querySelector("#hero-canvas");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersSaveData = navigator.connection?.saveData === true;
const shouldReduceRuntimeMotion = prefersReducedMotion || prefersSaveData;
const pointer = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42 };
const cursor = document.querySelector(".motion-cursor");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorLabel = document.querySelector(".cursor-label");
const cursorPosition = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
const cursorTarget = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
const progress = document.querySelector(".scroll-progress");
const hero = document.querySelector(".hero");
const heroGrid = document.querySelector(".hero-grid");
const contact = document.querySelector(".contact");
const loader = document.querySelector(".loader");
const caseModal = document.querySelector(".case-modal");
const serviceModal = document.querySelector(".service-modal");
const backTop = document.querySelector(".back-top");
const loaderCount = document.querySelector("[data-loader-count]");
const attitudeGhost = document.querySelector(".attitude-ghost");
const langToggle = document.querySelector(".lang-toggle");
const contactEmail = "xdigma01@gmail.com";
const whatsappNumber = "628131770613";
const recentWorkSource = {
  url: "https://script.google.com/macros/s/AKfycbxHdcy8Xyyo5chbEKqjiTthGsdxjH7VQd8gKq8DfBS6fhPZR_pkI1AOA_IQYiRL1Lh3FA/exec",
  limit: 3
};
let particles = [];
let width = 0;
let height = 0;
let frame = 0;
let lastCaseTrigger = null;
let lastServiceTrigger = null;
let isHeroCanvasVisible = true;
let scrollTicking = false;
let resizeTicking = false;
let recentWorkLoading = false;
let latestProjectLocales = null;
const storage = {
  get(key) {
    try {
      return window.localStorage?.getItem(key) || null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage?.setItem(key, value);
    } catch {
      /* Language selection still works for the session if storage is blocked. */
    }
  }
};
const savedLang = storage.get("xdigma-lang");
let currentLang = savedLang || "id";

const i18n = window.XDIGMA_CONTENT;

if (!i18n?.en || !i18n?.id) {
  throw new Error("Xdigma content failed to load.");
}

const fallbackRecentWorkProjects = [
  {
    resultUrl: "http://raalmuin.sch.id",
    visual: "visual-three",
    image: "",
    imagePosition: "center",
    imageFit: "cover",
    locales: {
      id: {
        title: "RA AL'MUIN",
        type: "Website sekolah / Brand platform",
        copy: "Website yang memperjelas identitas, layanan, dan kontak RA AL'MUIN secara online.",
        result: "raalmuin.sch.id",
        challenge: "Sekolah butuh website yang rapi untuk menjelaskan value, program, dan informasi penting ke calon orang tua.",
        solution: "Membangun website responsif dengan struktur pesan yang jelas, tampilan modern, dan CTA kontak yang mudah ditemukan.",
        deliverables: ["Website design", "Front-end development", "Content structure", "Responsive UI", "Basic SEO setup"],
        timeline: "4 Minggu",
        role: "UX/UI design, front-end development",
        stack: "HTML, CSS, JavaScript",
        mockLabel: "R.A AL-Mu'in"
      },
      en: {
        title: "RA AL'MUIN",
        type: "School website / Brand platform",
        copy: "A website that clarifies RA AL'MUIN's identity, services, and contact path online.",
        result: "raalmuin.sch.id",
        challenge: "The school needed a cleaner website to explain its value, programs, and key information to parents.",
        solution: "Built a responsive website with clear messaging, modern visuals, and easy-to-find contact CTAs.",
        deliverables: ["Website design", "Front-end development", "Content structure", "Responsive UI", "Basic SEO setup"],
        timeline: "4 Weeks",
        role: "UX/UI design, front-end development",
        stack: "HTML, CSS, JavaScript",
        mockLabel: "R.A AL-Mu'in"
      }
    }
  },
  {
    resultUrl: "https://dbagongmagelang.github.io/",
    visual: "visual-two",
    image: "",
    imagePosition: "center",
    imageFit: "cover",
    locales: {
      id: {
        title: "D Bagong Magelang",
        type: "Website restoran / Social media",
        copy: "Website dan sistem sosial media yang memperkenalkan menu, suasana, lokasi, dan cara reservasi D Bagong.",
        result: "Website live dan menu lebih gampang dibagikan",
        challenge: "Restoran belum punya tempat online yang cukup rapi untuk menampilkan menu, suasana, lokasi, dan kontak.",
        solution: "Membangun website responsif dengan menu yang jelas, foto suasana, informasi lokasi, dan arahan reservasi yang mudah diakses.",
        deliverables: ["Website design", "Front-end development", "Menu page", "Responsive UI", "Content direction"],
        timeline: "4 Minggu",
        role: "UX/UI design, front-end development, social media strategy",
        stack: "HTML, CSS, JavaScript, Canva",
        mockLabel: "D Bagong"
      },
      en: {
        title: "D Bagong Magelang",
        type: "Restaurant website / Social media",
        copy: "A website and social system that introduces D Bagong's menu, atmosphere, location, and reservation path.",
        result: "Live website and menu made easier to share",
        challenge: "The restaurant needed a clearer online place to present its menu, atmosphere, location, and contact path.",
        solution: "Built a responsive website with a clear menu page, restaurant photos, location info, and easy reservation direction.",
        deliverables: ["Website design", "Front-end development", "Menu page", "Responsive UI", "Content direction"],
        timeline: "4 Weeks",
        role: "UX/UI design, front-end development, social media strategy",
        stack: "HTML, CSS, JavaScript, Canva",
        mockLabel: "D Bagong"
      }
    }
  },
  {
    resultUrl: "",
    visual: "visual-one",
    image: "",
    imagePosition: "center",
    imageFit: "cover",
    locales: {
      id: {
        title: "Bakmi Saming",
        type: "Content design / Social media",
        copy: "Sistem konten sosial untuk membuat produk, menu, dan promo Bakmi Saming terlihat lebih konsisten.",
        result: "Konten lebih rapi dan siap dipakai rutin",
        challenge: "Konten sosial belum punya arah visual dan struktur pesan yang konsisten untuk menu dan promo.",
        solution: "Membuat arah visual, template konten, dan pilar komunikasi agar post lebih mudah diproduksi dan dikenali.",
        deliverables: ["Visual direction", "Social content templates", "Content pillars", "Reusable Canva assets"],
        timeline: "2 Minggu",
        role: "Content design, social media branding",
        stack: "Canva, Meta Business Suite",
        mockLabel: "Bakmi Saming"
      },
      en: {
        title: "Bakmi Saming",
        type: "Content design / Social media",
        copy: "A social content system that makes Bakmi Saming's products, menu, and promotions look more consistent.",
        result: "Cleaner content system ready for repeated use",
        challenge: "Social content did not yet have consistent visual direction or message structure for menu and promo posts.",
        solution: "Created visual direction, content templates, and communication pillars so posts are easier to produce and recognize.",
        deliverables: ["Visual direction", "Social content templates", "Content pillars", "Reusable Canva assets"],
        timeline: "2 Weeks",
        role: "Content design, social media branding",
        stack: "Canva, Meta Business Suite",
        mockLabel: "Bakmi Saming"
      }
    }
  }
];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, hasFinePointer && !prefersSaveData ? 1.5 : 1);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const maxParticleCount = hasFinePointer && !prefersSaveData ? 56 : 20;
  const minParticleCount = hasFinePointer ? 26 : 12;
  const particleDensity = hasFinePointer ? 28 : 52;
  const count = Math.min(
    maxParticleCount,
    Math.max(minParticleCount, Math.floor(width / particleDensity))
  );

  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2.8,
    speed: 0.25 + Math.random() * 0.7,
    phase: index * 0.31,
    color: index % 4 === 0 ? "#d42020" : index % 3 === 0 ? "#ff5b3d" : "#41d7d2",
  }));
}

function drawGrid() {
  ctx.save();
  ctx.globalAlpha = hasFinePointer ? 0.14 + pointer.x * 0.08 : 0.1;
  ctx.strokeStyle = "#f3efe4";
  ctx.lineWidth = 1;

  const spacing = hasFinePointer ? Math.max(62, width / 12) : Math.max(76, width / 5);
  const verticalStart = hasFinePointer ? height * 0.18 : height * 0.08;
  for (let x = -spacing; x < width + spacing; x += spacing) {
    const shift = Math.sin(frame * 0.006 + x * 0.01) * (hasFinePointer ? 12 : 5);
    ctx.beginPath();
    ctx.moveTo(x + shift, 0);
    ctx.lineTo(x - shift, height);
    ctx.stroke();
  }

  for (let y = verticalStart; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.sin(frame * 0.006 + y * 0.02) * (hasFinePointer ? 10 : 4));
    ctx.stroke();
  }
  ctx.restore();
}

function drawOrbit() {
  const cx = hasFinePointer ? width * (0.58 + (pointer.x - 0.5) * 0.16) : width * 0.78;
  const cy = hasFinePointer ? height * (0.46 + (pointer.y - 0.5) * 0.14) : height * 0.56;
  const radius = Math.min(width, height) * (hasFinePointer ? 0.32 : 0.48);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * 0.002);

  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * (1 - i * 0.1), radius * (0.28 + i * 0.1), i * 0.78, 0, Math.PI * 2);
    ctx.strokeStyle = i % 2 ? "rgba(212,32,32,0.34)" : "rgba(65,215,210,0.28)";
    ctx.lineWidth = i === 0 ? 2 : 1;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(243,239,228,0.9)";
  ctx.fill();
  ctx.restore();
}

function drawParticles() {
  particles.forEach((particle, index) => {
    particle.y += particle.speed;
    particle.x += Math.sin(frame * 0.018 + particle.phase) * 0.35;

    if (particle.y > height + 12) {
      particle.y = -12;
      particle.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = 0.32 + Math.sin(frame * 0.02 + index) * 0.16;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function animate() {
  pointer.x += (pointer.tx - pointer.x) * 0.08;
  pointer.y += (pointer.ty - pointer.y) * 0.08;
  frame += shouldReduceRuntimeMotion ? 0.25 : 1;

  if (isHeroCanvasVisible && (!shouldReduceRuntimeMotion || frame <= 0.25)) {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawOrbit();
    drawParticles();
  }

  if (heroGrid && hasFinePointer && isHeroCanvasVisible && !shouldReduceRuntimeMotion) {
    heroGrid.style.setProperty("--hero-x", `${(pointer.x - 0.5) * -18}px`);
    heroGrid.style.setProperty("--hero-y", `${(pointer.y - 0.5) * -14}px`);
  }

  if (cursor && !shouldReduceRuntimeMotion && hasFinePointer) {
    cursorPosition.x += (cursorTarget.x - cursorPosition.x) * 0.16;
    cursorPosition.y += (cursorTarget.y - cursorPosition.y) * 0.16;

    const cursorOffsetX = cursorTarget.x - cursorPosition.x;
    const cursorOffsetY = cursorTarget.y - cursorPosition.y;

    cursor.style.transform = `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0)`;
    cursorDot.style.transform =
      `translate3d(${cursorOffsetX}px, ${cursorOffsetY}px, 0) translate3d(-50%, -50%, 0)`;
    cursorRing.style.transform =
      `translate3d(-50%, -50%, 0) scale(var(--cursor-scale, 1)) rotate(${cursorOffsetX * 0.22}deg)`;
  }

  requestAnimationFrame(animate);
}

function splitHeadline() {
  const headline = document.querySelector("#hero-title");
  if (!headline || headline.dataset.split === "true") return;

  const words = headline.textContent.trim().split(/\s+/);
  headline.textContent = "";
  words.forEach((word, index) => {
    const wrapper = document.createElement("span");
    const inner = document.createElement("span");
    wrapper.className = "word";
    wrapper.style.setProperty("--word-index", index);
    inner.textContent = word;
    wrapper.append(inner);
    headline.append(wrapper);
    if (index < words.length - 1) {
      headline.append(" ");
    }
  });
  headline.dataset.split = "true";
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function setIndexedText(selector, values) {
  document.querySelectorAll(selector).forEach((element, index) => {
    if (values[index] !== undefined) element.textContent = values[index];
  });
}

function renderTextItems(selector, values, tagName = "span") {
  const container = document.querySelector(selector);
  if (!container) return;

  while (container.children.length < values.length) {
    container.append(document.createElement(tagName));
  }

  while (container.children.length > values.length) {
    container.lastElementChild.remove();
  }

  Array.from(container.children).forEach((element, index) => {
    element.textContent = values[index];
  });
}

function renderSelectOptions(select, placeholder, values) {
  if (!select) return;
  const selectedIndex = select.selectedIndex;
  const labels = [placeholder, ...values];

  select.replaceChildren(
    ...labels.map((label, index) => {
      const option = document.createElement("option");
      option.textContent = label;
      option.value = index === 0 ? "" : label;
      return option;
    })
  );

  select.selectedIndex = Math.min(Math.max(selectedIndex, 0), select.options.length - 1);
}

function renderList(list, items) {
  if (!list) return;
  list.replaceChildren();
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function getField(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && String(row[name]).trim()) return String(row[name]).trim();
  }
  return "";
}

function getProjectTimestamp(row) {
  const value = getField(row, ["timestamp", "date", "created at", "submitted at"]);
  if (!value) return Number.NaN;

  const numericDate = value.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2})(?:[:.](\d{1,2}))?(?:[:.](\d{1,2}))?)?$/
  );

  if (numericDate) {
    const firstPart = Number(numericDate[1]);
    const secondPart = Number(numericDate[2]);
    const year = Number(numericDate[3]);
    const month = firstPart > 12 ? secondPart : firstPart;
    const day = firstPart > 12 ? firstPart : secondPart;
    const hour = Number(numericDate[4] || 0);
    const minute = Number(numericDate[5] || 0);
    const second = Number(numericDate[6] || 0);
    const parsedDate = new Date(year, month - 1, day, hour, minute, second);

    if (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day
    ) {
      return parsedDate.getTime();
    }
  }

  const parsedTimestamp = Date.parse(value);
  return Number.isFinite(parsedTimestamp) ? parsedTimestamp : Number.NaN;
}

function sortProjectRowsByNewest(rows) {
  const timestampedRows = rows.map((row, index) => ({
    row,
    index,
    timestamp: getProjectTimestamp(row)
  }));

  if (!timestampedRows.some((item) => Number.isFinite(item.timestamp))) {
    return rows;
  }

  return timestampedRows
    .sort((a, b) => {
      const aHasDate = Number.isFinite(a.timestamp);
      const bHasDate = Number.isFinite(b.timestamp);

      if (aHasDate && bHasDate) {
        return b.timestamp - a.timestamp || a.index - b.index;
      }
      if (aHasDate) return -1;
      if (bHasDate) return 1;
      return a.index - b.index;
    })
    .map((item) => item.row);
}

function getListField(row, names) {
  const value = getField(row, names);
  if (!value) return [];
  return value
    .split(/\s*[|;]\s*|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function rowsFromCsv(text) {
  const rows = parseCsv(text);
  const headers = rows.shift()?.map((header) => header.trim().toLowerCase()) || [];
  return rows.map((cells) => (
    headers.reduce((data, header, index) => {
      data[header] = cells[index] || "";
      return data;
    }, {})
  ));
}

function rowsFromJson(json) {
  const items = Array.isArray(json) ? json : json?.data || [];
  return items.map((item) => {
    const row = {};
    Object.entries(item || {}).forEach(([key, value]) => {
      row[String(key).trim().toLowerCase()] = value ?? "";
    });
    return row;
  });
}

function rowsFromRemoteText(text, contentType = "") {
  const trimmedText = text.trim();
  if (!trimmedText) return [];

  if (contentType.includes("application/json") || /^[{[]/.test(trimmedText)) {
    return rowsFromJson(JSON.parse(trimmedText));
  }

  if (/<!doctype html|<html[\s>]/i.test(trimmedText)) {
    throw new Error("Recent work source returned HTML instead of project data. Check publish/access settings.");
  }

  return rowsFromCsv(trimmedText);
}

function getVisualClass(row, index) {
  const visual = getField(row, ["visual", "visual class"]);
  if (/^visual-(one|two|three)$/i.test(visual)) return visual.toLowerCase();
  return `visual-${["one", "two", "three"][index % 3]}`;
}

function getPublicImageUrl(value) {
  const rawUrl = String(value || "").trim();
  if (!rawUrl) return "";

  const driveMatch = rawUrl.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  const driveId = driveMatch?.[1] || (() => {
    try {
      const url = new URL(rawUrl);
      return /drive\.google\.com$/i.test(url.hostname) ? url.searchParams.get("id") : "";
    } catch {
      return "";
    }
  })();

  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w1600`;
  }

  try {
    const url = new URL(rawUrl);
    return /^https?:$/.test(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function getImagePosition(value) {
  const position = String(value || "").trim().toLowerCase();
  if (!position) return "center";

  const keywordParts = position.split(/\s+/);
  const allowedKeywords = new Set(["center", "top", "right", "bottom", "left"]);
  if (keywordParts.length <= 2 && keywordParts.every((part) => allowedKeywords.has(part))) {
    return position;
  }

  const percentageParts = position.match(/^(\d{1,3})%\s+(\d{1,3})%$/);
  if (percentageParts) {
    const x = Math.min(100, Number(percentageParts[1]));
    const y = Math.min(100, Number(percentageParts[2]));
    return `${x}% ${y}%`;
  }

  return "center";
}

function getImageFit(value) {
  return String(value || "").trim().toLowerCase() === "contain" ? "contain" : "cover";
}

function getSafeHttpUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return /^https?:$/.test(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function parseLinkedText(value) {
  const rawValue = String(value || "").trim();
  const markdownLink = rawValue.match(/^\[([^\]]+)\]\((.+)\)$/);

  if (markdownLink) {
    const url = getSafeHttpUrl(markdownLink[2]);
    if (url) return { text: markdownLink[1].trim() || url, url };
  }

  const directUrl = getSafeHttpUrl(rawValue);
  const domainUrl = !directUrl && /^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[/?#].*)?$/i.test(rawValue)
    ? getSafeHttpUrl(`https://${rawValue}`)
    : "";
  const url = directUrl || domainUrl;

  return {
    text: url ? rawValue.replace(/^https?:\/\//i, "").replace(/\/$/, "") : rawValue,
    url
  };
}

function applyProjectCardLanguage(card, lang) {
  const locales = card.projectLocales;
  if (!locales) return;

  const locale = locales[lang] || locales.id || locales.en;
  if (!locale) return;

  card.dataset.caseTitle = locale.title;
  card.dataset.caseType = locale.type;
  card.dataset.caseCopy = locale.copy;
  card.dataset.caseResult = locale.result;
  card.dataset.caseChallenge = locale.challenge;
  card.dataset.caseSolution = locale.solution;
  card.dataset.caseDeliverables = JSON.stringify(locale.deliverables);
  card.dataset.caseTimeline = locale.timeline;
  card.dataset.caseRole = locale.role;
  card.dataset.caseStack = locale.stack;
  card.dataset.cursor = lang === "id" ? "Lihat" : "View";
  card.setAttribute("aria-label", `${lang === "id" ? "Buka studi kasus" : "Open"} ${locale.title}`);

  const t = i18n[lang] || i18n.en;
  const resultUrl = getSafeHttpUrl(card.dataset.caseResultUrl);
  const title = card.querySelector(".project-meta h3");
  const type = card.querySelector(".project-meta span");
  const summary = card.querySelector(".project-summary");
  const resultLabel = card.querySelector(".project-result span");
  const resultValue = card.querySelector(".project-result strong");
  const liveLink = card.querySelector(".project-live-link");
  const mockTitle = card.querySelector(".mock-window strong");
  if (title) title.textContent = locale.title;
  if (type) type.textContent = locale.type;
  if (summary) summary.textContent = locale.challenge || locale.copy;
  if (resultLabel) resultLabel.textContent = t.projectResultLabel;
  if (resultValue) resultValue.textContent = locale.result;
  if (liveLink) {
    liveLink.textContent = t.projectLiveLabel;
    liveLink.hidden = !resultUrl;
    if (resultUrl) liveLink.href = resultUrl;
  }
  if (mockTitle) mockTitle.textContent = locale.mockLabel || locale.title.split(/\s+/)[0] || locale.title;
}

function updateLatestProjectPill(lang = currentLang) {
  const pill = document.querySelector(".project-pill");
  const title = pill?.querySelector("strong");
  if (!pill || !title) return;

  const t = i18n[lang] || i18n.en;
  const locale = latestProjectLocales?.[lang] ||
    latestProjectLocales?.id ||
    latestProjectLocales?.en;
  const projectTitle = locale?.title || t.latestProjectFallback;

  title.textContent = projectTitle;
  pill.setAttribute("aria-label", `${t.latestProject}: ${projectTitle}`);
}

function createProjectCard(project, index) {
  const visualClass = project.visual;
  const card = document.createElement("article");
  card.className = `project-card ${index === 0 ? "large " : ""}is-visible`;
  card.dataset.reveal = "";
  card.projectLocales = project.locales;
  card.dataset.caseResultUrl = project.resultUrl;
  card.dataset.caseVisual = visualClass;
  card.dataset.caseImage = project.image;
  card.dataset.caseImagePosition = project.imagePosition;
  card.dataset.caseImageFit = project.imageFit;
  card.tabIndex = 0;
  card.setAttribute("role", "button");

  const visual = document.createElement("div");
  visual.className = `project-visual ${visualClass}`;
  if (project.image) {
    visual.classList.add("has-image");
    visual.style.setProperty("--project-image", `url("${project.image}")`);
    visual.style.setProperty("--project-image-position", project.imagePosition);
    visual.style.setProperty("--project-image-fit", project.imageFit);
  }
  const mock = document.createElement("div");
  mock.className = "mock-window";
  mock.append(document.createElement("span"), document.createElement("span"), document.createElement("span"));
  const mockTitle = document.createElement("strong");
  mock.append(mockTitle, document.createElement("i"));
  visual.append(mock);

  const meta = document.createElement("div");
  meta.className = "project-meta";
  const type = document.createElement("span");
  const title = document.createElement("h3");
  const summary = document.createElement("p");
  summary.className = "project-summary";
  const result = document.createElement("div");
  result.className = "project-result";
  result.append(document.createElement("span"), document.createElement("strong"));
  const live = document.createElement("a");
  live.className = "project-live-link";
  live.target = "_blank";
  live.rel = "noopener noreferrer";
  live.dataset.cursor = currentLang === "id" ? "Live" : "Live";
  meta.append(type, title, summary, result, live);
  card.append(visual, meta);
  applyProjectCardLanguage(card, currentLang);
  return card;
}

function renderRecentWork(projects) {
  const grid = document.querySelector(".project-grid");
  if (!grid || !projects.length) return;

  latestProjectLocales = projects[0].locales;
  updateLatestProjectPill();
  grid.classList.remove("is-status");
  grid.setAttribute("aria-busy", "false");
  grid.replaceChildren(...projects.map(createProjectCard));
  lastCaseTrigger = null;
  setupCursorStates();
  updateScrollMotion();
}

function renderRecentWorkStatus(state) {
  const grid = document.querySelector(".project-grid");
  if (!grid) return;

  const t = i18n[currentLang] || i18n.en;
  const status = document.createElement("div");
  const label = document.createElement("strong");

  grid.classList.add("is-status");
  grid.setAttribute("aria-busy", String(state === "loading"));
  status.className = `work-status is-${state}`;
  status.setAttribute("role", state === "error" ? "alert" : "status");
  label.className = "work-status-label";
  label.textContent = state === "error" ? t.recentWorkError : t.recentWorkLoading;
  status.append(label);

  if (state === "error") {
    const retry = document.createElement("button");
    retry.className = "work-retry";
    retry.type = "button";
    retry.dataset.cursor = currentLang === "id" ? "Ulang" : "Retry";
    retry.textContent = t.recentWorkRetry;
    retry.addEventListener("click", loadRecentWorkFromGoogleSheet);
    status.append(retry);
  }

  grid.replaceChildren(status);
  setupCursorStates();
}

async function loadRecentWorkFromGoogleSheet() {
  if (recentWorkLoading) return;
  if (!recentWorkSource.url) {
    renderRecentWork(fallbackRecentWorkProjects.slice(0, recentWorkSource.limit));
    return;
  }

  recentWorkLoading = true;
  renderRecentWorkStatus("loading");
  try {
    const response = await fetch(recentWorkSource.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Recent work source returned ${response.status}`);
    const rows = rowsFromRemoteText(await response.text(), response.headers.get("content-type") || "");
    const publishedRows = rows.filter(
      (row) => !/^no|false|0$/i.test(getField(row, ["published", "publish", "show"]))
    );
    const projects = sortProjectRowsByNewest(publishedRows)
      .map((row, index) => {
        const idResult = parseLinkedText(getField(row, ["result", "hasil", "metric"]) || "Selected work");
        const enResultValue = getField(row, ["result en", "result english", "english result"]);
        const enResult = enResultValue ? parseLinkedText(enResultValue) : idResult;
        const explicitResultUrl = getSafeHttpUrl(getField(row, ["result url", "hasil url"]));
        const idDeliverables = getListField(row, ["deliverables", "output", "scope"]);
        const enDeliverables = getListField(row, [
          "deliverables en",
          "deliverables english",
          "english deliverables"
        ]);
        const idLocale = {
          title: getField(row, ["title", "project title", "nama project", "name"]) || `Project ${index + 1}`,
          type: getField(row, ["type", "project type", "kategori", "category"]) || "Project",
          copy:
            getField(row, [
              "copy",
              "the situation",
              "short summary",
              "summary",
              "description",
              "deskripsi"
            ]) || "Detail project sedang disiapkan.",
          result: idResult.text,
          challenge: getField(row, ["challenge", "tantangan"]) || "Detail sedang disiapkan.",
          solution: getField(row, ["solution", "solusi"]) || "Detail sedang disiapkan.",
          deliverables: idDeliverables,
          timeline: getField(row, ["timeline", "waktu"]) || "-",
          role: getField(row, ["role", "peran"]) || "-",
          stack: getField(row, ["stack", "tools"]) || "-",
          mockLabel: getField(row, ["mock label", "label"])
        };
        const enLocale = {
          title: getField(row, ["title en", "title english", "english title"]) || idLocale.title,
          type: getField(row, ["type en", "project type en", "type english", "english type"]) || idLocale.type,
          copy: getField(row, [
            "the situation en",
            "copy en",
            "short summary en",
            "summary en",
            "description en",
            "english summary"
          ]) || idLocale.copy,
          result: enResult.text,
          challenge: getField(row, ["challenge en", "challenge english", "english challenge"]) || idLocale.challenge,
          solution: getField(row, ["solution en", "solution english", "english solution"]) || idLocale.solution,
          deliverables: enDeliverables.length ? enDeliverables : idLocale.deliverables,
          timeline: getField(row, ["timeline en", "timeline english", "english timeline"]) || idLocale.timeline,
          role: getField(row, ["role en", "role english", "english role"]) || idLocale.role,
          stack: getField(row, ["stack en", "stack english", "english stack"]) || idLocale.stack,
          mockLabel: getField(row, ["mock label en", "mock label english"]) || idLocale.mockLabel
        };
        return {
          locales: {
            id: idLocale,
            en: enLocale
          },
          resultUrl: enResult.url || idResult.url || explicitResultUrl,
          visual: getVisualClass(row, index),
          image: getPublicImageUrl(getField(row, [
            "background image",
            "background image url",
            "image",
            "image url",
            "cover image",
            "thumbnail"
          ])),
          imagePosition: getImagePosition(getField(row, [
            "background position",
            "image position",
            "focal point"
          ])),
          imageFit: getImageFit(getField(row, [
            "background fit",
            "image fit"
          ]))
        };
      })
      .slice(0, recentWorkSource.limit);

    if (!projects.length) throw new Error("Recent work source returned no published projects");
    renderRecentWork(projects);
  } catch (error) {
    console.warn("Recent work could not be loaded:", error);
    renderRecentWork(fallbackRecentWorkProjects.slice(0, recentWorkSource.limit));
  } finally {
    recentWorkLoading = false;
  }
}

function openMailDraft(subject, lines) {
  const body = lines.filter(Boolean).join("\n");
  window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function openWhatsappDraft(lines) {
  const text = lines.map((line) => String(line ?? "")).join("\n").trim();
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

function getWhatsappHref(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function getFocusableElements(container) {
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(", ");

  return Array.from(container.querySelectorAll(focusableSelector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );
}

function trapModalFocus(event, modal, closeModal) {
  if (!modal.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeModal();
    return;
  }

  if (event.key !== "Tab") return;

  const focusable = getFocusableElements(modal);
  if (!focusable.length) {
    event.preventDefault();
    modal.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function applyLanguage(lang) {
  const t = i18n[lang] || i18n.en;
  currentLang = lang;
  storage.set("xdigma-lang", lang);
  document.documentElement.lang = t.htmlLang;
  document.title = t.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", t.description);
  langToggle?.setAttribute("data-lang", lang);
  langToggle?.setAttribute("aria-label", t.languageToggleLabel);
  document.querySelector(".main-nav")?.setAttribute("aria-label", t.navLabel);

  setText(".skip-link", t.skip);
  setText(".loader-inner span", t.loader);
  setText(".back-top", t.backTop);
  document.querySelector(".back-top")?.setAttribute("aria-label", t.backTop);
  document.querySelector(".back-top")?.setAttribute("data-cursor", t.backTop);
  document.querySelector(".menu-toggle")?.setAttribute("aria-label", t.mobileMenuLabel);
  document.querySelector(".menu-toggle")?.setAttribute("data-cursor", t.menu);
  if (!document.querySelector(".mobile-menu")?.classList.contains("is-open")) {
    setText(".menu-toggle", t.menu);
  }
  setIndexedText(".main-nav a", t.nav);
  setIndexedText(".mobile-menu a", t.nav);
  setText(".nav-cta", t.navCta);
  document.querySelector(".nav-cta")?.setAttribute("data-cursor", lang === "id" ? "Mulai" : "Start");
  document.querySelectorAll("[data-whatsapp-cta]").forEach((link) => {
    link.setAttribute("href", getWhatsappHref(t.whatsappMessage));
  });
  renderTextItems(".hero-kicker", t.heroKicker);
  setText(".eyebrow", t.eyebrow);
  renderTextItems(".hero-rotator", t.rotator);
  setText(".hero-primary", t.heroPrimaryCta);
  setText(".hero-secondary", t.heroSecondaryCta);
  document.querySelector(".hero-primary")?.setAttribute("data-cursor", lang === "id" ? "Konsultasi" : "Consult");
  document.querySelector(".hero-secondary")?.setAttribute("data-cursor", lang === "id" ? "Paket" : "Packages");
  renderTextItems(".hero-proof", t.heroProof);
  document.querySelector(".hero-proof")?.setAttribute("aria-label", t.heroProofLabel);

  const headline = document.querySelector("#hero-title");
  if (headline) {
    headline.dataset.split = "false";
    headline.textContent = t.heroTitle;
    delete headline.dataset.split;
    splitHeadline();
  }

  setText(".project-pill span", t.latestProject);
  updateLatestProjectPill(lang);
  setText(".hero-side p", t.heroSide);
  renderTextItems(".marquee-track", t.marquee);
  setText(".scroll-cue strong", t.scroll);
  setText(".intro .section-label span:nth-child(2)", t.aboutLabel);
  setText(".intro-text p:first-child", t.introLead);
  setText(".intro-text p:last-child", t.introBody);
  setText(".work .section-heading h2", t.recentWork);
  setText(".work .section-heading a", t.seeAll);
  const workStatus = document.querySelector(".work-status");
  if (workStatus) {
    setText(".work-status-label", workStatus.classList.contains("is-error") ? t.recentWorkError : t.recentWorkLoading);
    setText(".work-retry", t.recentWorkRetry);
  }
  setText(".rules .section-label span:nth-child(2)", t.attitude);
  renderTextItems(".attitude-ghost", [t.attitude, t.attitude, t.attitude]);

  document.querySelectorAll(".rule-item").forEach((item, index) => {
    const rule = t.rules[index];
    if (!rule) return;
    item.dataset.ruleNumber = rule[0];
    item.querySelector("h3").textContent = rule[1];
    item.querySelector("p").textContent = rule[2];
  });

  setText(".partner-strip .section-heading h2", t.partnershipTitle);
  setText(".partner-strip .section-heading p", t.partnershipBody);
  renderTextItems(".logo-track", [...t.industries, ...t.industries]);
  document.querySelector(".logo-marquee")?.setAttribute(
    "aria-label",
    `${t.partnershipTitle}: ${t.industries.join(", ")}`
  );
  setText(".services .section-heading h2", t.servicesTitle);
  setText(".services .section-heading p", t.servicesBody);
  setText(".service-preview span", t.selectedCapability);
  setText(".service-modal-list span", t.serviceIncludesLabel);
  setText(".service-modal-cta", t.serviceCta);
  setText(".service-close", t.serviceClose);
  document.querySelector(".service-close")?.setAttribute("aria-label", t.serviceAriaClose);
  document.querySelector(".service-close")?.setAttribute("data-cursor", t.serviceClose);
  document.querySelectorAll(".service-list button").forEach((service, index) => {
    const title = service.querySelector("span b") || service.querySelector("span:first-child");
    const meta = service.querySelector(".service-meta");
    if (title) title.textContent = t.services[index] || "";
    if (meta) meta.textContent = t.serviceMeta?.[index] || "";
    service.dataset.service = t.serviceDescriptions[index] || "";
  });
  const previewText = document.querySelector(".service-preview p");
  if (previewText) previewText.textContent = t.serviceDescriptions[0];

  setText(".process .section-heading h2", t.processTitle);
  setText(".process .section-heading p", t.processBody);
  document.querySelectorAll(".process-grid article").forEach((item, index) => {
    const step = t.process[index];
    if (!step) return;
    item.querySelector("h3").textContent = step[0];
    item.querySelector("p").textContent = step[1];
  });

  setText(".metric-copy h2", t.metricsTitle);
  renderTextItems(".metric-grid", t.metricLabels, "div");
  const tickerItems = [...t.metricTicker, ...t.metricTicker];
  renderTextItems(".metrics-track", tickerItems);
  setText(".awards-copy h2", t.awardsTitle);
  document.querySelectorAll(".awards-grid div").forEach((item, index) => {
    const proof = t.awardItems?.[index];
    if (!proof) return;
    item.querySelector("strong").textContent = proof[0];
    item.querySelector("span").textContent = proof[1];
  });
  setText(".faq .section-heading h2", t.faqTitle);
  document.querySelectorAll(".faq-list details").forEach((detail, index) => {
    const item = t.faqItems[index];
    if (!item) return;
    detail.querySelector("summary").textContent = item[0];
    detail.querySelector("p").textContent = item[1];
  });

  setText(".availability-copy span", t.availabilityKicker);
  document.querySelector(".availability")?.setAttribute("aria-label", t.availabilityLabel);
  setText(".availability-copy h2", t.availabilityTitle);
  setText(".availability a span", t.availabilityLink[0]);
  setText(".availability a strong", t.availabilityLink[1]);
  document.querySelector(".availability a")?.setAttribute("data-cursor", lang === "id" ? "Bicara" : "Talk");
  setText(".contact-inner span", t.contactKicker);
  setText(".contact-inner h2", t.contactTitle);
  setText(".brief-form-head span", t.contactForm.title);
  setText(".brief-form-head strong", t.contactForm.subtitle);
  document.querySelector(".brief-form")?.setAttribute("aria-label", t.contactForm.ariaLabel);
  setIndexedText(".brief-form label > span", t.contactForm.fields);
  document.querySelector(".brief-form input[name='name']")?.setAttribute("placeholder", t.contactForm.placeholders[0]);
  document.querySelector(".brief-form input[name='email']")?.setAttribute("placeholder", t.contactForm.placeholders[1]);
  document.querySelector(".brief-form textarea")?.setAttribute("placeholder", t.contactForm.placeholders[2]);
  setText(".brief-form button", t.contactForm.submit);
  document.querySelector(".brief-form button")?.setAttribute("data-cursor", lang === "id" ? "Kirim" : "Send");
  const projectType = document.querySelector(".brief-form select[name='type']");
  const timeline = document.querySelector(".brief-form select[name='timeline']");
  const budget = document.querySelector(".brief-form select[name='budget']");
  renderSelectOptions(projectType, t.contactForm.emptyOptions[0], t.contactForm.types);
  renderSelectOptions(timeline, t.contactForm.emptyOptions[1], t.contactForm.timelines);
  renderSelectOptions(budget, t.contactForm.emptyOptions[2], t.contactForm.budgets);
  document.querySelectorAll(".contact-button, .footer-hero a").forEach((item) => {
    item.textContent = t.whatsappLabel;
    item.setAttribute("data-cursor", lang === "id" ? "Bicara" : "Talk");
  });
  setText(".footer-hero span", t.footerKicker);
  setText(".footer-hero strong", t.footerTitle);
  setIndexedText(".footer-map h3", t.footerHeadings);
  setIndexedText(".footer-map div:nth-child(1) a", t.footerStudio);
  setIndexedText(".footer-map div:nth-child(2) a", t.footerServices);
  setText(".newsletter label", t.newsletter);
  document.querySelector(".newsletter")?.setAttribute("aria-label", t.newsletterLabel);
  document.querySelector("#newsletter-email")?.setAttribute("placeholder", t.newsletterPlaceholder);
  setText(".newsletter button", t.newsletterJoin);
  setIndexedText(".footer-bottom span", t.footerBottom);
  setText(".case-result span", t.caseSelected);
  setIndexedText(".case-label", t.caseLabels);
  setIndexedText(".case-meta span", t.caseMetaLabels);
  setText(".case-deliverables-label", t.caseDeliverables);
  setText(".case-cta", t.caseCta);
  document.querySelector(".case-cta")?.setAttribute("data-cursor", lang === "id" ? "Bicara" : "Talk");
  setText(".case-close", t.caseClose);
  document.querySelector(".case-close")?.setAttribute("aria-label", t.caseAriaClose);

  document.querySelectorAll(".project-card[data-case-title]").forEach((card) => {
    applyProjectCardLanguage(card, lang);
  });
  document.querySelectorAll(".service-list button").forEach((item) => {
    item.dataset.cursor = lang === "id" ? "Buka" : "Open";
  });

  if (serviceModal?.classList.contains("is-open") && lastServiceTrigger) {
    renderServiceModal(Number(lastServiceTrigger.dataset.serviceIndex || 0));
  }

  if (caseModal?.classList.contains("is-open") && lastCaseTrigger) {
    renderCaseModal(lastCaseTrigger);
  }
}

function setupLanguageToggle() {
  if (!langToggle) return;
  langToggle.addEventListener("click", () => {
    applyLanguage(currentLang === "en" ? "id" : "en");
  });
  applyLanguage(currentLang);
}

function setupLoader() {
  if (!loader) return;

  if (prefersReducedMotion) {
    if (loaderCount) loaderCount.textContent = "100%";
    loader.classList.add("is-done");
    return;
  }

  const start = performance.now();
  const duration = 680;

  function tick(now) {
    const progressValue = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    if (loaderCount) loaderCount.textContent = `${Math.round(eased * 100)}%`;
    if (progressValue < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
  window.setTimeout(() => {
    loader.classList.add("is-done");
  }, 760);
}

function setupHeroRotator() {
  const phrases = document.querySelectorAll(".hero-rotator span");
  if (!phrases.length) return;

  let index = 0;
  phrases[0].classList.add("is-active");
  if (prefersReducedMotion) return;

  window.setInterval(() => {
    const current = phrases[index];
    index = (index + 1) % phrases.length;
    const next = phrases[index];

    current.classList.remove("is-active");
    current.classList.add("is-leaving");
    next.classList.add("is-active");

    window.setTimeout(() => {
      current.classList.remove("is-leaving");
    }, 760);
  }, 2300);
}

function setupCursorStates() {
  if (!cursor || !cursorDot || !cursorRing || !cursorLabel || prefersReducedMotion || !hasFinePointer) return;

  document.addEventListener("pointerenter", () => cursor.classList.add("is-visible"));
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  document.addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));

  const interactiveElements = document.querySelectorAll("a, button, [data-cursor]");
  interactiveElements.forEach((element) => {
    if (element.dataset.cursorBound === "true") return;
    element.dataset.cursorBound = "true";

    element.addEventListener("pointerenter", () => {
      const label = element.dataset.cursor || "";
      cursor.classList.add("is-active");
      cursor.classList.toggle("has-label", Boolean(label));
      cursorLabel.textContent = label;
    });

    element.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-active", "has-label", "is-pressed");
      cursorLabel.textContent = "";
    });
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu) return;

  function setOpen(isOpen) {
    const t = i18n[currentLang] || i18n.en;
    menu.classList.toggle("is-open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? t.close : t.mobileMenuLabel);
    toggle.textContent = isOpen ? t.close : t.menu;
  }

  toggle.addEventListener("click", () => {
    setOpen(!menu.classList.contains("is-open"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function updateScrollMotion() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress?.style.setProperty("transform", `scaleX(${ratio})`);
  backTop?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.72);

  if (attitudeGhost) {
    attitudeGhost.style.setProperty("--attitude-x", `${-10 + ratio * 28}%`);
    attitudeGhost.style.setProperty("--attitude-y", `${Math.sin(ratio * Math.PI) * 30}px`);
  }

  if (contact) {
    const contactRect = contact.getBoundingClientRect();
    const localY = Math.max(0, Math.min(1, 1 - contactRect.top / window.innerHeight));
    contact.style.setProperty("--contact-x", `${58 + localY * 26}%`);
    contact.style.setProperty("--contact-y", `${42 + localY * 18}%`);
  }
}

function setupNewsletter() {
  const form = document.querySelector(".newsletter");
  const status = form?.querySelector(".newsletter-status");
  const emailInput = form?.querySelector("input[type='email']");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const t = i18n[currentLang] || i18n.en;
    const email = emailInput?.value.trim() || "";
    openMailDraft("Newsletter signup", [
      "Hi Xdigma,",
      "",
      "Please add this email to the newsletter list:",
      email
    ]);
    form.classList.add("is-sent");
    if (status) status.textContent = t.newsletterSuccess;
    form.reset();
    window.setTimeout(() => {
      form.classList.remove("is-sent");
      if (status) status.textContent = "";
    }, 2200);
  });
}

function setupBriefForm() {
  const form = document.querySelector(".brief-form");
  const status = form?.querySelector(".brief-status");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const t = i18n[currentLang] || i18n.en;
    const data = new FormData(form);
    const name = data.get("name") || "";
    const email = data.get("email") || "";
    const projectType = data.get("type") || "";
    const timeline = data.get("timeline") || "";
    const budget = data.get("budget") || "";
    const message = data.get("message") || "";
    const whatsapp = t.contactForm.whatsapp;
    openWhatsappDraft([
      whatsapp.greeting,
      "",
      whatsapp.intro,
      "",
      `*${whatsapp.labels[0]}:* ${name}`,
      `*${whatsapp.labels[1]}:* ${email}`,
      `*${whatsapp.labels[2]}:* ${projectType}`,
      `*${whatsapp.labels[3]}:* ${timeline}`,
      `*${whatsapp.labels[4]}:* ${budget}`,
      "",
      `*${whatsapp.labels[5]}:*`,
      String(message)
    ]);
    form.classList.add("is-sent");
    if (status) status.textContent = t.contactForm.success;
    form.reset();
    window.setTimeout(() => {
      form.classList.remove("is-sent");
      if (status) status.textContent = "";
    }, 3200);
  });
}

function setupServicePreview() {
  const preview = document.querySelector(".service-preview");
  const previewText = preview?.querySelector("p");
  const services = document.querySelectorAll("[data-service]");
  if (!preview || !previewText || !services.length) return;

  function updatePreview(text) {
    preview.classList.add("is-changing");
    window.setTimeout(() => {
      previewText.textContent = text;
      preview.classList.remove("is-changing");
    }, 120);
  }

  services.forEach((service) => {
    service.addEventListener("pointerenter", () => updatePreview(service.dataset.service));
    service.addEventListener("focus", () => updatePreview(service.dataset.service));
  });
}

function renderServiceModal(index) {
  if (!serviceModal) return;
  const t = i18n[currentLang] || i18n.en;
  const detail = t.serviceDetails[index] || t.serviceDetails[0];
  const title = serviceModal.querySelector("#service-modal-title");
  const number = serviceModal.querySelector(".service-modal-number");
  const copy = serviceModal.querySelector(".service-modal-copy");
  const list = serviceModal.querySelector(".service-modal-list ul");
  const cta = serviceModal.querySelector(".service-modal-cta");

  number.textContent = String(index + 1).padStart(2, "0");
  title.textContent = detail[0];
  copy.textContent = detail[1];
  renderList(list, detail[2]);
  if (cta) {
    cta.href = getWhatsappHref(`${t.serviceWhatsappIntro} ${detail[0]}.\n${t.serviceWhatsappOutro}`);
  }
}

function setupServiceModal() {
  if (!serviceModal) return;
  const close = serviceModal.querySelector(".service-close");
  const services = document.querySelectorAll("[data-service-index]");

  function openService(trigger) {
    lastServiceTrigger = trigger;
    renderServiceModal(Number(trigger.dataset.serviceIndex || 0));
    serviceModal.classList.add("is-open");
    serviceModal.setAttribute("aria-hidden", "false");
    serviceModal.setAttribute("tabindex", "-1");
    document.body.style.overflow = "hidden";
    cursor?.classList.add("is-visible");
    close.focus({ preventScroll: true });
  }

  function closeService() {
    serviceModal.classList.remove("is-open");
    serviceModal.setAttribute("aria-hidden", "true");
    serviceModal.removeAttribute("tabindex");
    document.body.style.overflow = "";
    lastServiceTrigger?.focus({ preventScroll: true });
  }

  services.forEach((service) => {
    service.addEventListener("click", (event) => {
      event.preventDefault();
      openService(service);
    });
  });

  close.addEventListener("click", closeService);
  serviceModal.addEventListener("click", (event) => {
    if (event.target === serviceModal) closeService();
  });
  window.addEventListener("keydown", (event) => {
    trapModalFocus(event, serviceModal, closeService);
  });
  serviceModal.querySelector(".service-modal-cta").addEventListener("click", () => {
    closeService();
  });
}

function setupRuleMotion() {
  if (!hasFinePointer || prefersReducedMotion) return;

  const rules = document.querySelectorAll(".rule-item");
  rules.forEach((rule, index) => {
    rule.addEventListener("pointerenter", () => {
      rules.forEach((item, itemIndex) => {
        item.style.setProperty("--rule-shift", `${(itemIndex - index) * 6}px`);
      });
    });
    rule.addEventListener("pointerleave", () => {
      rules.forEach((item) => item.style.setProperty("--rule-shift", "0px"));
    });
  });
}

function setupActiveNav() {
  const links = Array.from(document.querySelectorAll(".main-nav a, .mobile-menu a"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

  function setActive(id) {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  }

  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    },
    { rootMargin: "-28% 0px -52% 0px", threshold: [0.12, 0.35, 0.65] }
  );

  sections.forEach((section) => navObserver.observe(section));
}

function renderCaseModal(card) {
  if (!caseModal || !card) return;

  const deliverables = JSON.parse(card.dataset.caseDeliverables || "[]");
  const visual = caseModal.querySelector(".case-visual");
  const visualTitle = caseModal.querySelector(".case-visual strong");

  caseModal.querySelector("#case-title").textContent = card.dataset.caseTitle || "";
  caseModal.querySelector(".case-type").textContent = card.dataset.caseType || "";
  caseModal.querySelector(".case-copy").textContent = card.dataset.caseCopy || "";
  caseModal.querySelector(".case-challenge").textContent = card.dataset.caseChallenge || "";
  caseModal.querySelector(".case-solution").textContent = card.dataset.caseSolution || "";
  const resultElement = caseModal.querySelector(".case-result strong");
  const resultUrl = getSafeHttpUrl(card.dataset.caseResultUrl);
  if (resultElement && resultUrl) {
    const link = document.createElement("a");
    link.href = resultUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = card.dataset.caseResult || resultUrl;
    resultElement.replaceChildren(link);
  } else if (resultElement) {
    resultElement.textContent = card.dataset.caseResult || "";
  }
  const projectLink = caseModal.querySelector(".case-project-link");
  if (projectLink) {
    projectLink.textContent = (i18n[currentLang] || i18n.en).projectLiveLabel;
    projectLink.hidden = !resultUrl;
    if (resultUrl) {
      projectLink.href = resultUrl;
    } else {
      projectLink.removeAttribute("href");
    }
  }
  caseModal.querySelector(".case-timeline").textContent = card.dataset.caseTimeline || "";
  caseModal.querySelector(".case-role").textContent = card.dataset.caseRole || "";
  caseModal.querySelector(".case-stack").textContent = card.dataset.caseStack || "";
  renderList(caseModal.querySelector(".case-deliverables ul"), deliverables);

  visual?.classList.remove("visual-one", "visual-two", "visual-three", "has-image");
  visual?.style.removeProperty("--case-image");
  visual?.style.removeProperty("--case-image-position");
  visual?.style.removeProperty("--case-image-fit");
  if (card.dataset.caseVisual) visual?.classList.add(card.dataset.caseVisual);
  if (card.dataset.caseImage) {
    visual?.classList.add("has-image");
    visual?.style.setProperty("--case-image", `url("${card.dataset.caseImage}")`);
    visual?.style.setProperty("--case-image-position", card.dataset.caseImagePosition || "center");
    visual?.style.setProperty("--case-image-fit", card.dataset.caseImageFit || "cover");
  }
  if (visualTitle) visualTitle.textContent = card.dataset.caseTitle || "";
}

function setupCaseModal() {
  if (!caseModal) return;

  const close = caseModal.querySelector(".case-close");
  const grid = document.querySelector(".project-grid");

  function openCase(card) {
    lastCaseTrigger = card;
    renderCaseModal(card);
    caseModal.classList.add("is-open");
    caseModal.setAttribute("aria-hidden", "false");
    caseModal.setAttribute("tabindex", "-1");
    document.body.style.overflow = "hidden";
    close.focus({ preventScroll: true });
  }

  function closeCase() {
    caseModal.classList.remove("is-open");
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.removeAttribute("tabindex");
    document.body.style.overflow = "";
    lastCaseTrigger?.focus({ preventScroll: true });
  }

  grid?.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    const card = event.target.closest(".project-card[data-case-title]");
    if (card) openCase(card);
  });

  grid?.addEventListener("keydown", (event) => {
    const card = event.target.closest(".project-card[data-case-title]");
    if (!card || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    openCase(card);
  });

  close.addEventListener("click", closeCase);
  caseModal.querySelector(".case-cta")?.addEventListener("click", closeCase);
  caseModal.addEventListener("click", (event) => {
    if (event.target === caseModal) closeCase();
  });
  window.addEventListener("keydown", (event) => {
    trapModalFocus(event, caseModal, closeCase);
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  document.querySelectorAll("[data-reveal]").forEach((element) => {
    element.classList.add("is-visible");
  });
}

if (hero && "IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      isHeroCanvasVisible = entry.isIntersecting;
    },
    { rootMargin: "180px 0px" }
  );
  heroObserver.observe(hero);
}

function requestScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateScrollMotion();
    scrollTicking = false;
  });
}

function requestResizeUpdate() {
  if (resizeTicking) return;
  resizeTicking = true;
  requestAnimationFrame(() => {
    resizeCanvas();
    updateScrollMotion();
    resizeTicking = false;
  });
}

window.addEventListener("resize", () => {
  requestResizeUpdate();
});
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("pointermove", (event) => {
  pointer.tx = event.clientX / window.innerWidth;
  pointer.ty = event.clientY / window.innerHeight;
  if (!hasFinePointer) return;
  cursorTarget.x = event.clientX;
  cursorTarget.y = event.clientY;
  cursor?.classList.add("is-visible");
});

setupLanguageToggle();
setupLoader();
setupHeroRotator();
setupCursorStates();
setupNewsletter();
setupBriefForm();
setupServicePreview();
setupServiceModal();
setupRuleMotion();
setupMobileMenu();
setupActiveNav();
setupCaseModal();
loadRecentWorkFromGoogleSheet();
updateScrollMotion();
resizeCanvas();
animate();
