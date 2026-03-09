/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Brand Colors
        primary: {
          DEFAULT: '#0f4c5c',
          lighter: '#15697e',
          darker: '#0b3945',
        },
        secondary: {
          DEFAULT: '#ff7a59',
          lighter: '#ff9a80',
          darker: '#e35f40',
        },
        accent: {
          DEFAULT: '#f4b400',
          lighter: '#f7c94a',
          darker: '#cf9300',
        },
        
        // Dark Colors
        dark: {
          DEFAULT: '#1F2937',
          lighter: '#374151',
          darker: '#111827',
        },
        
        // Dark Mode Colors
        darkMode: {
          background: '#0B1E27',
          surface: '#102A36',
          'text-primary': '#EAF2F8',
          'text-secondary': '#B8D0DF',
          'text-muted': '#8FB2C7',
          border: '#23495A',
        },
        
        // Brand Colors
        amber: {
          DEFAULT: '#f4b400',
          lighter: '#f7c94a',
          darker: '#cf9300',
        },
        
        // Background Colors
        background: {
          DEFAULT: '#f7fafc',
          secondary: '#eaf1f6',
        },
        
        // Container Colors
        container: {
          DEFAULT: 'rgba(255,255,255,0.78)',
          secondary: 'rgba(255,255,255,0.66)',
        },
        
        // Input Colors
        input: {
          DEFAULT: 'rgba(15, 76, 92, 0.08)',
          strong: 'rgba(15, 76, 92, 0.16)',
        },
        
        // Text Colors
        text: {
          primary: '#102a43',
          secondary: '#334e68',
          tertiary: '#627d98',
          quaternary: '#829ab1',
          'on-dark': 'rgba(255, 255, 255, 0.95)',
          'on-dark-secondary': 'rgba(255, 255, 255, 0.75)',
          link: '#15697e',
        },
        
        // Accent Colors
        olive: {
          DEFAULT: '#2d936c',
        },
        taupe: {
          DEFAULT: '#6b7280',
        },
        terracotta: {
          DEFAULT: '#ff7a59',
        },
        
        // Functional Colors
        success: {
          DEFAULT: '#2d936c',
          light: '#e6f6f0',
        },
        error: {
          DEFAULT: '#d64545',
          light: '#fceceb',
        },
        warning: {
          DEFAULT: '#d8a102',
          light: '#fdf5df',
        },
        info: {
          DEFAULT: '#2f6fa3',
          light: '#e7f1fa',
        },
        
        // Border & Divider Colors
        border: {
          DEFAULT: 'rgba(16,42,67,0.12)',
          divider: 'rgba(16,42,67,0.08)',
          active: '#15697e',
        },
        
        // Data Visualization Colors
        data: {
          1: '#d9eff4',
          2: '#bde0e8',
          3: '#8ac9d8',
          4: '#57acc0',
          5: '#2f879f',
          6: '#15697e',
        },
        'data-accent': {
          1: '#0f4c5c',
          2: '#ff7a59',
          3: '#2d936c',
          4: '#f4b400',
        },
        
        // Gradient orbs (for background effects)
        orb: {
          terracotta: 'rgba(255, 122, 89, 0.1)',
          sage: 'rgba(15, 76, 92, 0.12)',
        },
      },
      
      // Background gradients
      backgroundImage: {
        'gradient-terracotta-orb': 'radial-gradient(circle, rgba(255, 122, 89, 0.1) 0%, transparent 70%)',
        'gradient-sage-orb': 'radial-gradient(circle, rgba(15, 76, 92, 0.12) 0%, transparent 70%)',
      },
      
      // Border colors
      borderColor: {
        DEFAULT: '#cbd5e1',
        active: '#15697e',
        divider: '#dbe5ee',
      },
      
      // Text colors for utilities
      textColor: {
        primary: '#102a43',
        secondary: '#334e68',
        tertiary: '#627d98',
        quaternary: '#829ab1',
        link: '#15697e',
      },
    },
  },
  plugins: [],
}
