export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      {/* Text is intentionally omitted: the live region in the root layout announces loading. */}
      <div aria-hidden className="size-8 rounded-full border-2 border-line border-t-brand-600" />
    </div>
  );
}
