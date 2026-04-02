"use client";

import React from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "../components/AdminLayout";
import { ClubAdminProvider } from "./ClubAdminContext";

export default function ClubAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ clubId: string }>();
  const clubId = params?.clubId || "0";

  return (
    <ProtectedRoute
      clubId={clubId}
      requireClubOwnerOrAdmin
      fallback={
        <div className="p-6 text-sm text-slate-600">
          Checking permissions for this admin workspace...
        </div>
      }
    >
      <ClubAdminProvider clubId={Number(clubId)}>
        <AdminLayout
          clubId={clubId}
          title="Club Admin Dashboard"
          subtitle="Manage your club profile, members, and publishing tools from one place."
        >
          {children}
        </AdminLayout>
      </ClubAdminProvider>
    </ProtectedRoute>
  );
}
