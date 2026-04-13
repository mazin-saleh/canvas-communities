"use client";

import AdminRequestReviewPanel from "@/components/admin/AdminRequestReviewPanel";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminRequestsPage() {
  return (
    <ProtectedRoute
      requireSuperAdmin
      fallback={
        <div className="p-6 text-sm text-slate-600">
          Checking admin permissions...
        </div>
      }
    >
      <section className="mx-auto w-full max-w-5xl p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">
            Admin Request Queue
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review pending club-admin requests and apply initial ABAC
            permissions.
          </p>
        </header>

        <AdminRequestReviewPanel mode="super_admin" />
      </section>
    </ProtectedRoute>
  );
}
