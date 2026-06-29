import Papa from 'papaparse';
//Defining the exact shapes of the data we expect
export interface RawDemandRow {
    product_id: number;
    demand_score: number;
}
export interface RawClusterRow {
    product_id: number;
    cluster_id: number;
    zone_category: string;
    copurchase_weight: number;
}
// A generic fetch and parse function
async function fetchAndParseCSV<T>(filePath: string): Promise<T[]> {
    const response = await fetch(filePath);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch file at ${filePath}. Status: ${response.status}`);
    }  
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,         // Turns rows into JSON objects
            dynamicTyping: true,  // Automatically converts string numbers to actual JS numbers
            skipEmptyLines: true, // Ignores trailing blank lines
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.error("PapaParse errors:", results.errors);
                    reject(new Error(`Failed to parse CSV at ${filePath}`));
                } else {
                    resolve(results.data as T[]);
                }
            },
            error: (error: Error) => {
                reject(error);
            }
        });
    });
}
// Specific Loader & Validator for Demand Scores
export async function loadDemandScores(): Promise<RawDemandRow[]> {
    console.log("Loading demand scores...");
    const data = await fetchAndParseCSV<any>('/data/demand_score_table.csv');
    const validatedData: RawDemandRow[] = data.map((row, index) => {
        if (typeof row.product_id !== 'number' || isNaN(row.product_id)) {
            throw new Error(`Row ${index + 1}: Invalid product_id "${row.product_id}"`);
        }
        if (typeof row.demand_score !== 'number' || isNaN(row.demand_score)) {
            throw new Error(`Row ${index + 1}: Invalid demand_score for product ${row.product_id}`);
        }
        if (row.demand_score < 0 || row.demand_score > 1) {
            throw new Error(`Row ${index + 1}: demand_score ${row.demand_score} is out of [0,1] bounds`);
        }   
        return {
            product_id: row.product_id,
            demand_score: row.demand_score
        };
    });  
    return validatedData;
}
// Specific Loader & Validator for SKU Clusters
export async function loadSkuClusters(): Promise<RawClusterRow[]> {
    console.log("Loading SKU clusters...");
    const data = await fetchAndParseCSV<any>('/data/sku_clusters_final.csv');
    const validatedData: RawClusterRow[] = data.map((row, index) => {
        if (typeof row.product_id !== 'number' || isNaN(row.product_id)) {
            throw new Error(`Cluster Row ${index + 1}: Invalid product_id "${row.product_id}"`);
        }
        if (typeof row.cluster_id !== 'number' || isNaN(row.cluster_id)) {
            throw new Error(`Cluster Row ${index + 1}: Invalid cluster_id for product ${row.product_id}`);
        }
        if (typeof row.copurchase_weight !== 'number' || isNaN(row.copurchase_weight)) {
            throw new Error(`Cluster Row ${index + 1}: Invalid copurchase_weight for product ${row.product_id}`);
        }
        if (!row.zone_category || typeof row.zone_category !== 'string') {
            throw new Error(`Cluster Row ${index + 1}: Missing or invalid zone_category for product ${row.product_id}`);
        }      
        return {
            product_id: row.product_id,
            cluster_id: row.cluster_id,
            zone_category: row.zone_category,
            copurchase_weight: row.copurchase_weight
        };
    });   
    return validatedData;
}