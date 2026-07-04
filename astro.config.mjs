import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tech-watch.zatsit.fr',
  compressHTML: true,
  prefetch: { defaultStrategy: 'viewport' },
  vite: {
    plugins: [tailwindcss()]
  }
});
