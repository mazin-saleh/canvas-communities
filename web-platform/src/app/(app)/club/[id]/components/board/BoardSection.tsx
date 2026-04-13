import BoardMemberCard from "./BoardMemberCard";
import InlineBoardMemberForm from "./InlineBoardMemberForm";
import { type BoardMember } from "./boardData";

type BoardSectionProps = {
  title: string;
  members: BoardMember[];
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

export default function BoardSection({ title, members, canEdit, communityId, rawMembers, onAssigned }: BoardSectionProps) {
  return (
    <section>
      <p className="mb-3 text-sm text-gray-600">{title}</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3">
        {canEdit && communityId && rawMembers && onAssigned && (
          <InlineBoardMemberForm
            communityId={communityId}
            members={rawMembers}
            onAssigned={onAssigned}
          />
        )}
        {members.map((member) => (
          <BoardMemberCard
            key={member.id}
            name={member.name}
            role={member.role}
            imageURL={member.imageURL}
          />
        ))}
      </div>
    </section>
  );
}
