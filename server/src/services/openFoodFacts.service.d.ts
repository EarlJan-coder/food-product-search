export type Product = {
    barcode: string;
    name: string;
    brand: string;
    imageUrl: string | null;
};
export declare function searchProducts(query: string, language?: string): Promise<Product[]>;
export declare function getProductByBarcode(barcode: string, language?: string): Promise<{
    barcode: string;
    name: string;
    brand: string;
    imageUrl: string | null;
    nutrition: {
        energyKcal: number | null;
        fat: number | null;
        carbohydrates: number | null;
        sugars: number | null;
        protein: number | null;
        salt: number | null;
    };
} | null>;
//# sourceMappingURL=openFoodFacts.service.d.ts.map