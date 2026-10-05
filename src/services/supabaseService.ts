

const getCache = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
};
const setCache = (key: string, data: any) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
};

const localFetch = (url: string | URL | Request, init?: RequestInit) => {
  if (import.meta.env.PROD) {
    return Promise.resolve(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  return fetch(url, init);
};
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Order, UserProfile, StoreNotification, StoreSettings } from '../types/store';
import { INITIAL_PRODUCTS, CATEGORIES } from '../data/products';
import { INITIAL_ORDERS, INITIAL_CUSTOMERS, INITIAL_BRANDS } from '../data/user';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';

/**
 * Safely creates a uniquely named Supabase Realtime channel.
 * Using unique names prevents the "cannot add postgres_changes callbacks after subscribe()"
 * error caused by React StrictMode double-mounting or hot-module reloading.
 */
function createUniqueChannel(prefix: string) {
  const channelName = `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  return supabase.channel(channelName);
}

/**
 * Universal Multi-Device Real-Time Sync Service
 * Seamlessly coordinates between Supabase and Centralized Server Sync Engine
 */

// Initialize SSE connection for real-time multi-device broadcasts
type SyncListener = (data: any) => void;
const listeners = {
  products: new Set<SyncListener>(),
  orders: new Set<SyncListener>(),
  users: new Set<SyncListener>(),
  notifications: new Set<SyncListener>(),
  settings: new Set<SyncListener>(),
};

let isSseInitialized = false;

function initSSE() {
  if (isSseInitialized || typeof window === 'undefined') return;
  isSseInitialized = true;

  try {
    const eventSource = import.meta.env.PROD ? { addEventListener: ()=>{}, onerror: null } as unknown as EventSource : new EventSource('/api/sync/events');

    eventSource.addEventListener('init', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.products?.length) listeners.products.forEach(cb => cb(data.products));
        if (data.orders?.length) listeners.orders.forEach(cb => cb(data.orders));
        if (data.users?.length) listeners.users.forEach(cb => cb(data.users));
        if (data.notifications?.length) listeners.notifications.forEach(cb => cb(data.notifications));
        if (data.settings) listeners.settings.forEach(cb => cb(data.settings));
      } catch (err) {
        console.warn('SSE init parse error:', err);
      }
    });

    eventSource.addEventListener('products', (e) => {
      try {
        const data = JSON.parse(e.data);
        listeners.products.forEach(cb => cb(data));
      } catch (err) {}
    });

    eventSource.addEventListener('orders', (e) => {
      try {
        const data = JSON.parse(e.data);
        listeners.orders.forEach(cb => cb(data));
      } catch (err) {}
    });

    eventSource.addEventListener('users', (e) => {
      try {
        const data = JSON.parse(e.data);
        listeners.users.forEach(cb => cb(data));
      } catch (err) {}
    });

    eventSource.addEventListener('notifications', (e) => {
      try {
        const data = JSON.parse(e.data);
        listeners.notifications.forEach(cb => cb(data));
      } catch (err) {}
    });

    eventSource.addEventListener('settings', (e) => {
      try {
        const data = JSON.parse(e.data);
        listeners.settings.forEach(cb => cb(data));
      } catch (err) {}
    });

    eventSource.addEventListener('snapshot', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.products) listeners.products.forEach(cb => cb(data.products));
        if (data.orders) listeners.orders.forEach(cb => cb(data.orders));
        if (data.users) listeners.users.forEach(cb => cb(data.users));
        if (data.notifications) listeners.notifications.forEach(cb => cb(data.notifications));
        if (data.settings) listeners.settings.forEach(cb => cb(data.settings));
      } catch (err) {}
    });

    eventSource.onerror = () => {
      // Reconnection handled automatically by browser EventSource
    };
  } catch (err) {
    console.warn('SSE connection warning:', err);
  }
}

/**
 * Seed initial data to cloud server if empty
 */
export async function initServerSync(defaults: {
  products: Product[];
  orders: Order[];
  users: UserProfile[];
  notifications: StoreNotification[];
  settings: StoreSettings;
  categories: any[];
  brands: any[];
}) {
  try {
    await localFetch('/api/sync/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaults),
    });
  } catch (err) {
    console.warn('Server sync init fallback:', err);
  }
}

/**
 * Real-time Subscription to Products across all devices & Supabase
 */
export function subscribeToProducts(onUpdate: (products: Product[]) => void, onReady?: () => void) {
  initSSE();
  listeners.products.add(onUpdate);

  let readyCalled = false;
  const callReady = () => {
    if (!readyCalled && onReady) {
      readyCalled = true;
      onReady();
    }
  };

  // Snappy maximum boot timeout for loading screen (under 1s)
  const hardTimeout = setTimeout(() => callReady(), 800);

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

  let hasLoaded = false;
  const rawCached = getCache('gls_cache_products');
  const cached = Array.isArray(rawCached) ? rawCached.filter(p => !isMockProduct(p)) : null;
  if (cached && cached.length > 0) {
    onUpdate(cached);
    setCache('gls_cache_products', cached);
    hasLoaded = true;
    clearTimeout(hardTimeout);
    callReady(); // Instant dismiss if valid local cache already exists
  } else if (rawCached) {
    localStorage.removeItem('gls_cache_products');
  }
  
  const wrappedOnUpdate = (data: Product[]) => {
    const cleanData = (Array.isArray(data) ? data : []).filter(p => !isMockProduct(p));
    setCache('gls_cache_products', cleanData);
    onUpdate(cleanData);
  };
  
  localFetch('/api/sync/products')
    .then(r => r.json())
    .then(serverProducts => {
      if (Array.isArray(serverProducts) && serverProducts.length > 0) {
        wrappedOnUpdate(serverProducts);
        hasLoaded = true;
        clearTimeout(hardTimeout);
        callReady();
      }
    })
    .catch(() => {});

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    supabase
      .from('products')
      .select('*')
      .then(async ({ data, error }) => {
        if (!error && data && data.length > 0) {
          wrappedOnUpdate(data as Product[]);
          hasLoaded = true;
        } else if (!error && data && data.length === 0) {
          // Products table in Supabase is empty: preserve current active catalog!
          hasLoaded = true;
        } else if (error && !hasLoaded) {
          console.warn('Supabase products fetch failed:', error.message);
          const fallback = getCache('gls_cache_products') || [];
          if (fallback.length > 0) onUpdate(fallback);
        }
        clearTimeout(hardTimeout);
        callReady();
      });

    supabaseChannel = createUniqueChannel('products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        const { data } = await supabase.from('products').select('*');
        if (data && data.length > 0) {
          wrappedOnUpdate(data as Product[]);
        }
      })
      .subscribe();

    // Auto re-sync when tab becomes visible or focused (throttled to at most once per 60s)
    let lastProductFetchTime = Date.now();
    const fetchLatestProducts = async () => {
      if (Date.now() - lastProductFetchTime < 60000) return;
      lastProductFetchTime = Date.now();
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          wrappedOnUpdate(data as Product[]);
        }
      } catch (e) {
        try {
          const res = await localFetch('/api/sync/products');
          const serverProducts = await res.json();
          if (Array.isArray(serverProducts) && serverProducts.length > 0) {
            wrappedOnUpdate(serverProducts);
          }
        } catch (_) {}
      }
    };

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestProducts();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocusOrVisibility);
      document.addEventListener('visibilitychange', handleFocusOrVisibility);
    }

    return () => {
      clearTimeout(hardTimeout);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocusOrVisibility);
        document.removeEventListener('visibilitychange', handleFocusOrVisibility);
      }
      listeners.products.delete(onUpdate);
      if (supabaseChannel) supabase.removeChannel(supabaseChannel);
    };
  }

  return () => {
    clearTimeout(hardTimeout);
    listeners.products.delete(onUpdate);
  };
}

/**
 * Real-time Subscription to Orders across all devices & Supabase
 */
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

export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  initSSE();
  listeners.orders.add(onUpdate);

  const rawCached = getCache('gls_cache_orders');
  const cached = Array.isArray(rawCached) ? rawCached.filter(o => !isMockOrder(o)) : null;
  if (cached && cached.length > 0) {
    onUpdate(cached);
  }

  const wrappedOnUpdate = (data: Order[]) => {
    const clean = (Array.isArray(data) ? data : []).filter(o => !isMockOrder(o));
    setCache('gls_cache_orders', clean);
    onUpdate(clean);
  };

  localFetch('/api/sync/orders')
    .then(r => r.json())
    .then(serverOrders => {
      if (Array.isArray(serverOrders) && serverOrders.length > 0) {
        wrappedOnUpdate(serverOrders);
      } else if (!isSupabaseConfigured) {
        wrappedOnUpdate(INITIAL_ORDERS);
      }
    })
    .catch(() => {
      if (!isSupabaseConfigured) wrappedOnUpdate(INITIAL_ORDERS);
    });

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    let ordersDebounceTimer: any = null;
    const fetchSupabaseOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          wrappedOnUpdate(data as Order[]);
          try {
            await localFetch('/api/sync/orders/bulk-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
          } catch (e) {}
        }
      } catch (err) {
        try {
          const res = await localFetch('/api/sync/orders');
          const serverOrders = await res.json();
          if (Array.isArray(serverOrders) && serverOrders.length > 0) {
            wrappedOnUpdate(serverOrders);
          }
        } catch (_) {}
      }
    };

    fetchSupabaseOrders();

    supabaseChannel = createUniqueChannel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        if (ordersDebounceTimer) clearTimeout(ordersDebounceTimer);
        ordersDebounceTimer = setTimeout(fetchSupabaseOrders, 2000);
      })
      .subscribe();
  }

  return () => {
    listeners.orders.delete(onUpdate);
    if (supabaseChannel) supabase.removeChannel(supabaseChannel);
  };
}

/**
 * Real-time Subscription to Users across all devices & Supabase
 */
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

export function subscribeToUsers(onUpdate: (users: UserProfile[]) => void) {
  initSSE();
  listeners.users.add(onUpdate);

  const rawCached = getCache('gls_cache_users');
  const cached = Array.isArray(rawCached) ? rawCached.filter(u => !isMockUser(u)) : null;
  if (cached && cached.length > 0) {
    onUpdate(cached);
  }

  const wrappedOnUpdate = (data: UserProfile[]) => {
    const clean = (Array.isArray(data) ? data : []).filter(u => !isMockUser(u));
    // Sort registered users (with email) to the top!
    clean.sort((a, b) => {
      const aReg = Boolean(a.email);
      const bReg = Boolean(b.email);
      if (aReg && !bReg) return -1;
      if (!aReg && bReg) return 1;
      return 0;
    });
    setCache('gls_cache_users', clean);
    onUpdate(clean);
  };

  localFetch('/api/sync/users')
    .then(r => r.json())
    .then(serverUsers => {
      if (Array.isArray(serverUsers) && serverUsers.length > 0) {
        wrappedOnUpdate(serverUsers);
      } else if (!isSupabaseConfigured) {
        wrappedOnUpdate(INITIAL_CUSTOMERS);
      }
    })
    .catch(() => {
      if (!isSupabaseConfigured) wrappedOnUpdate(INITIAL_CUSTOMERS);
    });

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    let usersDebounceTimer: any = null;
    const fetchSupabaseUsers = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && Array.isArray(data)) {
          wrappedOnUpdate(data as UserProfile[]);
          try {
            await localFetch('/api/sync/users/bulk-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
          } catch (e) {}
        }
      } catch (err) {
        try {
          const res = await localFetch('/api/sync/users');
          const serverUsers = await res.json();
          if (Array.isArray(serverUsers) && serverUsers.length > 0) {
            wrappedOnUpdate(serverUsers);
          }
        } catch (_) {}
      }
    };

    fetchSupabaseUsers();

    supabaseChannel = createUniqueChannel('users_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        if (usersDebounceTimer) clearTimeout(usersDebounceTimer);
        usersDebounceTimer = setTimeout(fetchSupabaseUsers, 2500);
      })
      .subscribe();
  }

  return () => {
    listeners.users.delete(onUpdate);
    if (supabaseChannel) supabase.removeChannel(supabaseChannel);
  };
}

/**
 * Real-time Subscription to Notifications across all devices & Supabase
 */
export function subscribeToNotifications(onUpdate: (notifications: StoreNotification[]) => void) {
  initSSE();
  listeners.notifications.add(onUpdate);

  localFetch('/api/sync/notifications')
    .then(r => r.json())
    .then(serverNotifs => {
      if (Array.isArray(serverNotifs)) {
        onUpdate(serverNotifs);
      } else {
        onUpdate(INITIAL_NOTIFICATIONS);
      }
    })
    .catch(() => onUpdate(INITIAL_NOTIFICATIONS));

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    let notifDebounceTimer: any = null;
    const fetchNotifs = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) {
          onUpdate(data as StoreNotification[]);
        }
      } catch (err) {
        try {
          const res = await localFetch('/api/sync/notifications');
          const serverNotifs = await res.json();
          if (Array.isArray(serverNotifs)) onUpdate(serverNotifs);
        } catch (_) {}
      }
    };

    fetchNotifs();

    supabaseChannel = createUniqueChannel('notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async () => {
        if (notifDebounceTimer) clearTimeout(notifDebounceTimer);
        notifDebounceTimer = setTimeout(fetchNotifs, 3000);
      })
      .subscribe();
  }

  return () => {
    listeners.notifications.delete(onUpdate);
    if (supabaseChannel) supabase.removeChannel(supabaseChannel);
  };
}

/**
 * Real-time Subscription to Settings across all devices & Supabase
 */
export function subscribeToSettings(defaultSettings: StoreSettings, onUpdate: (settings: StoreSettings) => void) {
  initSSE();
  listeners.settings.add(onUpdate);

  localFetch('/api/sync/settings')
    .then(r => r.json())
    .then(serverSettings => {
      if (serverSettings && serverSettings.storeName) {
        onUpdate(serverSettings);
      } else {
        onUpdate(defaultSettings);
      }
    })
    .catch(() => onUpdate(defaultSettings));

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    supabase
      .from('settings')
      .select('*')
      .eq('id', 'store_config')
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data?.config) {
          onUpdate(data.config as StoreSettings);
        }
      });

    supabaseChannel = createUniqueChannel('settings_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new && (payload.new as any).config) {
          onUpdate((payload.new as any).config as StoreSettings);
        }
      })
      .subscribe();
  }

  return () => {
    listeners.settings.delete(onUpdate);
    if (supabaseChannel) supabase.removeChannel(supabaseChannel);
  };
}

/**
 * Data Mutations - Synced Everywhere
 */
export async function addRealtimeOrder(order: Order) {
  // Sync to Central Server
  try {
    await localFetch('/api/sync/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  } catch (err) {
    console.warn('Server order sync error:', err);
  }

  // Sync to Supabase
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('orders').upsert(order);
      if (error) {
        console.error('Supabase add order error:', error.message);
      }
    } catch (err) {
      console.error('Supabase add order error:', err);
    }
  }
}

export async function updateRealtimeOrderStatus(orderId: string, status: Order['status']) {
  try {
    await localFetch(`/api/sync/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.warn('Server order status sync error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch (err) {
      console.error('Supabase update order status error:', err);
    }
  }
}

