/* 教材版本清单（方案 A：引擎、图标、配音全共享，词表按版本拆分） */
window.EDITIONS = [
  {
    id: 'pep',
    name: '人教 PEP',
    fullName: '人教 PEP · 小学英语',
    bookSeries: '小学英语 · PEP',
    desc: '三至六年级 · 8 册',
    accent: '#327160',
    wordsFile: 'words.js',
    ready: true
  },
  {
    id: 'jj',
    name: '冀教版',
    fullName: '冀教版 · 小学英语（三年级起点）',
    bookSeries: '小学英语 · 冀教版',
    desc: '三至六年级 · 8 册',
    accent: '#39627e',
    wordsFile: 'words-jj.js',
    ready: true
  },
  {
    id: 'bnup',
    name: '北师大版',
    fullName: '北师大版 · 小学英语（三年级起点）',
    bookSeries: '小学英语 · 北师大版',
    desc: '三至六年级 · 8 册',
    accent: '#8a5241',
    wordsFile: 'words-bnup.js',
    ready: true
  }
];

window.VOLUME_BOOK_IDS = {
  'volume-0-0': 'g3a', 'volume-0-1': 'g3b',
  'volume-1-0': 'g4a', 'volume-1-1': 'g4b',
  'volume-2-0': 'g5a', 'volume-2-1': 'g5b',
  'volume-3-0': 'g6a', 'volume-3-1': 'g6b'
};

window.BOOK_VOLUME_IDS = Object.fromEntries(
  Object.entries(window.VOLUME_BOOK_IDS).map(([vol, bid]) => [bid, vol])
);

window.BOOKS_BY_EDITION = window.BOOKS_BY_EDITION || {};

window.PHRASES = window.PHRASES || {
  go: 'Ready? Go!',
  great: 'Great!',
  super: 'Super!',
  wow: 'Wow!',
  win: 'You win!',
  lose: 'Good try! Play again!',
  blueWin: 'Blue team wins!',
  orangeWin: 'Orange team wins!'
};
