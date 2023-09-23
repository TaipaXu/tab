import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import vuetify from 'vite-plugin-vuetify';

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    plugins: [
        vue(),
        vuetify(),
        AutoImport({
            imports: ['vue'],
            dts: resolve('src/@types', 'auto-imports.d.ts')
        }),
        Components({
            dts: resolve('src/@types', 'components.d.ts')
        }),
        copy({
            targets: [
                { src: 'src/manifest.json', dest: 'dist' },
                { src: 'src/assets', dest: 'dist' }
            ],
            hook: 'writeBundle'
        }),
        del({
            targets: 'dist/favicon.ico',
            hook: 'writeBundle'
        })
    ],
    build: {
        rollupOptions: {
            input: ['popup.html', 'save.html', './src/service.ts'],
            output: {
                chunkFileNames: '[name].[hash].js',
                assetFileNames: '[name].[hash].[ext]',
                entryFileNames: '[name].js',
                dir: 'dist'
            }
        }
    }
});
