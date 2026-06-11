// Anthropic Messages API 連携 — AIフィードバック生成 / 銘柄Webリサーチ
import { getSetting } from './db.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

const COMMON_GUIDELINES = `
【共通指針 — 必ず守ること】
- あなたは中庸の立場で、客観的・公正公平・フラットな意見のみを述べる。過度な賞賛も否定もしない。
- 「一般的な感覚ではこの銘柄/スタイルはこのように感じられることが多い」という業界基準・標準的な評価との対比を必ず示す。
- 記録者の感じ方を否定せず、基準との違いがあればその理由として考えられる要因(個人差・温度・状態・経験段階など)を中立的に挙げる。
- 推測と事実を区別し、銘柄について確実でない情報は断定しない。
- 日本語で、ですます調で答える。`;

async function getApiKey() {
  const key = await getSetting('apiKey');
  if (!key) {
    const err = new Error('APIキーが未設定です。設定画面でAnthropic APIキーを登録してください。');
    err.noKey = true;
    throw err;
  }
  return key;
}

async function callApi(body) {
  const key = await getApiKey();
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error('通信に失敗しました。ネットワーク接続を確認してください。');
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error('APIキーが無効です。設定画面で確認してください。');
    if (res.status === 429) throw new Error('APIのレート制限に達しました。しばらく待って再試行してください。');
    const detail = await res.json().catch(() => null);
    throw new Error(`APIエラー (${res.status}): ${detail?.error?.message || '不明なエラー'}`);
  }
  return res.json();
}

function textOf(response) {
  return (response.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
}

// コードフェンスや前置きを除いてJSONを取り出す
function extractJson(text) {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = m ? m[1] : text;
  const start = Math.min(...['{', '['].map(c => {
    const i = candidate.indexOf(c);
    return i === -1 ? Infinity : i;
  }));
  if (start === Infinity) throw new Error('AI応答の解析に失敗しました');
  const end = Math.max(candidate.lastIndexOf('}'), candidate.lastIndexOf(']'));
  return JSON.parse(candidate.slice(start, end + 1));
}

function noteSummary(note, category) {
  const lines = [
    `カテゴリ: ${category.name}`,
    `銘柄/製品名: ${note.name || '(未記入)'}`,
    `テイスティング日: ${note.date || ''}`,
    `総合評価: ${note.rating || '-'} / 5`,
  ];
  for (const f of category.fields) {
    const v = note.fields?.[f.key];
    if (v) lines.push(`${f.label}: ${v}`);
  }
  if (note.flavors?.length) lines.push(`選択したフレーバー: ${note.flavors.join('、')}`);
  if (note.sliders) {
    const sl = category.sliders.map(s => `${s.label}=${note.sliders[s.key] ?? '-'}`).join(' / ');
    lines.push(`味わいプロファイル(1-5): ${sl}`);
  }
  if (note.memo) lines.push(`メモ: ${note.memo}`);
  if (note.scenery) lines.push(`【風景コメント(飲んで感じた情景)】\n${note.scenery}`);
  return lines.join('\n');
}

// ============ フィードバック生成 ============
export async function generateFeedback(note, category) {
  const system = `${category.agent.persona}\n${COMMON_GUIDELINES}`;
  const user = `以下は私のテイスティングノートです。${category.agent.name}として、フィードバックをください。

${noteSummary(note, category)}

次のJSON形式のみで回答してください(コードフェンス不要):
{
  "feedback": "①一般的な感覚・業界基準ではこの銘柄/スタイルはどう感じられるかとの対比 ②記録されたフレーバーや味わいプロファイルへの所見 ③味覚を鍛えるための次の練習提案(比較テイスティングなど)。改行を含む読みやすい文章で。",
  "sceneryInterpretation": "風景コメントの解釈と、その風景表現へのコメント。風景が未記入の場合は空文字。"
}`;

  const res = await callApi({
    model: MODEL,
    max_tokens: 2000,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const parsed = extractJson(textOf(res));
  return {
    text: parsed.feedback || '',
    sceneryInterpretation: parsed.sceneryInterpretation || '',
    agent: category.agent.name,
    createdAt: Date.now(),
  };
}

// ============ 銘柄Webリサーチ(参考リンク自動取得) ============
export async function researchLinks(note, category) {
  const hints = [note.name];
  for (const k of ['producer', 'distillery', 'brewery', 'roaster', 'region', 'country', 'vintage', 'grade']) {
    if (note.fields?.[k]) hints.push(String(note.fields[k]));
  }
  const user = `「${hints.filter(Boolean).join(' ')}」(${category.name})について、他者の客観的なテイスティングレビュー・解説記事・公式情報をweb検索で探してください。
信頼できそうなページを最大5件選び、次のJSON配列のみで回答してください(コードフェンス不要):
[{"title": "ページタイトル(日本語で簡潔に)", "url": "URL"}]
見つからない場合は [] と回答してください。`;

  const res = await callApi({
    model: MODEL,
    max_tokens: 1500,
    system: `あなたは飲料・嗜好品の情報リサーチャーです。検索結果から、テイスティングレビューや銘柄解説として参考になる実在のURLのみを選びます。`,
    messages: [{ role: 'user', content: user }],
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
  });
  const parsed = extractJson(textOf(res));
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(l => l && typeof l.url === 'string' && /^https?:\/\//.test(l.url))
    .slice(0, 5)
    .map(l => ({ title: String(l.title || l.url), url: l.url }));
}
