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
  tagline: "I build web apps and backend systems.",
  intro:
    "A software developer working mostly in C++, Python and the MERN stack — end to end, from the data layer up to the interface, with a bias for things that stay fast and stay maintainable.",
  bio:
    "I like building things end to end, from the data layer up to the UI, and figuring out how to keep them fast and easy to maintain. Three internships, two peer-reviewed papers, and a habit of shipping. Currently a software engineer at HSBC.",
  email: "sandeeputhayakumar@gmail.com",
  github: "https://github.com/Sandeep2k5",
  linkedin: "https://www.linkedin.com/in/sandeep-uthayakumar-8b7242255/",
};

export const STATS = [
  { value: "2", label: "Peer-reviewed papers", sub: "IEEE · ScienceDirect" },
  { value: "3", label: "Engineering roles", sub: "Industry + research" },
  { value: "8+", label: "Languages & runtimes", sub: "C++ · Python · TS" },
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
    items: ["React", "Next.js", "Node.js", "Express", "FastAPI"],
  },
  {
    label: "Data & Tooling",
    items: ["MongoDB", "MySQL", "Git", "Docker", "PyTorch", "scikit-learn"],
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
    period: "2026 — Present",
    year: "2026",
    summary:
      "Backend services and full-stack tooling for internal banking platforms.",
    details: [
      "Building and supporting backend services and full-stack tooling used across internal banking platforms.",
      "Working across the stack with a focus on reliability, performance and clean system design.",
    ],
    tags: ["Backend", "Full-stack", "Reliability"],
  },
  {
    company: "VidyaInternHub",
    role: "Backend Developer Intern",
    kind: "Internship",
    period: "May 2025 — Jul 2025",
    year: "2025",
    summary: "CRM backend API — stability and response time.",
    details: [
      "Worked on a CRM system backend API to improve server-side stability and cut response time.",
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
      "Built a Python cryptocurrency wallet with blockchain integration and a PyQt5 GUI.",
      "Implemented account creation, balance viewing and signed transaction flows.",
    ],
    tags: ["Python", "Blockchain", "PyQt5"],
  },
];

export const PROJECTS = [
  {
    n: "01",
    title: "Cryptocurrency Wallet Simulation",
    universe: "EARTH-1610",
    blurb:
      "A Python wallet with live blockchain integration and a PyQt5 desktop client — account creation, balances and cryptographically signed transactions.",
    skills: ["Python", "Blockchain", "Web3", "PyQt5"],
    source: "https://github.com/Sandeep2k5/Cryptocurreny-Wallet",
    accent: "cyan",
  },
  {
    n: "02",
    title: "Android Malware Detection & Family Prediction",
    universe: "EARTH-616",
    blurb:
      "A CNN-LSTM and Random Forest pipeline that classifies APK malware and predicts its family. Peer-reviewed and published in IEEE Access.",
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
      "A conversational study assistant — React front end, FastAPI service layer and an LLM-backed conversation engine with streamed responses.",
    skills: ["React", "FastAPI", "Python", "LLM"],
    source: "https://github.com/ClassicBSK/Studentgpt",
    accent: "magenta",
  },
];

export const PUBLICATIONS = [
  {
    title:
      "APK Malware Detection and Family Prediction Using CNN-LSTM and RF Classifiers",
    journal: "IEEE Access",
    year: "2025",
    kind: "Journal",
    blurb:
      "A hybrid deep-learning and ensemble approach to classifying Android malware and attributing it to a known family.",
    source: "https://ieeexplore.ieee.org/Xplore/home.jsp",
  },
  {
    title: "Multi-Head Attention Transformer for Text-to-Text Translation",
    journal: "ScienceDirect",
    year: "2025",
    kind: "Procedia",
    blurb:
      "A transformer architecture study on multi-head attention for sequence-to-sequence translation quality.",
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
