export const getAiAvatar = (seed, style = 'adventurer-neutral') => {
  const normalizedSeed = encodeURIComponent(String(seed || 'athand-user').trim().toLowerCase());
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${normalizedSeed}&backgroundType=gradientLinear`;
};

export const resolveAvatar = (preferredAvatar, seed, style = 'adventurer-neutral') => {
  if (preferredAvatar && !String(preferredAvatar).includes('/api/placeholder')) {
    return preferredAvatar;
  }
  return getAiAvatar(seed, style);
};
