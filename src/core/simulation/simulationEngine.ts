// src/core/simulation/simulationEngine.ts
import { EventBus } from './eventBus';
import { RoutePlanner } from '../routing/routePlanner';
import { PickerController } from './pickerController';
import { MockWarehouseLayout } from '../testing/mockWarehouseLayout';

// Defining the shape of an order waiting in line, now with arrival time
interface QueuedOrder {
    orderId: number;
    items: any[];
    arrivalTime: number;
}

export class SimulationEngine {
    private currentTime: number = 0;
    private picker: PickerController;
    private orderQueue: QueuedOrder[] = [];
    private isRunning: boolean = false;

    constructor(
        private layout: MockWarehouseLayout,
        private planner: RoutePlanner,
        private eventBus: EventBus,
        private pickServiceSeconds: number
    ) {
        this.picker = new PickerController(this.eventBus, 2, this.layout.dispatchPoint);
    }

    /**
     * Adds a new order to the back of the line and sorts by arrival time.
     */
    public enqueueOrder(orderId: number, targetProducts: any[], arrivalTime: number = 0) {
        this.orderQueue.push({ orderId, items: targetProducts, arrivalTime });
        
        // Ensure the queue always processes the earliest arrivals first!
        this.orderQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }

    /**
     * The Master Loop. Processes orders one by one until the queue is empty.
     */
    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        while (this.orderQueue.length > 0) {
            const nextOrder = this.orderQueue.shift(); 
            if (nextOrder) {
                
                // The Idle Time-Jump Logic!
                // If the robot is free, but the next order hasn't arrived yet, wait for it.
                if (this.currentTime < nextOrder.arrivalTime) {
                    this.currentTime = nextOrder.arrivalTime;
                }

                // Pass the arrivalTime into the function call
                this.processMultiItemOrder(nextOrder.orderId, nextOrder.items, nextOrder.arrivalTime);
            }
        }
        this.isRunning = false;
    }

    /**
     * Executes a multi-item order using the Greedy Nearest Neighbor algorithm.
     */
    // Update the signature to accept arrivalTime
    private processMultiItemOrder(orderId: number, targetProducts: any[], arrivalTime: number) {
        let unpickedItems = [...targetProducts];

        while (unpickedItems.length > 0) {
            const currentPos = this.picker.getPosition();
            let nearestItem = null;
            let shortestPath: number[][] = [];
            let shortestDistance = Infinity;

            // Look at every unpicked item and calculate the path to find the absolute closest one
            for (const item of unpickedItems) {
                const path = this.planner.calculatePath(currentPos.x, currentPos.y, item.pickX, item.pickY);
                if (path.length > 0 && path.length < shortestDistance) {
                    shortestDistance = path.length;
                    shortestPath = path;
                    nearestItem = item;
                }
            }

            // Safety catch
            if (!nearestItem) break;

            // Walk to the nearest item we found
            this.currentTime = this.picker.executePath(shortestPath, this.currentTime);
            
            // Simulate the time to grab it off the shelf
            this.currentTime += this.pickServiceSeconds;

            // Broadcast that we grabbed it
            this.eventBus.emit({
                type: "ITEM_PICKED",
                simulationTime: this.currentTime,
                orderId: orderId,
                productId: nearestItem.productId,
                warehouseAisleId: nearestItem.warehouseAisleId
            });

            // Cross it off our unpicked list
            unpickedItems = unpickedItems.filter(item => item.productId !== nearestItem!.productId);
        }

        // The list is empty! Calculate the path back home to dispatch.
        const finalPos = this.picker.getPosition();
        const pathHome = this.planner.calculatePath(
            finalPos.x, finalPos.y, 
            this.layout.dispatchPoint.x, this.layout.dispatchPoint.y
        );

        // Walk back home
        this.currentTime = this.picker.executePath(pathHome, this.currentTime);

        // FIX 2: Ensure the fulfilment time is calculated correctly
        this.eventBus.emit({
            type: "ORDER_COMPLETED",
            simulationTime: this.currentTime,
            orderId: orderId,
            fulfilmentTime: this.currentTime - arrivalTime 
        });
    }
}