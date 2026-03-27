import BoardSection from "./BoardSection";
import { type BoardSectionData } from "./boardData";

type BoardMembersPanelProps = {
  sections: BoardSectionData[];
};

export default function BoardMembersPanel({ sections }: BoardMembersPanelProps) {
  return (
    <section className="mt-2 rounded-lg border border-gray-300 bg-[#f7f7f7] p-3">
      <h3 className="mb-2 text-xl font-semibold text-gray-900">Board Members</h3>

      <div className="space-y-4">
        {sections.map((section) => (
          <BoardSection
            key={section.id}
            title={section.title}
            members={section.members}
          />
        ))}
      </div>
    </section>
  );
}
