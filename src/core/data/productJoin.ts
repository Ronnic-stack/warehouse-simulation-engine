import { loadDemandScores, loadSkuClusters } from './csvLoader';
import { ProductRecord, ZoneCategory } from '../../types/product';
// The exponent for temperature smoothing (configurable)
const TEMP_SMOOTHING = 0.75; 
export async function initializeSimulationData(): Promise<ProductRecord[]> {
    console.log("Initializing simulation data...");
     // Loading both CSV files concurrently for speed
    const [rawDemand, rawClusters] = await Promise.all([
        loadDemandScores(),
        loadSkuClusters()
    ]);
    // Building a quick lookup map for demand scores
    const demandMap = new Map<number, number>();
    rawDemand.forEach(row => demandMap.set(row.product_id, row.demand_score));
     const joinedProducts: ProductRecord[] = [];
    let totalSmoothedWeight = 0;
    //  Joining the tables using Raghav's cluster table as the authoritative base
    for (const clusterRow of rawClusters) {
        const demandScore = demandMap.get(clusterRow.product_id);        
        if (demandScore === undefined) {
            throw new Error(`Integration Error: Product ${clusterRow.product_id} is in the cluster table but missing from your demand scores.`);
        }
        // Applying temperature smoothing math immediately
        const safeScore = Math.max(demandScore, 0.000001);
        const smoothedWeight = Math.pow(safeScore, TEMP_SMOOTHING);
        totalSmoothedWeight += smoothedWeight;
        joinedProducts.push({
            productId: clusterRow.product_id,
            clusterId: clusterRow.cluster_id,
            zoneCategory: clusterRow.zone_category as ZoneCategory,
            copurchaseWeight: clusterRow.copurchase_weight,
            demandScore: demandScore,
            samplingWeight: smoothedWeight // Temporary placeholder, normalized below
        });
    }
    // Validating exact 3,000 product constraint
    if (joinedProducts.length !== 3000) {
        throw new Error(`Validation Failed: Expected exactly 3,000 joined simulation products, but got ${joinedProducts.length}.`);
    }
    // Normalizing probabilities so they all sum to exactly 1.0
    joinedProducts.forEach(product => {
        product.samplingWeight = product.samplingWeight / totalSmoothedWeight;
    });
    console.log(`Successfully joined 3,000 products. Total sampling weight sum: 1.0`);
    return joinedProducts;
}