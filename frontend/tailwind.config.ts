import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      colors: {
        minerion: {
          lime: '#DCFF0A',
          graphite: '#373737',
          sand: '#ede8d5',
          green: '#1c6f65',
          ink: '#111111',
          mist: '#f7f7ef'
        }
      },
      boxShadow: {
        soft: '0 16px 40px rgba(55, 55, 55, 0.10)',
        lift: '0 20px 60px rgba(28, 111, 101, 0.16)'
      }
    }
  },
  plugins: []
} satisfies Config;