export async function deleteRealtimeOrder(orderId: string) {
  try {
    await localFetch(`/api/sync/orders/${orderId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Server delete order sync error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (err) {
      console.error('Supabase delete order error:', err);
    }
  }
}

export async function saveRealtimeProduct(product: Product): Promise<{ success: boolean; error?: string }> {
  try {
    await localFetch('/api/sync/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
  } catch (err) {
    console.warn('Server save product sync error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('products').upsert(product);
      if (error) {
        console.error('Supabase save product error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Supabase save product error:', err);
      return { success: false, error: err?.message || 'Failed to save product to database' };
    }
  }
  return { success: true };
}

export async function deleteRealtimeProduct(productId: string) {
  try {
    await localFetch(`/api/sync/products/${productId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Server delete product sync error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (err) {
      console.error('Supabase delete product error:', err);
    }
  }
}

export async function updateRealtimeUserProfile(userProfile: UserProfile) {
  if (!userProfile.id) return;
  try {
    await localFetch('/api/sync/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile),
    });
  } catch (err) {
    console.warn('Server user sync error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').upsert(userProfile);
    } catch (err) {
      console.error('Supabase update user profile error:', err);
    }
  }
}

export async function updateRealtimeUserActivity(userId: string, actionText: string, page: string) {
  if (!userId) return;
  const newActivity = {
    id: `act-${Date.now()}`,
    action: actionText,
    page,
    timestamp: Date.now(),
  };

  try {
    await localFetch('/api/sync/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userId,
        lastSeen: 'Active Now',
        sessionStatus: 'online',
        recentActivity: [newActivity],
      }),
    });
  } catch (err) {}

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('users').select('recentActivity').eq('id', userId).maybeSingle();
      const existing = data?.recentActivity || [];
      const recent = [newActivity, ...existing].slice(0, 15);
      await supabase.from('users').update({
        recentActivity: recent,
        lastSeen: 'Active Now',
        sessionStatus: 'online',
      }).eq('id', userId);
    } catch (err) {
      console.error('Supabase update user activity error:', err);
    }
  }
}

