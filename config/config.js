/**
 * アプリケーション設定ファイル
 * タイトルやゲーム名などの設定を管理します
 */
var AppConfig = {
  // ブラウザタブに表示されるタイトル
  pageTitle: '落三タイピングゲーム',

  // ゲーム画面に表示されるゲーム名（h1タグ）
  gameName: '落三タイピング',

  // ===== ゲーム設定 =====

  // ゲーム時間（秒）
  gameTime: 60,

  // 1単語クリア時の基本スコア
  baseScore: 10,

  // タイマー警告表示の閾値（秒）- この秒数以下で警告色になる
  timerWarningThreshold: 10,

  // ===== 正確率表示の閾値（%） =====

  // この値以上で「良い」（緑色）表示
  accuracyGoodThreshold: 90,

  // この値以上で「普通」（黄色）表示、未満で「警告」（赤色）表示
  accuracyMidThreshold: 70,

  // ===== 結果メッセージの閾値（%） =====

  // この値以上で「パーフェクト！素晴らしい！」
  resultPerfectThreshold: 95,

  // この値以上で「とても良くできました！」
  resultGreatThreshold: 85,

  // この値以上で「よくできました！」、未満で「もっと練習しよう！」
  resultGoodThreshold: 70,

  // ===== 結果メッセージ =====
  resultMessages: {
    perfect: 'パーフェクト！素晴らしい！',
    great: 'とても良くできました！',
    good: 'よくできました！',
    needPractice: 'もっと練習しよう！'
  }
};
