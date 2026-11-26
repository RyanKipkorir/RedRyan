const SECTION_IDS = {
  home: "hero",
  about: "story",
  projects: "work",
  contact: "contact",
};

const navLinks = [
  {
    id: SECTION_IDS.home,
    title: "Home",
  },
  {
    id: SECTION_IDS.about,
    title: "About",
  },
  {
    id: SECTION_IDS.projects,
    title: "Projects",
  },
  {
    id: SECTION_IDS.contact,
    title: "Contact",
  },
];

const NAV_ANIMATION = {
  open: 0.9,
  close: 0.65,
  rise: [0.9, 0.07],
  tilt: 6,
  nudge: 16,
};

const NAV_FOOT = [
  { label: "GitHub", href: "https://github.com/redlitelighter" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle" },
  { label: "X", href: "https://x.com/your-handle" },
];

const HERO_PROFILE = {
  handle: "@RedRedRyan",
  github: "https://github.com/RyanKipkorir",
  email: "ryan@ystudios.co.ke",
  location: "Nairobi, KE",
};

const HERO_STATEMENT = "Defining is limiting, but here is what I do";
const HERO_SERVICES = [
  { n: "01", label: "UI/UX" },
  { n: "02", label: "Game Dev" },
  { n: "03", label: "Breathe AIR, Write Scripts" },
];
const HERO_ACTIONS = [
  { label: "My work", href: `#${SECTION_IDS.projects}`, tone: "red" },
  { label: "Who is Ryan?", href: `#${SECTION_IDS.about}`, tone: "white" },
];
const HERO_RED_LETTERS = ["H", "E", "L", "L", "0"];
const HERO_RYAN_LETTERS = ["W", "0", "R", "L", "D"];
const HERO_SCRAMBLE_CHARS = "01<>/\\{}[]=+*#%&?ΣπΔ∫";

const STORY_STARTED_YEAR = 2022;
const STORY_FLOW = [
  "make games on Unity.",
  "animate websites.",
  "write scripts.",
  "study cryptography.",
  "build trading platforms.",
  "put markets on a blockchain.",
  "love and hate the structures and first principles of math.",
];
const STORY_TOOLS = [
  { group: "Languages", items: ["JavaScript", "TypeScript", "HTML & CSS"] },
  {
    group: "Frameworks",
    items: [
      "React",
      "React Native",
      "Expo",
      "Tailwind CSS",
      "NativeWind",
      "Vite",
      "GSAP",
    ],
  },
  { group: "Software", items: ["Git & GitHub", "Vercel", "Hedera"] },
];
const STORY_BAR_COUNT = 100;

const GITHUB = "https://github.com/RedRedRyan";
const PROJECT_LAB = [
  { title: "Unity games", text: "Prototypes and playable worlds." },
  {
    title: "Math visualizations",
    text: "Curves, surfaces and things that move.",
  },
  { title: "Web3 experiments", text: "Onchain ideas, tested in public." },
];
const PROJECT_FINALE_TITLE = ["That’s", "the", "reel."];
const PROJECT_BAND_COUNT = 8;
const PROJECTS = [
  {
    id: "ystudios",
    name: "YStudios",
    kind: "Software & film studio",
    blurb: "A software and film studio, co-founded with alumni from MMU.",
    tags: ["Software", "Film", "Music"],
    url: "https://www.ystudios.co.ke/",
    image: "/images/ystudios.jpg",
  },
  {
    id: "nbx",
    name: "NBX",
    kind: "Tokenizing equities & bonds",
    blurb:
      "A platform tokenizing equities and bonds on Hedera.Incubated by The NSE",
    tags: ["Web3", "Fintech", "Tokenization"],
    url: "https://www.nbx-exchange.co.ke/",
    image: "/images/nbx.jpg",
  },
  {
    id: "ndimi",
    name: "Ndimi AI",
    kind: "Every African Language Understood",
    blurb:
      "Ndimi, meaning “tongues” in Swahili, is an app designed to bridge multiple languages",
    tags: ["AI", "Translation"],
    url: "https://ndimilanding-jjfm.vercel.app/",
    image: "/images/ndimi.jpg",
  },
  {
    id: "monstertrux",
    name: "MonsterTrux",
    kind: "Explore & race · Polygon",
    blurb:
      "Explore and race to Monsterlands. A web3 game experience built on Polygon.",
    tags: ["Web3", "Polygon", "Game"],
    url: "https://monstertrux.vercel.app/",
    image: "/images/monster.jpg",
  },
  {
    id: "redkeep",
    name: "RedKeep",
    kind: "Notebook app · Landing page",
    blurb:
      "A notebook app, designed and developed with secrecy at its core with dissappearing messages.",
    tags: ["Landing page", "React", "GSAP"],
    url: "https://redkeep.lewiseman.com/",
    image: "/images/redkeep.jpg",
  },
];

const CONTACT_TOPPLE_ANGLE = 66;
const CONTACT_SOCIALS = [
  {
    label: "X",
    href: "https://x.com/your-handle",
    icon: "/images/socials/x.png",
    from: { y: 10 },
    nudge: { x: -6, y: -6 },
  },
  {
    label: "Discord",
    href: "https://discord.com",
    icon: "/images/socials/discord.png",
    from: { x: -10 },
    nudge: { x: 6, y: -6 },
  },
  {
    label: "Telegram",
    href: "https://t.me/your-handle",
    icon: "/images/socials/telegram.png",
    from: { x: 10 },
    nudge: { x: 6, y: 6 },
  },
];

export {
  SECTION_IDS,
  navLinks,
  NAV_ANIMATION,
  NAV_FOOT,
  HERO_PROFILE,
  HERO_STATEMENT,
  HERO_SERVICES,
  HERO_ACTIONS,
  HERO_RED_LETTERS,
  HERO_RYAN_LETTERS,
  HERO_SCRAMBLE_CHARS,
  STORY_STARTED_YEAR,
  STORY_FLOW,
  STORY_TOOLS,
  STORY_BAR_COUNT,
  GITHUB,
  PROJECT_LAB,
  PROJECT_FINALE_TITLE,
  PROJECT_BAND_COUNT,
  PROJECTS,
  CONTACT_TOPPLE_ANGLE,
  CONTACT_SOCIALS,
};