export async function saveRealtimeSettings(settings: StoreSettings) {
  try {
    await localFetch('/api/sync/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  } catch (err) {
    console.warn('Server settings sync error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('settings').upsert({
        id: 'store_config',
        config: settings,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Supabase save settings error:', err);
    }
  }
}

export async function addRealtimeNotification(notification: StoreNotification) {
  try {
    await localFetch('/api/sync/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    });
  } catch (err) {
    console.warn('Server notification sync error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('notifications').upsert(notification);
      if (error) {
        console.error('Supabase add notification error:', error.message);
      }
    } catch (err) {
      console.error('Supabase add notification error:', err);
    }
  }
}

export async function markRealtimeNotificationRead(notificationId: string) {
  try {
    await localFetch(`/api/sync/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  } catch (err) {
    console.warn('Server mark notification read error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    } catch (err) {
      console.error('Supabase mark notification read error:', err);
    }
  }
}

export async function deleteRealtimeNotification(notificationId: string) {
  try {
    await localFetch(`/api/sync/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Server delete notification sync error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('notifications').delete().eq('id', notificationId);
    } catch (err) {
      console.error('Supabase delete notification error:', err);
    }
  }
}

// ==========================================
// CART & WISHLIST REAL-TIME CLOUD PERSISTENCE
// ==========================================

export async function fetchRealtimeCart(userId: string): Promise<any[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('users').select('cart_items').eq('id', userId).maybeSingle();
      if (!error && data?.cart_items && Array.isArray(data.cart_items)) {
        return data.cart_items;
      }
    } catch (err) {
      console.warn('Supabase fetch cart error:', err);
    }
  }

  try {
    const res = await localFetch(`/api/sync/cart/${userId}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Server fetch cart error:', err);
  }
  return [];
}

export async function saveRealtimeCart(userId: string, items: any[]) {
  try {
    await localFetch(`/api/sync/cart/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch (err) {
    console.warn('Server save cart error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').upsert({
        id: userId,
        cart_items: items,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Supabase save cart error:', err);
    }
  }
}

export async function fetchRealtimeWishlist(userId: string): Promise<string[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('users').select('wishlist_ids').eq('id', userId).maybeSingle();
      if (!error && data?.wishlist_ids && Array.isArray(data.wishlist_ids)) {
        return data.wishlist_ids;
      }
    } catch (err) {
      console.warn('Supabase fetch wishlist error:', err);
    }
  }

  try {
    const res = await localFetch(`/api/sync/wishlist/${userId}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Server fetch wishlist error:', err);
  }
  return [];
}

export async function saveRealtimeWishlist(userId: string, ids: string[]) {
  try {
    await localFetch(`/api/sync/wishlist/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  } catch (err) {
    console.warn('Server save wishlist error:', err);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').upsert({
        id: userId,
        wishlist_ids: ids,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Supabase save wishlist error:', err);
    }
  }
}

export async function fetchRealtimeUserProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      if (!error && data && data.length > 0) {
        return data as UserProfile;
      }
    } catch (err) {
      console.warn('Supabase fetch user profile error:', err);
    }
  }

  try {
    const res = await localFetch('/api/sync/users');
    if (res.ok) {
      const users = await res.json();
      if (Array.isArray(users)) {
        const found = users.find(u => u.id === userId);
        if (found) return found;
      }
    }
  } catch (err) {
    console.warn('Server fetch user error:', err);
  }
  return null;
}






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

