const deriveApiOrigin = () => {
  const explicitOrigin = import.meta.env.VITE_API_URL;
  if (explicitOrigin) return explicitOrigin.replace(/\/+$/, '');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiBaseUrl) return apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

  return 'http://localhost:5000';
};

const palette = [
  ['#0F172A', '#1E293B'],
  ['#0B1C2D', '#1D4ED8'],
  ['#3F6212', '#65A30D'],
  ['#7C2D12', '#EA580C'],
  ['#701A75', '#DB2777'],
  ['#134E4A', '#0D9488'],
];

const stockPortraits = [
  '/images/workers/worker-01.svg',
  '/images/workers/worker-02.svg',
  '/images/workers/worker-03.svg',
  '/images/workers/worker-04.svg',
  '/images/workers/worker-05.svg',
  '/images/workers/worker-06.svg',
];

const hashSeed = (seed = '') => {
  const normalized = String(seed || '').trim().toLowerCase();
  return [...normalized].reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const getInitials = (seed = '') => {
  const words = String(seed || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'AH';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const getAiAvatar = (seed = '') => {
  const hash = hashSeed(seed);
  const [bgStart, bgEnd] = palette[hash % palette.length];
  const initials = getInitials(seed);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" role="img" aria-label="${initials}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgStart}" />
          <stop offset="100%" stop-color="${bgEnd}" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="48" fill="url(#g)" />
      <circle cx="120" cy="92" r="46" fill="rgba(255,255,255,0.16)" />
      <path d="M48 202c12-33 39-55 72-55s60 22 72 55" fill="rgba(255,255,255,0.14)" />
      <text x="120" y="134" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="#FFFFFF">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getStockPortrait = (seed = '') => {
  const hash = hashSeed(seed);
  return stockPortraits[hash % stockPortraits.length];
};

export const resolveAvatar = (preferredAvatar, seed, style = 'adventurer-neutral') => {
  if (preferredAvatar && !String(preferredAvatar).includes('/api/placeholder')) {
    if (String(preferredAvatar).includes('/uploads/seed/')) {
      return getStockPortrait(seed);
    }
    if (String(preferredAvatar).startsWith('/uploads/')) {
      return `${deriveApiOrigin()}${preferredAvatar}`;
    }
    return preferredAvatar;
  }
  if (String(preferredAvatar || '').includes('/api/placeholder')) {
    return getStockPortrait(seed);
  }
  return getAiAvatar(seed, style);
};
