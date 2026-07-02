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

/* ==========================================================================
   Tablet JS
   Reserved for tablet-specific behavior.
   ========================================================================== */

/* ==========================================================================
   Mobile JS
   Mobile navigation behavior.
   ========================================================================== */

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu) return;

  function setOpen(isOpen) {
    const t = i18n[currentLang] || i18n.en;
    menu.classList.toggle("is-open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.querySelector("span").textContent = isOpen ? t.close : t.menu;
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
const testimonialsSection = document.querySelector(".testimonials");
const quoteRail = document.querySelector(".quote-rail");
const quoteItems = Array.from(quoteRail?.querySelectorAll("blockquote") || []);
const langToggle = document.querySelector(".lang-toggle");
const contactEmail = "hello@xdigma.studio";
const whatsappNumber = "628131770613";
// Paste a published Google Sheet CSV URL or Apps Script Web App URL here.
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
let quoteProgress = 0;
let quoteTargetProgress = 0;
let quoteNeedsRender = true;
let recentWorkLoading = false;
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
let currentLang = savedLang || "en";

const i18n = {
  en: {
    htmlLang: "en",
    title: "Xdigma — We Help Your Brand Get Found and Trusted Online",
    description: "Digital marketing for UMKM and growing brands. We handle the strategy, websites, SEO, and content so you don't have to figure it all out alone.",
    skip: "Skip to content",
    loader: "Loading ecosystem",
    backTop: "Top",
    menu: "Menu",
    close: "Close",
    nav: ["Work", "Services", "Studio", "Contact"],
    navCta: "Let's Talk",
    whatsappMessage: "Hi Xdigma, I want to grow my brand online.",
    whatsappLabel: "WhatsApp 0812 2950 7211",
    heroKicker: ["Digital marketing studio", "Jakarta / Remote"],
    eyebrow: "Your business is running. Let's make sure people can find it.",
    rotator: ["Get found online", "Look the part", "Grow steadily"],
    heroTitle: "We help brands show up in the right place, at the right time.",
    latestProject: "Latest project",
    heroSide: "From branding to SEO — we figure out what your brand needs and get it done. You'll always know the price before we start.",
    marquee: ["Identity", "Experience", "Motion", "Growth", "Identity", "Experience", "Motion", "Growth"],
    scroll: "Scroll",
    aboutLabel: "About",
    introLead: "We're a small digital marketing studio that works closely with founders and growing businesses.",
    introBody: "No big agency overhead. No confusing packages. Just the work your brand actually needs.",
    recentWork: "Recent work",
    seeAll: "See all projects",
    recentWorkLoading: "Loading projects",
    recentWorkError: "Projects could not be loaded",
    recentWorkRetry: "Try again",
    attitude: "How we think",
    rules: [
      ["No. 1", "Do the useful thing first.", "A good-looking brand that doesn't convert is just expensive decoration."],
      ["No. 2", "Don't overcomplicate it.", "Most brands don't need more — they need the right things done well."],
      ["No. 3", "Launching is just the start.", "We stick around to see what's working and what needs adjusting."],
      ["No. 4", "Be honest about what we don't know.", "We'd rather say 'let's figure it out' than pretend we have all the answers."],
      ["No. 5", "Leave things better than we found them.", "Clean work, documented handoffs — so you're never stuck without us."]
    ],
    partnershipTitle: "Trusted by them",
    partnershipBody: "These brands believed first — now it's your turn to see for yourself.",
    servicesTitle: "What we do",
    servicesBody: "Pick what you need. We'll tell you honestly if something else makes more sense for your situation.",
    services: ["Website design", "Front-end development", "Motion and interaction", "Shopify and conversion", "SEO and content"],
    serviceDescriptions: [
      "A website that looks like your brand and makes it easy for visitors to take action.",
      "Clean, fast, and built to last — with proper handoff so your team can manage it.",
      "The small details that make browsing feel smooth and intentional.",
      "Built around how people actually shop — less friction, more completed purchases.",
      "Help people find you on Google, and give them a reason to stay."
    ],
    serviceIncludesLabel: "Includes",
    serviceCta: "Ask about this",
    serviceClose: "Close",
    serviceAriaClose: "Close service detail",
    serviceDetails: [
      ["Website design", "We design websites that tell your story clearly and make the next step obvious for visitors.", ["Discovery and positioning", "Information architecture", "Wireframes and user flows", "Responsive visual design", "Component-ready design system"]],
      ["Front-end development", "Websites built properly — fast, accessible, and easy to update without breaking anything.", ["Responsive HTML/CSS/JS", "Reusable component patterns", "Interaction implementation", "Performance tuning", "Accessibility pass"]],
      ["Motion and interaction", "Subtle movement that makes the experience feel considered, not just decorated.", ["Loader and page motion", "Hover and cursor systems", "Scroll-based storytelling", "Canvas/CSS motion", "Reduced-motion alternatives"]],
      ["Shopify and conversion", "We find where people drop off and fix it — so more visitors actually complete their purchase.", ["Product page structure", "Collection UX", "Merchandising modules", "Checkout path cleanup", "Conversion experiment ideas"]],
      ["SEO and content", "We help your brand show up when people search for what you offer — and keep showing up.", ["Content architecture", "Landing-page templates", "Metadata structure", "Internal linking patterns", "Editorial component rules"]]
    ],
    selectedCapability: "Selected capability",
    processTitle: "How a project usually goes",
    processBody: "Simple, and we walk you through every part.",
    process: [
      ["We get to know your business", "What you sell, who you're trying to reach, and what's not working yet."],
      ["We plan before we build", "No jumping straight into design — we agree on direction first so nothing gets wasted."],
      ["We build, launch, and follow up", "After launch, we check in to see what the numbers are saying."]
    ],
    metricsTitle: "A few things we've helped clients achieve.",
    metricLabels: ["avg. engagement lift", "lead quality increase", "faster checkout flow", "prototype to launch"],
    metricTicker: ["34% bounce rate", "20k sign ups", "82% bookings increase", "396% traffic increase", "113% sales increase", "37% conversion rate"],
    awardsTitle: "Terlatih dan tersertifikasi.",
    awards: [
      "Google Analytics Certified",
      "Meta Blueprint Certified", 
      "Google Ads Certified"
    ],
    clientsSay: "What clients say",
    quoteButtons: ["Prev", "Next"],
    quotes: [
      ["Honestly didn't think a studio this size could pull it off. Happy to be wrong.", "Maya R., Founder / Akar Goods"],
      ["They explained every decision. That made a huge difference for us.", "Rafi D., Director / Ruang Nada"],
      ["First agency where the process actually matched what they promised upfront.", "Nadia P., CMO / Selaras Lab"],
      ["We could actually maintain everything after handoff. That almost never happens.", "Arman K., Product Lead / Kinora"]
    ],
    availabilityKicker: "Availability",
    availabilityTitle: "Every project is priced around what you actually need.",
    availabilityLink: ["Tell us your situation first"," we'll give you an honest number before you commit to anything."],
    contactKicker: "Not sure where to start? That's fine — most people aren't.",
    contactTitle: "Tell us what's going on with your brand. We'll take it from there.",
    contactForm: {
      title: "Send us a brief",
      subtitle: "Or just describe what's on your mind.",
      fields: ["Name", "Email", "Project type", "Timeline", "What's going on?"],
      placeholders: ["Your name", "you@brand.com", "No need to have it figured out — just tell us the situation."],
      emptyOptions: ["Choose one", "Choose one"],
      types: ["Website redesign", "New brand site", "E-commerce build", "Motion system"],
      timelines: ["2-4 weeks", "1-2 months", "Quarter launch", "Still figuring it out"],
      submit: "Send it over",
      success: "WhatsApp draft opened. Send it and we'll reply there."
    },
    footerKicker: "Xdigma Creative Studio",
    footerTitle: "We're easy to reach.",
    footerHeadings: ["Studio", "Services", "Social"],
    footerStudio: ["About", "Work", "Services", "Contact"],
    footerServices: ["Website design", "Motion design", "Front-end development", "SEO systems"],
    newsletter: "Newsletter",
    newsletterPlaceholder: "Email address",
    newsletterJoin: "Join",
    newsletterSuccess: "Email draft opened. Send it and you're on the list.",
    footerBottom: ["©2026 Xdigma Creative Studio", "Jakarta / Remote"],
    caseSelected: "What came out of it",
    caseLabels: ["The situation", "What we did"],
    caseMetaLabels: ["Timeline", "Role", "Stack"],
    caseDeliverables: "Deliverables",
    caseCta: "Talk to us about something similar",
    caseClose: "Close",
    caseAriaClose: "Close case study"
  },
  id: {
    htmlLang: "id",
    title: "Xdigma — Bantu Brand Lo Lebih Gampang Ditemuin dan Dipercaya",
    description: "Digital marketing buat UMKM dan bisnis yang lagi berkembang. Kami urus strategi, website, SEO, dan konten — biar lo gak perlu figuring out semuanya sendiri.",
    skip: "Langsung ke konten",
    loader: "Lagi nyiapin semuanya",
    backTop: "Atas",
    menu: "Menu",
    close: "Tutup",
    nav: ["Karya", "Layanan", "Studio", "Kontak"],
    navCta: "Ngobrol Dulu",
    whatsappMessage: "Halo Xdigma, gua mau ngembangin brand gua secara online.",
    whatsappLabel: "WhatsApp 0812 2950 7211",
    heroKicker: ["Studio digital marketing", "Jakarta / Remote"],
    eyebrow: "Bisnis lo udah jalan. Sekarang pastiin orang bisa nemuin lo.",
    rotator: ["Gampang ditemuin", "Keliatan profesional", "Tumbuh pelan tapi pasti"],
    heroTitle: "Kami bantu brand lo muncul di tempat yang tepat, di waktu yang tepat.",
    latestProject: "Project terbaru",
    heroSide: "Dari branding sampai SEO — kami cari tau apa yang brand lo butuhkan dan langsung kerjain. Harga selalu dikasih tau sebelum mulai.",
    marquee: ["Identitas", "Experience", "Motion", "Growth", "Identitas", "Experience", "Motion", "Growth"],
    scroll: "Scroll",
    aboutLabel: "Tentang",
    introLead: "Kami studio digital marketing kecil yang kerja dekat sama founder dan bisnis yang lagi tumbuh.",
    introBody: "Gak ada overhead agency besar. Gak ada paket yang bikin bingung. Cuma kerjaan yang emang dibutuhkan brand lo.",
    recentWork: "Karya terbaru",
    seeAll: "Lihat semua project",
    recentWorkLoading: "Lagi memuat project",
    recentWorkError: "Project belum bisa dimuat",
    recentWorkRetry: "Coba lagi",
    attitude: "Cara kami mikir",
    rules: [
      ["No. 1", "Kerjain yang berguna dulu.", "Brand yang keliatan bagus tapi gak convert itu cuma dekorasi mahal."],
      ["No. 2", "Jangan bikin ribet.", "Kebanyakan brand gak butuh lebih banyak — mereka butuh hal yang tepat dikerjain dengan bener."],
      ["No. 3", "Launch itu baru awal.", "Kami tetap pantau setelah launch buat liat apa yang jalan dan apa yang perlu disesuain."],
      ["No. 4", "Jujur kalau belum tau.", "Kami lebih milih bilang 'ayo cari tau bareng' daripada pura-pura punya semua jawabannya."],
      ["No. 5", "Tinggalin sesuatu yang lebih baik.", "Kerjaan yang rapi dan handoff yang terdokumentasi — biar lo gak stuck kalau butuh kami lagi."]
    ],
    partnershipTitle: "Dipercaya sama mereka",
    partnershipBody: "Brand-brand ini yang duluan percaya — sekarang giliran lo nilai sendiri.",
    servicesTitle: "Yang kami kerjain",
    servicesBody: "Pilih yang lo butuh. Kami bakal jujur kalau ada yang lebih masuk akal buat situasi lo.",
    services: ["Desain website", "Front-end development", "Motion dan interaksi", "Shopify dan konversi", "SEO dan konten"],
    serviceDescriptions: [
      "Website yang keliatan kayak brand lo dan bikin visitor gampang ambil aksi.",
      "Rapi, cepat, dan dibangun biar tahan lama — dengan handoff yang proper.",
      "Detail kecil yang bikin browsing terasa halus dan intentional.",
      "Dibangun sesuai cara orang belanja beneran — lebih sedikit friksi, lebih banyak pembelian selesai.",
      "Bantu orang nemuin lo di Google, dan kasih mereka alasan buat tetap di sana."
    ],
    serviceIncludesLabel: "Yang termasuk",
    serviceCta: "Tanya soal ini",
    serviceClose: "Tutup",
    serviceAriaClose: "Tutup detail layanan",
    serviceDetails: [
      ["Desain website", "Kami desain website yang ceritain brand lo dengan jelas dan bikin langkah selanjutnya obvious buat visitor.", ["Discovery dan positioning", "Information architecture", "Wireframe dan user flow", "Desain visual responsif", "Design system siap komponen"]],
      ["Front-end development", "Website yang dibangun dengan bener — cepat, accessible, dan gampang di-update tanpa merusak apapun.", ["HTML/CSS/JS responsif", "Pola komponen reusable", "Implementasi interaksi", "Tuning performa", "Audit aksesibilitas"]],
      ["Motion dan interaksi", "Gerakan halus yang bikin experience terasa thoughtful, bukan sekadar dihias.", ["Loader dan page motion", "Hover dan cursor system", "Storytelling berbasis scroll", "Motion canvas/CSS", "Alternatif reduced-motion"]],
      ["Shopify dan konversi", "Kami cari tau di mana orang drop off dan benerin itu — biar lebih banyak visitor yang beneran beli.", ["Struktur halaman produk", "UX koleksi", "Modul merchandising", "Pembersihan alur checkout", "Ide eksperimen konversi"]],
      ["SEO dan konten", "Bantu brand lo muncul waktu orang nyari apa yang lo tawarkan — dan terus muncul.", ["Arsitektur konten", "Template landing page", "Struktur metadata", "Pola internal linking", "Aturan komponen editorial"]]
    ],
    selectedCapability: "Kapabilitas pilihan",
    processTitle: "Biasanya project jalan kayak gini",
    processBody: "Simpel, dan kami temani di setiap bagiannya.",
    process: [
      ["Kami kenalan sama bisnis lo", "Apa yang lo jual, siapa yang lo coba jangkau, dan apa yang belum jalan."],
      ["Kami plan sebelum build", "Gak langsung loncat ke desain — kami sepakatin arahnya dulu biar gak ada yang kebuang."],
      ["Kami build, launch, dan follow up", "Setelah launch, kami cek balik buat liat apa yang dikasih tau angkanya."]
    ],
    metricsTitle: "Beberapa hal yang udah kami bantu klien capai.",
    metricLabels: ["rata-rata engagement naik", "kualitas lead naik", "alur checkout lebih cepat", "prototype ke launch"],
    metricTicker: ["34% bounce rate", "20k sign up", "82% booking naik", "396% traffic naik", "113% sales naik", "37% conversion rate"],
    awardsTitle: "Beberapa penghargaan di perjalanan.",
    awards: ["x 8 honorable mentions", "x 9 UI / UX awards", "x 3 featured launches"],
    clientsSay: "Kata klien",
    quoteButtons: ["Sebelum", "Lanjut"],
    quotes: [
      ["Jujur gak nyangka studio sekecil ini bisa pull it off. Seneng ternyata gue salah.", "Maya R., Founder / Akar Goods"],
      ["Mereka jelasin setiap keputusan. Itu beda banget buat kami.", "Rafi D., Director / Ruang Nada"],
      ["Pertama kalinya ketemu tempat yang prosesnya beneran sesuai sama yang dijanjiin di awal.", "Nadia P., CMO / Selaras Lab"],
      ["Kami bisa maintain semuanya sendiri setelah handoff. Itu hampir gak pernah terjadi.", "Arman K., Product Lead / Kinora"]
    ],
    availabilityKicker: "Ketersediaan",
    availabilityTitle: "Setiap project kami hargain sesuai kebutuhannya.",
    availabilityLink: ["Ceritain situasi lo dulu"," kami kasih gambaran harga yang jujur sebelum lo commit apapun."],
    contactKicker: "Belum tau harus mulai dari mana? Gak apa-apa — kebanyakan orang juga gitu.",
    contactTitle: "Ceritain situasi brand lo. Kami yang lanjutin dari sana.",
    contactForm: {
      title: "Kirim brief",
      subtitle: "Atau ceritain aja apa yang ada di pikiran lo.",
      fields: ["Nama", "Email", "Tipe project", "Timeline", "Situasinya gimana?"],
      placeholders: ["Nama lo", "lo@brand.com", "Gak harus udah kepikiran semuanya — ceritain aja situasinya."],
      emptyOptions: ["Pilih satu", "Pilih satu"],
      types: ["Redesign website", "Brand site baru", "Build e-commerce", "Sistem motion"],
      timelines: ["2-4 minggu", "1-2 bulan", "Launch kuartal ini", "Masih dirapihin"],
      submit: "Kirim",
      success: "Draft WhatsApp kebuka. Kirim, nanti kami balas di sana."
    },
    footerKicker: "Xdigma Creative Studio",
    footerTitle: "Gampang dihubungi.",
    footerHeadings: ["Studio", "Layanan", "Sosial"],
    footerStudio: ["Tentang", "Karya", "Layanan", "Kontak"],
    footerServices: ["Desain website", "Motion design", "Front-end development", "Sistem SEO"],
    newsletter: "Newsletter",
    newsletterPlaceholder: "Alamat email",
    newsletterJoin: "Gabung",
    newsletterSuccess: "Draft email kebuka. Kirim, nanti lo masuk list.",
    footerBottom: ["©2026 Xdigma Creative Studio", "Jakarta / Remote"],
    caseSelected: "Yang keluar dari project ini",
    caseLabels: ["Situasinya", "Yang kami lakuin"],
    caseMetaLabels: ["Timeline", "Peran", "Stack"],
    caseDeliverables: "Deliverables",
    caseCta: "Ngobrol soal sesuatu yang mirip",
    caseClose: "Tutup",
    caseAriaClose: "Tutup studi kasus"
  }
};

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, hasFinePointer && !prefersSaveData ? 1.5 : 1);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(hasFinePointer && !prefersSaveData ? 56 : 20, Math.max(hasFinePointer ? 26 : 12, Math.floor(width / (hasFinePointer ? 28 : 52))));
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
    cursor.style.transform = `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0)`;
    cursorDot.style.transform = `translate3d(${cursorTarget.x - cursorPosition.x}px, ${cursorTarget.y - cursorPosition.y}px, 0) translate3d(-50%, -50%, 0)`;
    cursorRing.style.transform = `translate3d(-50%, -50%, 0) scale(var(--cursor-scale, 1)) rotate(${(cursorTarget.x - cursorPosition.x) * 0.22}deg)`;
  }

  updateRenderedQuoteMotion();
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

  const title = card.querySelector(".project-meta h3");
  const type = card.querySelector(".project-meta span");
  const mockTitle = card.querySelector(".mock-window strong");
  if (title) title.textContent = locale.title;
  if (type) type.textContent = locale.type;
  if (mockTitle) mockTitle.textContent = locale.mockLabel || locale.title.split(/\s+/)[0] || locale.title;
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
  meta.append(type, title);
  card.append(visual, meta);
  applyProjectCardLanguage(card, currentLang);
  return card;
}

