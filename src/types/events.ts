// src/types/events.ts
import { FinalMetrics } from '../core/metrics/metricsCollector';

export type GridPoint = { x: number; y: number };

export type SimulationEvent =
    | {
        type: "PICKER_MOVED";
        simulationTime: number;
        from: GridPoint;
        to: GridPoint;
    }
    | {
        type: "ITEM_PICKED";
        simulationTime: number;
        orderId: number;
        productId: number;
        warehouseAisleId: string;
    }
    | {
        type: "ORDER_COMPLETED";
        simulationTime: number;
        orderId: number;
        fulfilmentTime: number;
    }
    | {
        type: "SIMULATION_COMPLETED";
        simulationTime: number;
        metrics: FinalMetrics;
    };