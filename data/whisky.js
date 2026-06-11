export default {
  id: 'whisky',
  name: 'ウイスキー',
  en: 'Whisky',
  icon: '🥃',
  color: '#c98a3a',
  agent: {
    name: 'CaskLogist',
    title: 'ウイスキー鑑定エージェント',
    persona: `あなたは「CaskLogist(カスクロジスト)」。マスターブレンダー/ケルピー(Keepers of the Quaich)相当の体系的知識を持つウイスキー鑑定エージェントです。
原料(モルト・グレーン)・発酵・蒸留器の形状・カスク(樽)の種類と熟成年数・産地の気候が香味に与える影響を体系的に説明できます。
スコッチ(各地域)、アイリッシュ、バーボン、ジャパニーズなど世界のウイスキーのスタイル基準に精通し、SWRI系フレーバーホイールの語彙で論じます。
特定の蒸留所やスタイルへの好みは出さず、一般的なスタイル基準との比較で語ります。`,
  },
  fields: [
    { key: 'distillery', label: '蒸留所 / ボトラー', type: 'text', placeholder: '例: ラフロイグ' },
    { key: 'region', label: '産地', type: 'text', placeholder: '例: アイラ / スコットランド' },
    { key: 'type', label: 'タイプ', type: 'select', options: ['シングルモルト', 'ブレンデッド', 'ブレンデッドモルト', 'シングルグレーン', 'バーボン', 'ライ', 'アイリッシュ', 'ジャパニーズ', 'その他'] },
    { key: 'age', label: '熟成年数', type: 'text', placeholder: '例: 10年 / NAS' },
    { key: 'cask', label: 'カスクタイプ', type: 'text', placeholder: '例: バーボン樽 + シェリー樽フィニッシュ', wide: true },
    { key: 'abv', label: '度数(%)', type: 'number', step: '0.1' },
    { key: 'serve', label: '飲み方', type: 'select', options: ['ストレート', '加水', 'ロック', 'ハイボール', 'トワイスアップ', 'その他'] },
    { key: 'price', label: '価格(円)', type: 'number' },
    { key: 'color', label: '外観(色)', type: 'text', placeholder: '例: 琥珀色、ゴールド', wide: true },
  ],
  sliders: [
    { key: 'smoky', label: 'スモーキー' },
    { key: 'fruity', label: 'フルーティ' },
    { key: 'sweetness', label: '甘味' },
    { key: 'body', label: 'ボディ' },
    { key: 'spicy', label: 'スパイシー' },
    { key: 'finish', label: '余韻' },
  ],
  wheel: [
    { name: 'フルーティ', color: '#e8a13c', children: ['青リンゴ', '洋ナシ', '柑橘', '桃・杏', 'トロピカル', 'ベリー', 'レーズン・イチジク'] },
    { name: 'フローラル', color: '#d989b8', children: ['ヘザー', 'バラ', 'スミレ', '香水様'] },
    { name: 'モルティ・穀物', color: '#c9b35a', children: ['麦芽', 'ビスケット', 'パン', 'ポリッジ', '穀物'] },
    { name: 'スイート', color: '#d8923c', children: ['バニラ', 'ハチミツ', 'キャラメル', 'トフィー', 'メープル', '黒糖'] },
    { name: 'ウッディ', color: '#8a5a30', children: ['オーク', '杉', '鉛筆', 'タンニン', '白檀'] },
    { name: 'スパイシー', color: '#b06a2e', children: ['シナモン', 'クローブ', 'ナツメグ', '黒胡椒', 'ジンジャー'] },
    { name: 'ピーティ・スモーキー', color: '#5a554e', children: ['ピート', '焚き火', 'ヨード・薬品', 'タール', '灰', '燻製'] },
    { name: 'マリン', color: '#5d8a9c', children: ['潮', '海藻', '磯'] },
    { name: 'ナッティ・オイリー', color: '#a8804f', children: ['アーモンド', 'クルミ', 'ヘーゼルナッツ', 'バター', '油脂'] },
    { name: 'ワイニー', color: '#9c4458', children: ['シェリー', 'ポート', '赤ワイン', 'ランシオ'] },
    { name: 'サルファリー', color: '#7d8a6b', children: ['マッチ', 'ゴム', '肉様'] },
  ],
};
