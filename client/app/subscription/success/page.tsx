export default function SubscriptionSuccess() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-xl bg-white p-10 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Active!
          </h1>

          <p className="mt-4 text-gray-600">
            Thank you for subscribing. You now have full access to
            nutritional information for all products.
          </p>

          <a
            href="/"
            className="mt-8 inline-block rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
          >
            Go to Search
          </a>
        </div>
      </div>
    </main>
  );
}
