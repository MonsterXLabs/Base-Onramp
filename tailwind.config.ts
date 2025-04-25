import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    screens: {
      xs: '375px',
      // => @media (min-width: 375px) { ... }

      xss: '480px',
      // => @media (min-width: 425px) { ... }

      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      mdp: '850px',
      // => @media (min-width: 850px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      xl2: '1366px',
      // => @media (min-width: 1366px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      '3xl': '2080px',
      // => @media (min-width: 2080px) { ... }
    },
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        AzeretMono: ['Azeret Mono', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          // DEFAULT: 'hsl(var(--primary))',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'dark-900': '#111111',
        'dark-700': '#232323',
        'dark-600': '#3a3a3a',
        'dark-800': '#1e1e1e',
        'gray-500': '#919191',
        'gray-600': '#545454',
        'light-200': '#dee8e8',
        'yellow-400': '#ddf247',
        'white-10': 'rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'template-gradient':
          'linear-gradient(101deg, rgba(255, 255, 255, 0.05) -0.78%, rgba(255, 255, 255, 0.01) 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  purge: {
    mode: 'all',
    preserveHtmlElements: false,
    content: ['./src/**/*.tsx', './node_modules/flatpickr/**/*.js'],
  },
} satisfies Config;

export default config;
