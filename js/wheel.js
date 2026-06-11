// フレーバーホイール — SVGサンバースト描画 + 選択UI
// 選択値は "グループ>項目" または "グループ" のパス文字列で保持する
import { escapeHtml } from './ui.js';

const SIZE = 640;
const CX = SIZE / 2, CY = SIZE / 2;
const R_CENTER = 78;   // 中心円
const R_GROUP = 180;   // 内輪(グループ)外径
const R_LEAF = 308;    // 外輪(項目)外径

function polar(r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function arcPath(r0, r1, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = polar(r1, a0), [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1), [x3, y3] = polar(r0, a0);
  return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r1},${r1} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} ` +
         `L${x2.toFixed(1)},${y2.toFixed(1)} A${r0},${r0} 0 ${large} 0 ${x3.toFixed(1)},${y3.toFixed(1)} Z`;
}

// 放射方向ラベル(左半分では180度回転して上下逆を防ぐ)
function radialLabel(text, r, midAngle, fontSize, fill) {
  const [x, y] = polar(r, midAngle);
  let rot = midAngle - 90;
  let anchor = 'start';
  if (midAngle > 180) { rot += 180; anchor = 'end'; }
  return `<text class="wheel-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${fontSize}"
    text-anchor="${anchor}" dominant-baseline="middle" fill="${fill}"
    transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">${escapeHtml(text)}</text>`;
}

function shade(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
  const b = Math.min(255, Math.round((n & 255) * factor));
  return `rgb(${r},${g},${b})`;
}

function buildSvg(category, selected) {
  const groups = category.wheel;
  const totalLeaves = groups.reduce((s, g) => s + g.children.length, 0);
  let angle = 0;
  let segs = '', labels = '';

  for (const g of groups) {
    const span = (g.children.length / totalLeaves) * 360;
    const gPath = g.name;
    const gSel = selected.has(gPath);
    segs += `<path class="wheel-seg ${gSel ? 'selected' : ''}" d="${arcPath(R_CENTER, R_GROUP, angle, angle + span)}"
      fill="${g.color}" data-path="${escapeHtml(gPath)}"><title>${escapeHtml(g.name)}</title></path>`;
    if (span > 7) labels += radialLabel(g.name, R_CENTER + 12, angle + span / 2, 13, '#fff');

    let ca = angle;
    g.children.forEach((child, i) => {
      const cSpan = span / g.children.length;
      const cPath = `${g.name}>${child}`;
      const cSel = selected.has(cPath);
      const fill = shade(g.color, 0.72 + 0.5 * ((i % 4) / 4));
      segs += `<path class="wheel-seg ${cSel ? 'selected' : ''}" d="${arcPath(R_GROUP, R_LEAF, ca, ca + cSpan)}"
        fill="${fill}" data-path="${escapeHtml(cPath)}"><title>${escapeHtml(child)}</title></path>`;
      labels += radialLabel(child, R_GROUP + 10, ca + cSpan / 2, 10.5, '#fff');
      ca += cSpan;
    });
    angle += span;
  }

  return `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(category.name)}のフレーバーホイール">
    ${segs}${labels}
    <circle class="wheel-center-bg" cx="${CX}" cy="${CY}" r="${R_CENTER - 4}"/>
    <text x="${CX}" y="${CY - 8}" text-anchor="middle" font-size="30">${category.icon}</text>
    <text class="wheel-center-label" x="${CX}" y="${CY + 22}" text-anchor="middle">${escapeHtml(category.name)}</text>
  </svg>`;
}

// フレーバー選択UI一式(ホイール + 選択チップ + 一覧ブラウザ + 自由入力)
export function renderFlavorPicker(container, category, selectedSet, onChange) {
  function rerender() {
    const chips = [...selectedSet].map(p => `
      <span class="chip accent">${escapeHtml(p.replace('>', ' › '))}
        <button type="button" data-remove="${escapeHtml(p)}" aria-label="削除">✕</button>
      </span>`).join('') || '<span class="chip" style="opacity:.5">ホイールをタップして選択</span>';

    const browser = category.wheel.map(g => `
      <details>
        <summary><span class="dot" style="background:${g.color}"></span>${escapeHtml(g.name)}</summary>
        <div class="fb-children">
          <span class="chip ${selectedSet.has(g.name) ? 'accent' : ''}" data-toggle="${escapeHtml(g.name)}">${escapeHtml(g.name)}(全体)</span>
          ${g.children.map(c => {
            const p = `${g.name}>${c}`;
            return `<span class="chip ${selectedSet.has(p) ? 'accent' : ''}" data-toggle="${escapeHtml(p)}">${escapeHtml(c)}</span>`;
          }).join('')}
        </div>
      </details>`).join('');

    container.innerHTML = `
      <div class="wheel-wrap">
        ${buildSvg(category, selectedSet)}
        <div class="flavor-chips">${chips}</div>
        <div class="flavor-browser">${browser}</div>
        <div class="flavor-free">
          <input type="text" placeholder="その他のフレーバーを自由入力" id="flavor-free-input">
          <button type="button" class="btn small secondary" id="flavor-free-add">追加</button>
        </div>
      </div>`;

    container.querySelectorAll('.wheel-seg, [data-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const p = el.dataset.path || el.dataset.toggle;
        if (!p) return;
        if (selectedSet.has(p)) selectedSet.delete(p); else selectedSet.add(p);
        const openGroups = [...container.querySelectorAll('details[open] summary')].map(s => s.textContent.trim());
        rerender();
        // アコーディオンの開閉状態を維持
        container.querySelectorAll('details').forEach(d => {
          if (openGroups.includes(d.querySelector('summary').textContent.trim())) d.open = true;
        });
        onChange?.();
      });
    });
    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedSet.delete(btn.dataset.remove);
        rerender();
        onChange?.();
      });
    });
    const freeInput = container.querySelector('#flavor-free-input');
    container.querySelector('#flavor-free-add').addEventListener('click', () => {
      const v = freeInput.value.trim();
      if (!v) return;
      selectedSet.add(v);
      rerender();
      onChange?.();
    });
  }
  rerender();
}
