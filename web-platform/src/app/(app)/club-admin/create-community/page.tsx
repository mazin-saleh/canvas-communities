"use client";

import { useRouter } from "next/navigation";
import CreateCommunityDialog from "@/components/CreateCommunityDialog";

export default function CreateCommunityPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100/70 px-4 py-8">
      <CreateCommunityDialog
        open
        onOpenChange={(open) => {
          if (!open) {
            router.back();
          }
        }}
        onSubmit={() => router.push("/discovery")}
      />
    </div>
  );
}
