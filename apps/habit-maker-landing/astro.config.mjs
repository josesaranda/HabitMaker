import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://habitmaker.josesaranda.es',
  vite: {
    plugins: [tailwindcss()],
  },
});
