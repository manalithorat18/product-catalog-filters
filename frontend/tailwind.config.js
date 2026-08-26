/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#12141A',
        surface: '#1A1D26',
        surface2: '#20242F',
        line: '#2B303C',
        ash: '#8A8F9E',
        bone: '#EDEEF3',
        signal: {
          DEFAULT: '#F2A93B',
          soft: '#F7C471',
          dim: '#4A3A1E',
        },
        wave: {
          DEFAULT: '#4FD1C5',
          dim: '#1E3A38',
        },
        alert: '#E2594B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
