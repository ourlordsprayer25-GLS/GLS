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

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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

function loadDB(): StoreDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        products: Array.isArray(parsed.products) ? parsed.products : [],
        deletedProductIds: Array.isArray(parsed.deletedProductIds) ? parsed.deletedProductIds : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        settings: parsed.settings || null,
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        brands: Array.isArray(parsed.brands) ? parsed.brands : [],
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
        dbState.products = products.filter(p => !deletedSet.has(p.id));
        changed = true;
      } else {
        const existingIds = new Set(dbState.products.map(p => p.id));
        for (const p of products) {
          if (!existingIds.has(p.id) && !deletedSet.has(p.id)) {
            dbState.products.push(p);
            changed = true;
          }
        }
      }
    }

    if (Array.isArray(orders) && dbState.orders.length === 0 && orders.length > 0) {
      dbState.orders = orders;
      changed = true;
    }

    if (Array.isArray(users) && dbState.users.length === 0 && users.length > 0) {
      dbState.users = users;
      changed = true;
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
      dbState.categories = categories;
      changed = true;
    }

    if (Array.isArray(brands) && dbState.brands.length === 0) {
      dbState.brands = brands;
      changed = true;
    }

    if (changed) {
      saveDB();
      broadcastSyncEvent('snapshot', dbState);
    }

    res.json({ success: true, db: dbState });
  });

  // 4. Products Sync API
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

  // Description Generation API endpoint
  app.post('/api/generate-description', async (req, res) => {
    const { name, materials, category } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Generate a high-end, professional product description for a product named "${name}" made of ${materials} in the ${category} category. Keep it concise, luxury-focused, and under 150 words.`,
      });
      res.json({ description: response.text });
    } catch (error) {
      console.error('Description generation error:', error);
      res.status(500).json({ error: 'Failed to generate description' });
    }
  });

  // Inventory Forecasting API endpoint
  app.post('/api/forecast-restock', async (req, res) => {
    const { products, orders } = req.body;
    try {
      const prompt = `
        Analyze the following inventory and sales data to suggest restocking quantities.
        Products: ${JSON.stringify(products.map((p: any) => ({ name: p.name, sku: p.sku, stock: p.stockLevel })))}
        Recent Orders: ${JSON.stringify(orders.slice(-50).map((o: any) => ({ items: o.items.map((i: any) => i.product.sku) })))}
        Return JSON array: [{ sku: string, suggestedRestock: number, reason: string }]
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
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
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`GLADYNS full-stack live-sync server running on http://localhost:${PORT}`);
  });
}

startServer();
