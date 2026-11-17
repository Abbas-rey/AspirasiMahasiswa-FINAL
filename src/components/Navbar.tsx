'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
  User,
  GraduationCap,
  ChevronRight,
  PlusCircle,
  Search,
  LayoutDashboard,
  Home,
  CheckCircle2,
} from 'lucide-react';

interface CurrentUser {
  id: string;
  name: string;
  nim_nip: string;
  role: 'MAHASISWA' | 'AKADEMISI' | 'ADMIN';
  scope_level?: string | null;
  must_change_pwd?: boolean;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'beranda' | 'cara-kerja' | 'kategori' | 'kontak'>('beranda');

  useEffect(() => {
    if (pathname !== '/') return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Check bottom of page first for Kontak/Footer
          const scrollBottom = window.innerHeight + window.scrollY;
          const docHeight = document.documentElement.scrollHeight;
          if (scrollBottom >= docHeight - 80) {
            setActiveSection('kontak');
            ticking = false;
            return;
          }

          // Offset to trigger section active state (below sticky navbar)
          const scrollPosition = window.scrollY + 100;

          const caraKerjaEl = document.getElementById('cara-kerja');
          const kategoriEl = document.getElementById('kategori');
          const kontakEl = document.getElementById('kontak');

          if (kontakEl && scrollPosition >= kontakEl.offsetTop) {
            setActiveSection('kontak');
          } else if (kategoriEl && scrollPosition >= kategoriEl.offsetTop) {
            setActiveSection('kategori');
          } else if (caraKerjaEl && scrollPosition >= caraKerjaEl.offsetTop) {
            setActiveSection('cara-kerja');
          } else {
            setActiveSection('beranda');
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    const initialHash = window.location.hash.replace('#', '');
    if (['cara-kerja', 'kategori', 'kontak', 'beranda'].includes(initialHash)) {
      setActiveSection(initialHash as any);
    } else {
      handleScroll();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'MAHASISWA':
        return '/dashboard/mahasiswa';
      case 'AKADEMISI':
        return '/dashboard/akademisi';
      case 'ADMIN':
        return '/dashboard/admin';
      default:
        return '/';
    }
  };

  const getRoleLabel = () => {
    if (!currentUser) return '';
    switch (currentUser.role) {
      case 'MAHASISWA':
        return 'Mahasiswa';
      case 'AKADEMISI':
        return 'Akademisi';
      case 'ADMIN':
        return 'Admin';
    }
  };

  // Determine navigation links based on user authentication and role
  const getNavLinks = () => {
    if (!currentUser) {
      // Guest / Landing page navigation (matching reference layout)
      return [
        { label: 'Beranda', href: '/' },
        { label: 'Cara Kerja', href: '/#cara-kerja' },
        { label: 'Kategori', href: '/#kategori' },
        { label: 'Lacak Status', href: '/lacak' },
        { label: 'Kontak', href: '/#kontak' },
      ];
    }

    if (currentUser.role === 'MAHASISWA') {
      // Role Mahasiswa: 3 menu items
      return [
        {
          label: 'Beranda',
          href: '/dashboard/mahasiswa',
          icon: Home,
          match: (p: string) => p === '/dashboard/mahasiswa',
        },
        {
          label: 'Buat Aspirasi',
          href: '/ajukan',
          icon: PlusCircle,
          match: (p: string) => p.startsWith('/ajukan'),
        },
        {
          label: 'Lacak Aspirasi',
          href: '/lacak',
          icon: Search,
          match: (p: string) => p.startsWith('/lacak'),
        },
      ];
    }

    if (currentUser.role === 'AKADEMISI') {
      // Role Akademisi: Reviewer menu
      return [
        {
          label: 'Beranda',
          href: '/dashboard/akademisi',
          icon: LayoutDashboard,
          match: (p: string) => p.startsWith('/dashboard/akademisi'),
        },
        {
          label: 'Lacak Aspirasi',
          href: '/lacak',
          icon: Search,
          match: (p: string) => p.startsWith('/lacak'),
        },
      ];
    }

    if (currentUser.role === 'ADMIN') {
      // Role Admin: Management menu
      return [
        {
          label: 'Beranda',
          href: '/dashboard/admin',
          icon: LayoutDashboard,
          match: (p: string) => p.startsWith('/dashboard/admin'),
        },
        {
          label: 'Lacak Aspirasi',
          href: '/lacak',
          icon: Search,
          match: (p: string) => p.startsWith('/lacak'),
        },
      ];
    }

    return [{ label: 'Beranda', href: '/' }];
  };

  const navLinks = getNavLinks();

  const isLinkActive = (link: { href: string; match?: (p: string) => boolean }) => {
    if (link.match) {
      return link.match(pathname);
    }

    if (pathname === '/') {
      if (link.href === '/' || link.href === '/#beranda') {
        return activeSection === 'beranda';
      }
      if (link.href === '/#cara-kerja') {
        return activeSection === 'cara-kerja';
      }
      if (link.href === '/#kategori') {
        return activeSection === 'kategori';
      }
      if (link.href === '/#kontak') {
        return activeSection === 'kontak';
      }
      if (link.href === '/lacak') {
        return false;
      }
    }

    if (link.href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(link.href) && !link.href.includes('#');
  };

  const handleNavClick = (href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      if (href.startsWith('/#')) {
        e.preventDefault();
        const targetId = href.replace('/#', '');
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', `/#${targetId}`);
          setActiveSection(targetId as any);
        }
      } else if (href === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
        setActiveSection('beranda');
      }
    }
  };

  const brandDestination = currentUser ? getDashboardLink() : '/';

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left: Brand Logo & Name (Minimalist clean style) */}
          <Link
            href={brandDestination}
            onClick={(e) => {
              if (!currentUser && pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, '', '/');
                setActiveSection('beranda');
              }
            }}
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <GraduationCap size={18} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                ASMA
              </span>
              <span className="text-[11px] font-semibold text-slate-500 border-l border-slate-300 pl-2 hidden sm:inline-block">
                {currentUser?.role === 'MAHASISWA'
                  ? 'Portal Mahasiswa'
                  : currentUser?.role === 'AKADEMISI'
                  ? 'Portal Akademisi'
                  : currentUser?.role === 'ADMIN'
                  ? 'Portal Admin'
                  : 'UIN Syarif Hidayatullah Jakarta'}
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (Clean text, no gradients) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              const IconComp = (link as any).icon;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(link.href, e)}
                  className={`text-sm transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'text-slate-900 font-bold border-b-2 border-slate-900 py-1'
                      : 'text-slate-600 hover:text-slate-900 font-medium py-1'
                  }`}
                >
                  {IconComp && <IconComp size={15} className={active ? 'text-slate-900' : 'text-slate-400'} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: CTA Button / User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 bg-slate-100 animate-pulse rounded-lg" />
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition text-xs font-medium"
                >
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {getRoleLabel()}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Keluar dari akun"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-900 hover:bg-slate-50 font-medium text-xs sm:text-sm transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {currentUser && (
              <Link
                href={getDashboardLink()}
                className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800"
              >
                Dasbor
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Clean rectangular card) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            const IconComp = (link as any).icon;

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(link.href, e);
                }}
                className={`px-3 py-2.5 rounded-lg text-sm transition flex items-center justify-between ${
                  active
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {IconComp && <IconComp size={16} className={active ? 'text-slate-900' : 'text-slate-400'} />}
                  <span>{link.label}</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            {currentUser ? (
              <div className="flex flex-col gap-2">
                <div className="p-3 rounded-lg bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.nim_nip} • {getRoleLabel()}</p>
                  </div>
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-slate-900 text-white font-medium"
                  >
                    Buka Dasbor
                  </Link>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut size={14} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Login Sistem ASMA
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
