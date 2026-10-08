import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImage = 'C:/Users/SWEETO/.gemini/antigravity/brain/87e76c46-6bd3-4fd0-acd2-70b0ef9b3255/.user_uploaded/media_1791454050526.jpg';

function createIco(pngBuffers: { width: number; height: number; buffer: Buffer }[]): Buffer {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * numImages;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(numImages, 4);

  const dirEntries: Buffer[] = [];
  for (const img of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Colors
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image size
    entry.writeUInt32LE(offset, 12); // Offset
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((img) => img.buffer)]);
}

async function run() {
  console.log('Source image:', sourceImage);
  if (!fs.existsSync(sourceImage)) {
    console.error('Source image does not exist!');
    process.exit(1);
  }

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Listing existing public files:');
  const existingPublic = fs.readdirSync(publicDir);
  console.log(existingPublic);

  const srcAssetsDir = path.join(process.cwd(), 'src', 'assets');
  let existingSrcAssets: string[] = [];
  if (fs.existsSync(srcAssetsDir)) {
    existingSrcAssets = fs.readdirSync(srcAssetsDir);
    console.log('Listing existing src/assets files:');
    console.log(existingSrcAssets);
  }

  // Generate PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'pwa-64x64.png', size: 64 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'logo.png', size: 512 },
    { name: 'logo-icon.png', size: 192 },
  ];

  for (const item of sizes) {
    const dest = path.join(publicDir, item.name);
    await sharp(sourceImage)
      .resize(item.size, item.size, { fit: 'cover' })
      .png()
      .toFile(dest);
    console.log(`Generated ${dest} (${item.size}x${item.size})`);
  }

  // Maskable icon: Add slight padding (approx 10-15%) for maskable safe zone
  const maskableDest = path.join(publicDir, 'pwa-maskable-512x512.png');
  const innerSize = Math.round(512 * 0.8);
  const innerBuffer = await sharp(sourceImage)
    .resize(innerSize, innerSize, { fit: 'cover' })
    .png()
    .toBuffer();

  // Create background with color from corner or top edge of the source image
  // The source image has a rich blue background
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 10, g: 95, b: 210, alpha: 1 },
    },
  })
    .composite([
      {
        input: innerBuffer,
        gravity: 'center',
      },
    ])
    .png()
    .toFile(maskableDest);
  console.log(`Generated maskable icon ${maskableDest}`);

  // Favicon.ico (contains 16x16, 32x32, 48x48)
  const buf16 = await sharp(sourceImage).resize(16, 16).png().toBuffer();
  const buf32 = await sharp(sourceImage).resize(32, 32).png().toBuffer();
  const buf48 = await sharp(sourceImage).resize(48, 48).png().toBuffer();
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: buf16 },
    { width: 32, height: 32, buffer: buf32 },
    { width: 48, height: 48, buffer: buf48 },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico');

  // og-logo and assets
  await sharp(sourceImage).resize(1200, 1200, { fit: 'cover' }).png().toFile(path.join(publicDir, 'og-logo.png'));
  await sharp(sourceImage).resize(1200, 1200, { fit: 'cover' }).jpeg({ quality: 90 }).toFile(path.join(publicDir, 'og-logo.jpg'));
  console.log('Generated og-logo.png and og-logo.jpg');

  const publicAssetsDir = path.join(publicDir, 'assets');
  if (!fs.existsSync(publicAssetsDir)) {
    fs.mkdirSync(publicAssetsDir, { recursive: true });
  }
  await sharp(sourceImage).resize(512, 512, { fit: 'cover' }).png().toFile(path.join(publicAssetsDir, 'logo.png'));
  await sharp(sourceImage).resize(192, 192, { fit: 'cover' }).png().toFile(path.join(publicAssetsDir, 'logo-icon.png'));
  console.log('Generated public/assets/logo.png and logo-icon.png');

  // Also check if src/assets has logo or icons to update
  if (fs.existsSync(srcAssetsDir)) {
    for (const f of existingSrcAssets) {
      if (f.toLowerCase().includes('logo') || f.toLowerCase().includes('icon')) {
        const target = path.join(srcAssetsDir, f);
        if (f.endsWith('.png')) {
          await sharp(sourceImage).resize(512, 512, { fit: 'cover' }).png().toFile(target);
          console.log(`Updated src/assets/${f}`);
        } else if (f.endsWith('.jpg') || f.endsWith('.jpeg')) {
          await sharp(sourceImage).resize(512, 512, { fit: 'cover' }).jpeg().toFile(target);
          console.log(`Updated src/assets/${f}`);
        }
      }
    }
  }

  // Also update dist directory if it exists so dev/preview immediately picks it up
  const distDir = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    console.log('Updating dist directory...');
    const filesToCopy = [
      'favicon.ico',
      'favicon-32x32.png',
      'favicon-16x16.png',
      'apple-touch-icon.png',
      'apple-touch-icon-precomposed.png',
      'pwa-64x64.png',
      'pwa-192x192.png',
      'pwa-512x512.png',
      'pwa-maskable-512x512.png',
      'og-logo.png',
      'og-logo.jpg',
      'logo.png',
      'logo-icon.png',
    ];
    for (const f of filesToCopy) {
      const srcFile = path.join(publicDir, f);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(distDir, f));
      }
    }

    const distAssets = path.join(distDir, 'assets');
    if (!fs.existsSync(distAssets)) {
      fs.mkdirSync(distAssets, { recursive: true });
    }
    fs.copyFileSync(path.join(publicAssetsDir, 'logo.png'), path.join(distAssets, 'logo.png'));
    fs.copyFileSync(path.join(publicAssetsDir, 'logo-icon.png'), path.join(distAssets, 'logo-icon.png'));
  }

  console.log('Done generating icons!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
