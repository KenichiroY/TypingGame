/**
 * タイピングゲーム メインロジック
 */

// ローマ字変換マッピング
var romajiMap = {
  'あ': ['a'], 'い': ['i', 'yi'], 'う': ['u', 'wu', 'whu'], 'え': ['e'], 'お': ['o'],
  'か': ['ka', 'ca'], 'き': ['ki'], 'く': ['ku', 'cu', 'qu'], 'け': ['ke'], 'こ': ['ko', 'co'],
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'さ': ['sa'], 'し': ['si', 'shi', 'ci'], 'す': ['su'], 'せ': ['se', 'ce'], 'そ': ['so'],
  'ざ': ['za'], 'じ': ['zi', 'ji'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'た': ['ta'], 'ち': ['ti', 'chi'], 'つ': ['tu', 'tsu'], 'て': ['te'], 'と': ['to'],
  'だ': ['da'], 'ぢ': ['di'], 'づ': ['du', 'dzu'], 'で': ['de'], 'ど': ['do'],
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['hu', 'fu'], 'へ': ['he'], 'ほ': ['ho'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  'わ': ['wa'], 'を': ['wo'], 'ん': ['nn', 'n'],
  'ぁ': ['xa', 'la'], 'ぃ': ['xi', 'li'], 'ぅ': ['xu', 'lu'], 'ぇ': ['xe', 'le'], 'ぉ': ['xo', 'lo'],
  'ゃ': ['xya', 'lya'], 'ゅ': ['xyu', 'lyu'], 'ょ': ['xyo', 'lyo'],
  'っ': ['xtu', 'ltu'],
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
  'しゃ': ['sya', 'sha'], 'しゅ': ['syu', 'shu'], 'しょ': ['syo', 'sho'],
  'じゃ': ['ja', 'zya', 'jya'], 'じゅ': ['ju', 'zyu', 'jyu'], 'じょ': ['jo', 'zyo', 'jyo'],
  'ちゃ': ['tya', 'cha', 'cya'], 'ちゅ': ['tyu', 'chu', 'cyu'], 'ちょ': ['tyo', 'cho', 'cyo'],
  'ぢゃ': ['dya'], 'ぢゅ': ['dyu'], 'ぢょ': ['dyo'],
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo']
};

// ゲーム状態
var words = [];
var currentWord = null;
var acceptableRomajis = [];
var displayRomaji = '';
var score = 0;
var combo = 0;
var maxCombo = 0;
var timeLeft = 60;
var timer = null;
var playing = false;
var totalTyped = 0;
var correctTyped = 0;
var encodedScore = '';

// 画面切り替え
function showScreen(id) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
  document.getElementById(id).classList.add('active');
}

// スコアエンコード
function encodeScore(s) {
  var scoreStr = ('0000' + s).slice(-4);
  var digits = [];
  for (var i = 0; i < scoreStr.length; i++) {
    digits.push(parseInt(scoreStr[i], 10));
  }
  var checksum = 0;
  for (var i = 0; i < digits.length; i++) {
    checksum += digits[i];
  }
  checksum = checksum % 10;
  var offsets = [7, 5, 3, 9];
  var encoded = [];
  for (var i = 0; i < digits.length; i++) {
    encoded.push((digits[i] + offsets[i]) % 10);
  }
  encoded.push(checksum);
  return encoded.join('');
}

// コピー
function copyCode() {
  var code = encodedScore;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(function() {
      alert('コードをコピーしました: ' + code);
    }).catch(function() {
      fallbackCopy(code);
    });
  } else {
    fallbackCopy(code);
  }
}

function fallbackCopy(text) {
  var textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    alert('コードをコピーしました: ' + text);
  } catch (e) {
    alert('コピーできませんでした。コード: ' + text);
  }
  document.body.removeChild(textArea);
}

// ローマ字パターン生成
function generateRomajiPatterns(hiragana) {
  var results = [''];
  var i = 0;

  while (i < hiragana.length) {
    // 促音処理
    if (hiragana[i] === 'っ' && i + 1 < hiragana.length) {
      var nextTwo = hiragana.substring(i + 1, i + 3);
      var nextOne = hiragana[i + 1];
      var nextRomajis = romajiMap[nextTwo] || romajiMap[nextOne];

      if (nextRomajis) {
        var consonant = nextRomajis[0].charAt(0);
        var newResults = [];
        for (var r = 0; r < results.length; r++) {
          newResults.push(results[r] + consonant);
          newResults.push(results[r] + 'xtu');
          newResults.push(results[r] + 'ltu');
        }
        results = newResults;
        i++;
        continue;
      }
    }

    // 2文字
    if (i + 1 < hiragana.length) {
      var two = hiragana.substring(i, i + 2);
      if (romajiMap[two]) {
        var romajis = romajiMap[two];
        var newResults = [];
        for (var r = 0; r < results.length; r++) {
          for (var j = 0; j < romajis.length; j++) {
            newResults.push(results[r] + romajis[j]);
          }
        }
        results = newResults;
        i += 2;
        continue;
      }
    }

    // 1文字
    var one = hiragana[i];
    if (romajiMap[one]) {
      var romajis = romajiMap[one];
      var newResults = [];
      for (var r = 0; r < results.length; r++) {
        for (var j = 0; j < romajis.length; j++) {
          newResults.push(results[r] + romajis[j]);
        }
      }
      results = newResults;
    }
    i++;
  }

  return results;
}

