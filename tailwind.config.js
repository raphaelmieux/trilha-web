/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // PRIMARY — Red (brick red, predominant)
        primary: {
          50:  '#fdf2ef',
          100: '#fae0d8',
          200: '#f4bfb0',
          300: '#eb9478',
          400: '#df6344',
          500: '#C13516', // base red from palette
          600: '#a22c12',
          700: '#83230e',
          800: '#621a0b',
          900: '#3e1007',
        },
        // SECONDARY — Yellow/Amber
        secondary: {
          50:  '#fffbf0',
          100: '#fef3d0',
          200: '#fde59f',
          300: '#fcd165',
          400: '#f9bb34',
          500: '#F5A623', // base amber from palette
          600: '#d48918',
          700: '#b06d0f',
          800: '#88520b',
          900: '#573506',
        },
        // TERTIARY — Blue (navy)
        tertiary: {
          50:  '#eef1fc',
          100: '#d5dbf8',
          200: '#aab7f1',
          300: '#7690e7',
          400: '#4b69db',
          500: '#2847ce',
          600: '#1B2E8C', // base navy from palette
          700: '#152473',
          800: '#0f1b58',
          900: '#091138',
        },
        // NEUTRAL — Cold gray scale (text-first)
        neutral: {
          50:  '#f9f9fa',
          100: '#E8E8E8', // base gray from palette
          200: '#d0d0d2',
          300: '#b0b0b4',
          400: '#888890',
          500: '#636370',
          600: '#484852',
          700: '#323238',
          800: '#1e1e22',
          900: '#0f0f11',
        },
        // GREEN — use only for confirmed success states, prefer blue
        success: {
          500: '#0E7C3A', // from palette
          600: '#0a6030',
        },
        // DARK backgrounds — 100% pure black based
        dark: {
          0:   '#000000', // pure black
          50:  '#080808',
          100: '#0f0f0f',
          200: '#141414',
          300: '#1a1a1a',
          400: '#222222',
          500: '#2a2a2a',
          600: '#333333',
          700: '#3d3d3d',
          800: '#111111', // alias for body bg
        },
      },
      fontFamily: {
        // Helvetica where it exists (macOS/iOS), Arial elsewhere — Arial is
        // metrically identical to Helvetica, so line breaks and measured text
        // widths are the same on every platform. Liberation Sans and Nimbus Sans
        // are the equivalent metric clones shipped on Linux. No web font is
        // loaded: this keeps the app free of a render-blocking external request.
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'Liberation Sans', 'Nimbus Sans', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
