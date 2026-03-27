"use client";

import React from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "../components/AdminLayout";

export default function ClubAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ clubId: string }>();
  const clubId = params?.clubId || "0";

  return (
    <ProtectedRoute
      clubId={clubId}
      allowedRoles={["Owner", "Admin", "Editor"]}
      fallback={
        <div className="p-6 text-sm text-slate-600">
          Checking permissions for this admin workspace...
        </div>
      }
    >
      <AdminLayout
        clubId={clubId}
        title="Club Admin Dashboard"
        subtitle="Manage your club profile, members, and publishing tools from one place."
      >
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}