function renderRecentWork(projects) {
  const grid = document.querySelector(".project-grid");
  if (!grid || !projects.length) return;

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
  const marker = document.createElement("span");
  const label = document.createElement("strong");

  grid.classList.add("is-status");
  grid.setAttribute("aria-busy", String(state === "loading"));
  status.className = `work-status is-${state}`;
  status.setAttribute("role", state === "error" ? "alert" : "status");
  marker.className = "work-loader-mark";
  marker.setAttribute("aria-hidden", "true");
  label.className = "work-status-label";
  label.textContent = state === "error" ? t.recentWorkError : t.recentWorkLoading;
  status.append(marker, label);

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
    renderRecentWorkStatus("error");
    return;
  }

  recentWorkLoading = true;
  renderRecentWorkStatus("loading");
  try {
    const response = await fetch(recentWorkSource.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Recent work source returned ${response.status}`);
    const rows = rowsFromRemoteText(await response.text(), response.headers.get("content-type") || "");
    const projects = rows
      .filter((row) => !/^no|false|0$/i.test(getField(row, ["published", "publish", "show"])))
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
          copy: getField(row, ["copy", "the situation", "short summary", "summary", "description", "deskripsi"]) || "Detail project sedang disiapkan.",
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
    renderRecentWorkStatus("error");
  } finally {
    recentWorkLoading = false;
  }
}

function openMailDraft(subject, lines) {
  const body = lines.filter(Boolean).join("\n");
  window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function openWhatsappDraft(lines) {
  const text = lines.filter(Boolean).join("\n");
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

function getWhatsappHref(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    )
  ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
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

  setText(".skip-link", t.skip);
  setText(".loader-inner span", t.loader);
  setText(".back-top", t.backTop);
  document.querySelector(".back-top")?.setAttribute("aria-label", t.backTop);
  document.querySelector(".back-top")?.setAttribute("data-cursor", t.backTop);
  document.querySelector(".menu-toggle")?.setAttribute("data-cursor", t.menu);
  if (!document.querySelector(".mobile-menu")?.classList.contains("is-open")) {
    setText(".menu-toggle span", t.menu);
  }
  setIndexedText(".main-nav a", t.nav);
  setIndexedText(".mobile-menu a", t.nav);
  setText(".nav-cta", t.navCta);
  document.querySelector(".nav-cta")?.setAttribute("data-cursor", lang === "id" ? "Mulai" : "Start");
  document.querySelectorAll("[data-whatsapp-cta]").forEach((link) => {
    link.setAttribute("href", getWhatsappHref(t.whatsappMessage));
  });
  setIndexedText(".hero-kicker span", t.heroKicker);
  setText(".eyebrow", t.eyebrow);
  setIndexedText(".hero-rotator span", t.rotator);

  const headline = document.querySelector("#hero-title");
  if (headline) {
    headline.dataset.split = "false";
    headline.textContent = t.heroTitle;
    delete headline.dataset.split;
    splitHeadline();
  }

  setText(".project-pill span", t.latestProject);
  setText(".hero-side p", t.heroSide);
  setIndexedText(".marquee-track span", t.marquee);
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
  setIndexedText(".attitude-ghost span", [t.attitude, t.attitude, t.attitude]);

  document.querySelectorAll(".rule-item").forEach((item, index) => {
    const rule = t.rules[index];
    if (!rule) return;
    item.querySelector("span").textContent = rule[0];
    item.querySelector("h3").textContent = rule[1];
    item.querySelector("p").textContent = rule[2];
  });

  setText(".partner-strip .section-heading h2", t.partnershipTitle);
  setText(".partner-strip .section-heading p", t.partnershipBody);
  setText(".services .section-heading h2", t.servicesTitle);
  setText(".services .section-heading p", t.servicesBody);
  setIndexedText(".service-list button > span:first-child", t.services);
  setText(".service-preview span", t.selectedCapability);
  setText(".service-modal-list span", t.serviceIncludesLabel);
  setText(".service-modal-cta", t.serviceCta);
  setText(".service-close", t.serviceClose);
  document.querySelector(".service-close")?.setAttribute("aria-label", t.serviceAriaClose);
  document.querySelector(".service-close")?.setAttribute("data-cursor", t.serviceClose);
  document.querySelectorAll(".service-list button").forEach((service, index) => {
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
  setIndexedText(".metric-grid div span", t.metricLabels);
  const tickerItems = [...t.metricTicker, ...t.metricTicker];
  setIndexedText(".metrics-track span", tickerItems);
  setText(".awards-copy h2", t.awardsTitle);
  setIndexedText(".awards-grid span", t.awards);
  setText(".testimonials .section-heading h2", t.clientsSay);
  setText("[data-quote-prev]", t.quoteButtons[0]);
  setText("[data-quote-next]", t.quoteButtons[1]);

  document.querySelectorAll(".quote-rail blockquote").forEach((quote, index) => {
    const item = t.quotes[index];
    if (!item) return;
    quote.querySelector("p").textContent = `“${item[0]}”`;
    quote.querySelector("cite").textContent = item[1];
  });

  setText(".availability-copy span", t.availabilityKicker);
  setText(".availability-copy h2", t.availabilityTitle);
  setText(".availability a span", t.availabilityLink[0]);
  setText(".availability a strong", t.availabilityLink[1]);
  document.querySelector(".availability a")?.setAttribute("data-cursor", lang === "id" ? "Bicara" : "Talk");
  setText(".contact-inner span", t.contactKicker);
  setText(".contact-inner h2", t.contactTitle);
  setText(".brief-form-head span", t.contactForm.title);
  setText(".brief-form-head strong", t.contactForm.subtitle);
  setIndexedText(".brief-form label > span", t.contactForm.fields);
  document.querySelector(".brief-form input[name='name']")?.setAttribute("placeholder", t.contactForm.placeholders[0]);
  document.querySelector(".brief-form input[name='email']")?.setAttribute("placeholder", t.contactForm.placeholders[1]);
  document.querySelector(".brief-form textarea")?.setAttribute("placeholder", t.contactForm.placeholders[2]);
  setText(".brief-form button", t.contactForm.submit);
  document.querySelector(".brief-form button")?.setAttribute("data-cursor", lang === "id" ? "Kirim" : "Send");
  const projectType = document.querySelector(".brief-form select[name='type']");
  const timeline = document.querySelector(".brief-form select[name='timeline']");
  if (projectType) {
    projectType.options[0].textContent = t.contactForm.emptyOptions[0];
    t.contactForm.types.forEach((item, index) => {
      if (projectType.options[index + 1]) projectType.options[index + 1].textContent = item;
    });
  }
  if (timeline) {
    timeline.options[0].textContent = t.contactForm.emptyOptions[1];
    t.contactForm.timelines.forEach((item, index) => {
      if (timeline.options[index + 1]) timeline.options[index + 1].textContent = item;
    });
  }
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

  window.requestAnimationFrame(() => {
    updateQuoteMotion();
    quoteNeedsRender = true;
  });
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

  updateQuoteMotion();
}

function updateQuoteMotion() {
  if (!testimonialsSection || !quoteRail) return;

  const quotes = quoteItems;
  if (prefersReducedMotion || !quotes.length) {
    quoteRail.style.setProperty("--quote-x", "0px");
    testimonialsSection.style.setProperty("--quote-distance", "0px");
    return;
  }

  const maxShift = getQuoteShift(quotes);
  const scrollable = Math.max(1, testimonialsSection.offsetHeight - window.innerHeight);
  const progressValue = Math.max(0, Math.min(1, (window.scrollY - testimonialsSection.offsetTop) / scrollable));
  quoteTargetProgress = progressValue;
  quoteNeedsRender = true;
  testimonialsSection.style.setProperty("--quote-distance", `${maxShift}px`);
}

function updateRenderedQuoteMotion() {
  if (!testimonialsSection || !quoteRail || prefersReducedMotion) return;
  if (!quoteNeedsRender && Math.abs(quoteTargetProgress - quoteProgress) < 0.001) return;
  const quotes = quoteItems;
  if (!quotes.length) return;

  const maxShift = getQuoteShift(quotes);
  const ease = Math.abs(quoteTargetProgress - quoteProgress) > 0.18 ? 0.14 : 0.085;
  quoteProgress += (quoteTargetProgress - quoteProgress) * ease;
  if (Math.abs(quoteTargetProgress - quoteProgress) < 0.001) quoteProgress = quoteTargetProgress;
  applyQuoteProgress(quoteProgress, quotes, maxShift);
  quoteNeedsRender = quoteProgress !== quoteTargetProgress;
}

function getQuoteShift(quotes = quoteItems) {
  if (!quoteRail || !quotes.length) return 0;
  const lastQuote = quotes[quotes.length - 1];
  return Math.max(0, lastQuote.offsetLeft + lastQuote.offsetWidth - quoteRail.clientWidth);
}

function applyQuoteProgress(progressValue, quotes = quoteItems, maxShift = getQuoteShift(quotes)) {
  if (!testimonialsSection || !quoteRail || !quotes.length) return;
  const clampedProgress = Math.max(0, Math.min(1, progressValue));
  const activeIndex = Math.min(quotes.length - 1, Math.round(clampedProgress * (quotes.length - 1)));
  const shift = getQuoteShiftForProgress(clampedProgress, quotes, maxShift);

  testimonialsSection.style.setProperty("--quote-distance", `${maxShift}px`);
  quoteRail.style.setProperty("--quote-x", `${shift * -1}px`);
  quotes.forEach((quote, index) => quote.classList.toggle("is-current", index === activeIndex));
}

function getQuoteShiftForProgress(progressValue, quotes, maxShift) {
  if (quotes.length < 2) return 0;
  const scaledProgress = progressValue * (quotes.length - 1);
  const baseIndex = Math.min(quotes.length - 2, Math.floor(scaledProgress));
  const segmentProgress = scaledProgress - baseIndex;
  const currentShift = Math.min(maxShift, quotes[baseIndex].offsetLeft);
  const nextShift = Math.min(maxShift, quotes[baseIndex + 1].offsetLeft);
  return currentShift + (nextShift - currentShift) * segmentProgress;
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!("IntersectionObserver" in window)) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        const suffix = element.dataset.suffix || "";
        const decimals = Number.isInteger(target) ? 0 : 1;
        const duration = prefersReducedMotion ? 1 : 1200;
        const start = performance.now();
        const finalValue = `${target.toFixed(decimals)}${suffix}`;
        element.textContent = `${(0).toFixed(decimals)}${suffix}`;

        function tick(now) {
          const progressValue = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progressValue, 3);
          element.textContent = progressValue === 1 ? finalValue : `${(target * eased).toFixed(decimals)}${suffix}`;
          if (progressValue < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        counterObserver.unobserve(element);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

function setupQuoteRail() {
  const rail = quoteRail || document.querySelector(".quote-rail");
  const quotes = Array.from(document.querySelectorAll(".quote-rail blockquote"));
  const prev = document.querySelector("[data-quote-prev]");
  const next = document.querySelector("[data-quote-next]");
  if (!rail || !quotes.length) return;

  function setCurrent(index) {
    quotes.forEach((quote, quoteIndex) => {
      quote.classList.toggle("is-current", quoteIndex === index);
    });
  }

  function getCurrentIndex() {
    const railLeft = rail.getBoundingClientRect().left;
    return quotes.reduce((closestIndex, quote, index) => {
      const closestDistance = Math.abs(quotes[closestIndex].getBoundingClientRect().left - railLeft);
      const distance = Math.abs(quote.getBoundingClientRect().left - railLeft);
      return distance < closestDistance ? index : closestIndex;
    }, 0);
  }

  function scrollToQuote(index) {
    const nextIndex = (index + quotes.length) % quotes.length;
    if (testimonialsSection && !prefersReducedMotion) {
      const scrollable = Math.max(1, testimonialsSection.offsetHeight - window.innerHeight);
      const progressValue = quotes.length > 1 ? nextIndex / (quotes.length - 1) : 0;
      quoteTargetProgress = progressValue;
      quoteNeedsRender = true;
      window.scrollTo({
        top: testimonialsSection.offsetTop + scrollable * progressValue,
        behavior: "smooth"
      });
      setCurrent(nextIndex);
      return;
    }

    quotes[nextIndex].scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", inline: "start", block: "nearest" });
    setCurrent(nextIndex);
  }

  prev?.addEventListener("click", () => scrollToQuote(getCurrentIndex() - 1));
  next?.addEventListener("click", () => scrollToQuote(getCurrentIndex() + 1));
  rail.addEventListener("scroll", () => {
    window.clearTimeout(rail._quoteTimer);
    rail._quoteTimer = window.setTimeout(() => setCurrent(getCurrentIndex()), 80);
  }, { passive: true });
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
    const message = data.get("message") || "";
    openWhatsappDraft([
      "Hi Xdigma,",
      "",
      "I want to start a project brief.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Project type: ${projectType}`,
      `Timeline: ${timeline}`,
      "",
      "Project context:",
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

  number.textContent = String(index + 1).padStart(2, "0");
  title.textContent = detail[0];
  copy.textContent = detail[1];
  renderList(list, detail[2]);
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
setupCounters();
setupQuoteRail();
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
