// We will need to import the types you agreed on in Section 20.2
import { ProductRecord, ZoneCategory } from '../../types/product';

// Temporary local interface until you and Raghav freeze the shared types
export interface MockProductLocation {
    productId: number;
    clusterId: number;
    zoneCategory: ZoneCategory;
    warehouseAisleId: string;
    pickX: number;
    pickY: number;
}

export interface MockWarehouseLayout {
    width: number;
    height: number;
    dispatchPoint: { x: number; y: number };
    walkableGrid: boolean[][]; 
    productLocations: MockProductLocation[];
}

/**
 * A tiny 5x5 testing grid so the simulation engine can run without Raghav's UI.
 * true = Walkable Aisle
 * false = Blocked Rack
 */
export const testLayout: MockWarehouseLayout = {
    width: 5,
    height: 5,
    dispatchPoint: { x: 2, y: 4 }, // Bottom center
    walkableGrid: [
        [true,  true,  true,  true,  true ],
        [true,  false, false, false, true ], // A rack in the middle
        [true,  false, false, false, true ],
        [true,  true,  true,  true,  true ],
        [true,  true,  true,  true,  true ]
    ],
    // Fake coordinates for the first 3 products to test the pathfinder
    productLocations: [
        { productId: 1, clusterId: 10, zoneCategory: "Ambient", warehouseAisleId: "A1", pickX: 0, pickY: 1 },
        { productId: 2, clusterId: 10, zoneCategory: "Ambient", warehouseAisleId: "A1", pickX: 0, pickY: 2 },
        { productId: 3, clusterId: 11, zoneCategory: "Chilled", warehouseAisleId: "C1", pickX: 4, pickY: 1 }
    ]
};