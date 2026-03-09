/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // New Brand Colors
        primary: {
          DEFAULT: '#0B1C2D',
          lighter: '#1A3A5C',
          darker: '#050F18',
        },
        secondary: {
          DEFAULT: '#1E3A8A',
          lighter: '#2E5CB8',
          darker: '#0F1F4A',
        },
        accent: {
          DEFAULT: '#3B82F6',
          lighter: '#60A5FA',
          darker: '#2563EB',
        },
        
        // Dark Colors
        dark: {
          DEFAULT: '#1F2937',
          lighter: '#374151',
          darker: '#111827',
        },
        
        // Dark Mode Colors
        darkMode: {
          background: '#020617',
          surface: '#0B1220',
          'text-primary': '#E5E7EB',
          'text-secondary': '#9CA3AF',
          'text-muted': '#6B7280',
          border: '#1F2937',
        },
        
        // Brand Colors
        amber: {
          DEFAULT: '#D4915A',
          lighter: '#E6B485',
          darker: '#B87A45',
        },
        
        // Background Colors
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F2ED',
        },
        
        // Container Colors
        container: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F2ED',
        },
        
        // Input Colors
        input: {
          DEFAULT: 'rgba(212, 145, 90, 0.08)', // #D4915A at 8% opacity
          strong: 'rgba(184, 122, 69, 0.12)', // #B87A45 at 12% opacity
        },
        
        // Text Colors
        text: {
          primary: '#3A2F28',
          secondary: '#6B5F56',
          tertiary: '#998C82',
          quaternary: '#C4BCB3',
          'on-dark': 'rgba(255, 255, 255, 0.95)',
          'on-dark-secondary': 'rgba(255, 255, 255, 0.75)',
          link: '#D4915A',
        },
        
        // Accent Colors
        olive: {
          DEFAULT: '#A8A082',
        },
        taupe: {
          DEFAULT: '#B8A898',
        },
        terracotta: {
          DEFAULT: '#D79178',
        },
        
        // Functional Colors
        success: {
          DEFAULT: '#B8C9A8',
          light: '#DFE8D6',
        },
        error: {
          DEFAULT: '#D6A89F',
          light: '#F0DDD8',
        },
        warning: {
          DEFAULT: '#E8CBA3',
          light: '#F5E8CF',
        },
        info: {
          DEFAULT: '#7F8E9C',
          light: '#C8D5E0',
        },
        
        // Border & Divider Colors
        border: {
          DEFAULT: '#E5DDD5',
          divider: '#E8E2DB',
          active: '#D4915A',
        },
        
        // Data Visualization Colors
        data: {
          1: '#E8E2DB',
          2: '#CFC6BC',
          3: '#B5A99B',
          4: '#998C7D',
          5: '#7D6F5F',
          6: '#5F5244',
        },
        'data-accent': {
          1: '#D4915A',
          2: '#B87A45',
          3: '#A8A082',
          4: '#D79178',
        },
        
        // Gradient orbs (for background effects)
        orb: {
          terracotta: 'rgba(215, 145, 120, 0.08)',
          sage: 'rgba(168, 160, 130, 0.06)',
        },
      },
      
      // Background gradients
      backgroundImage: {
        'gradient-terracotta-orb': 'radial-gradient(circle, rgba(215, 145, 120, 0.08) 0%, transparent 70%)',
        'gradient-sage-orb': 'radial-gradient(circle, rgba(168, 160, 130, 0.06) 0%, transparent 70%)',
      },
      
      // Border colors
      borderColor: {
        DEFAULT: '#E5DDD5',
        active: '#D4915A',
        divider: '#E8E2DB',
      },
      
      // Text colors for utilities
      textColor: {
        primary: '#3A2F28',
        secondary: '#6B5F56',
        tertiary: '#998C82',
        quaternary: '#C4BCB3',
        link: '#D4915A',
      },
    },
  },
  plugins: [],
}