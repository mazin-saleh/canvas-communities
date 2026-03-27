type TagListProps = {
  tags: Array<string | { name?: string }>;
};

export default function TagList({ tags }: TagListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <span
          key={`${String(tag)}-${idx}`}
          className="rounded-full bg-gray-200 px-2 py-1 text-[10px] font-medium text-gray-700"
        >
          {typeof tag === "string" ? tag : tag.name}
        </span>
      ))}
    </div>
  );
}
