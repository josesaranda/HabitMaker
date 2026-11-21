import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/api-admin-infrastructure',
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'api-admin-infrastructure',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/api-admin-infrastructure',
      provider: 'v8' as const,
    },
  },
}));
