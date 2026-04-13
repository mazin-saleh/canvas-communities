import BoardSection from "./BoardSection";
import { type BoardSectionData } from "./boardData";

type BoardMembersPanelProps = {
  sections: BoardSectionData[];
  canEdit?: boolean;
  communityId?: number;
  rawMembers?: Array<{
    id: string | number;
    userId: number;
    user?: { id: number; username: string };
    assignedRoles?: { clubRole: { id: number; name: string; color: string } }[];
  }>;
  onAssigned?: () => void;
};

export default function BoardMembersPanel({ sections, canEdit, communityId, rawMembers, onAssigned }: BoardMembersPanelProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-3">
      <h3 className="shrink-0 text-xl font-semibold text-gray-900">Board Members</h3>

      <div className="min-h-0 flex-1 space-y-4 pr-1">
        {sections.map((section) => (
          <BoardSection
            key={section.id}
            title={section.title}
            members={section.members}
            canEdit={canEdit}
            communityId={communityId}
            rawMembers={rawMembers}
            onAssigned={onAssigned}
          />
        ))}
      </div>
    </section>
  );
}
