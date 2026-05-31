const numbersEl = document.querySelector('#numbers');
const bonusEl = document.querySelector('#bonusNumber');
const generateButton = document.querySelector('#generateButton');
const copyButton = document.querySelector('#copyButton');
const statusEl = document.querySelector('#status');
const themeToggle = document.querySelector('#themeToggle');
const langToggle = document.querySelector('#langToggle');
const pageTitle = document.querySelector('#page-title');
const introDesc = document.querySelector('#intro-desc');
const bonusLabel = document.querySelector('#bonus-label');

const THEME_KEY = 'lotto-theme';
const LANG_KEY = 'lotto-lang';

const translations = {
  ko: {
    title: '로또 번호 생성기',
    heading: '로또 번호 생성기',
    description: '1부터 45까지 중복 없이 6개 번호를 뽑고, 보너스 번호 1개를 함께 생성합니다.',
    numbersAria: '생성된 로또 번호',
    bonusLabel: '보너스',
    generate: '번호 생성',
    copy: '복사',
    themeAria: '테마 전환',
    langLabel: 'EN',
    langAria: 'Switch to English',
    generated: '새 번호를 생성했습니다.',
    copied: '번호를 클립보드에 복사했습니다.',
    copyText: (nums, bonus) => `로또 번호: ${nums} / 보너스: ${bonus}`,
  },
  en: {
    title: 'Lotto Number Generator',
    heading: 'Lotto Number Generator',
    description: 'Draws 6 unique numbers from 1 to 45, plus one bonus number.',
    numbersAria: 'Generated lotto numbers',
    bonusLabel: 'Bonus',
    generate: 'Generate',
    copy: 'Copy',
    themeAria: 'Toggle theme',
    langLabel: '한',
    langAria: '한국어로 전환',
    generated: 'Generated a new set of numbers.',
    copied: 'Copied numbers to the clipboard.',
    copyText: (nums, bonus) => `Lotto numbers: ${nums} / Bonus: ${bonus}`,
  },
};

let currentLang = 'ko';
let statusKey = null;

function t() {
  return translations[currentLang];
}

function renderStatus() {
  if (!statusKey) {
    statusEl.textContent = '';
  } else if (statusKey === 'copyFallback') {
    statusEl.textContent = t().copyText(currentNumbers.join(', '), currentBonus);
  } else {
    statusEl.textContent = t()[statusKey];
  }
}

function applyLang(lang) {
  currentLang = translations[lang] ? lang : 'ko';
  const text = t();

  document.documentElement.lang = currentLang;
  document.title = text.title;
  pageTitle.textContent = text.heading;
  introDesc.textContent = text.description;
  numbersEl.setAttribute('aria-label', text.numbersAria);
  bonusLabel.textContent = text.bonusLabel;
  generateButton.textContent = text.generate;
  copyButton.textContent = text.copy;
  themeToggle.setAttribute('aria-label', text.themeAria);
  langToggle.textContent = text.langLabel;
  langToggle.setAttribute('aria-label', text.langAria);

  renderStatus();
}

function initLang() {
  const saved = localStorage.getItem(LANG_KEY);
  const prefersEn = (navigator.language || '').toLowerCase().startsWith('en');
  applyLang(saved ?? (prefersEn ? 'en' : 'ko'));
}

function toggleLang() {
  const next = currentLang === 'ko' ? 'en' : 'ko';
  applyLang(next);
  localStorage.setItem(LANG_KEY, next);
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ?? (prefersDark ? 'dark' : 'light'));
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

let currentNumbers = [];
let currentBonus = null;

function getBallClass(number) {
  if (number <= 10) return 'range-1';
  if (number <= 20) return 'range-2';
  if (number <= 30) return 'range-3';
  if (number <= 40) return 'range-4';
  return 'range-5';
}

function drawNumbers() {
  const pool = Array.from({ length: 45 }, (_, index) => index + 1);
  const picked = [];

  while (picked.length < 7) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const [number] = pool.splice(randomIndex, 1);
    picked.push(number);
  }

  currentNumbers = picked.slice(0, 6).sort((a, b) => a - b);
  currentBonus = picked[6];
}

function renderNumbers() {
  numbersEl.replaceChildren(
    ...currentNumbers.map((number) => {
      const ball = document.createElement('strong');
      ball.className = `ball ${getBallClass(number)}`;
      ball.textContent = number;
      return ball;
    })
  );

  bonusEl.className = `ball bonus ${getBallClass(currentBonus)}`;
  bonusEl.textContent = currentBonus;
}

function generateLotto() {
  drawNumbers();
  renderNumbers();
  statusKey = 'generated';
  renderStatus();
}

async function copyNumbers() {
  const text = t().copyText(currentNumbers.join(', '), currentBonus);

  try {
    await navigator.clipboard.writeText(text);
    statusKey = 'copied';
  } catch {
    statusKey = 'copyFallback';
  }
  renderStatus();
}

generateButton.addEventListener('click', generateLotto);
copyButton.addEventListener('click', copyNumbers);
themeToggle.addEventListener('click', toggleTheme);
langToggle.addEventListener('click', toggleLang);

initTheme();
initLang();
generateLotto();
