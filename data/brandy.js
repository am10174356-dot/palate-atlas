export default {
  id: 'brandy',
  name: 'ブランデー',
  en: 'Brandy',
  icon: '🍂',
  color: '#b87333',
  agent: {
    name: 'Ambelist',
    title: 'ブランデー鑑定エージェント',
    persona: `あなたは「Ambelist(アンベリスト)」。コニャック・アルマニャックのマスターブレンダー(メートル・ド・シェ)相当の体系的知識を持つブランデー鑑定エージェントです。
ブドウ品種(ユニ・ブラン等)や原料果実・蒸留方式(シャラント式単式/連続式)・リムーザンオークでの熟成・ランシオ香の発達など、ブランデーの香味形成を体系的に説明できます。
コニャック、アルマニャック、カルヴァドス、グラッパ、ピスコなど世界のブランデーの様式とBNIC系アロマホイールの語彙に精通しています。
特定メゾンへの好みは出さず、等級(VS〜XO以上)や熟成度の一般基準との比較で語ります。`,
  },
  fields: [
    { key: 'kind', label: '種類', type: 'select', options: ['コニャック', 'アルマニャック', 'フレンチブランデー', 'カルヴァドス', 'グラッパ', 'ピスコ', 'フルーツブランデー', 'ジャパニーズ', 'その他'] },
    { key: 'grade', label: '等級', type: 'select', options: ['VS', 'VSOP', 'ナポレオン', 'XO', 'XXO', 'オル・ダージュ', 'ヴィンテージ表記', 'なし・その他'] },
    { key: 'producer', label: '生産者', type: 'text', placeholder: '例: ヘネシー' },
    { key: 'region', label: '産地', type: 'text', placeholder: '例: グランド・シャンパーニュ' },
    { key: 'material', label: '品種・原料', type: 'text', placeholder: '例: ユニ・ブラン / リンゴ', wide: true },
    { key: 'age', label: '熟成', type: 'text', placeholder: '例: 約10年、リムーザンオーク' },
    { key: 'abv', label: '度数(%)', type: 'number', step: '0.1' },
    { key: 'price', label: '価格(円)', type: 'number' },
    { key: 'color', label: '外観(色)', type: 'text', placeholder: '例: 深い琥珀、マホガニー', wide: true },
  ],
  sliders: [
    { key: 'sweetness', label: '甘味' },
    { key: 'fruity', label: 'フルーティ' },
    { key: 'oak', label: '樽香' },
    { key: 'alcohol', label: 'アルコール感' },
    { key: 'smooth', label: 'まろやかさ' },
    { key: 'finish', label: '余韻' },
  ],
  wheel: [
    { name: 'フレッシュフルーツ', color: '#e8a13c', children: ['ブドウ', '洋ナシ', 'リンゴ', '桃', 'アプリコット', '柑橘'] },
    { name: 'ドライ・砂糖漬け', color: '#9c5b38', children: ['レーズン', 'プルーン', 'イチジク', 'オレンジピール', '干し杏'] },
    { name: 'フローラル', color: '#d989b8', children: ['スミレ', 'バラ', 'ライムの花', 'アイリス', 'ゼラニウム'] },
    { name: '甘味', color: '#d8923c', children: ['バニラ', 'ハチミツ', 'キャラメル', 'ヌガー', 'チョコレート'] },
    { name: 'ウッディ・スパイス', color: '#8a5a30', children: ['オーク', '杉', 'シナモン', 'クローブ', '黒胡椒', '甘草'] },
    { name: 'ランシオ・熟成', color: '#6b5544', children: ['ナッツ', 'キノコ', '革', 'タバコ', '蜜蝋', '土'] },
    { name: 'その他', color: '#5d9c59', children: ['ハーブ', 'ミント', 'ココナッツ', 'コーヒー'] },
  ],
};
