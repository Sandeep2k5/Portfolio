/**
 * Single source of truth for every piece of copy on the site.
 * Sections carry their own "issue number" + comic title so the
 * WebGL rig and the DOM stay in sync (see three/SpiderVerse.js CHAPTERS).
 */

export const PROFILE = {
  name: "Sandeep Uthayakumar",
  first: "SANDEEP",
  last: "UTHAYAKUMAR",
  alias: "Software Engineer",
  now: "Software Engineer @ HSBC",
  location: "India",
  tagline: "I build trading floor systems and backend services.",
  intro:
    "A software engineer on HSBC's trading floor systems and the Verint compliance platform, with a background in backend API development, full-stack web engineering and applied deep learning.",
  bio:
    "I like building things end to end, from the data layer up to the UI, and figuring out how to keep them fast and easy to maintain. Currently a software engineer at HSBC, on trading floor applications for front-office desks and the Verint compliance platform. Two internships, a research posting, two peer-reviewed papers, and a habit of shipping measurable performance gains.",
  email: "sandeeputhayakumar@gmail.com",
  github: "https://github.com/Sandeep2k5",
  linkedin: "https://www.linkedin.com/in/sandeep-uthayakumar-8b7242255/",
};

export const STATS = [
  { value: "2", label: "Peer-reviewed papers", sub: "IEEE · ScienceDirect" },
  { value: "3", label: "Engineering roles", sub: "Industry + research" },
  { value: "8+", label: "Languages & runtimes", sub: "C++ · Python · JS" },
];

export const SECTIONS = [
  { id: "origin", issue: "00", label: "Origin", title: "ORIGIN" },
  { id: "mask", issue: "01", label: "The Mask", title: "THE MASK" },
  { id: "missions", issue: "02", label: "Mission Log", title: "MISSION LOG" },
  { id: "multiverse", issue: "03", label: "Multiverse", title: "MULTIVERSE" },
  { id: "bugle", issue: "04", label: "The Bugle", title: "THE BUGLE" },
  { id: "signal", issue: "05", label: "Signal", title: "SIGNAL" },
];

export const STACK = [
  {
    label: "Languages",
    items: ["C", "C++", "Python", "JavaScript", "TypeScript", "SQL"],
  },
  {
    label: "Frameworks",
    items: ["React", "Next.js", "Node.js", "Express", "Angular", "FastAPI"],
  },
  {
    label: "Data & Tooling",
    items: [
      "MongoDB",
      "MySQL",
      "Git",
      "Docker",
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
    ],
  },
];

export const TRAITS = [
  { k: "Bias", v: "Ship it, then make it fast" },
  { k: "Depth", v: "Systems + ML research" },
  { k: "Range", v: "Data layer to pixel" },
];

export const EXPERIENCE = [
  {
    company: "HSBC",
    role: "Software Engineer",
    kind: "Full-time",
    period: "Jul 2026 — Present",
    year: "2026",
    summary: "Trading floor systems and the Verint compliance platform.",
    details: [
      "Develop and support trading floor applications for front-office desks, holding availability of latency-sensitive systems through market hours.",
      "Work across the Verint compliance platform on workforce management and analytics, including integration and migration work inside the trading environment.",
    ],
    tags: ["Trading Systems", "Verint", "Full-stack"],
  },
  {
    company: "VidyaInternaHub",
    role: "Backend Developer Intern",
    kind: "Internship",
    period: "May 2025 — Jul 2025",
    year: "2025",
    summary: "CRM backend APIs — stability and response time.",
    details: [
      "Re-engineered CRM backend APIs to improve server-side stability, cutting average response time by 70%.",
      "Optimised request handling so the service sustained roughly 75,000 requests per hour without degradation.",
    ],
    tags: ["Node.js", "REST", "Performance"],
  },
  {
    company: "NIT Puducherry",
    role: "Research Intern",
    kind: "Research",
    period: "Sep 2023 — Dec 2023",
    year: "2023",
    summary: "Blockchain wallet research and a working desktop client.",
    details: [
      "Built a Python cryptocurrency wallet with blockchain integration and a PyQt5 desktop GUI.",
      "Implemented the core ledger and proof-of-work transaction validation behind account creation, balance viewing and transfers.",
    ],
    tags: ["Python", "Blockchain", "PyQt5"],
  },
];

export const PROJECTS = [
  {
    n: "01",
    title: "Sicko Shoe Store",
    universe: "EARTH-2099",
    blurb:
      "A responsive, SEO-optimised storefront built on Next.js server-side rendering, with dynamic product listings and interactive filtering and sorting.",
    skills: ["Next.js", "React", "Tailwind CSS", "SSR"],
    source: "https://github.com/sand42446-dev/nextjs-e-commerce-platform",
    accent: "amber",
  },
  {
    n: "02",
    title: "Android Malware Detection & Family Prediction",
    universe: "EARTH-616",
    blurb:
      "A hybrid CNN-LSTM and Random Forest pipeline that classifies APK malware and predicts its family, reaching a 99.98% F1-score. Peer-reviewed and published through IEEE.",
    skills: ["Python", "Deep Learning", "CNN-LSTM", "scikit-learn"],
    source:
      "https://github.com/Sandeep2k5/Artificial-Intelligence-Model-for-Android-Malware-Detection",
    accent: "red",
  },
  {
    n: "03",
    title: "Student-GPT",
    universe: "EARTH-928",
    blurb:
      "A Transformer trained to answer Data Structures & Algorithms questions in natural language, served through a React front end and a FastAPI service layer.",
    skills: ["React", "FastAPI", "PyTorch", "Transformers"],
    source: "https://github.com/ClassicBSK/Studentgpt",
    accent: "magenta",
  },
  {
    n: "04",
    title: "Cryptocurrency Wallet Simulation",
    universe: "EARTH-1610",
    blurb:
      "A Python wallet with live blockchain integration and a PyQt5 desktop client — account creation, balances and proof-of-work validated transactions.",
    skills: ["Python", "Blockchain", "Web3", "PyQt5"],
    source: "https://github.com/Sandeep2k5/Cryptocurreny-Wallet",
    accent: "cyan",
  },
];

export const PUBLICATIONS = [
  {
    title:
      "APK Malware Detection and Family Prediction Using CNN-LSTM and RF Classifiers",
    journal: "IEEE",
    year: "2025",
    kind: "16th ICCCNT",
    blurb:
      "Reshapes 215 static features into a 43×5 matrix — CNN layers extract spatial features, LSTM layers capture sequential patterns — reporting a 99.98% F1-score against existing benchmark models.",
    source: "https://ieeexplore.ieee.org/Xplore/home.jsp",
  },
  {
    title: "Multi-Head Attention Transformer for Text-to-Text Translation",
    journal: "ScienceDirect",
    year: "2025",
    kind: "Procedia",
    blurb:
      "A multi-head attention Transformer for English-to-Tamil translation, achieving a 40% improvement in translation accuracy over the baseline.",
    source:
      "https://www.sciencedirect.com/science/article/pii/S1877050925015509",
  },
];

export const LINKS = [
  {
    label: "Email",
    value: "sandeeputhayakumar@gmail.com",
    href: `mailto:${PROFILE.email}`,
    icon: "mail",
  },
  {
    label: "LinkedIn",
    value: "in/sandeep-uthayakumar",
    href: PROFILE.linkedin,
    icon: "linkedin",
  },
  {
    label: "GitHub",
    value: "@Sandeep2k5",
    href: PROFILE.github,
    icon: "github",
  },
];
