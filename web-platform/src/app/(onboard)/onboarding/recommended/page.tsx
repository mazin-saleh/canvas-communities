"use client";

import RecommendedPage from "@/app/(app)/recommended/page";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function OnboardRecommended() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <RecommendedPage />
      </div>
      <div className="flex justify-end px-5 py-4">
        <Button
          onClick={() => {
            completeOnboarding();
            router.push("/discovery");
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
