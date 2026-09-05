const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org";

const USER_AGENT =
  "FoodProductSearch/1.0 (foodproductsearch@example.com)";

const MAX_RETRIES = 2;
const REQUEST_TIMEOUT = 10_000;

export type Product = {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string | null;
};

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  product_name_nl?: string;
  product_name_de?: string;
  product_name_fr?: string;
  brands?: string;
  image_front_url?: string;
};

type OpenFoodFactsSearchResponse = {
  products?: OpenFoodFactsProduct[];
};

type OpenFoodFactsProductResponse = {
  product?: OpenFoodFactsProduct & {
    nutriments?: {
      energy_kcal_100g?: number;
      fat_100g?: number;
      carbohydrates_100g?: number;
      sugars_100g?: number;
      proteins_100g?: number;
      salt_100g?: number;
    };
  };
  status?: number;
};

const languageFields: Record<
  string,
  keyof OpenFoodFactsProduct
> = {
  en: "product_name_en",
  nl: "product_name_nl",
  de: "product_name_de",
  fr: "product_name_fr",
};

async function fetchWithRetry(
  url: string,
): Promise<Response> {
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT,
    );

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return response;
      }

      lastResponse = response;

      if (response.status !== 503) {
        return response;
      }

      if (attempt < MAX_RETRIES) {
        const delay = 1000 * 2 ** attempt;

        await new Promise((resolve) =>
          setTimeout(resolve, delay),
        );
      }
    } catch (error) {
      clearTimeout(timeout);

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      await new Promise((resolve) =>
        setTimeout(resolve, delay),
      );
    }
  }

  return lastResponse!;
}

export async function searchProducts(
  query: string,
  language: string = "en",
): Promise<Product[]> {
  const url = new URL(
    `${OPEN_FOOD_FACTS_URL}/cgi/search.pl`,
  );

  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "20");

  const response = await fetchWithRetry(url.toString());

  if (!response.ok) {
    throw new Error(
      `Open Food Facts request failed: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as OpenFoodFactsSearchResponse;

  const localizedField: keyof OpenFoodFactsProduct =
    languageFields[language] ?? "product_name_en";

  return (data.products ?? [])
    .filter((product) => product.code)
    .map((product) => ({
      barcode: product.code!,
      name:
        product[localizedField] ??
        product.product_name ??
        "Unknown product",
      brand: product.brands ?? "Unknown brand",
      imageUrl: product.image_front_url ?? null,
    }));

    
}

export async function getProductByBarcode(
  barcode: string,
  language: string = "en",
) {
  const url = new URL(
    `${OPEN_FOOD_FACTS_URL}/api/v2/product/${encodeURIComponent(barcode)}`,
  );

  url.searchParams.set(
    "fields",
    [
      "code",
      "product_name",
      "product_name_en",
      "product_name_nl",
      "product_name_de",
      "product_name_fr",
      "brands",
      "image_front_url",
      "nutriments",
    ].join(","),
  );

  const response = await fetchWithRetry(url.toString());

  if (!response.ok) {
    throw new Error(
      `Open Food Facts product request failed: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as OpenFoodFactsProductResponse;

  if (!data.product) {
    return null;
  }

  const product = data.product;

  const localizedField: keyof OpenFoodFactsProduct =
    languageFields[language] ?? "product_name_en";

  return {
    barcode: product.code ?? barcode,
    name:
      product[localizedField] ??
      product.product_name ??
      "Unknown product",
    brand: product.brands ?? "Unknown brand",
    imageUrl: product.image_front_url ?? null,

    nutrition: {
      energyKcal:
        product.nutriments?.energy_kcal_100g ?? null,
      fat:
        product.nutriments?.fat_100g ?? null,
      carbohydrates:
        product.nutriments?.carbohydrates_100g ?? null,
      sugars:
        product.nutriments?.sugars_100g ?? null,
      protein:
        product.nutriments?.proteins_100g ?? null,
      salt:
        product.nutriments?.salt_100g ?? null,
    },
  };
}