import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n/provider';
import { NAV_ITEMS, PRIMARY_NAV_ITEMS } from '@/config/navigation';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/documents',
}));

describe('Sidebar', () => {
  it('renders every navigation destination', () => {
    render(
      <I18nProvider locale="en">
        <Sidebar />
      </I18nProvider>,
    );

    const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(within(nav).getAllByRole('link')).toHaveLength(NAV_ITEMS.length);
  });

  it('marks the current section with aria-current', () => {
    render(
      <I18nProvider locale="en">
        <Sidebar />
      </I18nProvider>,
    );

    expect(screen.getByRole('link', { name: 'Documents' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBeNull();
  });
});

describe('BottomNav', () => {
  it('shows the primary destinations plus a menu trigger', () => {
    render(
      <I18nProvider locale="en">
        <BottomNav onOpenMore={() => {}} />
      </I18nProvider>,
    );

    const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(within(nav).getAllByRole('link')).toHaveLength(PRIMARY_NAV_ITEMS.length);
    expect(within(nav).getByRole('button', { name: 'Menu' })).toBeDefined();
  });

  it('is translated', () => {
    render(
      <I18nProvider locale="hi">
        <BottomNav onOpenMore={() => {}} />
      </I18nProvider>,
    );

    expect(screen.getByRole('button', { name: 'मेन्यू' })).toBeDefined();
  });
});
