import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { id: 'home', label: 'Go to Home', path: '/' },
  { id: 'search', label: 'Find House Help', path: '/house-help-search' },
  { id: 'other', label: 'Explore Other Help', path: '/other-help' },
  { id: 'messages', label: 'Open Messages', path: '/messages' },
  { id: 'profile', label: 'Open Profile', path: '/profile' },
  { id: 'help', label: 'Help Center', path: '/help-center' },
  { id: 'login', label: 'Log In', path: '/login' },
];

const CommandCenter = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isShortcut) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    return actions.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const onNavigate = (path) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  const handleListKey = (event) => {
    if (!open || filtered.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      onNavigate(filtered[activeIndex].path);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 hidden rounded-full glass px-4 py-2 text-xs font-medium text-text-primary md:block"
      >
        Quick Actions
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/35 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-20 w-full max-w-xl rounded-3xl glass-strong p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">Command Center</p>
              <span className="rounded-md bg-background-secondary px-2 py-1 text-[11px] text-text-tertiary">ESC</span>
            </div>

            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleListKey}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              placeholder="Type an action..."
            />

            <div className="mt-3 space-y-1">
              {filtered.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${idx === activeIndex ? 'bg-sky-500 text-white' : 'bg-background-secondary text-text-primary hover:bg-background'}`}
                >
                  {item.label}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="rounded-xl bg-background-secondary px-3 py-2 text-sm text-text-tertiary">No action found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommandCenter;
