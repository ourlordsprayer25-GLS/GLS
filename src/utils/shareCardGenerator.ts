/**
 * GLADYNS MAISON - High-Definition Viral Share Card Canvas Generator
 * Produces crisp 1080x1080 graphics ready for Instagram Stories, WhatsApp Status, and social sharing.
 */

import { Product } from '../types/store';

export interface ShareCardOptions {
  mode: 'store' | 'product';
  product?: Product | null;
  formattedPrice?: string;
  storeName?: string;
  storeTagline?: string;
  websiteUrl?: string;
}

/**
 * Loads an image safely with CORS handling
 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback without crossOrigin if failed
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => resolve(null);
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

/**
 * Generates an ultra high-res 1080x1080 share card on an off-screen HTML5 Canvas
 */
export async function generateShareCard(options: ShareCardOptions): Promise<{ dataUrl: string; blob: Blob | null }> {
  const canvas = document.createElement('canvas');
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return { dataUrl: '', blob: null };
  }

  const {
    mode,
    product,
    formattedPrice = '200 000 CFA',
    storeName = 'GLADYNS ALL ACROSS',
    storeTagline = 'Curated studio audio, smart home technology, electronics & timeless atelier.',
    websiteUrl = 'https://gladyns.store',
  } = options;

  // 1. Luxury Dark Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, '#09090b'); // Pure obsidian
  bgGrad.addColorStop(0.5, '#0c1222'); // Deep midnight navy
  bgGrad.addColorStop(1, '#060810');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Ambient luminous halos
  const glow1 = ctx.createRadialGradient(size * 0.3, size * 0.25, 10, size * 0.3, size * 0.25, 450);
  glow1.addColorStop(0, 'rgba(37, 99, 235, 0.18)'); // Blue glow
  glow1.addColorStop(1, 'rgba(37, 99, 235, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, size, size);

  const glow2 = ctx.createRadialGradient(size * 0.75, size * 0.8, 10, size * 0.75, size * 0.8, 400);
  glow2.addColorStop(0, 'rgba(217, 119, 6, 0.12)'); // Amber/gold luxury glow
  glow2.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, size, size);

  // 3. Elegant Outer Frame Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, size - 80, size - 80);

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, size - 96, size - 96);

  // Corner Accent Brackets
  const cornerSize = 24;
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(35, 35 + cornerSize);
  ctx.lineTo(35, 35);
  ctx.lineTo(35 + cornerSize, 35);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(size - 35 - cornerSize, 35);
  ctx.lineTo(size - 35, 35);
  ctx.lineTo(size - 35, 35 + cornerSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(35, size - 35 - cornerSize);
  ctx.lineTo(35, size - 35);
  ctx.lineTo(35 + cornerSize, size - 35);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(size - 35 - cornerSize, size - 35);
  ctx.lineTo(size - 35, size - 35);
  ctx.lineTo(size - 35, size - 35 - cornerSize);
  ctx.stroke();

  if (mode === 'store' || !product) {
    // ==========================================
    // STOREFRONT CARD MODE
    // ==========================================

    // Load Logo Icon
    const logoImg = await loadImage('/assets/logo-icon.png');
    if (logoImg) {
      // Glow behind logo
      ctx.save();
      ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
      ctx.shadowBlur = 30;
      ctx.drawImage(logoImg, (size - 160) / 2, 130, 160, 160);
      ctx.restore();
    } else {
      // Fallback stylized monogram
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect((size - 130) / 2, 140, 130, 130, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 70px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('G', size / 2, 230);
    }

    // Top Category Pill
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect((size - 400) / 2, 330, 400, 42, 21);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✦ OFFICIAL MAISON & CURATED ATELIER ✦', size / 2, 357);

    // Main Store Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(storeName, size / 2, 440);

    // Subtitle Line
    ctx.fillStyle = '#94a3b8';
    ctx.font = '300 24px system-ui, sans-serif';
    ctx.fillText('HAUTE ELECTRONICS · STUDIO AUDIO · TIMELING LIVING', size / 2, 490);

    // Decorative Divider with Diamond
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size * 0.2, 540);
    ctx.lineTo(size * 0.45, 540);
    ctx.moveTo(size * 0.55, 540);
    ctx.lineTo(size * 0.8, 540);
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(size / 2, 540, 5, 0, Math.PI * 2);
    ctx.fill();

    // Narrative Tagline (Word-wrapped)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'normal 22px system-ui, sans-serif';
    wrapText(ctx, `"${storeTagline}"`, size / 2, 600, 780, 36);

    // Feature Badges Grid (3 Luxury Highlights)
    const features = [
      { icon: '🌍', text: 'Global Express Dispatch' },
      { icon: '🛡️', text: '100% Certified Warranty' },
      { icon: '✨', text: 'Curated Boutique Drops' },
    ];

    const cardY = 720;
    const cardW = 280;
    const startX = (size - (cardW * 3 + 40)) / 2;

    features.forEach((feat, idx) => {
      const cx = startX + idx * (cardW + 20);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx, cardY, cardW, 80, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${feat.icon} ${feat.text}`, cx + cardW / 2, cardY + 46);
    });

    // Bottom Website Link Pill Bar
    const barY = 880;
    const barW = 540;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect((size - barW) / 2, barY, barW, 64, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🔗 gladyns.store', size / 2, barY + 41);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Scan or visit to explore our active catalogue & seasonal drops', size / 2, 980);

  } else {
    // ==========================================
    // PRODUCT SHOWCASE CARD MODE
    // ==========================================

    // Top Brand Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GLADYNS MAISON · OFFICIAL SHOWCASE', size / 2, 100);

    // Product Image Container
    const imgBoxSize = 460;
    const imgX = (size - imgBoxSize) / 2;
    const imgY = 130;

    // Soft Card Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgBoxSize, imgBoxSize, 28);
    ctx.fill();
    ctx.stroke();

    // Draw Product Image
    const prodImgSrc = product.primaryImage || product.images?.[0];
    if (prodImgSrc) {
      const prodImg = await loadImage(prodImgSrc);
      if (prodImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX + 8, imgY + 8, imgBoxSize - 16, imgBoxSize - 16, 22);
        ctx.clip();
        ctx.drawImage(prodImg, imgX + 8, imgY + 8, imgBoxSize - 16, imgBoxSize - 16);
        ctx.restore();
      }
    }

    // Category / Department Badge
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect((size - 320) / 2, 620, 320, 36, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    const tagText = product.brand ? `${product.brand.toUpperCase()} · ${product.categoryLabel || product.category}` : (product.categoryLabel || 'CURATED PIECE');
    ctx.fillText(tagText.slice(0, 32), size / 2, 643);

    // Product Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    const cleanTitle = product.name.length > 40 ? `${product.name.slice(0, 38)}...` : product.name;
    ctx.fillText(cleanTitle, size / 2, 705);

    // Subtitle / Tagline
    if (product.subtitle || product.tagline) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '300 20px system-ui, sans-serif';
      const sub = (product.subtitle || product.tagline || '').slice(0, 60);
      ctx.fillText(sub, size / 2, 745);
    }

    // Price Badge Box (in CFA)
    const priceBoxY = 785;
    const priceBoxW = 420;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; // Emerald subtle glow
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect((size - priceBoxW) / 2, priceBoxY, priceBoxW, 76, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(formattedPrice, size / 2, priceBoxY + 50);

    // Bottom Bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`gladyns.store/product/${product.slug || product.id}`, size / 2, 920);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Available now with complimentary courier dispatch & warranty', size / 2, 960);
  }

  // Generate Data URL & Blob
  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));

  return { dataUrl, blob };
}

/**
 * Word wrap helper for canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

/**
 * Triggers instant browser file download of the generated card
 */
export function downloadShareCard(dataUrl: string, fileName: string = 'gladyns-maison-share.png') {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
