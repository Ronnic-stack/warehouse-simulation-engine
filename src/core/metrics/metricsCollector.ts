// src/core/metrics/metricsCollector.ts
import { EventBus } from '../simulation/eventBus';
import { SimulationEvent } from '../../types/events';

// The shape of our final dashboard data
export interface FinalMetrics {
    totalOrdersCompleted: number;
    totalItemsPicked: number;
    pickerTravelDistance: number;
    averageOrderFulfilmentTime: number;
    averageTravelDistancePerItem: number;
    pickRatePerMinute: number;
    pickerUtilisationRate: number;
    pickDensityPerAisle: Record<string, number>;
}

export class MetricsCollector {
    // 1. Raw Data Counters
    private totalOrdersCompleted: number = 0;
    private totalItemsPicked: number = 0;
    private pickerTravelDistance: number = 0;
    
    // 2. Time & Aisle Tracking
    private totalSimulationTime: number = 0;
    private totalFulfilmentTime: number = 0;
    private aislePickCounts: Record<string, number> = {};

    constructor(private eventBus: EventBus) {
        this.eventBus.subscribe((event) => this.handleEvent(event));
    }

    private handleEvent(event: SimulationEvent) {
        // Keep our master clock synced with the latest event
        if (event.simulationTime > this.totalSimulationTime) {
            this.totalSimulationTime = event.simulationTime;
        }

        switch (event.type) {
            case "PICKER_MOVED":
                this.pickerTravelDistance += 1;
                break;

            case "ITEM_PICKED":
                this.totalItemsPicked += 1;
                // Count which aisle this pick happened in
                const aisle = event.warehouseAisleId;
                this.aislePickCounts[aisle] = (this.aislePickCounts[aisle] || 0) + 1;
                break;

            case "ORDER_COMPLETED":
                this.totalOrdersCompleted += 1;
                this.totalFulfilmentTime += event.fulfilmentTime;
                break;
        }
    }

    /**
     * Calculates all final metrics for the Dashboard!
     */
    public getSnapshot(): FinalMetrics {
        // 1. Average Order Fulfilment Time
        const avgFulfilment = this.totalOrdersCompleted > 0
            ? this.totalFulfilmentTime / this.totalOrdersCompleted
            : 0;

        // 2. Average Travel Distance per Item
        const avgDistancePerItem = this.totalItemsPicked > 0
            ? this.pickerTravelDistance / this.totalItemsPicked
            : 0;

        // 3. Pick Rate (Items per simulation minute)
        const minutesPassed = this.totalSimulationTime / 60;
        const pickRatePerMinute = minutesPassed > 0
            ? this.totalItemsPicked / minutesPassed
            : 0;

        // 4. Picker Utilisation Rate
        // Distance * 2 seconds per step = total time spent actively moving
        const timeMoving = this.pickerTravelDistance * 2;
        const utilisationRate = this.totalSimulationTime > 0
            ? timeMoving / this.totalSimulationTime
            : 0;

        // 5. Pick Density per Aisle (Fractions summing to ~1.0)
        const pickDensity: Record<string, number> = {};
        for (const aisle in this.aislePickCounts) {
            pickDensity[aisle] = Number((this.aislePickCounts[aisle] / this.totalItemsPicked).toFixed(2));
        }

        return {
            totalOrdersCompleted: this.totalOrdersCompleted,
            totalItemsPicked: this.totalItemsPicked,
            pickerTravelDistance: this.pickerTravelDistance,
            averageOrderFulfilmentTime: Number(avgFulfilment.toFixed(2)),
            averageTravelDistancePerItem: Number(avgDistancePerItem.toFixed(2)),
            pickRatePerMinute: Number(pickRatePerMinute.toFixed(2)),
            pickerUtilisationRate: Number(utilisationRate.toFixed(2)),
            pickDensityPerAisle: pickDensity
        };
    }
}