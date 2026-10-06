import express, { Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = 2005;

// Centralized persistent store path
const DB_FILE = path.resolve(__dirname, 'data-store.json');

interface StoreDB {
  products: any[];
  deletedProductIds: string[];
  orders: any[];
  users: any[];
  notifications: any[];
  settings: any | null;
  categories: any[];
  brands: any[];
  carts: Record<string, any[]>;
  wishlists: Record<string, string[]>;
  lastUpdated: number;
}

const isMockProduct = (p: any) => {
  if (!p) return false;
  return (
    p.id === 'prod-analog-synth' ||
    p.id === 'prod-vinyl-turntable' ||
    p.id === 'prod-audiophile-headphones' ||
    p.id === 'prod-studio-monitors' ||
    p.id === 'prod-leather-weekender' ||
    p.id === 'prod-leather-tote' ||
    (typeof p.name === 'string' && (
      p.name.includes('Polyphonic Analog') ||
      p.name.includes('Direct-Drive') ||
      p.name.includes('Planar Magnetic') ||
      p.name.includes('Active Ribbon')
    ))
  );
};

const isMockOrder = (o: any) => {
  if (!o) return false;
  return (
    o.id === 'ord-1001' ||
    o.id === 'ord-1002' ||
    o.id === 'ord-1003' ||
    o.id === 'ord-1004' ||
    o.id?.startsWith('ord-c00') ||
    o.id?.startsWith('ord-100') ||
    o.orderNumber?.startsWith('GLS-9') ||
    o.id === 'ord-vintage-amp' ||
    o.id === 'ord-acoustic-guitar' ||
    o.id === 'ord-turntable' ||
    o.id === 'ord-synth'
  );
};

const isMockUser = (u: any) => {
  if (!u) return false;
  return (
    u.id === 'usr-c001' ||
    u.id === 'usr-c002' ||
    u.id === 'usr-c003' ||
    u.id === 'usr-c004' ||
    u.id === 'usr-guest' ||
    u.id?.startsWith('usr-c00') ||
    u.email?.includes('@gladyns-patron.ci') ||
    u.email?.includes('@luxeparis.fr') ||
    u.email === 'sarah.j@example.com' ||
    u.email === 'm.vance@example.com' ||
    u.email === 'elena.r@example.com' ||
    u.email === 'david.k@example.com' ||
    u.email === 'jp.moreau@luxeparis.fr'
  );
};

const isMockCategory = (c: any) => {
  if (!c) return false;
  return [
    'audio',
    'electronics',
    'wearables',
    'accessories',
    'lighting',
    'home',
    'leather-goods',
    'timepieces',
    'stationery',
    'all',
    'musical',
    'appliances',
    'apparel'
  ].includes(c.id);
};

const isMockBrand = (b: any) => {
  if (!b) return false;
  return (
    b.origin === 'United States' ||
    b.origin === 'Hong Kong' ||
    b.origin === 'Taiwan' ||
    b.origin === "Côte d'Ivoire" ||
    b.name === 'Bang & Olufsen' ||
    b.name === 'Teenage Engineering' ||
    b.name === 'Leica'
  );
};

const sanitizeProductVariants = (p: any): any => {
  if (!p) return p;
  let sizes = p.sizes || [];
  let colors = p.colors || [];
  const isApparelCategory = ['apparel', 'clothing', 'shoes', 'footwear', 'fashion', 'men', 'women'].includes((p.category || '').toLowerCase());
  if (!isApparelCategory && sizes.length === 3 && sizes.every((s: any) => ['S', 'M', 'L'].includes(s.name))) {
    sizes = [];
  }
  if (colors.length === 1 && colors[0].name.toLowerCase() === 'standard') {
    colors = [];
  }
  if (p.id === 'prod-1790854541223' && colors.length === 0) {
    colors = [
      { id: 'col-bose-1', name: 'Black', inStock: true, colorHex: '#000000' },
      { id: 'col-bose-2', name: 'White Smoke', inStock: true, colorHex: '#E5E7EB' }
    ];
  }
  if (p.id === 'prod-1790779519345' && colors.length === 0) {
    colors = [
      { id: 'col-jbl-1', name: 'Squad Camo', inStock: true, colorHex: '#3D4436' },
      { id: 'col-jbl-2', name: 'Midnight Black', inStock: true, colorHex: '#000000' },
      { id: 'col-jbl-3', name: 'Fiesta Red', inStock: true, colorHex: '#DC2626' }
    ];
  }
  return { ...p, sizes, colors };
};

function loadDB(): StoreDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        products: Array.isArray(parsed.products) ? parsed.products.filter((p: any) => !isMockProduct(p)).map(sanitizeProductVariants) : [],
        deletedProductIds: Array.isArray(parsed.deletedProductIds) ? parsed.deletedProductIds : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders.filter((o: any) => !isMockOrder(o)) : [],
        users: Array.isArray(parsed.users) ? parsed.users.filter((u: any) => !isMockUser(u)) : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        settings: parsed.settings || null,
        categories: Array.isArray(parsed.categories) ? parsed.categories.filter((c: any) => !isMockCategory(c)) : [],
        brands: Array.isArray(parsed.brands) ? parsed.brands.filter((b: any) => !isMockBrand(b)) : [],
        carts: parsed.carts && typeof parsed.carts === 'object' ? parsed.carts : {},
        wishlists: parsed.wishlists && typeof parsed.wishlists === 'object' ? parsed.wishlists : {},
        lastUpdated: parsed.lastUpdated || Date.now(),
      };
    }
  } catch (err) {
    console.error('Error reading data-store.json:', err);
  }
  return {
    products: [],
    deletedProductIds: [],
    orders: [],
    users: [],
    notifications: [],
    settings: null,
    categories: [],
    brands: [],
    carts: {},
    wishlists: {},
    lastUpdated: Date.now(),
  };
}

