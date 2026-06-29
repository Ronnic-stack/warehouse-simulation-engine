import { ProductRecord } from '../../types/product';
import { Order } from '../../types/order';
import { createSeededRandom, randomInt, randomExponential } from '../random/seededRandom';
import { pickRandomProduct } from '../random/weightedSampler';


// This is the Master Clock. This simulates customers arriving over time and building their baskets.
 export function generateSimulationOrders(
    products: ProductRecord[], 
    totalOrders: number, 
    averageSecondsBetweenCustomers: number, 
    seed: number
): Order[] {
    
    // Turning on the locked random number machine
    const rng = createSeededRandom(seed);
    
    const allOrders: Order[] = [];
    let currentTime = 0;

    // letting customers into the store, one by one
    for (let i = 1; i <= totalOrders; i++) {
        
        // The Clock: Fast-forward time until the next customer arrives.
        // Instead of arriving exactly 30 seconds apart, some arrive in 5 seconds, some in 60.
        const timeGap = randomExponential(rng, averageSecondsBetweenCustomers);
        currentTime += timeGap;

        // The Basket Size: Decide how many items this customer buys (between 1 and 8 items)
        const basketSize = randomInt(rng, 1, 8);
        const currentBasket: ProductRecord[] = [];

        // The Shopping Trip: Spin the roulette wheel to fill their basket
        for (let b = 0; b < basketSize; b++) {
            const pickedItem = pickRandomProduct(products, rng);
            currentBasket.push(pickedItem);
        }

        // The Checkout: Print their receipt and save it to our master list
        allOrders.push({
            orderId: i,
            timeInSeconds: Math.round(currentTime), 
            basket: currentBasket
        });
    }

    return allOrders;
}