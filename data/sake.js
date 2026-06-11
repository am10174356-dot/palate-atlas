export default {
  id: 'sake',
  name: '日本酒',
  en: 'Sake',
  icon: '🍶',
  color: '#8fa8c9',
  agent: {
    name: '蔵識 (Kurashiki)',
    title: '日本酒鑑定エージェント',
    persona: `あなたは「蔵識(くらしき)」。SSI認定 唎酒師・酒匠および国税庁鑑定官相当の体系的知識を持つ日本酒鑑定エージェントです。
酒米(山田錦・五百万石など)・精米歩合・酵母(きょうかい酵母各系統)・麹・仕込み水・火入れ/生酒・熟成が香味に与える影響を体系的に説明できます。
評価はSSIの4タイプ分類(薫酒・爽酒・醇酒・熟酒)と日本酒度・酸度・アミノ酸度の指標、吟醸香(カプロン酸エチル・酢酸イソアミル)の科学的背景を基準とします。
特定の蔵や流派への好みは出さず、特定名称酒の一般的なスタイル基準との比較で語ります。`,
  },
  fields: [
    { key: 'brewery', label: '蔵元', type: 'text', placeholder: '例: 旭酒造' },
    { key: 'prefecture', label: '都道府県', type: 'text', placeholder: '例: 山口県' },
    { key: 'grade', label: '特定名称', type: 'select', options: ['純米大吟醸', '純米吟醸', '特別純米', '純米', '大吟醸', '吟醸', '特別本醸造', '本醸造', '普通酒', 'その他'] },
    { key: 'rice', label: '酒米', type: 'text', placeholder: '例: 山田錦' },
    { key: 'polish', label: '精米歩合(%)', type: 'number', placeholder: '例: 50' },
    { key: 'yeast', label: '酵母', type: 'text', placeholder: '例: きょうかい1801号' },
    { key: 'smv', label: '日本酒度', type: 'text', placeholder: '例: +3' },
    { key: 'acid', label: '酸度', type: 'text', placeholder: '例: 1.4' },
    { key: 'abv', label: '度数(%)', type: 'number', step: '0.1' },
    { key: 'temp', label: '飲用温度', type: 'select', options: ['雪冷え(5℃)', '花冷え(10℃)', '涼冷え(15℃)', '常温(20℃)', '日向燗(30℃)', 'ぬる燗(40℃)', '上燗(45℃)', '熱燗(50℃)', '飛び切り燗(55℃〜)'] },
    { key: 'styleType', label: '4タイプ分類', type: 'select', options: ['薫酒(香り高い)', '爽酒(軽快・なめらか)', '醇酒(コク・旨味)', '熟酒(熟成)'] },
    { key: 'price', label: '価格(円)', type: 'number' },
  ],
  sliders: [
    { key: 'sweetness', label: '甘辛' },
    { key: 'acidity', label: '酸味' },
    { key: 'umami', label: '旨味' },
    { key: 'aroma', label: '香りの強さ' },
    { key: 'body', label: '濃淡' },
    { key: 'finish', label: '余韻' },
  ],
  wheel: [
    { name: '吟醸香(果実)', color: '#e8a13c', children: ['リンゴ', 'バナナ', 'メロン', '洋ナシ', 'ライチ', 'イチゴ'] },
    { name: '花・草', color: '#d989b8', children: ['桜', '白い花', '新緑', 'ハーブ', '青竹'] },
    { name: '原料由来', color: '#cfc08e', children: ['炊いた米', '餅', '麹', '米ぬか', '蒸米'] },
    { name: '乳性', color: '#c9d4dd', children: ['ヨーグルト', 'クリーム', 'バター', 'チーズ'] },
    { name: '熟成香', color: '#9c5b38', children: ['カラメル', 'ナッツ', 'ドライフルーツ', '蜂蜜', '紹興酒様', 'スパイス'] },
    { name: 'ミネラル・他', color: '#7d8a93', children: ['ミネラル', '石', '杉(木香)', 'アルコール'] },
    { name: 'オフフレーバー', color: '#6b6b50', children: ['老香(ひねか)', '日光臭', '生老香', '酸臭'] },
  ],
};
