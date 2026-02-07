/**
 * TRADELINE INVENTORY DATA
 * 
 * This file serves as the single source of truth for tradline inventory.
 * Update this file daily/weekly and run the sync-tradelines API endpoint
 * to push changes to Supabase.
 * 
 * IMPORTANT: This is for easy LOCAL management. To use:
 * 1. Update the tradelines array below
 * 2. Call POST /api/sync-tradelines (requires admin auth)
 * 3. System will create/update records in Supabase
 */

export interface TradelineInventoryItem {
  cardId: string;           // Unique card identifier (e.g., "22830")
  bank: string;             // Bank name
  creditLimit: number;      // e.g., 10000 for $10,000
  accountAge: string;       // Format: "14y9m" (years and months)
  purchaseDeadline: string; // Date format: "Feb 26th" or "2026-02-26"
  reportingStart: string;   // Format: "Mar 9th" or "2026-03-09"
  reportingEnd: string;     // Format: "Mar 16th" or "2026-03-16"
  price: number;            // e.g., 780 for $780.00
  stock: number;            // Quantity available
  guarantees?: {
    noLatePayments: boolean;
    utilizationPercent: number;
    guaranteedPostDate: string; // e.g., "Mar 16th"
  };
  description?: string;
  active?: boolean;
}

/**
 * MAIN TRADELINE INVENTORY
 * Last updated: February 7, 2026
 */
export const tradelineInventory: TradelineInventoryItem[] = [
  {
    cardId: "22688",
    bank: "CP1",
    creditLimit: 7000,
    accountAge: "4y4m",
    purchaseDeadline: "Mar 1st",
    reportingStart: "Mar 12th",
    reportingEnd: "Mar 19th",
    price: 336,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 19th"
    }
  },
  {
    cardId: "14412",
    bank: "Barclays",
    creditLimit: 5000,
    accountAge: "5y3m",
    purchaseDeadline: "Feb 26th",
    reportingStart: "Mar 9th",
    reportingEnd: "Mar 16th",
    price: 336,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 16th"
    }
  },
  {
    cardId: "1139",
    bank: "Discover",
    creditLimit: 10500,
    accountAge: "2y1m",
    purchaseDeadline: "Feb 22nd",
    reportingStart: "Mar 5th",
    reportingEnd: "Mar 12th",
    price: 390,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 12th"
    }
  },
  {
    cardId: "17221",
    bank: "Elan",
    creditLimit: 22000,
    accountAge: "0y7m",
    purchaseDeadline: "Feb 22nd",
    reportingStart: "Mar 5th",
    reportingEnd: "Mar 12th",
    price: 420,
    stock: 2,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 12th"
    }
  },
  {
    cardId: "28219",
    bank: "CP1",
    creditLimit: 20000,
    accountAge: "1y7m",
    purchaseDeadline: "Feb 23rd",
    reportingStart: "Mar 6th",
    reportingEnd: "Mar 13th",
    price: 420,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 13th"
    }
  },
  {
    cardId: "22278",
    bank: "Chase",
    creditLimit: 5000,
    accountAge: "8y10m",
    purchaseDeadline: "Feb 24th",
    reportingStart: "Mar 7th",
    reportingEnd: "Mar 14th",
    price: 450,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 14th"
    }
  },
  {
    cardId: "22830",
    bank: "Chase",
    creditLimit: 10000,
    accountAge: "14y9m",
    purchaseDeadline: "Feb 26th",
    reportingStart: "Mar 9th",
    reportingEnd: "Mar 16th",
    price: 780,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 16th"
    },
    description: "Seasoned Chase tradeline with a 14y9m age and a $10,000 credit limit. This seasoned authorized user credit card tradeline is guaranteed to post by Mar 16th when purchased by Feb 26th. This tradeline is also guaranteed to have no late payments ever reported and a utilization of 15% or lower."
  },
  {
    cardId: "20653",
    bank: "Barclays",
    creditLimit: 15900,
    accountAge: "4y10m",
    purchaseDeadline: "Feb 28th",
    reportingStart: "Mar 11th",
    reportingEnd: "Mar 18th",
    price: 450,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 18th"
    }
  },
  {
    cardId: "28913",
    bank: "Discover",
    creditLimit: 5100,
    accountAge: "6y2m",
    purchaseDeadline: "Feb 21st",
    reportingStart: "Mar 4th",
    reportingEnd: "Mar 11th",
    price: 450,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 11th"
    }
  },
  {
    cardId: "29018",
    bank: "Chase",
    creditLimit: 5000,
    accountAge: "7y4m",
    purchaseDeadline: "Feb 16th",
    reportingStart: "Feb 27th",
    reportingEnd: "Mar 6th",
    price: 450,
    stock: 1,
    guarantees: {
      noLatePayments: true,
      utilizationPercent: 15,
      guaranteedPostDate: "Mar 6th"
    }
  }
  // Add more tradelines as needed...
];

export const REQUIRED_DOCUMENTS = [
  {
    id: "au_drivers_license",
    label: "Authorized User's Driver's License",
    description: "Valid government-issued ID"
  },
  {
    id: "au_ssn_card",
    label: "Authorized User's Social Security Card",
    description: "Original or certified copy"
  },
  {
    id: "billing_drivers_license",
    label: "Billing Party's Driver's License (if different from AU)",
    description: "Required if billing party differs from AU"
  }
];

export const PAYMENT_METHODS = [
  {
    id: "echeck",
    label: "Electronic Check",
    description: "Primary payment method (no credit cards)"
  }
];

export const EXCLUDED_STATES = ["Georgia"]; // States where tradelines cannot be sold

/**
 * Helper function to convert accounting age string to years and months
 */
export function parseAccountAge(ageString: string): { years: number; months: number } {
  const match = ageString.match(/(\d+)y(\d+)m/);
  if (match) {
    return {
      years: parseInt(match[1], 10),
      months: parseInt(match[2], 10)
    };
  }
  return { years: 0, months: 0 };
}

/**
 * Helper function to format account age for display
 */
export function formatAccountAge(years: number, months: number): string {
  return `${years}y${months}m`;
}
