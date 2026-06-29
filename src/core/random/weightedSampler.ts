import { ProductRecord } from '../../types/product';

/**
 * Think of this like a giant roulette wheel. Every product gets a "slice" of the wheel.
 * Popular items get big slices, rare items get tiny slices.
 * This function spins the wheel and hands us the winning product.
 */
export function pickRandomProduct(products: ProductRecord[], randomFloat: () => number): ProductRecord {
    
    // This gives us a random decimal between 0 and 1
    const spin = randomFloat();
    
    // This keeps track of the size of the slices we have checked so far
    let slicesChecked = 0;

    // Walk around the edge of the wheel, looking at each product's slice one by one
    for (const product of products) {
        slicesChecked += product.samplingWeight;
        
        if (spin <= slicesChecked) {
            return product; 
        }
    }

    // The Safety Net: Sometimes computer math isn't perfect and the wheel adds up  to 0.9999 instead of 1.0. If the ball slips through, just give them the very last item.
    return products[products.length - 1];
}