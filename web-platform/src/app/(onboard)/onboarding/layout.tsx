export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#f0f0f2]">
      {children}
    </div>
  );
}
