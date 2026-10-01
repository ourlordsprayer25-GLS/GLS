
const localFetch = (url: string | URL | Request, init?: RequestInit) => {
  if (import.meta.env.PROD) {
    return Promise.resolve(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  return fetch(url, init);
};
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Order, UserProfile, StoreNotification, StoreSettings } from '../types/store';
import { INITIAL_PRODUCTS } from '../data/products';
import { INITIAL_ORDERS, INITIAL_CUSTOMERS } from '../data/user';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';

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
export function subscribeToProducts(onUpdate: (products: Product[]) => void) {
  initSSE();
  listeners.products.add(onUpdate);

  // 1. Fetch from Server Central Database
  localFetch('/api/sync/products')
    .then(r => r.json())
    .then(serverProducts => {
      if (Array.isArray(serverProducts)) {
        if (!isSupabaseConfigured || serverProducts.length > 0) onUpdate(serverProducts);
      } else {
        if (!isSupabaseConfigured) onUpdate(INITIAL_PRODUCTS);
      }
    })
    .catch(() => { if (!isSupabaseConfigured) onUpdate(INITIAL_PRODUCTS); });

  // 2. Supabase Integration if configured
  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    supabase
      .from('products')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          onUpdate(data as Product[]);
        }
      });

    supabaseChannel = supabase
      .channel('products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        const { data } = await supabase.from('products').select('*');
        if (data) {
          onUpdate(data as Product[]);
        }
      })
      .subscribe();
  }

  return () => {
    listeners.products.delete(onUpdate);
    if (supabaseChannel) supabase.removeChannel(supabaseChannel);
  };
}

/**
 * Real-time Subscription to Orders across all devices & Supabase
 */
export function subscribeToOrders(onUpdate: (orders: Order[]) => void) {
  initSSE();
  listeners.orders.add(onUpdate);

  localFetch('/api/sync/orders')
    .then(r => r.json())
    .then(serverOrders => {
      if (Array.isArray(serverOrders)) {
        onUpdate(serverOrders);
      } else {
        onUpdate(INITIAL_ORDERS);
      }
    })
    .catch(() => onUpdate(INITIAL_ORDERS));

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          onUpdate(data as Order[]);
        }
      });

    supabaseChannel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) onUpdate(data as Order[]);
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
export function subscribeToUsers(onUpdate: (users: UserProfile[]) => void) {
  initSSE();
  listeners.users.add(onUpdate);

  localFetch('/api/sync/users')
    .then(r => r.json())
    .then(serverUsers => {
      if (Array.isArray(serverUsers)) {
        onUpdate(serverUsers);
      } else {
        onUpdate(INITIAL_CUSTOMERS);
      }
    })
    .catch(() => onUpdate(INITIAL_CUSTOMERS));

  let supabaseChannel: any = null;
  if (isSupabaseConfigured) {
    supabase
      .from('users')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          onUpdate(data as UserProfile[]);
        }
      });

    supabaseChannel = supabase
      .channel('users_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        const { data } = await supabase.from('users').select('*');
        if (data && data.length > 0) onUpdate(data as UserProfile[]);
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
    supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          onUpdate(data as StoreNotification[]);
        }
      });

    supabaseChannel = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async () => {
        const { data } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
        if (data && data.length > 0) onUpdate(data as StoreNotification[]);
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

    supabaseChannel = supabase
      .channel('settings_realtime')
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
      await supabase.from('orders').upsert(order);
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

export async function saveRealtimeProduct(product: Product) {
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
      await supabase.from('products').upsert(product);
    } catch (err) {
      console.error('Supabase save product error:', err);
    }
  }
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
      await supabase.from('notifications').upsert(notification);
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




