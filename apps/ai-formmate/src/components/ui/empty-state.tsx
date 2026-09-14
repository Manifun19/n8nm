import type { ReactNode } from 'react';

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {body ? <p className="max-w-md text-sm text-ink-muted">{body}</p> : null}
      {action}
    </div>
  );
}
