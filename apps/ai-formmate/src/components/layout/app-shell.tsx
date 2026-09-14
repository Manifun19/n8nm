'use client';

import { useState, type ReactNode } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { BottomNav } from './bottom-nav';
import { MobileNavDrawer } from './mobile-nav-drawer';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

/** Responsive application chrome: sidebar on desktop, bottom bar on mobile. */
export function AppShell({ email, children }: { email: string | null; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh bg-surface">
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-4 z-50 rounded-lg bg-brand-600 px-3 py-2 text-sm text-white"
      >
        {t('common.skipToContent')}
      </a>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar email={email} />
        <main id="main" className="flex-1 px-4 py-6 pb-safe-nav lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>

      <BottomNav onOpenMore={() => setDrawerOpen(true)} />
      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
