export default {
  id: 'cascalate',
  name: 'カスカレート',
  en: 'Cascalate',
  icon: '🍒',
  color: '#c95f6e',
  agent: {
    name: 'Cascalist',
    title: 'カスカレート鑑定エージェント',
    persona: `あなたは「Cascalist(カスカリスト)」。コーヒーチェリーの果肉・果皮(カスカラ)を原料とする新しい嗜好品「カスカレート」の鑑定エージェントです。
カスカラはコーヒー精製の副産物で、レーズン・ハイビスカス・紅茶・黒糖を思わせる風味を持ちます。カスカレートはその風味をチョコレート様の体験に昇華させたプロダクトです。
確立された業界基準がまだ存在しない分野のため、あなたはコーヒー(SCAカッピング)・カカオ/チョコレート(ファインカカオ評価)・紅茶・ドライフルーツの評価体系を横断的に応用して評価します。
カスカラの産地・精製・乾燥条件、配合、製造工程がテクスチャーと風味に与える影響を、近接領域の科学的知見から推論して説明します。
新しいカテゴリを育てる立場として、基準が未確立であることを正直に示しながら、再現性のある語彙で客観的に語ります。`,
  },
  fields: [
    { key: 'lot', label: 'ロット / 試作番号', type: 'text', placeholder: '例: Lot 2026-06-A' },
    { key: 'origin', label: 'カスカラ産地', type: 'text', placeholder: '例: エチオピア イルガチェフェ' },
    { key: 'process', label: 'カスカラ精製・乾燥', type: 'text', placeholder: '例: ナチュラル、天日乾燥', wide: true },
    { key: 'blend', label: '配合・原材料', type: 'textarea', placeholder: '例: カスカラ40% / カカオバター30% / きび糖30%', wide: true },
    { key: 'form', label: '形状', type: 'select', options: ['タブレット', 'ボンボン', 'ドリンク', 'ペースト', 'その他'] },
    { key: 'madeDate', label: '製造日', type: 'date' },
    { key: 'texture', label: 'テクスチャー', type: 'text', placeholder: '例: 口どけなめらか、後半にざらつき', wide: true },
    { key: 'price', label: '想定価格(円)', type: 'number' },
  ],
  sliders: [
    { key: 'sweetness', label: '甘味' },
    { key: 'acidity', label: '酸味' },
    { key: 'bitterness', label: '苦味' },
    { key: 'fruity', label: 'フルーティ' },
    { key: 'melt', label: '口どけ' },
    { key: 'finish', label: '余韻' },
  ],
  wheel: [
    { name: '果実(カスカラ)', color: '#d8475a', children: ['レーズン', 'プルーン', 'チェリー', 'ハイビスカス', 'クランベリー', '杏'] },
    { name: '紅茶・ハーブ', color: '#b06a2e', children: ['紅茶', 'ルイボス', 'ローズヒップ', 'ハーブ'] },
    { name: '甘味', color: '#d8923c', children: ['黒糖', 'キャラメル', 'ハチミツ', 'メープル'] },
    { name: 'カカオ・ロースト', color: '#6b4530', children: ['カカオ', 'ダークチョコ', 'コーヒー', 'トースト'] },
    { name: 'ナッツ・穀物', color: '#a8804f', children: ['アーモンド', 'ヘーゼルナッツ', '穀物'] },
    { name: 'スパイス', color: '#9c5b38', children: ['シナモン', 'ジンジャー', 'カルダモン'] },
    { name: '発酵・ワイン様', color: '#8a4468', children: ['ワイン', '発酵果実', '梅酒様'] },
    { name: 'オフフレーバー', color: '#7d8a93', children: ['土', 'カビ', '紙', '焦げ'] },
  ],
};
