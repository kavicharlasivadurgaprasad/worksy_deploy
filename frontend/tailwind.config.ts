import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        'ink-soft': '#0D0D0D',
        paper: '#EDEAE1',
        'paper-dim': '#E3DFD3',
        brass: '#FFFFFF',
        'brass-light': '#FFFFFF',
        moss: '#47543D',
        slate: {
          DEFAULT: '#6E6B62',
          light: '#9C988C',
        },
        worksy: {
          bg: '#08080A',
          surface: '#111114',
          card: '#151518',
          'card-hover': '#1C1C20',
          border: '#222226',
          'border-light': '#2E2E34',
          cream: '#F5EFEB',
          'cream-dark': '#EDE6DC',
          'cream-text': '#18181B',
          muted: '#8E8E93',
          subtle: '#636366',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      maxWidth: {
        content: '1440px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
