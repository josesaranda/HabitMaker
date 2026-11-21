import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/api-admin-application',
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'api-admin-application',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    passWithNoTests: true,
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/api-admin-application',
      provider: 'v8' as const,
    },
  },
}));
