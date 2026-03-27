"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CreateCommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      allowedRoles={["Owner", "Admin"]}
      fallback={<div className="p-6 text-sm text-slate-600">Checking elevated permissions...</div>}
    >
      {children}
    </ProtectedRoute>
  );
}
