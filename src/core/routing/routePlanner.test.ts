import { expect, test, describe } from 'vitest';
import { RoutePlanner } from './routePlanner';
import { testLayout } from '../testing/mockWarehouseLayout';

describe('A* Route Planner Math', () => {
    test('Calculates the exact shortest path around an obstacle', () => {
        const planner = new RoutePlanner(testLayout);
        
        // Dispatch Point is (2, 4). Product 1 is at (0, 1).
        const path = planner.calculatePath(2, 4, 0, 1);
        
        // The path array includes the starting position, so a 5-step walk means an array length of 6
        expect(path.length).toBe(6);
        
        // Verifying the final destination is exactly correct
        const finalStep = path[path.length - 1];
        expect(finalStep).toEqual([0, 1]);
    });
});