"use client";

import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

const permissionFields = [
  "canManageSettings",
  "canManageRoles",
  "canManageEvents",
  "canManageGallery",
  "canManageAnnouncements",
  "canManageRoster",
  "canBlacklistUsers",
] as const;

type PermissionField = (typeof permissionFields)[number];

type PermissionSet = {
  canManageSettings: boolean;
  canManageRoles: boolean;
  canManageEvents: boolean;
  canManageGallery: boolean;
  canManageAnnouncements: boolean;
  canManageRoster: boolean;
  canBlacklistUsers: boolean;
};

type PendingRequest = {
  id: number;
  userId: number;
  communityId: number;
  justification: string;
  requestedAt: string;
  user: {
    username: string;
  };
  community: {
    name: string;
  };
};

type AdminRequestReviewPanelProps = {
  mode: "super_admin" | "club_owner";
  clubId?: number;
};

const defaultPermissions: PermissionSet = {
  canManageSettings: false,
  canManageRoles: false,
  canManageEvents: false,
  canManageGallery: false,
  canManageAnnouncements: false,
  canManageRoster: false,
  canBlacklistUsers: false,
};

export default function AdminRequestReviewPanel({
  mode,
  clubId,
}: AdminRequestReviewPanelProps) {
  const { isSuperAdmin } = useRole();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [permissionsByRequest, setPermissionsByRequest] = useState<
    Record<number, PermissionSet>
  >({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canReview = mode === "super_admin" ? isSuperAdmin : Boolean(clubId);

  const scopedRequests = useMemo(() => {
    if (mode === "club_owner" && clubId) {
      return pendingRequests.filter(
        (request) => request.communityId === clubId,
      );
    }

    return pendingRequests;
  }, [clubId, mode, pendingRequests]);

  async function loadRequests() {
    if (!canReview) {
      setPendingRequests([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requests =
        (await api.admin.listPendingRequests()) as PendingRequest[];
      setPendingRequests(requests);
      setPermissionsByRequest((current) => {
        const next: Record<number, PermissionSet> = { ...current };
        for (const request of requests) {
          if (!next[request.id]) {
            next[request.id] = { ...defaultPermissions };
          }
        }
        return next;
      });
    } catch (loadError) {
      const loadMessage =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load requests";
      setError(loadMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, clubId, canReview]);

  function setPermission(
    requestId: number,
    key: PermissionField,
    checked: boolean,
  ) {
    setPermissionsByRequest((current) => ({
      ...current,
      [requestId]: {
        ...(current[requestId] ?? defaultPermissions),
        [key]: checked,
      },
    }));
  }

  async function approve(requestId: number) {
    const selectedPermissions =
      permissionsByRequest[requestId] ?? defaultPermissions;
    setMessage(null);
    setError(null);

    try {
      if (mode === "super_admin") {
        await api.admin.approveRequest(requestId, selectedPermissions);
      } else if (clubId) {
        await api.clubs.manageRoles(clubId, {
          action: "approve_request",
          requestId,
          permissions: selectedPermissions,
        });
      }

      setMessage(`Request #${requestId} approved.`);
      await loadRequests();
    } catch (approveError) {
      const approveMessage =
        approveError instanceof Error
          ? approveError.message
          : "Approval failed";
      setError(approveMessage);
    }
  }

  async function deny(requestId: number) {
    if (!clubId || mode !== "club_owner") {
      return;
    }

    setMessage(null);
    setError(null);

    try {
      await api.clubs.manageRoles(clubId, {
        action: "deny_request",
        requestId,
      });
      setMessage(`Request #${requestId} denied.`);
      await loadRequests();
    } catch (denyError) {
      const denyMessage =
        denyError instanceof Error ? denyError.message : "Denial failed";
      setError(denyMessage);
    }
  }

  if (!canReview) {
    return (
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        You do not have access to review admin requests.
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Pending Admin Requests
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Approve requests and set granular ABAC permissions.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading requests...</p>
      ) : null}

      {!loading && scopedRequests.length === 0 ? (
        <p className="text-sm text-slate-500">No pending requests.</p>
      ) : null}

      <div className="space-y-4">
        {scopedRequests.map((request) => {
          const selected =
            permissionsByRequest[request.id] ?? defaultPermissions;

          return (
            <article
              key={request.id}
              className="rounded-md border border-slate-200 p-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  {request.user.username} requested admin access for{" "}
                  {request.community.name}
                </p>
                <p className="text-xs text-slate-600">
                  {request.justification}
                </p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {permissionFields.map((permissionKey) => (
                  <label
                    key={permissionKey}
                    className="inline-flex items-center gap-2 text-xs text-slate-700"
                  >
                    <Checkbox
                      checked={selected[permissionKey]}
                      onCheckedChange={(checked) =>
                        setPermission(
                          request.id,
                          permissionKey,
                          Boolean(checked),
                        )
                      }
                    />
                    {permissionKey}
                  </label>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" onClick={() => void approve(request.id)}>
                  Approve
                </Button>
                {mode === "club_owner" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void deny(request.id)}
                  >
                    Deny
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {message ? <p className="text-xs text-emerald-600">{message}</p> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </section>
  );
}
