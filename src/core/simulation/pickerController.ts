// src/core/simulation/pickerController.ts
import { EventBus } from './eventBus';
import { GridPoint } from '../../types/events';

export class PickerController {
    private position: GridPoint;

    constructor(
        private eventBus: EventBus,
        private pickerStepSeconds: number, // How long it takes to take one step
        initialPosition: GridPoint
    ) {
        this.position = { ...initialPosition };
    }

    /**
     * Walks the generated path step-by-step and emits an event for the UI.
     * Returns the updated simulation time after the walk is complete.
     */
    public executePath(path: number[][], currentSimulationTime: number): number {
        let currentTime = currentSimulationTime;

        // The path array includes our starting spot at index 0. 
        // We want to start moving toward index 1.
        for (let i = 1; i < path.length; i++) {
            const nextStep: GridPoint = { x: path[i][0], y: path[i][1] };
            
            // Advance the clock for this step
            currentTime += this.pickerStepSeconds;

            // Broadcast the movement to the UI!
            this.eventBus.emit({
                type: "PICKER_MOVED",
                simulationTime: currentTime,
                from: { ...this.position },
                to: nextStep
            });

            // Update our internal position
            this.position = nextStep;
        }

        return currentTime;
    }

    public getPosition(): GridPoint {
        return this.position;
    }
}