import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'


export default defineConfig([
	globalIgnores(['dist', 'node_modules']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			// errors
			'no-debugger': 'error',
			'default-param-last': 'error',
			'no-dupe-args': 'error',
			'no-dupe-else-if': 'error',
			'no-duplicate-case': 'error',
			'no-func-assign': 'error',
			'no-import-assign': 'error',
			'no-inner-declarations': 'error',
			'no-invalid-regexp': 'error',
			'no-promise-executor-return': 'error',
			'no-self-assign': 'error',
			'no-self-compare': 'error',
			'no-setter-return': 'error',
			'no-sparse-arrays': 'error',
			'no-template-curly-in-string': 'error',
			'no-unassigned-vars': 'error',
			'no-undef': 'error',
			'no-unreachable-loop': 'error',
			'no-unsafe-negation': 'error',
			'no-unsafe-optional-chaining': 'error',
			'require-atomic-updates': 'error',
			'use-isnan': 'error',
			'valid-typeof': 'error',
			'block-scoped-var': 'error',
			'no-alert': 'error',
			'no-caller': 'error',
			'no-eval': 'error',
			'no-multi-assign': 'error',
			'no-multi-str': 'error',
			'no-new': 'error',
			'no-new-wrappers': 'error',
			'no-octal': 'error',
			'no-octal-escape': 'error',
			'no-regex-spaces': 'error',
			'no-sequences': 'error',
			'no-throw-literal': 'error',
			'no-var': 'error',
			'no-with': 'error',

			// warnings
			'no-duplicate-imports': 'warn',
			'no-irregular-whitespace': 'warn',
			'no-unexpected-multiline': 'warn',
			'no-unmodified-loop-condition': 'warn',
			'no-unreachable': 'warn',
			'no-unsafe-finally': 'warn',
			'no-unused-vars': 'warn',
			'no-useless-backreference': 'warn',
			'no-console': 'warn',
			'no-else-return': 'warn',
			'no-empty': 'warn',
			'no-extra-boolean-cast': 'warn',
			'no-implicit-globals': 'warn',
			'no-lone-blocks': 'warn',
			'no-lonely-if': 'warn',
			'no-nested-ternary': 'warn',
			'no-param-reassign': 'warn',
			'no-plusplus': 'warn',
			'no-undef-init': 'warn',
			'no-unneeded-ternary': 'warn',
			'no-unused-expressions': 'warn',
			'no-useless-escape': 'warn',
			'no-useless-rename': 'warn',
			'no-useless-return': 'warn',
			'prefer-const': 'warn',
			'react-hooks/rules-of-hooks': 'warn',
			'react-hooks/exhaustive-deps': 'warn',

			// suggestions
			'arrow-body-style': ['error', 'as-needed'],
			'curly': ['warn', 'multi-or-nest'],
			'eqeqeq': ['error', 'always'],
			'func-style': ['error', 'expression'],
			'logical-assignment-operators': ['error', 'always'],
			'operator-assignment': ['warn', 'always'],
			'sort-imports': ['warn', {
				'ignoreCase': false,
				'ignoreDeclarationSort': true,
				'ignoreMemberSort': false,
				'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
				'allowSeparatedGroups': false
			}]
		},
	},
])
