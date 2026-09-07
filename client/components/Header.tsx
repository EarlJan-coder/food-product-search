"use client";

import { useState, useEffect, useRef } from "react";
import {
  getCurrentUser,
  createCheckoutSession,
  createPortalSession,
  type User,
} from "@/lib/api";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubscribe() {
    setActionLoading(true);
    try {
      const data = await createCheckoutSession();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setActionLoading(true);
    try {
      const data = await createPortalSession();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal failed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  function handleRefreshUser() {
    setLoading(true);
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch((error) => console.error("Failed to refresh user:", error))
      .finally(() => setLoading(false));
  }

  const isSubscribed = user?.subscriptionStatus === "active";

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Food Product Search
          </h1>

          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-72 animate-fade-in rounded-xl bg-white py-2 shadow-xl ring-1 ring-gray-200">
                    <div className="border-b border-gray-100 px-4 pb-3 pt-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Subscription Status
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          isSubscribed ? "text-green-600" : "text-gray-700"
                        }`}
                      >
                        {isSubscribed ? "Active" : "Inactive"}
                      </p>
                    </div>

                    <div className="px-4 py-2">
                      {isSubscribed ? (
                        <button
                          type="button"
                          onClick={handleUnsubscribe}
                          disabled={actionLoading}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          {actionLoading
                            ? "Loading..."
                            : "Manage Subscription"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubscribe}
                          disabled={actionLoading}
                          className="flex w-full items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          {actionLoading
                            ? "Loading..."
                            : "Subscribe to Premium"}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
