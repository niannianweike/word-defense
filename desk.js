const desk = document.querySelector('.desk');
const bookDialog = document.querySelector('#book-dialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const editionPicker = document.querySelector('#edition-picker');
const booksGrid = document.querySelector('#books-grid');
const editionBanner = document.querySelector('#edition-banner');
const deskInstruction = document.querySelector('#desk-instruction');
const deskFooter = document.querySelector('.desk-footer');
const switchEditionBtn = document.querySelector('#switch-edition');
const LAST_ED_KEY = 'word-defense-last-ed';

if (window.BOOKS && (!window.BOOKS_BY_EDITION || !window.BOOKS_BY_EDITION.pep)) {
  window.BOOKS_BY_EDITION = window.BOOKS_BY_EDITION || {};
  window.BOOKS_BY_EDITION.pep = window.BOOKS;
}

const legacyVolumes = new Map();
for (const vol of document.querySelectorAll('.fallback .unit-volume')) {
  legacyVolumes.set(vol.id, vol);
}

let currentEdition = null;

function getLastEditionId() {
  try { return localStorage.getItem(LAST_ED_KEY) || ''; } catch (e) { return ''; }
}
function setLastEditionId(id) {
  try { localStorage.setItem(LAST_ED_KEY, id); } catch (e) {}
}

function editionStats(ed) {
  const books = (window.BOOKS_BY_EDITION && window.BOOKS_BY_EDITION[ed.id]) || [];
  const readyBooks = books.filter(b => (b.units || []).length > 0).length;
  const totalUnits = books.reduce((s, b) => s + (b.units || []).length, 0);
  return { books, readyBooks, totalUnits };
}

function renderEditionPicker() {
  const lastId = getLastEditionId();
  editionPicker.innerHTML = '';
  for (const ed of (window.EDITIONS || [])) {
    const { readyBooks, totalUnits } = editionStats(ed);
    const available = totalUnits > 0;
    const isLast = available && lastId === ed.id;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'edition-card';
    btn.style.setProperty('--ed-color', ed.accent || '#327160');
    btn.disabled = !available;
    btn.innerHTML =
      '<div class="edition-card-top">' +
        '<span class="edition-card-en">English · 3–6</span>' +
        (available
          ? (isLast ? '<span class="edition-badge">上次使用 · 续接进度</span>' : '<span class="edition-badge">' + totalUnits + ' 单元</span>')
          : '<span class="edition-badge soon">筹备中</span>') +
      '</div>' +
      '<strong>' + ed.name + '</strong>' +
      '<small>' + (available ? ('三至六年级 · ' + readyBooks + ' 册 ' + totalUnits + ' 个单元') : (ed.desc + ' · 即将上线')) + '</small>' +
      '<span class="edition-card-go">' + (available ? '进入选课本 →' : '制作中') + '</span>';
    btn.addEventListener('click', () => selectEdition(ed.id));
    editionPicker.appendChild(btn);
  }
}

function showEditionPicker() {
  currentEdition = null;
  if (bookDialog.open) bookDialog.close();
  renderEditionPicker();
  editionPicker.hidden = false;
  booksGrid.hidden = true;
  switchEditionBtn.hidden = true;
  editionBanner.textContent = '小学英语 · 单词对战';
  deskInstruction.textContent = '请先选择教材版本';
  deskFooter.textContent = '人教 PEP · 冀教版 · 北师大版（三至六年级）';
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
}

function selectEdition(edId) {
  const ed = (window.EDITIONS || []).find(e => e.id === edId);
  if (!ed) return;
  const { books, readyBooks, totalUnits } = editionStats(ed);
  if (!totalUnits) return;
  currentEdition = ed;
  setLastEditionId(ed.id);
  try { sessionStorage.setItem('wd-session-ed', ed.id); } catch (e) {}

  editionPicker.hidden = true;
  booksGrid.hidden = false;
  switchEditionBtn.hidden = false;
  editionBanner.textContent = ed.fullName;
  deskInstruction.textContent = '选一本课本翻开，再挑一个单元';
  deskFooter.textContent = ed.name + ' · 三至六年级 · ' + readyBooks + ' 册 ' + totalUnits + ' 个单元';

  for (const bookBtn of document.querySelectorAll('.volume-book')) {
    const seriesEl = bookBtn.querySelector('.book-series');
    if (seriesEl) seriesEl.textContent = ed.bookSeries;
    const bid = window.VOLUME_BOOK_IDS[bookBtn.dataset.volume];
    const bObj = books.find(b => b.id === bid);
    const hasUnits = !!(bObj && bObj.units && bObj.units.length);
    bookBtn.classList.toggle('empty-book', !hasUnits);
  }
}

function buildDynamicVolume(ed, book) {
  const sec = document.createElement('section');
  sec.className = 'unit-volume';
  const h3 = document.createElement('h3');
  h3.textContent = book ? book.name : '';
  sec.appendChild(h3);
  const units = (book && book.units) || [];
  const note = document.createElement('p');
  note.className = 'edition-note';
  note.textContent = units.length
    ? ((book.note ? book.note + ' · ' : '') + units.length + ' 个单元已就绪')
    : ((book && book.note) || '筹备中');
  sec.appendChild(note);

  if (!units.length) {
    const empty = document.createElement('p');
    empty.className = 'volume-empty';
    empty.textContent = '这一册正在整理中，很快上线。';
    sec.appendChild(empty);
    return sec;
  }

  const list = document.createElement('div');
  list.className = 'unit-links';
  for (const u of units) {
    const battle = u.words.filter(w => !w.learnOnly).length;
    const extra = u.words.length - battle;
    const a = document.createElement('a');
    a.className = 'card';
    a.href = 'play.html?ed=' + encodeURIComponent(ed.id) +
      '&book=' + encodeURIComponent(book.id) +
      '&unit=u' + encodeURIComponent(u.no);
    a.innerHTML =
      '<div class="no">' + u.no + '</div>' +
      '<div class="nm"><b>Unit ' + u.no + '</b> ' + u.en +
      '<small>' + u.zh + ' · ' + battle + ' 个词' + (extra ? ' + ' + extra + ' 个认读词' : '') + '</small></div>' +
      '<div class="go">开始 ▶</div>';
    list.appendChild(a);
  }
  sec.appendChild(list);

  const whole = document.createElement('p');
  whole.className = 'whole';
  whole.innerHTML = '<a href="play.html?ed=' + encodeURIComponent(ed.id) + '&book=' + encodeURIComponent(book.id) + '">整册版：选全部单元 + 全册大混战</a>';
  sec.appendChild(whole);
  return sec;
}

switchEditionBtn.addEventListener('click', showEditionPicker);

for (const book of document.querySelectorAll('.volume-book')) {
  book.addEventListener('click', () => {
    if (!currentEdition) return;
    const volId = book.dataset.volume;
    const volumesBox = bookDialog.querySelector('.volumes');
    let sectionEl = null;
    if (currentEdition.id === 'pep' && legacyVolumes.has(volId)) {
      sectionEl = legacyVolumes.get(volId);
      sectionEl.hidden = false;
    } else {
      const bid = window.VOLUME_BOOK_IDS[volId];
      const books = (window.BOOKS_BY_EDITION && window.BOOKS_BY_EDITION[currentEdition.id]) || [];
      const bObj = books.find(b => b.id === bid);
      sectionEl = buildDynamicVolume(currentEdition, bObj);
    }
    volumesBox.replaceChildren(sectionEl);
    bookDialog.style.setProperty('--book-color', book.style.getPropertyValue('--book'));
    const titleEl = sectionEl.querySelector('h3');
    bookDialog.querySelector('#current-volume').textContent = (currentEdition.name + ' · ') + (titleEl ? titleEl.textContent : book.getAttribute('aria-label'));
    if (!bubble.hidden) closeBubble(false);
    bookDialog.showModal();
    bookDialog.querySelector('.book-close').focus({ preventScroll: true });
  });
}

bookDialog.addEventListener('click', (event) => {
  if (event.target === bookDialog) bookDialog.close();
});

const pea = document.querySelector('#pea');
const bubble = document.querySelector('#pea-guide');
const audio = document.querySelector('#pea-audio');
const letters = document.querySelector('#pea-letters');
const line = document.querySelector('#pea-line');
const play = document.querySelector('#pea-play');
const cues = [
  [0, 'ABC', '你好呀，我是小豌豆！选一本英语课本，再挑一个单元。'],
  [6.23, 'APPLE', '僵尸举着英文单词走来了！'],
  [9.13, 'APPLE', '点传送带上的图片卡，听听单词怎么读。'],
  [13.92, 'APPLE', '找到对应的图片卡，拖到僵尸那一行的空地上。'],
  [20.81, 'MATCH', '射手会自动开火。单词对上，两枪打倒僵尸！'],
  [26.33, 'OOPS', '选错会让僵尸加速。每行的小车只能救急一次。'],
  [32.46, 'GO', '小车用完后，再有僵尸冲进来，这局就输了。'],
  [37.21, 'GO', '准备好了？选个单元开始吧！'],
];
// Mouth openings measured from the narration at 20 samples per second, including pauses.
const mouthFrames = atob('AAAAAAAMJCQVJCQkJCQkJAgAAAAAAAojGw0NGAwMGQ8YJCQQDiQkJAoAAAAAAAAAAAAAAAAdJBkPCwsiJBoOEBIQJBMaGRQSFxYADRgkJAAcGyQkDwAAAAAAABIZGAwAECQkJBITCCQkJCQkGA0kJCQkCAAAAAAAAAAAAAAAICQeExANDREbJAAZJBkACA8SDiQVHBwQGSQiDCQkIQoAABskCwokFA0AEiQkJCQkJCAAAAgAAAAKHyQVEBATCSQkJCQAChckJAoUJBgMJCQkDh8kEiQKCAsYCRgkJAoPEiQkJBYAAAAAAAANECQXEQ4JAAsRCgoJJCQjCQAAAA8JJBwAEhQfJBYkJB0NAAkAAAAAAAAAAAAAJCAcGg8kJCQhAAwkJAAdJBsODAwaCyQkJAsAAA8YExUkHR0YEAkkJAAIDiMJACQkJAgLEBMUJCQLAAAAAAAAAAAiJB4WCBAkJAAJIyQkJCQkJA8AJCQXDQsMGCETABMiGAAkJCQQJCQkERIQDCQXCyQdAAkVEQ0LChgVHiQaFhQkJBkAAAAAAAAICg4kJB8RCiIkJCQNACQgFAAAJCQeDCQkDAsWJCQkCggeJCQkAAAAAAAAAAAkJB0KAAoWCSAfGBQkJCQNAAAAAAAQHSQcCgwJAAkkJAwSABokJBwkCyQkJA4kJBkQJCQkAAAAAAAAAAAAAAAAAAkcJCQfCw0SCQ4kJBEKChYkJCQVAAAAAAAAGyQaCg0NDRUkJBAUJCIAGg4AGCQkJAAAJCQWCQAAAAAAAAAAESQcGhQPFB0SGB0JGCQkGgkOEiQkJBUAAAAAChIdCxUXDAsAJCQWAAgYHhcQDyIkAAAkJCQRAAAAAAAAAAAAABoTEw0LESQkGiQhJCQkIQkkJCQeAAAAAAAAHCQkIiEeJB4JFSQbDQsUEwsVGQoNESMkJCQkJAoAAAAAAAsZJCQAABMcCCQfDggJJCQkJCQkDgAAAAAAAAAAAAAAACQkDiQkECIkJCQkJCQAAAAACBcbFAkTHxANDggkJBkkJBYTJCQLJCQkDQAAAAAAAAAAAAAAAAAAAAAAAAAA');
let activeCue = -1;
let frame = 0;

function updateBubble() {
  let next = cues.length - 1;
  while (next > 0 && audio.currentTime < cues[next][0]) next--;
  if (next === activeCue) return;
  activeCue = next;
  const [, word, text] = cues[next];
  if (letters.textContent !== word) {
    letters.replaceChildren(...Array.from(word, (letter, index) => {
      const tile = document.createElement('span');
      tile.textContent = letter;
      tile.style.setProperty('--i', index);
      return tile;
    }));
    letters.setAttribute('aria-label', word);
  }
  line.textContent = text;
}

function closeMouth() {
  cancelAnimationFrame(frame);
  pea.removeAttribute('data-mouth-open');
}

function speak() {
  updateBubble();
  const opening = reducedMotion.matches ? 0 : (mouthFrames.charCodeAt(Math.floor(audio.currentTime * 20)) || 0);
  pea.toggleAttribute('data-mouth-open', opening > 0);
  pea.style.setProperty('--mouth', opening / 32);
  frame = requestAnimationFrame(speak);
}

function playNarration(restart = false) {
  if (restart) {
    audio.currentTime = 0;
    activeCue = -1;
    updateBubble();
  }
  audio.play().catch(() => {
    if (bubble.hidden || !audio.paused) return;
    line.textContent = '点播放，再听小豌豆讲玩法。';
    play.textContent = '播放';
  });
}

function closeBubble(restoreFocus = true) {
  bubble.hidden = true;
  pea.setAttribute('aria-expanded', 'false');
  audio.pause();
  closeMouth();
  if (restoreFocus) pea.focus({ preventScroll: true });
}

pea.addEventListener('click', () => {
  if (!bubble.hidden) {
    closeBubble();
    return;
  }
  bubble.hidden = false;
  pea.setAttribute('aria-expanded', 'true');
  playNarration(true);
});

document.querySelector('#pea-close').addEventListener('click', () => closeBubble());
desk.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !bubble.hidden) closeBubble();
});
play.addEventListener('click', () => {
  if (audio.paused) playNarration(audio.ended || audio.currentTime === 0);
  else audio.pause();
});
audio.addEventListener('playing', () => {
  closeMouth();
  activeCue = -1;
  play.textContent = '暂停';
  speak();
});
audio.addEventListener('waiting', closeMouth);
audio.addEventListener('timeupdate', updateBubble);
audio.addEventListener('pause', () => {
  closeMouth();
  play.textContent = audio.ended ? '再听一遍' : '继续';
});
audio.addEventListener('ended', () => {
  closeMouth();
  play.textContent = '再听一遍';
});