let dbState: StoreDB = loadDB();

function saveDB() {
  try {
    dbState.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data-store.json:', err);
  }
}

// Server-Sent Events (SSE) subscribers for instant multi-device live sync
const sseClients = new Set<Response>();

function broadcastSyncEvent(eventType: string, payload: any) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

function injectOGMetaTags(html: string, url: string, products: any[]): string {
  if (url.startsWith('/product/')) {
    const prodId = url.replace('/product/', '').split('?')[0];
    const product = products.find(p => p.id === prodId || p.slug === prodId);
    if (product) {
      const rawPrice = Number(product.price);
      const rawOrig = Number(product.originalPrice);

      const curPriceCFA = !isNaN(rawPrice) && rawPrice > 0
        ? (rawPrice < 500 ? Math.round(rawPrice * 605) : Math.round(rawPrice))
        : 0;

      const origPriceCFA = !isNaN(rawOrig) && rawOrig > 0
        ? (rawOrig < 500 ? Math.round(rawOrig * 605) : Math.round(rawOrig))
        : 0;

      const formatMoney = (n: number) => 'FCFA ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const formattedPrice = curPriceCFA > 0 ? formatMoney(curPriceCFA) : '';
      const formattedOrig = origPriceCFA > 0 ? formatMoney(origPriceCFA) : '';

      const discountPct = (origPriceCFA > curPriceCFA && curPriceCFA > 0)
        ? Math.round(((origPriceCFA - curPriceCFA) / origPriceCFA) * 100)
        : 0;

      const isOutOfStock = product.inStock === false || product.stockLevel === 0;
      const stockStr = isOutOfStock ? 'Out of Stock' : 'In Stock';
      const brandStr = product.brand || 'GLADYNS';

      let title = product.name;
      if (formattedPrice) {
        title = `${product.name} — ${formattedPrice}`;
      }

      let descParts = [];
      if (formattedPrice) {
        if (discountPct > 0 && formattedOrig) {
          descParts.push(`${formattedPrice} (was ${formattedOrig}, -${discountPct}%)`);
        } else {
          descParts.push(formattedPrice);
        }
        descParts.push(stockStr);
        if (brandStr) descParts.push(brandStr);
      }
      const desc = descParts.length > 0 ? descParts.join(' • ') : (product.subtitle || product.tagline || 'Discover premium goods at GLADYNS.');
      const img = product.primaryImage || (product.images && product.images[0]?.url) || '';
      
      let newHtml = html;
      newHtml = newHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/g, '');
      newHtml = newHtml.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/g, '');
      newHtml = newHtml.replace(/<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/g, '');
      newHtml = newHtml.replace(/<title>.*?<\/title>/g, '');
      
      const metaTags = `
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${desc}" />
        <meta property="og:image" content="${img}" />
      `;
      
      return newHtml.replace('</head>', metaTags + '</head>');
    }
  }
  return html;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  app.use(express.json({ limit: '10mb' }));

  // ==========================================
  // REAL-TIME CLOUD DATA SYNC API (MULTI-DEVICE)
  // ==========================================

  // 1. SSE Real-Time Sync Stream
  app.get('/api/sync/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('retry: 3000\n\n');

    // Send initial snapshot
    res.write(`event: init\ndata: ${JSON.stringify(dbState)}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // 2. Fetch Full Store Snapshot across all devices
  app.get('/api/sync/snapshot', (_req, res) => {
    res.json(dbState);
  });

  // 3. Initialize or Merge Seed Data from Client
  app.post('/api/sync/init', (req, res) => {
    const { products, orders, users, notifications, settings, categories, brands } = req.body;
    let changed = false;
    const deletedSet = new Set(dbState.deletedProductIds || []);

    if (Array.isArray(products) && products.length > 0) {
      if (dbState.products.length === 0) {
        dbState.products = products.filter(p => !deletedSet.has(p.id) && !isMockProduct(p));
        changed = true;
      } else {
        const existingIds = new Set(dbState.products.map(p => p.id));
        for (const p of products) {
          if (!existingIds.has(p.id) && !deletedSet.has(p.id) && !isMockProduct(p)) {
            dbState.products.push(p);
            changed = true;
          }
        }
      }
    }

    if (Array.isArray(orders) && dbState.orders.length === 0 && orders.length > 0) {
      const cleanOrders = orders.filter(o => !isMockOrder(o));
      if (cleanOrders.length > 0) {
        dbState.orders = cleanOrders;
        changed = true;
      }
    }

    if (Array.isArray(users) && dbState.users.length === 0 && users.length > 0) {
      const cleanUsers = users.filter(u => !isMockUser(u));
      if (cleanUsers.length > 0) {
        dbState.users = cleanUsers;
        changed = true;
      }
    }

    if (Array.isArray(notifications) && dbState.notifications.length === 0 && notifications.length > 0) {
      dbState.notifications = notifications;
      changed = true;
    }

    if (settings && !dbState.settings) {
      dbState.settings = settings;
      changed = true;
    }

    if (Array.isArray(categories) && dbState.categories.length === 0) {
      const cleanCategories = categories.filter(c => !isMockCategory(c));
      if (cleanCategories.length > 0) {
        dbState.categories = cleanCategories;
        changed = true;
      }
    }

    if (Array.isArray(brands) && dbState.brands.length === 0) {
      const cleanBrands = brands.filter(b => !isMockBrand(b));
      if (cleanBrands.length > 0) {
        dbState.brands = cleanBrands;
        changed = true;
      }
    }

    if (changed) {
      saveDB();
      broadcastSyncEvent('snapshot', dbState);
    }

    res.json({ success: true, db: dbState });
  });

  // Bulk Sync Endpoints to keep Central Server store aligned with Supabase
  app.post('/api/sync/orders/bulk-sync', (req, res) => {
    if (Array.isArray(req.body)) {
      dbState.orders = req.body.filter(o => !isMockOrder(o));
      saveDB();
      broadcastSyncEvent('orders', dbState.orders);
    }
    res.json({ success: true, count: dbState.orders.length });
  });

  app.post('/api/sync/categories/bulk-sync', (req, res) => {
    if (Array.isArray(req.body)) {
      dbState.categories = req.body.filter(c => !isMockCategory(c));
      saveDB();
      broadcastSyncEvent('categories', dbState.categories);
    }
    res.json({ success: true, count: dbState.categories.length });
  });

  app.post('/api/sync/brands/bulk-sync', (req, res) => {
    if (Array.isArray(req.body)) {
      dbState.brands = req.body.filter(b => !isMockBrand(b));
      saveDB();
      broadcastSyncEvent('brands', dbState.brands);
    }
    res.json({ success: true, count: dbState.brands.length });
  });

  app.post('/api/sync/users/bulk-sync', (req, res) => {
    if (Array.isArray(req.body)) {
      dbState.users = req.body.filter(u => !isMockUser(u));
      saveDB();
      broadcastSyncEvent('users', dbState.users);
    }
    res.json({ success: true, count: dbState.users.length });
  });

  // 4. Products Sync API
  app.post('/api/sync/products/bulk-sync', (req, res) => {
    if (Array.isArray(req.body) && req.body.length > 0) {
      const clean = req.body.filter(p => !isMockProduct(p)).map(sanitizeProductVariants);
      if (clean.length > 0) {
        dbState.products = clean;
        saveDB();
        broadcastSyncEvent('products', dbState.products);
      }
    }
    res.json({ success: true, count: dbState.products.length });
  });

  app.get('/api/sync/products', (_req, res) => {
    res.json(dbState.products);
  });

  app.post('/api/sync/products', (req, res) => {
    const product = req.body;
    if (!product || !product.id) {
      return res.status(400).json({ error: 'Product with ID required' });
    }

    // Unmark from deletedProductIds if added again
    if (dbState.deletedProductIds) {
      dbState.deletedProductIds = dbState.deletedProductIds.filter(id => id !== product.id);
    }

    const idx = dbState.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      dbState.products[idx] = product;
    } else {
      dbState.products.unshift(product); // New arrivals appear at the top of the storefront
    }
    saveDB();
    broadcastSyncEvent('products', dbState.products);
    res.json({ success: true, product });
  });

  app.delete('/api/sync/products/:id', (req, res) => {
    const { id } = req.params;
    dbState.products = dbState.products.filter(p => p.id !== id);
    if (!dbState.deletedProductIds) dbState.deletedProductIds = [];
    if (!dbState.deletedProductIds.includes(id)) {
      dbState.deletedProductIds.push(id);
    }
    saveDB();
    broadcastSyncEvent('products', dbState.products);
    res.json({ success: true, id });
  });

    // 4b. Categories Sync API
  app.get('/api/sync/categories', (_req, res) => {
    res.json(dbState.categories);
  });
  app.post('/api/sync/categories', (req, res) => {
    const category = req.body;
    if (!category || !category.id) return res.status(400).json({ error: 'Category with ID required' });
    const idx = dbState.categories.findIndex(c => c.id === category.id);
    if (idx >= 0) dbState.categories[idx] = category;
    else dbState.categories.push(category);
    saveDB();
    broadcastSyncEvent('categories', dbState.categories);
    res.json({ success: true, category });
  });
  app.delete('/api/sync/categories/:id', (req, res) => {
    dbState.categories = dbState.categories.filter(c => c.id !== req.params.id);
    saveDB();
    broadcastSyncEvent('categories', dbState.categories);
    res.json({ success: true });
  });

    // 4c. Brands Sync API
  app.get('/api/sync/brands', (_req, res) => {
    res.json(dbState.brands);
  });
  app.post('/api/sync/brands', (req, res) => {
    const brand = req.body;
    if (!brand || !brand.name) return res.status(400).json({ error: 'Brand with name required' });
    const idx = dbState.brands.findIndex(b => b.name === brand.name);
    if (idx >= 0) dbState.brands[idx] = brand;
    else dbState.brands.push(brand);
    saveDB();
    broadcastSyncEvent('brands', dbState.brands);
    res.json({ success: true, brand });
  });
  app.delete('/api/sync/brands/:name', (req, res) => {
    dbState.brands = dbState.brands.filter(b => b.name !== req.params.name);
    saveDB();
    broadcastSyncEvent('brands', dbState.brands);
    res.json({ success: true });
  });

  // 5. Orders Sync API (Cross-Device Real-Time)
  app.get('/api/sync/orders', (_req, res) => {
    res.json(dbState.orders);
  });

  app.post('/api/sync/orders', (req, res) => {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Order with ID required' });
    }
    const idx = dbState.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      dbState.orders[idx] = order;
    } else {
      dbState.orders.unshift(order);
    }
    saveDB();
    broadcastSyncEvent('orders', dbState.orders);
    res.json({ success: true, order });
  });

  app.patch('/api/sync/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = dbState.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.timeline = order.timeline || [];
      order.timeline.push({
        status,
        timestamp: Date.now(),
        description: `Order status updated to ${status}`,
      });
      saveDB();
      broadcastSyncEvent('orders', dbState.orders);
      return res.json({ success: true, order });
    }
    res.status(404).json({ error: 'Order not found' });
  });

  app.delete('/api/sync/orders/:id', (req, res) => {
    const { id } = req.params;
    dbState.orders = dbState.orders.filter(o => o.id !== id);
    saveDB();
    broadcastSyncEvent('orders', dbState.orders);
    res.json({ success: true, id });
  });

  // 6. Settings Sync API
  app.get('/api/sync/settings', (_req, res) => {
    res.json(dbState.settings);
  });

  app.post('/api/sync/settings', (req, res) => {
    dbState.settings = req.body;
    saveDB();
    broadcastSyncEvent('settings', dbState.settings);
    res.json({ success: true, settings: dbState.settings });
  });

  // 7. Users / Customers Sync API
  app.get('/api/sync/users', (_req, res) => {
    res.json(dbState.users);
  });

  app.post('/api/sync/users', (req, res) => {
    const user = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: 'User with ID required' });
    }
    const idx = dbState.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      dbState.users[idx] = { ...dbState.users[idx], ...user };
    } else {
      dbState.users.push(user);
    }
    saveDB();
    broadcastSyncEvent('users', dbState.users);
    res.json({ success: true, user });
  });

  // 8. Notifications Sync API
  app.get('/api/sync/notifications', (_req, res) => {
    res.json(dbState.notifications);
  });

  app.post('/api/sync/notifications', (req, res) => {
    const notif = req.body;
    if (!notif || !notif.id) {
      return res.status(400).json({ error: 'Notification with ID required' });
    }
    const idx = dbState.notifications.findIndex(n => n.id === notif.id);
    if (idx >= 0) {
      dbState.notifications[idx] = notif;
    } else {
      dbState.notifications.unshift(notif);
    }
    saveDB();
    broadcastSyncEvent('notifications', dbState.notifications);
    res.json({ success: true, notification: notif });
  });

  app.patch('/api/sync/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    const notif = dbState.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveDB();
      broadcastSyncEvent('notifications', dbState.notifications);
      return res.json({ success: true, notif });
    }
    res.status(404).json({ error: 'Notification not found' });
  });

  app.delete('/api/sync/notifications/:id', (req, res) => {
    const { id } = req.params;
    dbState.notifications = dbState.notifications.filter(n => 
      n.id !== id && 
      n.linkTarget !== id &&
      !n.id.includes(id)
    );
    saveDB();
    broadcastSyncEvent('notifications', dbState.notifications);
    res.json({ success: true, id });
  });

  app.delete('/api/sync/notifications', (_req, res) => {
    dbState.notifications = [];
    saveDB();
    broadcastSyncEvent('notifications', dbState.notifications);
    res.json({ success: true });
  });

  // 9. User Cart Sync API (Cloud Persisted)
  app.get('/api/sync/cart/:userId', (req, res) => {
    const { userId } = req.params;
    const cart = dbState.carts[userId] || [];
    res.json(cart);
  });

  app.post('/api/sync/cart/:userId', (req, res) => {
    const { userId } = req.params;
    const { items } = req.body;
    dbState.carts[userId] = Array.isArray(items) ? items : [];
    saveDB();
    broadcastSyncEvent(`cart:${userId}`, dbState.carts[userId]);
    res.json({ success: true, cart: dbState.carts[userId] });
  });

  // 10. User Wishlist Sync API (Cloud Persisted)
  app.get('/api/sync/wishlist/:userId', (req, res) => {
    const { userId } = req.params;
    const wishlist = dbState.wishlists[userId] || [];
    res.json(wishlist);
  });

  app.post('/api/sync/wishlist/:userId', (req, res) => {
    const { userId } = req.params;
    const { ids } = req.body;
    dbState.wishlists[userId] = Array.isArray(ids) ? ids : [];
    saveDB();
    broadcastSyncEvent(`wishlist:${userId}`, dbState.wishlists[userId]);
    res.json({ success: true, wishlist: dbState.wishlists[userId] });
  });

  // ==========================================
  // AI & EMAIL UTILITY API
  // ==========================================

  // Helper: Smart synthesized product description generator
  function generateSynthesizedDescription(params: {
    name: string;
    brand?: string;
    category?: string;
    materials?: string;
    condition?: string;
    specs?: { label: string; value: string }[];
    tagline?: string;
  }): string {
    const { name, brand, category, materials, condition, specs = [], tagline } = params;
    const brandPrefix = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ` : '';
    const fullName = `${brandPrefix}${name}`.trim();
    const condText = condition || 'Brand New';

    const cpuSpec = specs.find(s => s.label.toLowerCase().includes('processor') || s.label.toLowerCase().includes('cpu'))?.value;
    const ramSpec = specs.find(s => s.label.toLowerCase().includes('ram') || s.label.toLowerCase().includes('memory'))?.value;
    const storageSpec = specs.find(s => s.label.toLowerCase().includes('storage') || s.label.toLowerCase().includes('drive') || s.label.toLowerCase().includes('ssd'))?.value;
    const osSpec = specs.find(s => s.label.toLowerCase().includes('operating') || s.label.toLowerCase().includes('os'))?.value;
    const displaySpec = specs.find(s => s.label.toLowerCase().includes('display') || s.label.toLowerCase().includes('screen'))?.value;
    const workloadSpec = specs.find(s => s.label.toLowerCase().includes('work') || s.label.toLowerCase().includes('use') || s.label.toLowerCase().includes('purpose'))?.value;

    const isTechOrHardware = Boolean(
      cpuSpec || ramSpec || storageSpec || osSpec ||
      category?.toLowerCase().includes('computer') ||
      category?.toLowerCase().includes('laptop') ||
      category?.toLowerCase().includes('it') ||
      category?.toLowerCase().includes('tech') ||
      category?.toLowerCase().includes('electronic')
    );

    if (isTechOrHardware) {
      const p1 = `The ${fullName} is engineered for exceptional reliability, daily productivity, and computing efficiency. Verified in ${condText} condition, this piece has been fully inspected, benchmarked, and prepared for immediate deployment.`;

      const specBullets: string[] = [];
      if (cpuSpec) specBullets.push(`• Processor: ${cpuSpec}`);
      if (ramSpec) specBullets.push(`• RAM: ${ramSpec} for responsive multitasking`);
      if (storageSpec) specBullets.push(`• Storage: ${storageSpec} for rapid boots and file transfers`);
      if (displaySpec) specBullets.push(`• Display: ${displaySpec}`);
      if (osSpec) specBullets.push(`• Operating System: ${osSpec}`);
      if (workloadSpec) specBullets.push(`• Recommended For: ${workloadSpec}`);

      const p2 = specBullets.length > 0 
        ? `\n\nKey Technical Highlights:\n${specBullets.join('\n')}`
        : `\n\nEquipped with high-performance components, it smoothly powers through daily office applications, browser tabs, video calls, media, and development environments.`;

      const p3 = `\n\nEvery device is subjected to rigorous hardware quality checks—covering display clarity, ports, thermal cooling, keyboard responsiveness, and battery health—delivering dependable performance and peace of mind.`;

      return `${p1}${p2}${p3}`;
    }

    // General & Luxury Goods copy
    const matText = materials ? `crafted from ${materials}` : 'crafted with premium, high-grade materials';
    const catText = category ? ` in our curated ${category} collection` : '';
    
    const p1 = `Discover elevated quality and refined aesthetics with the ${fullName}. Thoughtfully created${catText} and ${matText}, this piece is presented in verified ${condText} condition.`;
    const p2 = tagline ? `\n\n"${tagline}" — balancing distinctive style with enduring utility.` : '\n\nDesigned to unite timeless appeal with everyday durability, providing a superior ownership experience.';
    const p3 = `\n\nCarefully inspected and certified for authenticity, craftsmanship, and exceptional finish. An outstanding acquisition for discerning clients.`;

    return `${p1}${p2}${p3}`;
  }

  // Description Generation API endpoint
  app.post('/api/generate-description', async (req, res) => {
    const { name, brand, materials, category, condition, specs, tagline } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Please enter a product name first.' });
    }

    // 1. Try Gemini if API key and client are configured
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const specsText = Array.isArray(specs) && specs.length > 0 
          ? specs.map((s: any) => `${s.label}: ${s.value}`).join(', ') 
          : 'None specified';
        
        const prompt = `Write a high-end, engaging, professional e-commerce product description for:
Product Name: "${name}"
Brand: "${brand || 'Generic'}"
Category: "${category || 'General'}"
Condition: "${condition || 'Brand New'}"
Materials: "${materials || 'Standard'}"
Key Specifications: ${specsText}

Requirements:
- Emphasize the specifications, performance, condition, and reliability.
- If technical hardware/laptop, include concise bullet points for CPU, RAM, and Storage.
- Keep it concise, authoritative, and attractive to buyers (100 to 180 words).`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const generated = response.text?.trim();
        if (generated) {
          return res.json({ description: generated });
        }
      } catch (geminiErr) {
        console.warn('Gemini generation fallback to synthesizer:', geminiErr);
      }
    }

    // 2. High-precision synthesized description (always succeeds, zero downtime)
    const fallback = generateSynthesizedDescription({ name, brand, category, materials, condition, specs, tagline });
    res.json({ description: fallback });
  });

  // Inventory Forecasting API endpoint
  app.post('/api/forecast-restock', async (req, res) => {
    const { products, orders } = req.body;
    if (!ai || !process.env.GEMINI_API_KEY) {
      // Rule-based inventory forecast fallback
      const forecasts = (Array.isArray(products) ? products : [])
        .filter((p: any) => (p.stockLevel || 0) < 5)
        .map((p: any) => ({
          sku: p.sku || 'SKU-UNKNOWN',
          suggestedRestock: Math.max(10, 15 - (p.stockLevel || 0)),
          reason: `Low stock threshold reached (${p.stockLevel || 0} remaining). High sales velocity projected.`,
        }));
      return res.json(forecasts);
    }
    try {
      const prompt = `
        Analyze the following inventory and sales data to suggest restocking quantities.
        Products: ${JSON.stringify(products.map((p: any) => ({ name: p.name, sku: p.sku, stock: p.stockLevel })))}
        Recent Orders: ${JSON.stringify(orders.slice(-50).map((o: any) => ({ items: o.items.map((i: any) => i.product.sku) })))}
        Return JSON array: [{ sku: string, suggestedRestock: number, reason: string }]
      `;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      res.json(JSON.parse(response.text || '[]'));
    } catch (error) {
      console.error('Forecasting error:', error);
      res.status(500).json({ error: 'Failed to forecast restock' });
    }
  });

  // Transactional Email API endpoint
  app.post('/api/send-email', async (req, res) => {
    const { toEmail, subject, customerName, orderNumber, statusText, detailsText } = req.body;

    if (!toEmail) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(toEmail)) {
      return res.status(400).json({ error: 'Invalid email syntax format.' });
    }

    const disposableDomains = [
      'tempmail.com', 'throwawaymail.com', 'mailinator.com', '10minutemail.com', 
      'yopmail.com', 'guerrillamail.com', 'dispostable.com', 'sharklasers.com'
    ];
    const emailDomain = toEmail.split('@')[1]?.toLowerCase() || '';
    if (disposableDomains.some(disposable => emailDomain.includes(disposable))) {
      return res.status(400).json({ error: 'Disposable email addresses are not permitted.' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

    const htmlContent = `
      <div style="font-family: 'Playfair Display', Georgia, serif; background-color: #FAF9F6; padding: 40px 20px; color: #1c1917; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; padding: 50px 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
          <div style="margin-bottom: 40px; border-bottom: 1px solid #f5f5f4; padding-bottom: 30px;">
            <h1 style="font-size: 30px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin: 0; color: #09090b;">GLADYNS</h1>
            <p style="font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #71717a; margin-top: 5px;">Department Store & Curation</p>
          </div>
          <h2 style="font-size: 22px; font-weight: 600; line-height: 1.4; margin-bottom: 25px; color: #18181b;">${subject}</h2>
          <p style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #4b5563; text-align: left; margin-bottom: 30px;">Dear ${customerName || 'Valued Patron'},</p>
          <p style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #4b5563; text-align: left; margin-bottom: 30px;">
            We are writing to provide a real-time status update for your order <strong>${orderNumber || ''}</strong>. 
            The current stage of your order is: <span style="background-color: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 13px;">${statusText || 'Updated'}</span>.
          </p>
          <div style="background-color: #fafaf9; border-radius: 8px; border: 1px solid #f5f5f4; padding: 25px; text-align: left; margin-bottom: 40px;">
            <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 15px; color: #09090b; border-bottom: 1px solid #e7e5e4; padding-bottom: 8px;">Order Summary</h3>
            <p style="font-family: sans-serif; font-size: 13px; line-height: 1.5; color: #52525b; margin: 5px 0;"><strong>Status Details:</strong> ${detailsText || ''}</p>
            <p style="font-family: sans-serif; font-size: 13px; line-height: 1.5; color: #52525b; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
          <div style="margin-bottom: 40px;">
            <a href="${process.env.APP_URL || 'https://gladyns.com'}" style="display: inline-block; background-color: #09090b; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 13px; font-family: sans-serif; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em;">
              Track Order Pipeline
            </a>
          </div>
          <div style="border-top: 1px solid #f5f5f4; padding-top: 30px; font-family: sans-serif; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
            <p style="margin: 0;">If you have any inquiries, please contact our 24/7 dedicated concierge service.</p>
            <p style="margin: 15px 0 0 0; font-weight: 600; color: #71717a;">GLADYNS Customer Relations</p>
          </div>
        </div>
      </div>
    `;

    console.log(`[EMAIL DISPATCH] To: ${toEmail} | Subject: "${subject}"`);

    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `GLADYNS <${senderEmail}>`,
            to: [toEmail],
            subject: subject,
            html: htmlContent,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          return res.status(502).json({ error: 'Failed to dispatch via Resend', details: data });
        }
        return res.status(200).json({ success: true, message: 'Email dispatched successfully', messageId: data.id });
      } catch (e) {
        console.error('Error dispatching email:', e);
        return res.status(500).json({ error: 'Internal server error while sending email' });
      }
    } else {
      console.log(`[DEVELOPMENT EMAIL LOG] To activate live email transmission, add RESEND_API_KEY to your .env file.`);
      return res.status(200).json({
        success: true,
        fallback: true,
        message: 'Email processed and logged in terminal (add RESEND_API_KEY to transmit live).',
      });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE INTEGRATION (DEV VS PROD)
  // ==========================================
  if (!isProd) {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server },
        watch: {
          ignored: ['**/data-store.json', '**/dist/**', '**/.git/**'],
        },
      },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      if (url.startsWith('/api/')) {
        return next();
      }

      const isFile = url.includes('.') && !url.endsWith('.html');
      const isViteInternal = url.startsWith('/@vite/') || url.startsWith('/@id/') || url.startsWith('/node_modules/');
      
      if (isFile || isViteInternal) {
        return next();
      }
      
      try {
        const rawHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        let template = await vite.transformIndexHtml(url, rawHtml);
          template = injectOGMetaTags(template, url, dbState.products);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      const rawHtml = fs.readFileSync(path.resolve(__dirname, 'dist/index.html'), 'utf-8');
        const finalHtml = injectOGMetaTags(rawHtml, req.originalUrl, dbState.products);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    });
  }

  server.listen(PORT, () => {
    console.log(`GLADYNS full-stack live-sync server running on http://localhost:${PORT}`);
    syncProductsFromSupabase();
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://objlslsagvfbhiddwsbz.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxzbHNhZ3ZmYmhpZGR3c2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzEzMDcsImV4cCI6MjEwNjM0NzMwN30.r3wuFy3TgByhbPs72WDQZGoX7LlAPn61UwAw6JF0lcY";

async function syncProductsFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const clean = data.filter((p: any) => !isMockProduct(p)).map(sanitizeProductVariants);
        if (clean.length > 0) {
          dbState.products = clean;
          saveDB();
          console.log(`[Supabase Sync] Successfully loaded ${clean.length} live products into data-store.json`);
        }
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Note: Background fetch from Supabase:', err?.message || err);
  }
}

startServer();



