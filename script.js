/* ==========================================================================
   Desktop JS
   Pointer, cursor, and magnetic-card interactions.
   ========================================================================== */

function setupMagneticCards() {
  if (!hasFinePointer || prefersReducedMotion) return;

  document.querySelectorAll("[data-magnetic]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -8;
      const ry = ((x / rect.width) - 0.5) * 8;
      const tx = (x / rect.width - 0.5) * 18;
      const ty = (y / rect.height - 0.5) * 18;
      card.style.setProperty("--tilt-x", `${rx}deg`);
      card.style.setProperty("--tilt-y", `${ry}deg`);
      card.style.setProperty("--card-x", `${tx}px`);
      card.style.setProperty("--card-y", `${ty}px`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--card-x", "0px");
      card.style.setProperty("--card-y", "0px");
    });
  });
}

function setupCursorStates() {
  if (!cursor || !cursorDot || !cursorRing || !cursorLabel || prefersReducedMotion || !hasFinePointer) return;

  document.addEventListener("pointerenter", () => cursor.classList.add("is-visible"));
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  document.addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));

  const interactiveElements = document.querySelectorAll("a, button, [data-magnetic], [data-cursor]");
  interactiveElements.forEach((element) => {
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
const parallaxElements = Array.from(document.querySelectorAll("[data-parallax]"));
const langToggle = document.querySelector(".lang-toggle");
const contactEmail = "hello@xdigma.studio";
const whatsappNumber = "6281229507211";
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
    title: "Xdigma Creative Studio - Digital Experiences That Move",
    description: "Independent digital studio for websites, brand systems, motion, and growth experiences.",
    skip: "Skip to content",
    loader: "Loading ecosystem",
    backTop: "Top",
    menu: "Menu",
    close: "Close",
    nav: ["Work", "Services", "Studio", "Contact"],
    navCta: "Start a project",
    whatsappMessage: "Hi Xdigma, I want to talk about a website project.",
    whatsappLabel: "WhatsApp 0812 2950 7211",
    heroKicker: ["Creative web studio", "Jakarta / Remote"],
    eyebrow: "We turn quiet brands into magnetic digital systems.",
    rotator: ["Turn vision into value", "Unlock audience momentum", "Fuel measurable growth"],
    heroTitle: "Websites that feel alive, sell clearly, and stay sharp.",
    latestProject: "Latest project",
    heroSide: "Strategy, UX, visual systems, front-end builds, and campaign pages designed to move people from interest to action.",
    marquee: ["Identity", "Experience", "Motion", "Growth", "Identity", "Experience", "Motion", "Growth"],
    scroll: "Scroll",
    aboutLabel: "About",
    introLead: "Xdigma is a compact digital studio for founders, culture brands, and high-growth teams who need a site with presence, precision, and momentum.",
    introBody: "We blend brand direction, interface craft, front-end engineering, and conversion thinking into one focused build process.",
    recentWork: "Recent work",
    seeAll: "See all projects",
    projectTypes: ["Brand platform / Web app", "E-commerce / Motion", "Editorial / UX"],
    attitude: "Attitude",
    rules: [
      ["Rule No. 1", "Make it useful before making it loud.", "Every interaction has a job: clarify, persuade, reduce friction, or add delight."],
      ["Rule No. 2", "Design systems should feel human.", "We build flexible components with a strong visual voice, not sterile templates."],
      ["Rule No. 3", "Launch is a beginning.", "The best sites learn from traffic, sharpen conversion paths, and keep improving."],
      ["Rule No. 4", "Trust the process, question the obvious.", "We keep decisions moving while making room for the sharper idea to appear."],
      ["Rule No. 5", "Make the handoff feel effortless.", "Clean systems, clear docs, and components your team can keep using after launch."]
    ],
    partnershipTitle: "True partnership",
    partnershipBody: "For teams that want senior taste, steady process, and launch energy.",
    servicesTitle: "Services",
    servicesBody: "Lean team, senior hands, measurable output.",
    services: ["Website design", "Front-end development", "Motion and interaction", "Shopify and conversion", "SEO-ready content systems"],
    serviceDescriptions: [
      "Narrative, IA, wireframes, visual direction, and high-fidelity responsive interface systems.",
      "Fast, accessible front-end builds with motion, reusable components, and clean handoff logic.",
      "Kinetic detail for hero moments, transitions, hover states, loaders, and scroll-based storytelling.",
      "Product pages, collection flows, merchandising systems, and checkout optimization for better conversion.",
      "Content architecture, landing-page systems, metadata structure, and scalable editorial templates."
    ],
    serviceIncludesLabel: "Includes",
    serviceCta: "Start a project",
    serviceClose: "Close",
    serviceAriaClose: "Close service detail",
    serviceDetails: [
      ["Website design", "A focused design sprint for brands that need a sharper story, cleaner UX, and a visual system strong enough to scale across pages.", ["Discovery and positioning", "Information architecture", "Wireframes and user flows", "Responsive visual design", "Component-ready design system"]],
      ["Front-end development", "Production-ready interface builds with motion, performance, accessibility, and maintainable component logic baked in from the start.", ["Responsive HTML/CSS/JS", "Reusable component patterns", "Interaction implementation", "Performance tuning", "Accessibility pass"]],
      ["Motion and interaction", "Kinetic details that make the experience feel alive without getting in the way of clarity, speed, or conversion.", ["Loader and page motion", "Hover and cursor systems", "Scroll-based storytelling", "Canvas/CSS motion", "Reduced-motion alternatives"]],
      ["Shopify and conversion", "Commerce flows shaped around product storytelling, faster browsing, cleaner decision points, and fewer checkout leaks.", ["Product page structure", "Collection UX", "Merchandising modules", "Checkout path cleanup", "Conversion experiment ideas"]],
      ["SEO-ready content systems", "Editorial and landing-page systems that help teams publish consistently while keeping metadata, hierarchy, and performance in shape.", ["Content architecture", "Landing-page templates", "Metadata structure", "Internal linking patterns", "Editorial component rules"]]
    ],
    selectedCapability: "Selected capability",
    processTitle: "How we move",
    processBody: "A tight loop from taste to shipping.",
    process: [
      ["Find the signal", "Clarify the offer, audience, conversion path, and moments worth making memorable."],
      ["Shape the system", "Design the visual language, component logic, and motion rules before scaling pages."],
      ["Launch with grip", "Build, test, tune performance, and hand over a site your team can actually run."]
    ],
    metricsTitle: "Built for creative confidence and business lift.",
    metricLabels: ["avg. engagement lift", "lead quality increase", "faster checkout flow", "prototype to launch"],
    metricTicker: ["34% bounce rate", "20k sign ups", "82% bookings increase", "396% traffic increase", "113% sales increase", "37% conversion rate"],
    awardsTitle: "Awards-ready craft. Business-ready systems.",
    awards: ["x 8 honorable mentions", "x 9 UI / UX awards", "x 3 featured launches"],
    clientsSay: "Clients say",
    quoteButtons: ["Prev", "Next"],
    quotes: [
      ["They gave us a website with real character and a cleaner path to sales. The first week already felt different.", "Maya R., Founder / Akar Goods"],
      ["Fast, thoughtful, and very sharp on details. The whole process felt like working with a senior product team.", "Rafi D., Director / Ruang Nada"],
      ["The launch felt custom from the first scroll. They turned a messy offer into something visitors understood immediately.", "Nadia P., CMO / Selaras Lab"],
      ["Our team could actually maintain the system after handoff. That made the website feel like a product, not a one-time poster.", "Arman K., Product Lead / Kinora"]
    ],
    availabilityKicker: "Now booking",
    availabilityTitle: "Two focused launch slots open for Q3.",
    availabilityLink: ["Start the brief", "Tell us what needs to move."],
    contactKicker: "Ready when the idea is.",
    contactTitle: "Let's build the site your brand has been trying to become.",
    contactForm: {
      title: "Quick brief",
      subtitle: "Tell us the shape of the build.",
      fields: ["Name", "Email", "Project type", "Timeline", "What needs to move?"],
      placeholders: ["Your name", "you@brand.com", "Give us the context, goal, or one messy paragraph."],
      emptyOptions: ["Choose one", "Choose one"],
      types: ["Website redesign", "New brand site", "E-commerce build", "Motion system"],
      timelines: ["2-4 weeks", "1-2 months", "Quarter launch", "Still shaping it"],
      submit: "Send brief",
      success: "WhatsApp draft opened. Send it and we'll reply there."
    },
    footerKicker: "Xdigma Creative Studio",
    footerTitle: "Let's talk",
    footerHeadings: ["Studio", "Services", "Social"],
    footerStudio: ["About", "Work", "Services", "Contact"],
    footerServices: ["Website design", "Motion design", "Front-end development", "SEO systems"],
    newsletter: "Newsletter",
    newsletterPlaceholder: "Email address",
    newsletterJoin: "Join",
    newsletterSuccess: "Email draft opened. Send it and you're on the list.",
    footerBottom: ["©2026 Xdigma Creative Studio", "Jakarta / Remote"],
    caseSelected: "Selected result",
    caseLabels: ["Challenge", "Solution"],
    caseMetaLabels: ["Timeline", "Role", "Stack"],
    caseDeliverables: "Deliverables",
    caseCta: "Build something like this",
    caseClose: "Close",
    caseAriaClose: "Close case study",
    caseAria: ["Open Selaras Lab case study", "Open Akar Goods case study", "Open Ruang Nada case study"],
    cases: [
      ["Selaras Lab", "Brand platform / Web app", "A high-conviction brand platform with a productized content system, conversion-led landing pages, and a cinematic launch experience for a culture-tech team.", "68% engagement lift", "The team had a strong offer but no clear system for turning product stories into landing pages visitors could understand fast.", "We rebuilt the brand architecture, designed reusable story modules, and added motion moments that made the platform feel confident without slowing the path to action.", ["Brand narrative", "Responsive web system", "CMS-ready landing modules", "Launch motion direction"], "visual-one", "6 weeks", "Strategy, UX, UI, front-end", "HTML, CSS, JS, CMS-ready modules"],
      ["Akar Goods", "E-commerce / Motion", "A faster shopping flow with sharper product storytelling, motion-led category moments, and a calmer checkout path for repeat purchase behavior.", "41% faster checkout flow", "Product pages were visually rich but the buying path felt slow, especially on mobile category browsing.", "We tightened product hierarchy, reduced decision friction, and used lightweight motion to make categories easier to scan.", ["Commerce UX", "Product page system", "Collection flow", "Checkout cleanup"], "visual-two", "4 weeks", "UX cleanup, motion, front-end", "Shopify flow, CSS motion, conversion UX"],
      ["Ruang Nada", "Editorial / UX", "An editorial experience that turns discovery into deep reading through modular story pages, immersive visual pacing, and a lightweight publishing system.", "3.1x lead quality increase", "The publication had strong content but readers were dropping before reaching high-intent stories and inquiry points.", "We shaped a more cinematic reading rhythm, clearer entry points, and an editorial component system the team could publish with quickly.", ["Editorial UX", "Story templates", "Interaction system", "Publishing handoff"], "visual-three", "5 weeks", "Editorial UX, design system", "Modular templates, interaction rules, handoff docs"]
    ]
  },
  id: {
    htmlLang: "id",
    title: "Xdigma Creative Studio - Website yang Gerak dan Jualan",
    description: "Studio digital buat website, brand system, motion, dan growth experience yang enak dilihat, jelas dipakai, dan siap jalan.",
    skip: "Langsung ke konten",
    loader: "Lagi nyiapin experience",
    backTop: "Atas",
    menu: "Menu",
    close: "Tutup",
    nav: ["Karya", "Layanan", "Studio", "Kontak"],
    navCta: "Mulai proyek",
    whatsappMessage: "Halo Xdigma, gua mau ngobrol soal project website.",
    whatsappLabel: "WhatsApp 0812 2950 7211",
    heroKicker: ["Studio web kreatif", "Jakarta / Remote"],
    eyebrow: "Kami bantu brand yang masih kalem jadi experience digital yang lebih niat.",
    rotator: ["Bikin ide jadi nilai", "Buka momentum audiens", "Dorong growth yang kebaca"],
    heroTitle: "Website yang hidup, jelas jualannya, dan tetap tajam.",
    latestProject: "Project terbaru",
    heroSide: "Strategi, UX, visual system, front-end build, sampai campaign page yang bantu orang paham, percaya, lalu ambil aksi.",
    marquee: ["Identitas", "Experience", "Motion", "Growth", "Identitas", "Experience", "Motion", "Growth"],
    scroll: "Scroll",
    aboutLabel: "Tentang",
    introLead: "Xdigma adalah studio digital ringkas buat founder, culture brand, dan tim yang lagi tumbuh, yang butuh website dengan karakter, arah jelas, dan momentum.",
    introBody: "Kami gabungin arah brand, craft interface, front-end engineering, dan conversion thinking ke proses build yang fokus dan nggak ribet.",
    recentWork: "Karya terbaru",
    seeAll: "Lihat semua project",
    projectTypes: ["Platform brand / Web app", "E-commerce / Motion", "Editorial / UX"],
    attitude: "Sikap",
    rules: [
      ["Aturan No. 1", "Bikin berguna dulu, baru dibikin ramai.", "Setiap interaksi harus punya kerjaan: memperjelas, meyakinkan, ngurangin friksi, atau nambah rasa."],
      ["Aturan No. 2", "Design system tetap harus punya nyawa.", "Kami bikin komponen yang fleksibel dan punya karakter, bukan template yang steril."],
      ["Aturan No. 3", "Launch itu baru mulai.", "Website yang bagus harus bisa belajar dari traffic, ngerapihin conversion path, dan terus ditajamin."],
      ["Aturan No. 4", "Percaya proses, tapi jangan manut buta.", "Keputusan harus jalan, tapi ruang buat ide yang lebih tajam tetap harus kebuka."],
      ["Aturan No. 5", "Handoff jangan bikin pusing.", "Sistemnya rapi, dokumentasinya jelas, dan tim lu bisa lanjut pakai setelah launch."]
    ],
    partnershipTitle: "Partner beneran",
    partnershipBody: "Buat tim yang butuh taste senior, proses yang tenang, dan energi launch yang tetap tajam.",
    servicesTitle: "Layanan",
    servicesBody: "Tim ramping, tangan senior, output kebaca.",
    services: ["Desain website", "Front-end development", "Motion dan interaksi", "Shopify dan konversi", "Sistem konten siap SEO"],
    serviceDescriptions: [
      "Narasi, IA, wireframe, arah visual, sampai interface responsif yang siap dibangun.",
      "Build front-end yang cepat, accessible, punya motion, reusable, dan enak di-handoff.",
      "Detail kinetik buat hero, transisi, hover, loader, dan storytelling berbasis scroll tanpa bikin berat.",
      "Halaman produk, flow koleksi, merchandising, dan checkout yang lebih tenang buat naikin conversion.",
      "Arsitektur konten, sistem landing page, metadata, dan template editorial yang gampang diskalakan."
    ],
    serviceIncludesLabel: "Yang termasuk",
    serviceCta: "Mulai proyek",
    serviceClose: "Tutup",
    serviceAriaClose: "Tutup detail layanan",
    serviceDetails: [
      ["Desain website", "Sprint desain fokus buat brand yang butuh cerita lebih tajam, UX lebih bersih, dan sistem visual yang kuat buat dipakai lintas halaman.", ["Discovery dan positioning", "Information architecture", "Wireframe dan user flow", "Desain visual responsif", "Design system siap komponen"]],
      ["Front-end development", "Build interface siap produksi dengan motion, performa, aksesibilitas, dan logic komponen yang gampang dirawat.", ["HTML/CSS/JS responsif", "Pola komponen reusable", "Implementasi interaksi", "Tuning performa", "Audit aksesibilitas"]],
      ["Motion dan interaksi", "Detail motion yang bikin experience terasa hidup tanpa ganggu clarity, speed, atau conversion.", ["Loader dan page motion", "Hover dan cursor system", "Storytelling berbasis scroll", "Motion canvas/CSS", "Alternatif reduced-motion"]],
      ["Shopify dan konversi", "Flow commerce yang bantu produk lebih gampang dipahami, browsing lebih cepat, dan checkout lebih minim bocor.", ["Struktur halaman produk", "UX koleksi", "Modul merchandising", "Pembersihan alur checkout", "Ide eksperimen konversi"]],
      ["Sistem konten siap SEO", "Sistem editorial dan landing page yang bantu tim publish konsisten sambil tetap rapi di metadata, hierarchy, dan performa.", ["Arsitektur konten", "Template landing page", "Struktur metadata", "Pola internal linking", "Aturan komponen editorial"]]
    ],
    selectedCapability: "Kapabilitas pilihan",
    processTitle: "Cara kami jalan",
    processBody: "Ritme rapat dari taste sampai shipping.",
    process: [
      ["Cari sinyalnya", "Beresin offer, audiens, conversion path, dan momen yang layak dibuat memorable."],
      ["Bentuk sistemnya", "Rancang bahasa visual, logic komponen, dan aturan motion sebelum halaman diperbanyak."],
      ["Launch dengan grip", "Build, test, tuning performa, lalu handoff website yang bisa beneran dipakai tim."]
    ],
    metricsTitle: "Dibangun buat rasa percaya diri kreatif dan impact bisnis.",
    metricLabels: ["rata-rata engagement naik", "kualitas lead naik", "alur checkout lebih cepat", "prototype ke launch"],
    metricTicker: ["34% bounce rate", "20k sign up", "82% booking naik", "396% traffic naik", "113% sales naik", "37% conversion rate"],
    awardsTitle: "Craft siap dilirik. Sistem siap dipakai.",
    awards: ["x 8 honorable mentions", "x 9 UI / UX awards", "x 3 featured launches"],
    clientsSay: "Kata klien",
    quoteButtons: ["Sebelum", "Lanjut"],
    quotes: [
      ["Mereka bikin website kami punya karakter dan jalur jualannya jauh lebih bersih. Minggu pertama aja udah kerasa bedanya.", "Maya R., Founder / Akar Goods"],
      ["Cepat, thoughtful, dan tajam banget di detail. Rasanya kayak kerja bareng tim produk senior.", "Rafi D., Director / Ruang Nada"],
      ["Dari scroll pertama udah kerasa custom. Offer kami yang tadinya berantakan jadi langsung gampang dimengerti visitor.", "Nadia P., CMO / Selaras Lab"],
      ["Tim kami bisa lanjut rawat sistemnya setelah handoff. Website ini kerasa kayak product, bukan poster sekali pakai.", "Arman K., Product Lead / Kinora"]
    ],
    availabilityKicker: "Slot lagi dibuka",
    availabilityTitle: "Dua slot launch fokus kebuka buat Q3.",
    availabilityLink: ["Mulai brief", "Ceritain apa yang perlu digerakin."],
    contactKicker: "Kalau idenya udah siap, kami juga.",
    contactTitle: "Yuk bangun website yang bikin brand lu akhirnya kelihatan sebagus potensinya.",
    contactForm: {
      title: "Brief cepat",
      subtitle: "Kasih gambaran project-nya.",
      fields: ["Nama", "Email", "Tipe project", "Timeline", "Apa yang perlu digerakin?"],
      placeholders: ["Nama lu", "lu@brand.com", "Kasih konteks, target, atau satu paragraf mentah dulu juga boleh."],
      emptyOptions: ["Pilih satu", "Pilih satu"],
      types: ["Redesign website", "Brand site baru", "Build e-commerce", "Sistem motion"],
      timelines: ["2-4 minggu", "1-2 bulan", "Launch kuartal ini", "Masih dirapihin"],
      submit: "Kirim brief",
      success: "Draft WhatsApp kebuka. Kirim, nanti kami balas di sana."
    },
    footerKicker: "Xdigma Creative Studio",
    footerTitle: "Ngobrol yuk",
    footerHeadings: ["Studio", "Layanan", "Sosial"],
    footerStudio: ["Tentang", "Karya", "Layanan", "Kontak"],
    footerServices: ["Desain website", "Motion design", "Front-end development", "Sistem SEO"],
    newsletter: "Newsletter",
    newsletterPlaceholder: "Alamat email",
    newsletterJoin: "Gabung",
    newsletterSuccess: "Draft email kebuka. Kirim, nanti lu masuk list.",
    footerBottom: ["©2026 Xdigma Creative Studio", "Jakarta / Remote"],
    caseSelected: "Hasil utama",
    caseLabels: ["Tantangan", "Solusi"],
    caseMetaLabels: ["Timeline", "Peran", "Stack"],
    caseDeliverables: "Deliverables",
    caseCta: "Bikin yang kayak gini",
    caseClose: "Tutup",
    caseAriaClose: "Tutup studi kasus",
    caseAria: ["Buka studi kasus Selaras Lab", "Buka studi kasus Akar Goods", "Buka studi kasus Ruang Nada"],
    cases: [
      ["Selaras Lab", "Platform brand / Web app", "Platform brand yang lebih yakin, punya sistem konten siap produksi, landing page yang fokus conversion, dan pengalaman launch yang sinematik.", "engagement naik 68%", "Tim punya offer kuat, tapi belum punya sistem jelas buat ngubah cerita produk jadi landing page yang cepat dipahami visitor.", "Kami rapihin arsitektur brand, bikin modul cerita reusable, dan masukin momen motion yang bikin platform terasa yakin tanpa memperlambat aksi.", ["Narasi brand", "Sistem web responsif", "Modul landing siap CMS", "Arah motion launch"], "visual-one", "6 minggu", "Strategi, UX, UI, front-end", "HTML, CSS, JS, modul siap CMS"],
      ["Akar Goods", "E-commerce / Motion", "Flow belanja yang lebih cepat, storytelling produk lebih tajam, motion kategori yang halus, dan checkout yang lebih tenang.", "checkout 41% lebih cepat", "Halaman produk udah kaya visual, tapi jalur belinya masih terasa lambat, terutama di mobile.", "Kami tajamin hierarki produk, kurangin friksi keputusan, dan pakai motion ringan supaya kategori lebih gampang discan.", ["UX commerce", "Sistem halaman produk", "Alur koleksi", "Pembersihan checkout"], "visual-two", "4 minggu", "UX cleanup, motion, front-end", "Shopify flow, CSS motion, conversion UX"],
      ["Ruang Nada", "Editorial / UX", "Experience editorial yang bikin discovery berubah jadi deep reading lewat story page modular dan sistem publishing yang ringan.", "kualitas lead naik 3.1x", "Kontennya kuat, tapi pembaca sering drop sebelum sampai ke cerita berniat tinggi dan titik inquiry.", "Kami bentuk ritme baca yang lebih sinematik, entry point lebih jelas, dan sistem komponen editorial yang cepat dipakai tim publish.", ["UX editorial", "Template cerita", "Sistem interaksi", "Handoff publishing"], "visual-three", "5 minggu", "UX editorial, design system", "Template modular, aturan interaksi, docs handoff"]
    ]
  }};

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
  setIndexedText(".project-meta span", t.projectTypes);
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

  document.querySelectorAll(".project-card[data-case-title]").forEach((card, index) => {
    const item = t.cases[index];
    if (!item) return;
    card.dataset.caseTitle = item[0];
    card.dataset.caseType = item[1];
    card.dataset.caseCopy = item[2];
    card.dataset.caseResult = item[3];
    card.dataset.caseChallenge = item[4];
    card.dataset.caseSolution = item[5];
    card.dataset.caseDeliverables = JSON.stringify(item[6]);
    card.dataset.caseVisual = item[7];
    card.dataset.caseTimeline = item[8];
    card.dataset.caseRole = item[9];
    card.dataset.caseStack = item[10];
    card.dataset.cursor = lang === "id" ? "Lihat" : "View";
    card.setAttribute("aria-label", t.caseAria[index]);
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

  if (hasFinePointer && !shouldReduceRuntimeMotion) {
    parallaxElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = Math.max(-36, Math.min(36, center * -0.035));
      element.style.setProperty("--parallax-y", `${offset}px`);
    });
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
  caseModal.querySelector(".case-result strong").textContent = card.dataset.caseResult || "";
  caseModal.querySelector(".case-timeline").textContent = card.dataset.caseTimeline || "";
  caseModal.querySelector(".case-role").textContent = card.dataset.caseRole || "";
  caseModal.querySelector(".case-stack").textContent = card.dataset.caseStack || "";
  renderList(caseModal.querySelector(".case-deliverables ul"), deliverables);

  visual?.classList.remove("visual-one", "visual-two", "visual-three");
  if (card.dataset.caseVisual) visual?.classList.add(card.dataset.caseVisual);
  if (visualTitle) visualTitle.textContent = card.dataset.caseTitle || "";
}

function setupCaseModal() {
  if (!caseModal) return;

  const close = caseModal.querySelector(".case-close");
  const cards = document.querySelectorAll(".project-card[data-case-title]");

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

  cards.forEach((card) => {
    card.addEventListener("click", () => openCase(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCase(card);
      }
    });
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
setupMagneticCards();
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
updateScrollMotion();
resizeCanvas();
animate();