function resetView() {
  desk.style.setProperty('--pan-x', '0px');
  desk.style.setProperty('--pan-y', '0px');
}

desk.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
  const rect = desk.getBoundingClientRect();
  desk.style.setProperty('--pan-x', ((event.clientX - rect.left) / rect.width - .5) * 22 + 'px');
  desk.style.setProperty('--pan-y', ((event.clientY - rect.top) / rect.height - .5) * 16 + 'px');
});
desk.addEventListener('pointerleave', resetView);
reducedMotion.addEventListener('change', resetView);
document.body.classList.add('desk-ready');

// 每次直接进首页都要先选版本；只有从单元页点「← 换一个单元」返回时才自动展开该册
const rawHash = location.hash.slice(1);
let returnEd = '', returnVol = '';
if (/^volume-[0-3]-[01]$/.test(rawHash)) {
  returnEd = 'pep';
  returnVol = rawHash;
} else if (rawHash.startsWith('ed=')) {
  const hp = new URLSearchParams(rawHash);
  returnEd = hp.get('ed') || '';
  returnVol = hp.get('vol') || '';
}
const sessionEd = (() => { try { return sessionStorage.getItem('wd-session-ed') || ''; } catch (e) { return ''; } })();

if (returnVol && returnEd && (sessionEd === returnEd || returnEd === 'pep')) {
  selectEdition(returnEd);
  if (/^volume-[0-3]-[01]$/.test(returnVol)) {
    document.querySelector('.volume-book[data-volume="' + returnVol + '"]')?.click();
  }
} else {
  showEditionPicker();
}
