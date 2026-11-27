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
      try {
        localStorage.removeItem('asma_last_activity');
      } catch {}
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
      // Guest: nav tengah murni urutan seksi landing; Lacak Status jadi tombol utilitas di kanan
      return [
        { label: 'Beranda', href: '/' },
        { label: 'Cara Kerja', href: '/#cara-kerja' },
        { label: 'Kategori', href: '/#kategori' },
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200">
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
            <div className="w-8 h-8 rounded-lg bg-[#00638E] flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-xs">
              <GraduationCap size={18} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-zinc-900 tracking-tight">
                ASMA
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 border-l border-zinc-300 pl-2 hidden lg:inline-block whitespace-nowrap">
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
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              const IconComp = (link as any).icon;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(link.href, e)}
                  className={`text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'text-[#00638E] font-semibold border-b-2 border-[#00638E] py-1'
                      : 'text-zinc-600 hover:text-[#00638E] font-medium py-1'
                  }`}
                >
                  {IconComp && <IconComp size={15} className={active ? 'text-[#00638E]' : 'text-zinc-400'} />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: CTA Button / User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {loading ? (
              <div className="w-40 h-9 bg-zinc-100 animate-pulse rounded-lg" />
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-[#8CB9CC] bg-zinc-50 hover:bg-[#BFD8E3]/20 text-zinc-800 transition text-xs font-medium"
                >
                  <div className="w-6 h-6 rounded-md bg-[#00638E] text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#BFD8E3]/50 text-[#004A6B]">
                    {getRoleLabel()}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Keluar dari akun"
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition border border-transparent hover:border-zinc-400"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/lacak"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-medium text-xs sm:text-sm transition ${
                    pathname.startsWith('/lacak')
                      ? 'bg-[#00638E] border-[#00638E] text-white shadow-xs'
                      : 'border-slate-300 hover:border-[#00638E] text-zinc-800 hover:text-[#00638E] hover:bg-[#BFD8E3]/15'
                  }`}
                >
                  <Search size={14} className={pathname.startsWith('/lacak') ? 'text-white' : 'text-zinc-500'} />
                  <span>Lacak Status</span>
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-xl bg-[#00638E] hover:bg-[#004A6B] text-white font-semibold text-xs sm:text-sm transition shadow-xs"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {currentUser && (
              <Link
                href={getDashboardLink()}
                className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#BFD8E3]/30 text-[#004A6B]"
              >
                Dasbor
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Clean rectangular card) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          {!currentUser && !loading && (
            <Link
              href="/lacak"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00638E] text-white text-sm font-semibold hover:bg-[#004A6B] transition shadow-xs"
            >
              <Search size={15} />
              <span>Lacak Status</span>
            </Link>
          )}
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
                    ? 'bg-[#BFD8E3]/25 text-[#00638E] font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-[#00638E] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {IconComp && <IconComp size={16} className={active ? 'text-[#00638E]' : 'text-zinc-400'} />}
                  <span>{link.label}</span>
                </div>
                <ChevronRight size={14} className="text-zinc-400" />
              </Link>
            );
          })}

          <div className="pt-3 border-t border-zinc-100">
            {currentUser ? (
              <div className="flex flex-col gap-2">
                <div className="p-3 rounded-lg bg-zinc-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-500">{currentUser.nim_nip} • {getRoleLabel()}</p>
                  </div>
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-[#00638E] text-white font-medium"
                  >
                    Buka Dasbor
                  </Link>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-medium text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                >
                  <LogOut size={14} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-xl bg-[#00638E] text-white text-sm font-semibold hover:bg-[#004A6B] transition shadow-xs"
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