export function subscribeToCategories(onUpdate: (categories: any[]) => void) {
  initSSE();
  if (!(listeners as any).categories) (listeners as any).categories = new Set();
  (listeners as any).categories.add(onUpdate);

  const rawCached = getCache('gls_cache_categories');
  const cached = Array.isArray(rawCached) ? rawCached.filter(c => !isMockCategory(c)) : null;
  if (cached && cached.length > 0) {
    onUpdate(cached);
  }
  
  const wrappedOnUpdateCat = (data: any[]) => {
    const clean = (Array.isArray(data) ? data : []).filter(c => !isMockCategory(c));
    setCache('gls_cache_categories', clean);
    onUpdate(clean);
  };
  
  localFetch('/api/sync/categories')
    .then(r => r.json())
    .then(serverCats => {
      if (Array.isArray(serverCats) && serverCats.length > 0) {
        wrappedOnUpdateCat(serverCats);
      } else if (!isSupabaseConfigured) {
        wrappedOnUpdateCat(CATEGORIES as any);
      }
    })
    .catch(() => {});

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    const fetchSupabaseCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          wrappedOnUpdateCat(data);
          try {
            await localFetch('/api/sync/categories/bulk-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
          } catch (e) {}
        }
      } catch (err) {}
    };

    fetchSupabaseCategories();

    supabaseChannel = createUniqueChannel('categories_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchSupabaseCategories();
      })
      .subscribe();
  }

  return () => {
    if ((listeners as any).categories) (listeners as any).categories.delete(onUpdate);
    if (supabaseChannel) supabase.removeChannel(supabaseChannel);
  };
}

