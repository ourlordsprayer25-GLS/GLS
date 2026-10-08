import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function unwrapLegacyCss(code: string): string {
  let result = code;

  // 1. Remove empty layer declarations: @layer components; etc.
  result = result.replace(/@layer\s+[a-z0-9_-]+\s*;/gi, '');

  // 2. Unwrap @layer <name> { ... }
  const layerRegex = /@layer\s+[a-z0-9_-]+\s*\{/gi;
  let match: RegExpExecArray | null;
  while ((match = layerRegex.exec(result)) !== null) {
    const startIdx = match.index;
    const openBraceIdx = startIdx + match[0].length - 1;
    let depth = 1;
    let closeBraceIdx = -1;
    for (let i = openBraceIdx + 1; i < result.length; i++) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') {
        depth--;
        if (depth === 0) {
          closeBraceIdx = i;
          break;
        }
      }
    }
    if (closeBraceIdx !== -1) {
      result =
        result.slice(0, startIdx) +
        result.slice(openBraceIdx + 1, closeBraceIdx) +
        result.slice(closeBraceIdx + 1);
      layerRegex.lastIndex = startIdx;
    } else {
      break;
    }
  }

  // 3. Unwrap :where(...) selectors for older browser compatibility (Chrome < 88 / MIUI Browser)
  let idx: number;
  while ((idx = result.indexOf(':where(')) !== -1) {
    const openParen = idx + 6;
    let depth = 1;
    let closeParen = -1;
    for (let i = openParen + 1; i < result.length; i++) {
      if (result[i] === '(') depth++;
      else if (result[i] === ')') {
        depth--;
        if (depth === 0) {
          closeParen = i;
          break;
        }
      }
    }
    if (closeParen !== -1) {
      const inner = result.slice(openParen + 1, closeParen);
      result = result.slice(0, idx) + inner + result.slice(closeParen + 1);
    } else {
      break;
    }
  }

  return result;
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'legacy-css-unwrapper',
        enforce: 'post',
        generateBundle(_, bundle) {
          for (const fileName in bundle) {
            if (fileName.endsWith('.css')) {
              const chunk = bundle[fileName];
              if (chunk && chunk.type === 'asset' && typeof chunk.source === 'string') {
                chunk.source = unwrapLegacyCss(chunk.source);
              }
            }
          }
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'GLADYNS Marketplace',
          short_name: 'GLADYNS',
          description: 'A highly curated global marketplace uniting exceptional design and precision technology.',
          theme_color: '#09090b',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          importScripts: ['/sw-push.js'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    build: {
      target: ['es2015', 'chrome79', 'edge79', 'firefox72', 'safari13'],
      cssTarget: ['chrome79', 'safari13'],
      cssMinify: 'lightningcss',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true; ignore data-store.json to prevent reload loops
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/data-store.json', '**/dist/**', '**/.git/**'],
      },
    },
  };
});
