import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@nx': nx,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [
            '../../../../../../package.json',
            '../../../../../../../package.json',
          ],
          checkDynamicDependenciesExceptions: [
            '@habit-maker/auth-feature',
            '@habit-maker/habits-feature',
            '@habit-maker/settings-feature',
            '@habit-maker/today-feature',
          ],
          depConstraints: [
            {
              sourceTag: 'platform:frontend',
              onlyDependOnLibsWithTags: ['platform:frontend'],
            },
            {
              sourceTag: 'platform:backend',
              onlyDependOnLibsWithTags: ['platform:backend'],
            },
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain', 'type:shared'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:data-access',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:data-access',
                'type:feature',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:infrastructure',
              ],
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:infrastructure',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:api',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:infrastructure',
                'type:api',
                'type:shared',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['**/vitest.config.*.timestamp*'],
  },
];