export async function saveRealtimeCategory(category: any) {
  try {
    await localFetch('/api/sync/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
  } catch (err) {}
  
  if (isSupabaseConfigured) {
    try {
      await supabase.from('categories').upsert(category);
    } catch (err) {}
  }
}

export async function deleteRealtimeCategory(categoryId: string) {
  try {
    await localFetch('/api/sync/categories/' + categoryId, { method: 'DELETE' });
  } catch (err) {}
  
  if (isSupabaseConfigured) {
    try {
      await supabase.from('categories').delete().eq('id', categoryId);
    } catch (err) {}
  }
}

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

export function subscribeToBrands(onUpdate: (brands: any[]) => void) {
  initSSE();
  if (!(listeners as any).brands) (listeners as any).brands = new Set();
  (listeners as any).brands.add(onUpdate);

  const rawCached = getCache('gls_cache_brands');
  const cached = Array.isArray(rawCached) ? rawCached.filter(b => !isMockBrand(b)) : null;
  if (cached && cached.length > 0) {
    onUpdate(cached);
  }
  
  const wrappedOnUpdateBrand = (data: any[]) => {
    const clean = (Array.isArray(data) ? data : []).filter(b => !isMockBrand(b));
    setCache('gls_cache_brands', clean);
    onUpdate(clean);
  };
  
  localFetch('/api/sync/brands')
    .then(r => r.json())
    .then(serverBrands => {
      if (Array.isArray(serverBrands) && serverBrands.length > 0) {
        wrappedOnUpdateBrand(serverBrands);
      } else if (!isSupabaseConfigured) {
        wrappedOnUpdateBrand(INITIAL_BRANDS);
      }
    })
    .catch(() => {});

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    const fetchSupabaseBrands = async () => {
      try {
        const { data, error } = await supabase.from('brands').select('name, origin');
        if (!error && Array.isArray(data) && data.length > 0) {
          wrappedOnUpdateBrand(data);
          try {
            await localFetch('/api/sync/brands/bulk-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
          } catch (e) {}
        }
      } catch (err) {}
    };

    fetchSupabaseBrands();

    supabaseChannel = createUniqueChannel('brands_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, () => {
        fetchSupabaseBrands();
      })
      .subscribe();
  }

  return () => {
    if ((listeners as any).brands) (listeners as any).brands.delete(onUpdate);
    if (supabaseChannel) supabase.removeChannel(supabaseChannel);
  };
}

export async function saveRealtimeBrand(brand: any) {
  try {
    await localFetch('/api/sync/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brand),
    });
  } catch (err) {}
  
  if (isSupabaseConfigured) {
    try {
      await supabase.from('brands').upsert(brand);
    } catch (err) {}
  }
}

export async function deleteRealtimeBrand(brandName: string) {
  try {
    await localFetch('/api/sync/brands/' + brandName, { method: 'DELETE' });
  } catch (err) {}
  
  if (isSupabaseConfigured) {
    try {
      await supabase.from('brands').delete().eq('name', brandName);
    } catch (err) {}
  }
}






