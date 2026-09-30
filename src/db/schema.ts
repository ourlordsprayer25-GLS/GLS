import { pgTable, serial, text, timestamp, integer, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (linked to Supabase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  category: text('category').notNull(),
  brand: text('brand').notNull(),
  primaryImage: text('primary_image').notNull(),
  images: jsonb('images').$type<string[]>().default([]),
  colors: jsonb('colors').default([]),
  sizes: jsonb('sizes').default([]),
  features: jsonb('features').default([]),
  stock: integer('stock').default(100),
  isNew: text('is_new').default('false'),
  hotDeal: text('hot_deal').default('false'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('confirmed'),
  total: doublePrecision('total').notNull(),
  subtotal: doublePrecision('subtotal').notNull(),
  tax: doublePrecision('tax').notNull(),
  shippingCost: doublePrecision('shipping_cost').notNull(),
  discount: doublePrecision('discount').notNull(),
  shippingMethod: text('shipping_method').notNull(),
  trackingNumber: text('tracking_number'),
  estimatedDelivery: text('estimated_delivery'),
  shippingAddress: jsonb('shipping_address').notNull(),
  paymentMethod: text('payment_method').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  price: doublePrecision('price').notNull(),
  selectedColor: jsonb('selected_color'),
  selectedSize: jsonb('selected_size'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
