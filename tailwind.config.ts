import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:    '#FDFDFD',
        ink:      '#1A1A1A',
        positive: '#008F5D',
        negative: '#C62828',
      },
      fontFamily: {
        hand: ['"Caveat"', '"Comic Sans MS"', 'cursive'],
        sketch: ['"Patrick Hand"', '"Comic Sans MS"', 'cursive'],
      },
      keyframes: {
        wiggle: {
          '0%,100%': { transform: 'rotate(-0.4deg) translateY(0)' },
          '50%':     { transform: 'rotate(0.4deg) translateY(-1px)' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%':     { transform: 'scale(1.08)', opacity: '0.85' },
        },
        sketchIn: {
          '0%':   { strokeDashoffset: '300', opacity: '0' },
          '100%': { strokeDashoffset: '0',   opacity: '1' },
        },
      },
      animation: {
        wiggle:   'wiggle 2.4s ease-in-out infinite',
        breathe:  'breathe 500ms ease-out',
        sketchIn: 'sketchIn 1.2s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
