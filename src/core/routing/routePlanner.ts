import * as PF from 'pathfinding';
import { MockWarehouseLayout } from '../testing/mockWarehouseLayout';

export class RoutePlanner {
    private baseGrid: PF.Grid;
    private finder: PF.AStarFinder;

    /**
     * Translates our warehouse layout into a pathfinding grid.
     */
    constructor(layout: MockWarehouseLayout) {
        // Creating a blank grid of the exact width and height
        this.baseGrid = new PF.Grid(layout.width, layout.height);
        
        // Loop through our layout and add the physical racks as "un-walkable" walls
        for (let y = 0; y < layout.height; y++) {
            for (let x = 0; x < layout.width; x++) {
                if (layout.walkableGrid[y][x] === false) {
                    this.baseGrid.setWalkableAt(x, y, false);
                }
            }
        }

        // Setting up the A* Algorithm (Orthogonal movement only, no diagonal walking)
        this.finder = new PF.AStarFinder({
            allowDiagonal: false 
        });
    }

    //Calculates the shortest valid path from point A to point B avoiding racks.
     
    public calculatePath(startX: number, startY: number, endX: number, endY: number): number[][] {
        // Pathfinding algorithms permanently modify the grid memory when they run
        const gridClone = this.baseGrid.clone();
        
        // Returns an array of coordinates, e.g., [[0,0], [0,1], [1,1]]
        const path = this.finder.findPath(startX, startY, endX, endY, gridClone);
        
        if (path.length === 0) {
            console.warn(`⚠️ No valid path found from (${startX},${startY}) to (${endX},${endY})`);
        }
        
        return path;
    }
}