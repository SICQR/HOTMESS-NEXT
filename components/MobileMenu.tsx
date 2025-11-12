"use client";
import React from 'react';
import clsx from 'clsx';

export type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
};

export function MobileMenu({ isOpen, onClose, children, title }: MobileMenuProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const firstFocusable = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    const container = panelRef.current;
    const selector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = container ? Array.from(container.querySelectorAll<HTMLElement>(selector)) : [];
    firstFocusable.current = focusables[0] || null;
    setTimeout(() => firstFocusable.current?.focus(), 0);
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !container || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); prev?.focus?.(); };
  }, [isOpen, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Mobile menu'}
      className={clsx('fixed inset-0 z-50 md:hidden transition', isOpen ? 'pointer-events-auto' : 'pointer-events-none')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      hidden={!isOpen}
    >
      <div className={clsx('absolute inset-0 bg-black/80 backdrop-blur-sm', isOpen ? 'opacity-100' : 'opacity-0')} />
      <div ref={panelRef} className={clsx('relative ml-auto h-full w-80 max-w-[85%] bg-[var(--color-bg)] border-l border-token p-6', isOpen ? 'translate-x-0' : 'translate-x-full')}>
        {title && <div className="mb-4 text-sm text-muted">{title}</div>}
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
