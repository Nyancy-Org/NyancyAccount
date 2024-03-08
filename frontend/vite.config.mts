import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 1240,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:1239/',
        rewrite: (path) => path.replace(/^\/v1/, ''),
        changeOrigin: true,
        ws: true
      }
    }
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
  },
  build: {
    cssCodeSplit: true,
    minify: 'esbuild',
    cssMinify: 'lightningcss',
    reportCompressedSize: false,
    assetsInlineLimit: 0
  },
  css: {
    lightningcss: {}
  },
  json: {
    stringify: true
  }
})
