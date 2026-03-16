const deriveApiOrigin = () => {
  const explicitOrigin = import.meta.env.VITE_API_URL;
  if (explicitOrigin) return explicitOrigin.replace(/\/+$/, '');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiBaseUrl) return apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

  return 'http://localhost:5000';
};

export const getAiAvatar = () => '/images/provider-fallback.svg';

export const resolveAvatar = (preferredAvatar, seed, style = 'adventurer-neutral') => {
  if (preferredAvatar && !String(preferredAvatar).includes('/api/placeholder')) {
    if (String(preferredAvatar).startsWith('/uploads/')) {
      return `${deriveApiOrigin()}${preferredAvatar}`;
    }
    return preferredAvatar;
  }
  return getAiAvatar(seed, style);
};
