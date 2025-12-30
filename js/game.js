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
  'わ': ['wa'], 'を': ['wo'],
  // 「ん」は文脈によって変わるため、ここでは定義しない（generateRomajiPatternsで処理）
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
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo'],

  //数字(半角)
  '0': ['0'], '1': ['1'], '2': ['2'], '3': ['3'], '4': ['4'],
  '5': ['5'], '6': ['6'], '7': ['7'], '8': ['8'], '9': ['9'],
  //数字(全角)
   '０': ['0'], '１': ['1'], '２': ['2'], '３': ['3'], '４': ['4'],
  '５': ['5'], '６': ['6'], '７': ['7'], '８': ['8'], '９': ['9'],

  //記号
  '。': ['.'], '、': [','],
  '「': ['['], '」': [']'],
  '（': ['('], '）': [')'],
  '(': ['('], ')': [')'],
  '!': ['!'], '！': ['!'],
  '?': ['?'], '？': ['?'],
  'ー': ['-']
};

// 「ん」の後に来ると"nn"が必須になる文字（母音、や行、な行）
var nnRequiredAfter = ['あ', 'い', 'う', 'え', 'お', 'や', 'ゆ', 'よ', 'な', 'に', 'ぬ', 'ね', 'の', 'にゃ', 'にゅ', 'にょ'];

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

  // チェックサム1：単純合計
  var check1 = (digits[0] + digits[1] + digits[2] + digits[3]) % 10;

  // チェックサム2：重み付き合計
  var check2 = (digits[0]*3 + digits[1]*7 + digits[2]*2 + digits[3]*5) % 10;

  var offsets = [1, 5, 3, 9];
  var encoded = [];
  for (var i = 0; i < digits.length; i++) {
    encoded.push((digits[i] + offsets[i]) % 10);
  }

  return encoded.join('') + check1 + check2;
}

// コピー
function copyCode() {
  var code = encodedScore;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(function() {
      alert('コードをコピーしました: ' + code);
    }).catch(function() {
      fallbackCopy(code, true);
    });
  } else {
    fallbackCopy(code, true);
  }
}

function fallbackCopy(text, showAlert) {
  var textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    if (showAlert) {
      alert('コードをコピーしました: ' + text);
    }
    return true;
  } catch (e) {
    alert('コピーできませんでした。コード: ' + text);
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}

// コピーして報告ページへ移動
function copyAndReport() {
  var code = encodedScore;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(function() {
      window.open(AppConfig.reportURL, '_blank');
    }).catch(function() {
      if (fallbackCopy(code, false)) {
        window.open(AppConfig.reportURL, '_blank');
      }
    });
  } else {
    if (fallbackCopy(code, false)) {
      window.open(AppConfig.reportURL, '_blank');
    }
  }
}

// 「ん」の後に"nn"が必須かどうかを判定
function requiresDoubleN(hiragana, position) {
  // 末尾の「ん」は"nn"必須
  if (position >= hiragana.length - 1) {
    return true;
  }

  // 次の文字を取得（2文字の組み合わせも確認）
  var nextTwo = hiragana.substring(position + 1, position + 3);
  var nextOne = hiragana[position + 1];

  // 2文字の組み合わせがnnRequiredAfterに含まれるか確認
  for (var i = 0; i < nnRequiredAfter.length; i++) {
    if (nnRequiredAfter[i] === nextTwo || nnRequiredAfter[i] === nextOne) {
      return true;
    }
  }

  return false;
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

    // 「ん」の処理
    if (hiragana[i] === 'ん') {
      var newResults = [];
      if (requiresDoubleN(hiragana, i)) {
        // "nn"のみ許可
        for (var r = 0; r < results.length; r++) {
          newResults.push(results[r] + 'nn');
        }
      } else {
        // "n"と"nn"の両方を許可
        for (var r = 0; r < results.length; r++) {
          newResults.push(results[r] + 'nn');
          newResults.push(results[r] + 'n');
        }
      }
      results = newResults;
      i++;
      continue;
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
  if (acc >= AppConfig.accuracyGoodThreshold) {
    accEl.className = 'stat-value good';
  } else if (acc >= AppConfig.accuracyMidThreshold) {
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
      score += AppConfig.baseScore + combo;
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
  timeLeft = AppConfig.gameTime;
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
    timeEl.className = 'stat-value' + (timeLeft <= AppConfig.timerWarningThreshold ? ' warning' : '');

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
  if (acc >= AppConfig.resultPerfectThreshold) msg = AppConfig.resultMessages.perfect;
  else if (acc >= AppConfig.resultGreatThreshold) msg = AppConfig.resultMessages.great;
  else if (acc >= AppConfig.resultGoodThreshold) msg = AppConfig.resultMessages.good;
  else msg = AppConfig.resultMessages.needPractice;
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

  // 報告ページURLが設定されている場合はボタンを表示
  if (AppConfig.reportURL && AppConfig.reportURL.length > 0) {
    document.getElementById('reportBtn').style.display = 'inline-block';
  }

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
