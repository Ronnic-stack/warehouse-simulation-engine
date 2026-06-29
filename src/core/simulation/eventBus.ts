// src/core/simulation/eventBus.ts
import { SimulationEvent } from '../../types/events';

// Define the shape of any function that wants to listen to our events
type EventListener = (event: SimulationEvent) => void;

export class EventBus {
    private listeners: EventListener[] = [];

    /**
     * The frontend (Raghav's UI) will call this to "tune in" to our radio station.
     * Returns an unsubscribe function just in case they want to disconnect.
     */
    public subscribe(listener: EventListener): () => void {
        this.listeners.push(listener);
        
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * The backend (Your Engine) will call this to broadcast an event to all listeners.
     */
    public emit(event: SimulationEvent): void {
        for (const listener of this.listeners) {
            listener(event);
        }
    }
}