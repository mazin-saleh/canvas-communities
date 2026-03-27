"use client";

import RecommendedPage from "@/app/(app)/recommended/page";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function OnboardRecommended() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden px-4 py-5 md:px-6">
      <div className="min-h-0 flex-1 overflow-hidden">
        <RecommendedPage />
      </div>
      <div className="flex justify-end pt-4">
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
