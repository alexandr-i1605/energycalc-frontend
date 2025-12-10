import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  base: '/energycalc-frontend/',
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: 'EnergyCalc',
        short_name: 'EnergyCalc',
        start_url: '/energycalc-frontend/',
        scope: '/energycalc-frontend/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0058A3',
        icons: [
          {
            src: 'logo.svg',
            sizes: '192x192',
            type: 'image/svg',
          },
          {
            src: 'logo.svg',
            sizes: '512x512',
            type: 'image/svg',
          },
        ],
      },
    }),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/img-proxy': {
      target: 'http://localhost:9000',
      changeOrigin: true,
    },
    },
  },
})
