"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const router = useRouter();

  const {
    customer,
    isAuthenticated,
    authLoading,
    logout,
  } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/account");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--brand-cream)] px-4 py-10">
      <div className="section-container mx-auto">
        <h1 className="text-3xl font-bold">
          My Account
        </h1>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6">
          <h2 className="text-xl font-semibold">
            Welcome, {customer.customer_fullname}
          </h2>

          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            +91 {customer.customer_phone}
          </p>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Customer ID: {customer.customer_id}
          </p>

          <button
            type="button"
            onClick={async () => {
              try {
                await logout();
                router.replace("/login");
              } catch (error) {
                console.error("Logout failed:", error);
              }
            }}
            className="mt-6 rounded-lg bg-[var(--brand-black)] px-6 py-3 text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}