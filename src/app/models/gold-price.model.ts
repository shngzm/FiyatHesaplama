/**
 * Gold Price Model
 * Represents current gold prices in Turkish Lira
 */
export interface GoldPrice {
  currency: string;      // Currency code (e.g., 'TRY')
  buying: number;        // Buying price (TL/gram) for 24 carat gold
  selling: number;       // Selling price (TL/gram) for 24 carat gold
  timestamp: Date;       // Last update timestamp
}

/**
 * API Response from Gold Price Service
 */
export interface GoldPriceApiResponse {
  GA?: {
    Alış?: string;
    Satış?: string;
    Tarih?: string;
  };
  // TCMB response format (alternative)
  data?: {
    buying?: number;
    selling?: number;
    date?: string;
  };
}
