import React from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { Download } from 'react-bootstrap-icons';
import { useParams } from 'react-router-dom';

// Fixed pixel margin around the graph in the exported image
const MARGIN = 30;

const escapeXml = (s) => String(s ?? '').replace(/[<>&"']/g, c => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
}[c]));

// Bootstrap Icons (same as PRNode.jsx) — 16x16 viewBox, rendered at smaller size in nodes
const SEARCH_ICON_PATHS = '<path fill="#333" d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>';
const EXT_ICON_PATHS = '<path fill="#333" fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/><path fill="#333" fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>';

// Wrap long text at word boundaries, ellipsize if it overflows maxLines.
const wrapText = (text, maxCharsPerLine = 38, maxLines = 2) => {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  const consumedWordCount = lines.join(' ').split(/\s+/).filter(Boolean).length;
  if (consumedWordCount < words.length && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxCharsPerLine - 1
      ? last.slice(0, maxCharsPerLine - 1) + '…'
      : last + '…';
  }
  return lines;
};

function DownloadButton({ fileNameBase }) {
  const { getNodes } = useReactFlow();
  const { owner, repo } = useParams();

  const onClick = () => {
    const allNodes = getNodes();
    const origin = window.location.origin;

    // Compute tight bounds from measured node dimensions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of allNodes) {
      const w = n.measured?.width ?? 300;
      const h = n.measured?.height ?? 60;
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + w);
      maxY = Math.max(maxY, n.position.y + h);
    }

    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;
    const imageWidth = Math.ceil(boundsWidth) + MARGIN * 2;
    const imageHeight = Math.ceil(boundsHeight) + MARGIN * 2;
    const tx = MARGIN - minX;
    const ty = MARGIN - minY;

    // --- Edge extraction ---
    // In ReactFlow v12, .react-flow__edges IS the <svg> element (not a container).
    // Use a broad selector that doesn't care about nesting.
    const edgesRoot = document.querySelector('.react-flow__edges');
    const defsEl = edgesRoot?.querySelector('defs');
    const defsMarkup = defsEl ? defsEl.innerHTML : '';

    const edgePathEls = document.querySelectorAll('.react-flow__edge-path');
    const pathsOut = [];
    edgePathEls.forEach(el => {
      const d = el.getAttribute('d');
      if (!d) return;
      const cs = window.getComputedStyle(el);
      const stroke = (cs.stroke && cs.stroke !== 'none') ? cs.stroke : '#b1b1b7';
      const strokeWidth = cs.strokeWidth || '1';
      const dash = (cs.strokeDasharray && cs.strokeDasharray !== 'none') ? cs.strokeDasharray : '';
      const markerEnd = el.getAttribute('marker-end') || '';
      const attrs = [
        `d="${d}"`,
        `stroke="${stroke}"`,
        `stroke-width="${strokeWidth}"`,
        'fill="none"',
        dash ? `stroke-dasharray="${dash}"` : '',
        markerEnd ? `marker-end="${markerEnd}"` : '',
      ].filter(Boolean).join(' ');
      pathsOut.push(`<path ${attrs}/>`);
    });
    const edgePathsMarkup = pathsOut.join('\n    ');

    // --- Node rendering ---
    const nodesMarkup = allNodes.map(node => {
      const w = node.measured?.width ?? 300;
      const h = node.measured?.height ?? 60;
      const bg = node.style?.background || '#d1d1d1';
      const isPRNode = node.type === 'prNode';
      const rawTitle = isPRNode ? node.data?.title : node.data?.label;
      const authorLogin = isPRNode ? node.data?.author?.login : null;
      const prUrl = isPRNode ? node.data?.url : null;
      const headRef = node.headRefName;
      const branchUrl = (isPRNode && owner && repo && headRef)
        ? `${origin}/tree/${owner}/${repo}/${encodeURIComponent(headRef)}`
        : null;

      const iconSize = 12;
      const iconPad = 4;

      // Wrap title; reserve ~20px of breathing room inside the node
      const titleLines = wrapText(rawTitle, Math.max(20, Math.floor((w - 24) / 6.5)), authorLogin ? 2 : 3);
      const lineHeight = 14;
      const totalTextHeight = lineHeight * titleLines.length + (authorLogin ? lineHeight + 2 : 0);
      const textStartY = (h - totalTextHeight) / 2 + lineHeight - 3;

      const titleTspans = titleLines.map((line, i) => (
        `<tspan x="${w / 2}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
      )).join('');

      const titleText = `<text x="${w / 2}" y="${textStartY}" text-anchor="middle" font-family="sans-serif" font-size="12">${titleTspans}</text>`;

      const authorText = authorLogin
        ? `<text x="${w / 2}" y="${textStartY + lineHeight * titleLines.length + 2}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#333">${escapeXml(`<${authorLogin}>`)}</text>`
        : '';

      // Two icons, bottom-right corner of the node (away from the title text)
      const iconY = h - iconSize - iconPad;
      const extIconX = w - iconPad - iconSize;
      const searchIconX = extIconX - iconPad - iconSize;
      const iconScale = iconSize / 16;

      const searchIconGraphic = `<g transform="translate(${searchIconX}, ${iconY}) scale(${iconScale})">${SEARCH_ICON_PATHS}</g>`;
      const extIconGraphic = `<g transform="translate(${extIconX}, ${iconY}) scale(${iconScale})">${EXT_ICON_PATHS}</g>`;

      // Each icon gets its own <a> wrapping the graphic + a transparent click-padding rect
      const clickPad = 2;
      const searchAnchor = branchUrl ? `<a href="${escapeXml(branchUrl)}">
      <rect x="${searchIconX - clickPad}" y="${iconY - clickPad}" width="${iconSize + clickPad * 2}" height="${iconSize + clickPad * 2}" fill="transparent"/>
      ${searchIconGraphic}
    </a>` : searchIconGraphic;

      const extAnchor = prUrl ? `<a href="${escapeXml(prUrl)}" target="_blank" rel="noopener noreferrer">
      <rect x="${extIconX - clickPad}" y="${iconY - clickPad}" width="${iconSize + clickPad * 2}" height="${iconSize + clickPad * 2}" fill="transparent"/>
      ${extIconGraphic}
    </a>` : extIconGraphic;

      const iconsLayer = isPRNode ? `\n    ${searchAnchor}\n    ${extAnchor}` : '';

      return `<g transform="translate(${node.position.x}, ${node.position.y})">
    <rect width="${w}" height="${h}" rx="8" ry="8" fill="${bg}" stroke="black" stroke-width="1"/>
    ${titleText}${authorText ? `\n    ${authorText}` : ''}${iconsLayer}
  </g>`;
    }).join('\n  ');

    // --- Compose final SVG ---
    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" viewBox="0 0 ${imageWidth} ${imageHeight}">
  <defs>${defsMarkup}</defs>
  <rect width="${imageWidth}" height="${imageHeight}" fill="#ffffff"/>
  <g transform="translate(${tx}, ${ty})">
    <g class="edges">
    ${edgePathsMarkup}
    </g>
    <g class="nodes">
  ${nodesMarkup}
    </g>
  </g>
</svg>`;

    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('download', `${fileNameBase}.svg`);
    a.setAttribute('href', url);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Panel position="top-right">
      <button className="download-btn" onClick={onClick}>
        Download Image <Download />
      </button>
    </Panel>
  );
}

export default DownloadButton;