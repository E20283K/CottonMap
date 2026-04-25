/**
 * Generates a premium base64 SVG for a custom field label card.
 * High-end design with accent bars and professional typography.
 */
/**
 * Generates a premium base64 SVG for a custom field label.
 * Supports hierarchical styles: Sektor (Halo) and Block (Pill).
 */
export function createCustomLabelImage(
  name: string, 
  area: string, 
  color: string, 
  type: 'sector' | 'block' = 'block',
  showArea: boolean = true
): { uri: string } {
  const nameLen = name.length;
  
  if (type === 'sector') {
    // Sector Style: Large Bold Text with Halo
    const W = nameLen * 12 + 40;
    const H = 40;
    const svg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <text x="${W/2}" y="${H/2 + 5}" 
              font-family="Arial, Helvetica, sans-serif" 
              font-size="20" 
              font-weight="900" 
              text-anchor="middle"
              stroke="${color}" 
              stroke-width="5"
              stroke-linejoin="round"
              opacity="0.8">
          ${name.toUpperCase()}
        </text>
        <text x="${W/2}" y="${H/2 + 5}" 
              font-family="Arial, Helvetica, sans-serif" 
              font-size="20" 
              font-weight="900" 
              text-anchor="middle"
              fill="white">
          ${name.toUpperCase()}
        </text>
      </svg>
    `;
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return { uri: `data:image/svg+xml;base64,${base64}` };
  } else {
    // Block Style: Compact Black Pill
    const displayLabel = showArea ? `${name} • ${area}` : name;
    const W = Math.max(displayLabel.length * 8 + 20, 60);
    const H = 28;
    const R = H / 2;

    const svg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${W}" height="${H}" rx="${R}" ry="${R}" fill="${color}" opacity="0.9" />
        <text x="${W/2}" y="${H/2 + 4}" 
              font-family="Arial, Helvetica, sans-serif" 
              font-size="11" 
              font-weight="700" 
              text-anchor="middle"
              fill="white">
          ${displayLabel}
        </text>
      </svg>
    `;
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return { uri: `data:image/svg+xml;base64,${base64}` };
  }
}
