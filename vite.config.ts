import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig, type Plugin } from 'vite-plus';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import vueDevTools from 'vite-plugin-vue-devtools';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const resolveProject = (...segments: string[]) => path.resolve(projectRoot, ...segments);

const chromeExtensionAssets = (): Plugin => ({
    name: 'chrome-extension-assets',
    async writeBundle() {
        const dist = resolveProject('dist');

        await fs.mkdir(dist, { recursive: true });
        await fs.copyFile(resolveProject('src/manifest.json'), path.join(dist, 'manifest.json'));
        await fs.rm(path.join(dist, 'assets'), { recursive: true, force: true });
        await fs.cp(resolveProject('src/assets'), path.join(dist, 'assets'), { recursive: true });
        await fs.rm(path.join(dist, 'favicon.ico'), { force: true });
    },
});

export default defineConfig({
    staged: {
        '*': 'vp check --fix',
        '*.html': 'eslint --fix',
        '**/*.vue': 'eslint --fix',
    },
    fmt: {
        ignorePatterns: [
            '**/*.vue',
            '**/*.html',
            'node_modules/**',
            'dist/**',
            'dist-ssr/**',
            '.vite/**',
            '.vscode/**',
        ],
        semi: true,
        singleQuote: true,
        indentStyle: 'space',
        indentWidth: 4,
    },
    lint: {
        plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'vue'],
        categories: {
            correctness: 'error',
        },
        env: {
            browser: true,
            builtin: true,
        },
        ignorePatterns: ['**/dist/**', '**/dist-ssr/**'],
        rules: {
            'no-array-constructor': 'error',
            'typescript/ban-ts-comment': 'error',
            'typescript/no-empty-object-type': 'error',
            'typescript/no-explicit-any': 'error',
            'typescript/no-namespace': 'error',
            'typescript/no-require-imports': 'error',
            'typescript/no-unnecessary-type-constraint': 'error',
            'typescript/no-unsafe-function-type': 'error',
            'vite-plus/prefer-vite-plus-imports': 'error',
        },
        overrides: [
            {
                files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.vue'],
                rules: {
                    'constructor-super': 'off',
                    'getter-return': 'off',
                    'no-class-assign': 'off',
                    'no-const-assign': 'off',
                    'no-dupe-class-members': 'off',
                    'no-dupe-keys': 'off',
                    'no-func-assign': 'off',
                    'no-import-assign': 'off',
                    'no-new-native-nonconstructor': 'off',
                    'no-obj-calls': 'off',
                    'no-redeclare': 'off',
                    'no-setter-return': 'off',
                    'no-this-before-super': 'off',
                    'no-undef': 'off',
                    'no-unreachable': 'off',
                    'no-unsafe-negation': 'off',
                    'no-var': 'error',
                    'no-with': 'off',
                    'prefer-const': 'error',
                    'prefer-rest-params': 'error',
                    'prefer-spread': 'error',
                },
            },
        ],
        options: {
            typeAware: true,
            typeCheck: true,
        },
        jsPlugins: [
            {
                name: 'vite-plus',
                specifier: 'vite-plus/oxlint-plugin',
            },
        ],
    },
    plugins: [vue(), vueDevTools(), vuetify(), chromeExtensionAssets()],
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_debugger: true,
                pure_funcs: [
                    'console.log',
                    'console.info',
                    'console.debug',
                    'console.trace',
                    'console.table',
                ],
            },
        },
        rollupOptions: {
            input: {
                popup: resolveProject('popup.html'),
                save: resolveProject('save.html'),
                service: resolveProject('src/service.ts'),
            },
            output: {
                chunkFileNames: '[name].[hash].js',
                assetFileNames: '[name].[hash].[ext]',
                entryFileNames: '[name].js',
                dir: 'dist',
            },
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
