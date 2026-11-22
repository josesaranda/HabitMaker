import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir:
    '../../../../node_modules/.vite/libs/habit-maker-api/settings/infrastructure',
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'api-settings-infrastructure',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory:
        '../../../../coverage/libs/habit-maker-api/settings/infrastructure',
      provider: 'v8' as const,
    },
  },
}));
