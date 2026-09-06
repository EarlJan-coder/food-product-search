const API_URL="http://localhost:4000"

export type Product = {
    barcode: string;
    name: string;
    brand: string;
    imageUrl: string | null;
};

export type ProductSearchResponse = {
    query: string;
    language: string;
    count: number;
    products: Product[];
};

export type Nutrition = {
  energyKcal: number | null;
  fat: number | null;
  carbohydrates: number | null;
  sugars: number | null;
  protein: number | null;
  salt: number | null;
};

export type ProductNutritionResponse = {
    barcode: string,
    nutrition: Nutrition,
}

export async function getProductNutrition(
    barcode: string,
    language: string,
): Promise<ProductNutritionResponse> {
    const params = new URLSearchParams({
        lang: language
    });

    const response = await fetch(
        `${API_URL}/api/products/${encodeURIComponent(barcode,)}/nutrition?${params.toString()}`
    );

    if (response.status === 403) {
        throw new Error("SUBSCRIPTION_REQUIRED")
    }

    if (!response.ok) {
        throw new Error(
            "Failed to retrieve nutritional information"
        )
    }

    return response.json();
}

export async function searchProducts(
    query:  string,
    language: string,
): Promise<ProductSearchResponse> {
    const params = new URLSearchParams({
        q: query,
        lang: language,
    });

    const response = await fetch(
        `${API_URL}/api/products/search?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error("Failed to search products")
    }

    return response.json();
}