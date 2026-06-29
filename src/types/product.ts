export type ZoneCategory = 
    | "Ambient" 
    | "Chilled" 
    | "Frozen" 
    | "Non-Food" 
    | "Hazardous / Special Handling";
export interface ProductRecord {
    productId: number;
    demandScore: number;
    clusterId: number;
    zoneCategory: ZoneCategory;
    copurchaseWeight: number;
    samplingWeight: number;
}