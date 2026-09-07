export default function SubscriptionCancel() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="rounded-xl bg-white p-10 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Cancelled
          </h1>

          <p className="mt-4 text-gray-600">
            Your subscription checkout was cancelled. No charges
            were made.
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
