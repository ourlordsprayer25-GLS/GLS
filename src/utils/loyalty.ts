import { LoyaltyTier } from '../types/store';

export interface TierConfig {
  id: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  name: string;
  minPoints: number;
  maxPoints: number | null; // null for highest tier
  multiplier: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    progressGradient: string;
    ringColor: string;
    iconColor: string;
  };
  perks: string[];
  description: string;
}

export const LOYALTY_TIERS: TierConfig[] = [
  {
    id: 'Bronze',
    name: 'Bronze Patron',
    minPoints: 0,
    maxPoints: 499,
    multiplier: '1.0x',
    colorScheme: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-900',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      progressGradient: 'from-amber-600 to-amber-500',
      ringColor: 'ring-amber-400',
      iconColor: 'text-amber-700',
    },
    description: 'Entry-level patron benefits with verified authentic sourcing and order tracking.',
    perks: [
      '1 reward point per $1 spent',
      'Real-time 5-stage order tracking & updates',
      '30-day trial & complimentary returns',
      'Seasonal newsletter & editorial dispatches',
    ],
  },
  {
    id: 'Silver',
    name: 'Silver Circle',
    minPoints: 500,
    maxPoints: 1499,
    multiplier: '1.25x',
    colorScheme: {
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      border: 'border-slate-300',
      badgeBg: 'bg-slate-200',
      badgeText: 'text-slate-800',
      progressGradient: 'from-slate-400 via-blue-500 to-blue-600',
      ringColor: 'ring-slate-400',
      iconColor: 'text-slate-600',
    },
    description: 'Enhanced privileges for regular connoisseurs, including flash drop priority.',
    perks: [
      '1.25 reward points per $1 spent (+25% bonus)',
      '2 hours early access to Hot Deals & Flash Vaults',
      'Dedicated WhatsApp VIP concierge support',
      'Annual anniversary reward credit',
    ],
  },
  {
    id: 'Gold',
    name: 'Gold Privilege',
    minPoints: 1500,
    maxPoints: 2999,
    multiplier: '1.5x',
    colorScheme: {
      bg: 'bg-yellow-50/70',
      text: 'text-yellow-950',
      border: 'border-amber-300',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-400',
      badgeText: 'text-amber-950 font-bold',
      progressGradient: 'from-yellow-400 via-amber-500 to-amber-600',
      ringColor: 'ring-yellow-400',
      iconColor: 'text-amber-500',
    },
    description: 'Premier status featuring complimentary express delivery and tailored styling.',
    perks: [
      '1.5 reward points per $1 spent (+50% bonus)',
      'Complimentary Global Express Courier delivery on all orders',
      'Priority garment tailoring & artisan repairs',
      'Invitation to private seasonal capsule showcases',
    ],
  },
  {
    id: 'Platinum',
    name: 'Platinum Elite',
    minPoints: 3000,
    maxPoints: null,
    multiplier: '2.0x',
    colorScheme: {
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-950',
      border: 'border-indigo-300',
      badgeBg: 'bg-gradient-to-r from-blue-700 to-indigo-900',
      badgeText: 'text-white font-bold',
      progressGradient: 'from-blue-600 via-indigo-600 to-slate-900',
      ringColor: 'ring-indigo-500',
      iconColor: 'text-indigo-600',
    },
    description: 'Highest echelon of patronage with 24/7 dedicated advisor and bespoke reservations.',
    perks: [
      '2.0 reward points per $1 spent (2x double points)',
      '24/7 Personal Boutique Concierge & Stylist',
      'Bespoke Made-to-Measure reservation access',
      'Lifetime warranty coverage across apparel and precision hardware',
      'VIP passes to international GLADYNS runway showcases',
    ],
  },
];

export interface LoyaltyProgress {
  currentTier: TierConfig;
  nextTier: TierConfig | null;
  points: number;
  pointsToNextTier: number;
  progressPercentage: number;
  isMaxTier: boolean;
  creditValueUSD: number;
}

export function calculateLoyaltyProgress(points: number): LoyaltyProgress {
  const safePoints = Math.max(0, Math.floor(points || 0));

  // Determine current tier based on points
  let currentTierIndex = 0;
  for (let i = 0; i < LOYALTY_TIERS.length; i++) {
    const tier = LOYALTY_TIERS[i];
    if (tier.maxPoints === null) {
      if (safePoints >= tier.minPoints) {
        currentTierIndex = i;
      }
    } else if (safePoints >= tier.minPoints && safePoints <= tier.maxPoints) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = LOYALTY_TIERS[currentTierIndex];
  const nextTier = currentTierIndex < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[currentTierIndex + 1] : null;
  const isMaxTier = nextTier === null;

  let pointsToNextTier = 0;
  let progressPercentage = 100;

  if (nextTier) {
    pointsToNextTier = Math.max(0, nextTier.minPoints - safePoints);
    const tierRange = nextTier.minPoints - currentTier.minPoints;
    const pointsIntoTier = safePoints - currentTier.minPoints;
    progressPercentage = Math.min(100, Math.max(0, Math.round((pointsIntoTier / tierRange) * 100)));
  }

  return {
    currentTier,
    nextTier,
    points: safePoints,
    pointsToNextTier,
    progressPercentage,
    isMaxTier,
    creditValueUSD: +(safePoints * 0.1).toFixed(2),
  };
}
