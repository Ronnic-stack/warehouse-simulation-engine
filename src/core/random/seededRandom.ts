/**
 * Creates our custom "Random Number Machine". 
 * Because we use a "seed" (like the number 42), this machine is locked. 
 * If you run the game 100 times with the same seed, it will generate the 
 * exact same sequence of random decimals every single time.
 */
export function createSeededRandom(seed: number): () => number {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

/**
 * Picks a random whole number between a minimum and a maximum.
 * Example: If you need a customer to buy between 1 and 8 items, 
 * this function will pick a whole number (like 3 or 5) from that range.
 */
export function randomInt(rng: () => number, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Creates realistic, unpredictable time gaps for when customers arrive.
 * Instead of customers arriving exactly every 5 seconds like robots, 
 * this math makes them arrive in natural clumps (sometimes two arrive instantly, 
 * sometimes nobody arrives for a minute), but it perfectly averages out over time.
 */
export function randomExponential(rng: () => number, mean: number): number {
    return -mean * Math.log(1 - rng());
}