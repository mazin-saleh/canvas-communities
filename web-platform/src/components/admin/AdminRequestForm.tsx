"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/context/RoleContext";
import { api } from "@/lib/api";

type AdminRequestFormProps = {
  clubId: number;
  clubName?: string;
};

export default function AdminRequestForm({
  clubId,
  clubName = "this club",
}: AdminRequestFormProps) {
  const { getRoleForClub } = useRole();
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const role = getRoleForClub(clubId);
  const shouldShowForm = role === "member";

  const helperText = useMemo(() => {
    if (role === "club_owner" || role === "club_admin") {
      return "You already have elevated editing access in this club.";
    }

    if (role === null) {
      return "Join this club to request admin access.";
    }

    return "Request elevated access for content, events, and roster management.";
  }, [role]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!shouldShowForm) {
      return;
    }

    if (justification.trim().length < 20) {
      setError("Justification must be at least 20 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await api.clubs.requestAdminAccess(clubId, justification.trim());
      setMessage(`Admin request submitted for ${clubName}.`);
      setJustification("");
    } catch (submitError) {
      const submitMessage =
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit admin request.";
      setError(submitMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">
        Request Club Admin Access
      </h3>
      <p className="mt-1 text-xs text-slate-600">{helperText}</p>

      {shouldShowForm ? (
        <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
          <Textarea
            value={justification}
            onChange={(event) => setJustification(event.target.value)}
            placeholder="Describe why you should be granted club-admin access."
            rows={4}
            className="bg-white"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
            <span className="text-xs text-slate-500">
              Minimum 20 characters
            </span>
          </div>
        </form>
      ) : null}

      {message ? (
        <p className="mt-2 text-xs text-emerald-600">{message}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </section>
  );
}
