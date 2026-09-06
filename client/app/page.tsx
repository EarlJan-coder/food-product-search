"use client";

import { useState } from "react";
import {
  searchProducts,
  getProductNutrition,
  type Product,
  type Nutrition,
} from "@/lib/api";

const languages = [
  { code: "en", name: "English" },
  { code: "nl", name: "Dutch" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [nutrition, setNutrition] =
    useState<Nutrition | null>(null);

  const [loading, setLoading] = useState(false);
  const [nutritionLoading, setNutritionLoading] = useState(false);

  const [error, setError] = useState("");
  const [nutritionError, setNutritionError] = useState("");

  async function handleSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Clear previously selected product and nutrition
      setSelectedProduct(null);
      setNutrition(null);
      setNutritionError("");

      const data = await searchProducts(
        query.trim(),
        language,
      );

      setProducts(data.products);
    } catch (error) {
      console.error(error);

      setError("Unable to search for products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleProductSelect(product: Product) {
  setSelectedProduct(product);
  setNutrition(null);
  }

  function handleCloseDetails() {
    setSelectedProduct(null);
    setNutrition(null);
    setNutritionError("");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Food Product Search
          </h1>

          <p className="mt-2 text-gray-600">
            Search packaged food products and view their
            nutritional information.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search Input */}
            <div className="flex-1">
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Product
              </label>

              <input
                id="search"
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search for a product..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-600 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Language Selector */}
            <div className="md:w-48">
              <label
                htmlFor="language"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Language
              </label>

              <select
                id="language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-600 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              >
                {languages.map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>

        {/* Search Results */}
        <div className="mt-8">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">
                Searching for products...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-600">
              {error}
            </p>
          )}

          {/* Products */}
          {!loading &&
            !error &&
            products.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <button
                    key={product.barcode}
                    type="button"
                    onClick={() =>{console.log("Selected product: ", product); handleProductSelect(product)}
                    }
                    className="overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Product Image */}
                    <div className="flex h-56 items-center justify-center bg-gray-100 p-6">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">
                          No image available
                        </span>
                      )}
                    </div>

                    {/* Product Information */}
                    <div className="p-5">
                      <p className="text-sm font-medium text-gray-500">
                        {product.brand}
                      </p>

                      <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-gray-900">
                        {product.name}
                      </h2>

                      <p className="mt-3 text-xs text-gray-400">
                        Barcode: {product.barcode}
                      </p>

                      <p className="mt-4 text-sm font-medium text-gray-700">
                        View details →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

          {/* No Results */}
          {!loading &&
            !error &&
            query &&
            products.length === 0 && (
              <p className="text-gray-600">
                No products found.
              </p>
            )}
        </div>

        {/* Product Details */}
        {selectedProduct && (
          <section className="mt-10 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {/* Details Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {selectedProduct.brand}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {selectedProduct.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Barcode: {selectedProduct.barcode}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            {/* Product Image */}
            {selectedProduct.imageUrl && (
              <div className="mt-6 flex justify-center rounded-lg bg-gray-100 p-6">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="h-64 w-full object-contain"
                />
              </div>
            )}

            {/* Nutrition Section */}
            <div className="mt-6 rounded-lg bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Nutritional Information
              </h3>

              {/* Nutrition Loading */}
              {nutritionLoading && (
                <p className="mt-3 text-sm text-gray-500">
                  Checking subscription and loading
                  nutritional information...
                </p>
              )}

              {/* Subscription Required */}
              {!nutritionLoading &&
                nutritionError ===
                  "Active subscription required to view nutritional information." && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-600">
                      Nutritional information is available
                      to active subscribers only.
                    </p>

                    <button
                      type="button"
                      className="mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                      Subscribe to view nutrition
                    </button>
                  </div>
                )}

              {/* Nutrition Error */}
              {!nutritionLoading &&
                nutritionError &&
                nutritionError !==
                  "Active subscription required to view nutritional information." && (
                  <p className="mt-3 text-sm text-red-600">
                    {nutritionError}
                  </p>
                )}

              {/* Nutrition Data */}
              {!nutritionLoading &&
                !nutritionError &&
                nutrition && (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                      <p className="text-sm text-gray-500">
                        Energy
                      </p>

                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {nutrition.energyKcal ?? "N/A"} kcal
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        per 100g
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                      <p className="text-sm text-gray-500">
                        Fat
                      </p>

                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {nutrition.fat ?? "N/A"} g
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        per 100g
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                      <p className="text-sm text-gray-500">
                        Carbohydrates
                      </p>

                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {nutrition.carbohydrates ?? "N/A"} g
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        per 100g
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                      <p className="text-sm text-gray-500">
                        Sugars
                      </p>

                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {nutrition.sugars ?? "N/A"} g
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        per 100g
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                      <p className="text-sm text-gray-500">
                        Protein
                      </p>

                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {nutrition.protein ?? "N/A"} g
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        per 100g
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                      <p className="text-sm text-gray-500">
                        Salt
                      </p>

                      <p className="mt-1 text-xl font-semibold text-gray-900">
                        {nutrition.salt ?? "N/A"} g
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        per 100g
                      </p>
                    </div>
                  </div>
                )}

              {/* No Nutrition Data */}
              {!nutritionLoading &&
                !nutritionError &&
                !nutrition && (
                  <p className="mt-3 text-sm text-gray-500">
                    No nutritional information available for
                    this product.
                  </p>
                )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}