import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about-athand', label: 'About' },
  { to: '/house-help-search', label: 'Service List' },
  { to: '/worker-panel', label: 'Dashboard' },
  { to: '/other-help', label: 'Others' },
  { to: '/messages', label: 'Blog' },
  { to: '/profile', label: 'Contact' },
];

const DesktopHeader = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { isAuthenticated, user } = useAuth();
  const userInitial = String(user?.fullName || user?.name || user?.email || 'A')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className={`sticky top-0 z-40 hidden md:block ${isHome ? 'border-b border-white/10 bg-[#120d0b]/80' : 'border-b border-border bg-container/92'} backdrop-blur-xl`}>
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-4 border-emerald-500 bg-transparent text-base font-bold text-emerald-400">
            Q
          </span>
          <div>
            <p className={`text-xl font-black uppercase tracking-[0.12em] ${isHome ? 'text-white' : 'text-text-primary'}`}>ATHAND</p>
          </div>
        </Link>
        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-7">
            {links.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm transition ${active ? (isHome ? 'font-semibold text-white' : 'font-semibold text-primary') : (isHome ? 'text-white/75 hover:text-white' : 'text-text-secondary hover:text-text-primary')}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {isAuthenticated ? (
            <Link
              to="/profile"
              className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-medium transition ${
                isHome
                  ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                  : 'border-border bg-background text-text-primary hover:border-primary/40'
              }`}
            >
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                isHome ? 'border-orange-300 bg-orange-100 text-slate-900' : 'border-border bg-background text-text-primary'
              }`}>
                {userInitial}
              </span>
              <span>Account</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                  isHome ? 'text-white/82 hover:text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isHome
                    ? 'border-accent bg-accent text-white hover:bg-accent-darker'
                    : 'border-accent bg-accent text-white hover:bg-accent-darker'
                }`}
              >
                Sign Up
              </Link>
            </div>
          )}
          <DarkModeToggle className={isHome ? '!border-white/15 !bg-white/5 !text-white hover:!bg-white/10' : '!bg-background !text-text-secondary hover:!bg-background-secondary'} />
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