// 新しい単語
function setNewWord() {
  var idx = Math.floor(Math.random() * words.length);
  currentWord = words[idx];
  acceptableRomajis = generateRomajiPatterns(currentWord.hiragana);
  displayRomaji = acceptableRomajis[0];

  document.getElementById('kanji').textContent = currentWord.kanji;
  document.getElementById('hiragana').textContent = currentWord.hiragana;
  updateRomajiDisplay('');
}

function updateRomajiDisplay(typed) {
  var html = '';
  for (var i = 0; i < displayRomaji.length; i++) {
    if (i < typed.length) {
      html += '<span class="char-correct">' + displayRomaji[i] + '</span>';
    } else {
      html += '<span class="char-pending">' + displayRomaji[i] + '</span>';
    }
  }
  document.getElementById('romaji').innerHTML = html;
}

function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('combo').textContent = combo + 'x';

  var comboEl = document.getElementById('combo');
  comboEl.className = 'stat-value' + (combo > 0 ? ' highlight' : '');

  var acc = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;
  var accEl = document.getElementById('accuracy');
  accEl.textContent = acc + '%';
  if (acc >= 90) {
    accEl.className = 'stat-value good';
  } else if (acc >= 70) {
    accEl.className = 'stat-value mid';
  } else {
    accEl.className = 'stat-value warning';
  }
}

// 入力チェック
function checkInput() {
  var inputEl = document.getElementById('input');
  var value = inputEl.value.toLowerCase();

  // 完全一致
  for (var i = 0; i < acceptableRomajis.length; i++) {
    if (value === acceptableRomajis[i]) {
      score += 10 + combo;
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      totalTyped += value.length;
      correctTyped += value.length;

      inputEl.value = '';
      setNewWord();
      updateStats();
      return;
    }
  }

  // 部分一致
  var anyMatch = false;
  for (var i = 0; i < acceptableRomajis.length; i++) {
    if (acceptableRomajis[i].indexOf(value) === 0) {
      anyMatch = true;
      displayRomaji = acceptableRomajis[i];
      break;
    }
  }

  if (anyMatch) {
    totalTyped++;
    correctTyped++;
    updateRomajiDisplay(value);
  } else if (value.length > 0) {
    combo = 0;
    totalTyped++;
    inputEl.value = value.substring(0, value.length - 1);
  }
  updateStats();
}

// ゲーム開始
function startGame() {
  playing = true;
  score = 0;
  combo = 0;
  maxCombo = 0;
  timeLeft = 60;
  totalTyped = 0;
  correctTyped = 0;

  updateStats();
  document.getElementById('time').textContent = timeLeft;
  document.getElementById('time').className = 'stat-value';

  showScreen('game');

  var inputEl = document.getElementById('input');
  inputEl.value = '';
  inputEl.focus();

  setNewWord();

  timer = setInterval(function() {
    timeLeft--;
    var timeEl = document.getElementById('time');
    timeEl.textContent = timeLeft;
    timeEl.className = 'stat-value' + (timeLeft <= 10 ? ' warning' : '');

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ゲーム終了
function endGame() {
  playing = false;
  clearInterval(timer);

  encodedScore = encodeScore(score);
  var acc = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;

  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalAccuracy').textContent = acc + '%';
  document.getElementById('finalCombo').textContent = maxCombo + 'x';
  document.getElementById('scoreCode').textContent = encodedScore;

  var msg = '';
  if (acc >= 95) msg = 'パーフェクト！素晴らしい！';
  else if (acc >= 85) msg = 'とても良くできました！';
  else if (acc >= 70) msg = 'よくできました！';
  else msg = 'もっと練習しよう！';
  document.getElementById('resultMsg').textContent = msg;

  showScreen('result');
}

function restartGame() {
  showScreen('start');
}

// 初期化
function initGame() {
  // 設定を適用
  document.title = AppConfig.pageTitle;
  document.getElementById('gameName').textContent = AppConfig.gameName;

  // 単語データを読み込み
  words = WordData;
  document.getElementById('wordCount').textContent = words.length;

  // 入力イベント設定
  document.getElementById('input').oninput = function() {
    if (playing) checkInput();
  };

  // スタート画面を表示
  showScreen('start');
}

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', initGame);
