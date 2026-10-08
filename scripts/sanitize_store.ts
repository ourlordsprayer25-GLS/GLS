import fs from 'fs';
import path from 'path';

const storePath = path.join(process.cwd(), 'data-store.json');

if (!fs.existsSync(storePath)) {
  console.error('data-store.json not found!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(storePath, 'utf-8'));

// 1. Sanitize settings
if (data.settings) {
  data.settings.storeDescription =
    'Boutique Officielle GLADYNS — Électronique, Audio, Électroménager et Innovations de qualité certifiée.';

  if (!data.settings.aboutUs) {
    data.settings.aboutUs = {};
  }
  data.settings.aboutUs.title = 'About GLADYNS Department Store';
  data.settings.aboutUs.subtitle = 'Curated Multi-Department House & Living Standards';
  data.settings.aboutUs.content =
    'GLADYNS is a modern multi-department store curating premium electronics, studio musical instruments, and autonomous smart home appliances. Every department represents uncompromising engineering, sustainable materials, and rigorous functional design.';
  data.settings.aboutUs.missionStatement =
    'Pure Engineering, Acoustic Precision, and Enduring Quality Across Every Department.';

  if (!data.settings.heroContent) {
    data.settings.heroContent = {};
  }
  data.settings.heroContent.title = 'ELECTRONICS, INSTRUMENTS, APPLIANCES & INNOVATION';
  data.settings.heroContent.subtitle =
    'Curated studio analog synthesizers, planar acoustics, smart living tech, and precision equipment.';

  if (data.settings.moreToLoveSection) {
    data.settings.moreToLoveSection.subtitle =
      'Explore curated alternatives featuring precision engineering and superior craft from our global archive.';
  }

  if (data.settings.terms) {
    data.settings.terms.returnPolicy =
      'You have a dedicated return period from delivery to return any item in its original condition and packaging. Prepaid return labels can be generated directly from your live Order Pipeline dashboard.';
  }

  if (data.settings.refundPolicy) {
    data.settings.refundPolicy.overview =
      'At GLADYNS, we stand behind the exceptional quality and precision construction of every piece. If your acquisition does not fully meet your expectations, we provide a seamless 30-day return window with 100% complimentary return shipping.';
    data.settings.refundPolicy.exceptions =
      'Custom-configured items, personalized engraved pieces, and unsealed software or consumable accessories cannot be returned unless a manufacturing defect exists.';
  }
}

// 2. Sanitize products
let cleanedProductsCount = 0;
if (Array.isArray(data.products)) {
  data.products.forEach((p: any) => {
    let modified = false;

    // Check care
    if (typeof p.care === 'string' && /dry clean|wash|tumble|iron|fabric|garment/i.test(p.care)) {
      p.care = 'Wipe gently with a clean dry microfiber cloth. Avoid extreme humidity and moisture.';
      modified = true;
    }

    // Check materials
    if (typeof p.materials === 'string' && /wool|cotton|cashmere|twill|silk|linen|fleece/i.test(p.materials)) {
      p.materials = 'High-grade aerospace aluminum alloy, reinforced polymer & premium components';
      modified = true;
    }

    // Check category/department
    if (typeof p.category === 'string' && /apparel|fashion|outerwear|knitwear/i.test(p.category)) {
      p.category = 'accessories';
      p.categoryLabel = 'ACCESSORIES';
      modified = true;
    }

    if (typeof p.department === 'string' && /apparel|fashion/i.test(p.department)) {
      p.department = 'Living';
      modified = true;
    }

    // Check tags / descriptions
    if (typeof p.subtitle === 'string' && /wardrobe|fashion|garment|apparel/i.test(p.subtitle)) {
      p.subtitle = 'Curated Precision Standard';
      modified = true;
    }

    if (modified) {
      cleanedProductsCount++;
    }
  });
}

// 3. Sanitize categories
if (Array.isArray(data.categories)) {
  data.categories = data.categories.filter((cat: any) => {
    const id = (cat.id || cat.name || '').toLowerCase();
    return !['apparel', 'fashion', 'outerwear', 'knitwear', 'clothing'].includes(id);
  });
}

// Write back
fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Successfully sanitized data-store.json! Cleaned ${cleanedProductsCount} products.`);
