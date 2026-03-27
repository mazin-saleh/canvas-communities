import BoardMemberCard from "./BoardMemberCard";
import { type BoardMember } from "./boardData";

type BoardSectionProps = {
  title: string;
  members: BoardMember[];
};

export default function BoardSection({ title, members }: BoardSectionProps) {
  return (
    <section>
      <p className="mb-3 text-sm text-gray-600">{title}</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3">
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
