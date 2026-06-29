// src/core/simulation/simulationClock.ts

export class SimulationClock {
    /**
     * Generates a timeline of order arrival timestamps using an Exponential distribution.
     * * @param durationMinutes Total time the simulation runs
     * @param meanInterArrivalSeconds Average time between orders (e.g., 7s for Normal scenario)
     * @param randomizer A function that returns a random number between 0 and 1 (Use your Mulberry32 function here!)
     * @returns An array of timestamps in seconds (e.g., [4.2, 12.8, 15.1, 22.9...])
     */
    public static generateArrivalTimeline(
        durationMinutes: number, 
        meanInterArrivalSeconds: number,
        randomizer: () => number = Math.random // Default to Math.random if seed isn't passed
    ): number[] {
        const arrivalTimes: number[] = [];
        let currentTime = 0;
        const maxTimeSeconds = durationMinutes * 60;

        while (true) {
            // Get a uniform random number between 0 and 1
            const u = randomizer();
            
            // Safety check to prevent Math.log(0) which returns -Infinity
            const safeU = Math.max(u, 0.000001);

            // Apply the Exponential Distribution formula
            const timeGap = -meanInterArrivalSeconds * Math.log(safeU);
            
            // Advance the clock by the randomized gap
            currentTime += timeGap;

            // If we've passed the end of the simulation, stop generating!
            if (currentTime >= maxTimeSeconds) {
                break;
            }

            // Add this timestamp to our master timeline
            arrivalTimes.push(Number(currentTime.toFixed(2)));
        }

        return arrivalTimes;
    }
}