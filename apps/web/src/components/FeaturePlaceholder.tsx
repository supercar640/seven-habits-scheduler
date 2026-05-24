/**
 * Temporary scaffold placeholder for a feature screen.
 * Replaced by real implementation as each slice is built (see build order in CLAUDE.md).
 */
export function FeaturePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-2 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-neutral-500">{description}</p>
    </main>
  );
}
