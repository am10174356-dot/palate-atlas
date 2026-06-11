export default {
  id: 'coffee',
  name: 'コーヒー',
  en: 'Coffee',
  icon: '☕',
  color: '#9c6b44',
  agent: {
    name: 'Extlist',
    title: 'コーヒー鑑定エージェント',
    persona: `あなたは「Extlist(エクストリスト)」。SCA(スペシャルティコーヒー協会)認定 Qグレーダー相当の体系的知識を持つコーヒー鑑定エージェントです。
産地・標高・品種・精製方法(ウォッシュト/ナチュラル/ハニー/嫌気性発酵など)・焙煎度・抽出変数(挽き目・湯温・比率・時間)がカップに与える影響を科学的に説明できます。
評価はSCAカッピングプロトコルとSCAフレーバーホイールの語彙を基準とします。
特定の焙煎店や抽出流派への好みは出さず、カッピング基準との比較で客観的に語ります。`,
  },
  fields: [
    { key: 'roaster', label: '焙煎店 / ブランド', type: 'text', placeholder: '例: 〇〇コーヒーロースターズ' },
    { key: 'country', label: '産地(国)', type: 'text', placeholder: '例: エチオピア' },
    { key: 'farm', label: '農園 / 地域', type: 'text', placeholder: '例: イルガチェフェ コチェレ' },
    { key: 'variety', label: '品種', type: 'text', placeholder: '例: ゲイシャ、SL28' },
    { key: 'process', label: '精製方法', type: 'select', options: ['ウォッシュト', 'ナチュラル', 'ハニー', 'アナエロビック(嫌気性)', 'カーボニックマセレーション', 'ウェットハル', 'その他'] },
    { key: 'roast', label: '焙煎度', type: 'select', options: ['ライト', 'シナモン', 'ミディアム', 'ハイ', 'シティ', 'フルシティ', 'フレンチ', 'イタリアン'] },
    { key: 'brew', label: '抽出方法', type: 'select', options: ['ハンドドリップ', 'フレンチプレス', 'エスプレッソ', 'エアロプレス', 'サイフォン', '水出し', 'カッピング', 'その他'] },
    { key: 'recipe', label: 'レシピ', type: 'textarea', placeholder: '例: 15g / 225ml / 92℃ / 2:30', wide: true },
    { key: 'price', label: '価格(円)', type: 'number' },
  ],
  sliders: [
    { key: 'acidity', label: '酸味' },
    { key: 'sweetness', label: '甘味' },
    { key: 'body', label: 'ボディ' },
    { key: 'bitterness', label: '苦味' },
    { key: 'clean', label: 'クリーン' },
    { key: 'after', label: '余韻' },
  ],
  wheel: [
    { name: 'ベリー', color: '#c0455e', children: ['ブルーベリー', 'ストロベリー', 'ラズベリー', 'ブラックベリー'] },
    { name: '柑橘', color: '#e8c44a', children: ['レモン', 'ライム', 'オレンジ', 'グレープフルーツ', 'ベルガモット'] },
    { name: '核果・トロピカル', color: '#f0a35e', children: ['桃', 'アプリコット', 'パイナップル', 'マンゴー', 'ライチ'] },
    { name: 'ドライフルーツ', color: '#9c5b38', children: ['レーズン', 'プルーン', 'イチジク'] },
    { name: '発酵・ワイン様', color: '#8a4468', children: ['ワイン', 'ウイスキー', '発酵果実'] },
    { name: 'フローラル', color: '#d989b8', children: ['ジャスミン', 'ローズ', 'カモミール', '紅茶様'] },
    { name: '甘味', color: '#d8923c', children: ['バニラ', 'キャラメル', 'ハチミツ', '黒糖', 'メープル'] },
    { name: 'ナッツ・ココア', color: '#8a5a30', children: ['アーモンド', 'ヘーゼルナッツ', 'ピーナッツ', 'チョコレート', 'カカオニブ'] },
    { name: 'スパイス', color: '#b06a2e', children: ['シナモン', 'クローブ', 'ナツメグ', 'ペッパー'] },
    { name: 'ロースト・穀物', color: '#6b5544', children: ['トースト', '穀物', '焦げ', 'タバコ'] },
    { name: 'グリーン・植物', color: '#5d9c59', children: ['青草', 'ハーブ', 'ピーマン', '豆様'] },
    { name: '欠点風味', color: '#7d8a93', children: ['紙', 'カビ', 'ゴム', '薬品', '土臭'] },
  ],
};
