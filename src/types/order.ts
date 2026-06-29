import { ProductRecord } from './product';

/**
 * This is the exact blueprint for a single customer's checkout receipt.
 */
export interface Order {
    orderId: number;           // Customer #1, Customer #2, etc.
    timeInSeconds: number;     // Exactly when they checked out (e.g., 45 seconds after opening)
    basket: ProductRecord[];   // The list of items they bought
}