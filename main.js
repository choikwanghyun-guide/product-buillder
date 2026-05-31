const numbersEl = document.querySelector('#numbers');
const bonusEl = document.querySelector('#bonusNumber');
const generateButton = document.querySelector('#generateButton');
const copyButton = document.querySelector('#copyButton');
const statusEl = document.querySelector('#status');
const themeToggle = document.querySelector('#themeToggle');

const THEME_KEY = 'lotto-theme';

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
  statusEl.textContent = '새 번호를 생성했습니다.';
}

async function copyNumbers() {
  const text = `로또 번호: ${currentNumbers.join(', ')} / 보너스: ${currentBonus}`;

  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = '번호를 클립보드에 복사했습니다.';
  } catch {
    statusEl.textContent = text;
  }
}

generateButton.addEventListener('click', generateLotto);
copyButton.addEventListener('click', copyNumbers);
themeToggle.addEventListener('click', toggleTheme);

initTheme();
generateLotto();
