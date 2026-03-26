import { Hono } from 'hono';
import { verifyAgent } from '../lib/verifier.js';

export const badgeRoutes = new Hono();

const LEVEL_COLORS: Record<number, string> = {
  0: '#9e9e9e',
  1: '#2196f3',
  2: '#4caf50',
  3: '#ffc107',
};

function generateBadgeSVG(label: string, value: string, color: string): string {
  const labelWidth = label.length * 6.5 + 10;
  const valueWidth = value.length * 6.5 + 10;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="a">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#a)">
      <rect width="${labelWidth}" height="20" fill="#555"/>
      <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#b)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
      <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
      <text x="${labelWidth / 2}" y="14">${label}</text>
      <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
      <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
    </g>
  </svg>`;
}

badgeRoutes.get('/badge/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    const result = await verifyAgent(did);
    const level = result.verificationLevel;
    const score = Math.round(result.reputationScore * 10) / 10;
    const color = LEVEL_COLORS[level] ?? LEVEL_COLORS[0];
    const value = `Level ${level} \u2022 Score ${score}`;
    const svg = generateBadgeSVG('EtereCitizen', value, color);

    return c.body(svg, 200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'max-age=300',
    });
  } catch {
    const svg = generateBadgeSVG('EtereCitizen', 'Unknown', '#9e9e9e');

    return c.body(svg, 200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'max-age=300',
    });
  }
});
