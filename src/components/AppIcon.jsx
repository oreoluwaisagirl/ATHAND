import React from 'react';

const AppIcon = ({ name, className = 'h-5 w-5' }) => {
  const props = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
    className,
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'home':
      return <svg {...props}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>;
    case 'cleaning':
      return <svg {...props}><path d="M7 4h8" /><path d="M9 4v5" /><path d="M7 9h8l2 4H5l2-4Z" /><path d="M8 13v6" /><path d="M12 13v7" /><path d="M16 13v5" /></svg>;
    case 'electric':
      return <svg {...props}><path d="m13 2-7 11h5l-1 9 8-12h-5l0-8Z" /></svg>;
    case 'truck':
      return <svg {...props}><path d="M3 7h11v8H3z" /><path d="M14 10h3l3 3v2h-6z" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="17.5" cy="18" r="1.5" /></svg>;
    case 'care':
      return <svg {...props}><circle cx="12" cy="8" r="3" /><path d="M6 20a6 6 0 0 1 12 0" /><path d="M5 11h2" /><path d="M17 11h2" /></svg>;
    case 'paint':
      return <svg {...props}><path d="M14 4 4 14l6 6 10-10-6-6Z" /><path d="m12 6 6 6" /></svg>;
    case 'wrench':
      return <svg {...props}><path d="M14 6a4 4 0 0 0 4.5 4.5L12 17l-3 1 1-3 6.5-6.5A4 4 0 0 0 14 6Z" /><path d="m5 19 2 2" /></svg>;
    case 'shield':
      return <svg {...props}><path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z" /><path d="m9.5 12 1.7 1.7L14.8 10" /></svg>;
    case 'bolt':
      return <svg {...props}><path d="m13 2-6 9h4l-1 11 7-10h-4l0-10Z" /></svg>;
    case 'card':
      return <svg {...props}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /><path d="M7 14h3" /></svg>;
    case 'support':
      return <svg {...props}><path d="M4 12a8 8 0 1 1 16 0" /><path d="M4 13v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" /><path d="M20 13v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" /><path d="M12 20v1" /></svg>;
    case 'pin':
      return <svg {...props}><path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.35-4.35" /></svg>;
    case 'chevronDown':
      return <svg {...props}><path d="m7 10 5 5 5-5" /></svg>;
    case 'arrowRight':
      return <svg {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
    case 'rocket':
      return <svg {...props}><path d="M14 4c3 0 5 2 6 6-2 1-4 3-5 5-3-1-5-3-6-6 2-1 3-5 5-5Z" /><path d="M9 15 5 19" /><path d="M8 19H4v-4" /></svg>;
    case 'lock':
      return <svg {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 1 1 8 0v3" /></svg>;
    case 'worker':
      return <svg {...props}><path d="M8 9V7l4-2 4 2v2" /><path d="M9 11h6" /><path d="M7 21v-5a5 5 0 0 1 10 0v5" /><circle cx="12" cy="10" r="3" /></svg>;
    case 'alert':
      return <svg {...props}><path d="M12 4 3 20h18L12 4Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
    case 'chat':
      return <svg {...props}><path d="M4 5h16v10H8l-4 4V5Z" /></svg>;
    case 'star':
      return <svg {...props}><path d="m12 3 2.7 5.46 6.03.88-4.36 4.25 1.03 6.01L12 16.8 6.6 19.6l1.03-6.01L3.27 9.34l6.03-.88L12 3Z" /></svg>;
    case 'book':
      return <svg {...props}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4Z" /><path d="M8 4v16" /></svg>;
    case 'toolbox':
      return <svg {...props}><rect x="3" y="8" width="18" height="11" rx="2" /><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M3 12h18" /></svg>;
    case 'chef':
      return <svg {...props}><path d="M8 9a4 4 0 1 1 8 0v1H8V9Z" /><path d="M9 10v8h6v-8" /><path d="M7 18h10" /></svg>;
    case 'car':
      return <svg {...props}><path d="M5 15 7 9h10l2 6" /><path d="M4 15h16v3H4z" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="16.5" cy="18" r="1.5" /></svg>;
    case 'leaf':
      return <svg {...props}><path d="M19 5c-7 0-12 5-12 12 7 0 12-5 12-12Z" /><path d="M5 19c3-3 7-6 11-8" /></svg>;
    case 'gear':
      return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.76-.32 1.6 1.6 0 0 0-1 1.45V21a2 2 0 1 1-4 0v-.09a1.6 1.6 0 0 0-1-1.45 1.6 1.6 0 0 0-1.76.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.45-1H3a2 2 0 1 1 0-4h.09a1.6 1.6 0 0 0 1.45-1 1.6 1.6 0 0 0-.32-1.76l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 8.8 4.6a1.6 1.6 0 0 0 1-1.45V3a2 2 0 1 1 4 0v.09a1.6 1.6 0 0 0 1 1.45 1.6 1.6 0 0 0 1.76-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9c.64 0 1.2.38 1.45 1H21a2 2 0 1 1 0 4h-.09a1.6 1.6 0 0 0-1.45 1Z" /></svg>;
    case 'hammer':
      return <svg {...props}><path d="M14 4 20 10" /><path d="M13 5 9 9" /><path d="m8 10 6 6" /><path d="M5 19l9-9" /></svg>;
    case 'pipe':
      return <svg {...props}><path d="M7 5h6v4H9v6h8" /><path d="M17 15a2 2 0 1 0 0 4" /></svg>;
    case 'mail':
      return <svg {...props}><path d="M4 6h16v12H4z" /><path d="m4 8 8 6 8-6" /></svg>;
    case 'bell':
      return <svg {...props}><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>;
    case 'question':
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.3-1.7 2.7" /><path d="M12 17h.01" /></svg>;
    case 'instagram':
      return <svg {...props}><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.5" cy="6.5" r=".5" /></svg>;
    case 'facebook':
      return <svg {...props}><path d="M14 8h2V4h-2a4 4 0 0 0-4 4v3H7v4h3v5h4v-5h3l1-4h-4V8a1 1 0 0 1 1-1Z" /></svg>;
    case 'twitter':
      return <svg {...props}><path d="M22 5.9c-.7.3-1.4.5-2.2.6a3.8 3.8 0 0 0 1.7-2.1 7.5 7.5 0 0 1-2.4.9 3.8 3.8 0 0 0-6.5 3.5A10.7 10.7 0 0 1 5 5.1a3.8 3.8 0 0 0 1.2 5 3.7 3.7 0 0 1-1.7-.5v.1a3.8 3.8 0 0 0 3 3.8 3.8 3.8 0 0 1-1.7.1 3.8 3.8 0 0 0 3.5 2.6A7.7 7.7 0 0 1 4 18.6a10.8 10.8 0 0 0 5.8 1.7c7 0 10.9-5.9 10.9-11v-.5A7.8 7.8 0 0 0 22 5.9Z" /></svg>;
    default:
      return null;
  }
};

export default AppIcon;
