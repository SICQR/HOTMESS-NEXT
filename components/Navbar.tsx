'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLayoutMode } from '@/components/LayoutModeProvider';
import dynamic from 'next/dynamic';
import React from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const items = [
    { href: '/shop', label: 'Shop' },
    { href: '/radio', label: 'Radio' },
    { href: '/records', label: 'Records' },
    { href: '/care', label: 'Care' },
    { href: '/community', label: 'Community' },
    { href: '/about', label: 'About' },
  ];

  const { hero } = useLayoutMode();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const firstLinkRef = React.useRef<HTMLAnchorElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  
  // Close menu on route change
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  React.useEffect(() => {
    if (!hero) return; // only apply scroll behavior on hero page
    function onScroll() {
      const threshold = window.innerHeight * 0.25;
      setScrolled(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hero]);
  const UserMenu = dynamic(() => import('@/components/header/UserMenu'), { ssr: false });
  
  // Basic focus trap when mobile menu is open
  React.useEffect(() => {
    if (!menuOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = menuRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    // move focus to first item
    setTimeout(() => firstLinkRef.current?.focus(), 0);
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !container) return;
      const focusables = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [menuOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={
        `fixed top-0 left-0 w-full z-50 border-b border-token transition-colors duration-500 ` +
        (hero
          ? scrolled
            ? 'bg-[color:rgba(var(--color-bg-rgb)/0.88)] backdrop-blur-md shadow-lg shadow-black/40'
            : 'bg-[color:rgba(var(--color-bg-rgb)/0.35)] backdrop-blur-xl'
          : 'bg-[color:rgba(var(--color-bg-rgb)/0.80)] backdrop-blur')
      }
      aria-label="Site navigation"
    >
      <nav aria-label="Primary" className={`mx-auto flex max-w-7xl items-center justify-between px-6 ${hero ? 'py-6' : 'py-4'}`}>
        <Link href="/" aria-label="Go to HOTMESS Home" className={`font-bold tracking-tight accent-primary ${hero ? 'heading-2' : 'heading-3'}`}>
          HOTMESS
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          {items.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                prefetch
                aria-current={active ? 'page' : undefined}
                className={`transition ${active ? 'accent-primary' : 'text-muted hover:accent-primary'}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            <svg className={`h-6 w-6 ${menuOpen ? 'hidden' : 'block'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className={`h-6 w-6 ${menuOpen ? 'block' : 'hidden'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Link
            href="/radio"
            prefetch
            className={`hidden md:inline-block rounded-full font-semibold transition btn-base ${hero ? 'px-6 py-3 text-sm btn-primary shadow-lg shadow-[rgba(255,39,104,0.25)]' : 'px-4 py-2 text-sm btn-primary'}`}
          >
            {hero ? (scrolled ? 'RADIO' : 'LISTEN LIVE') : 'RADIO'}
          </Link>
          <UserMenu />
        </div>
      </nav>
      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!menuOpen}
        aria-hidden={!menuOpen}
  className="md:hidden fixed inset-0 z-[60] bg-[color:rgba(var(--color-bg-rgb)/0.90)] backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
      >
        <div className="mt-20 px-6" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="flex flex-col gap-4 text-lg">
            {items.map(({ href, label }, idx) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  ref={idx === 0 ? firstLinkRef : undefined}
                  prefetch
                  aria-current={active ? 'page' : undefined}
                  className={`block rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition ${active ? 'bg-surface accent-primary' : 'bg-surface/70 text-muted hover:bg-surface'}`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/radio"
              className="mt-2 block rounded-full text-center font-semibold px-6 py-3 btn-base btn-primary"
            >
              Listen Live
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
