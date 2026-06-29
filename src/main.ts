// src/main.ts
import { testLayout } from './core/testing/mockWarehouseLayout';
import { RoutePlanner } from './core/routing/routePlanner';
import { EventBus } from './core/simulation/eventBus';
import { SimulationEngine } from './core/simulation/simulationEngine';
import { MetricsCollector } from './core/metrics/metricsCollector';
import { SimulationClock } from './core/simulation/simulationClock';

function runExtremeStressTest() {
    console.log("--- STARTING 1-HOUR EXTREME STRESS TEST ---");

    const planner = new RoutePlanner(testLayout);
    const eventBus = new EventBus();
    const engine = new SimulationEngine(testLayout, planner, eventBus, 5);
    const metrics = new MetricsCollector(eventBus);

    // 1. Generate an intense timeline: 60 minutes, order every 3 seconds
    const timeline = SimulationClock.generateArrivalTimeline(60, 3);
    console.log(`🔥 NIGHTMARE MODE: Generating ${timeline.length} orders...\n`);
    
    // 2. Queue them all up
    timeline.forEach((arrivalTime, index) => {
        const items = [testLayout.productLocations[0], testLayout.productLocations[1], testLayout.productLocations[2]]; 
        const orderId = 1000 + index;
        engine.enqueueOrder(orderId, items, arrivalTime);
    });

    // 3. Start the engine!
    console.log("🟢 SIMULATION RUNNING (Calculating paths for thousands of items...)");
    engine.start();

    // 4. Print the final dashboard
    console.log("\n📊 FINAL METRICS SNAPSHOT:");
    console.log(metrics.getSnapshot());
}

runExtremeStressTest();