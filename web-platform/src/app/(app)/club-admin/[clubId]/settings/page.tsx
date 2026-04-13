"use client";

import { useParams } from "next/navigation";
import AdminRequestReviewPanel from "@/components/admin/AdminRequestReviewPanel";

export default function ClubSettingsPage() {
  const params = useParams<{ clubId: string }>();
  const clubId = Number(params?.clubId ?? "0");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
      <p className="text-sm text-slate-600">
        Control moderation, privacy defaults, and operational permissions for administrators.
      </p>

      <AdminRequestReviewPanel mode="club_owner" clubId={clubId} />
    </div>
  );
}
