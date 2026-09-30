import { UserProfile, Order } from '../types/store';
import { INITIAL_PRODUCTS } from './products';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-guest',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  tier: 'Bronze',
  loyaltyPoints: 0,
  lifetimePoints: 0,
  pointsHistory: [],
  addresses: [],
  preferences: {
    newsletter: false,
    dropAlerts: false,
    sustainablePackaging: false,
    preferredSize: 'M',
  },
  registeredDateExact: new Date().toISOString().replace('T', ' ').slice(0, 19),
  registrationDetails: {
    year: new Date().getFullYear(),
    month: new Date().toLocaleDateString('en-US', { month: 'long' }),
    day: new Date().getDate(),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    exactTimestamp: new Date().toISOString(),
  },
  deviceInfo: {
    deviceType: 'mobile',
    os: 'iOS 18.2',
    browser: 'Safari Mobile',
    isPwa: false,
  },
  location: {
    country: "Côte d'Ivoire",
    countryCode: 'CI',
    city: 'Abidjan (Cocody)',
    flag: '🇨🇮',
    ipAddress: '154.120.91.44',
  },
  sessionStatus: 'online',
  lastSeen: 'Just now',
  sessionDurationMinutes: 14,
  recentActivity: [
    { id: 'act-1', action: 'Browsing Storefront Catalog', page: 'Home Page', timestamp: 'Just now' },
    { id: 'act-2', action: 'Checked Shopping Bag', page: 'Cart Page', timestamp: '2 mins ago' },
  ],
};

export const INITIAL_CUSTOMERS: UserProfile[] = [];

export const INITIAL_ORDERS: Order[] = [];
