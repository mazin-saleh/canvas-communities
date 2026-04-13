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
    <section className="mt-2 rounded-lg border border-gray-300 bg-[#f7f7f7] p-3">
      <h3 className="mb-2 text-xl font-semibold text-gray-900">Board Members</h3>

      <div className="space-y-4">
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
