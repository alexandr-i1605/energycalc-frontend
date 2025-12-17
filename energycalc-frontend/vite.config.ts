import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'
import mkcert from 'vite-plugin-mkcert'
import { BACKEND_URL, BACKEND_IP } from './src/network_config'

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
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
        cookiePathRewrite: '/',
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookieHeaders = proxyRes.headers['set-cookie']
            if (setCookieHeaders) {
              const modified = setCookieHeaders.map((cookie: string) => {
                let result = cookie.replace(/;\s*[Dd]omain=[^;]*/gi, '')
                const isDeletion = result.includes('Max-Age=0') || result.includes('expires=Thu, 01 Jan 1970')
                if (!isDeletion) {
                  result = result.replace(/;\s*[Pp]ath=[^;]*/gi, '')
                  result = result.replace(/;\s*[Ss]ame[Ss]ite=[^;]*/gi, '')
                  result += '; Path=/; SameSite=Lax'
                }
                return result
              })
              proxyRes.headers['set-cookie'] = modified
            }
          })
        },
      },
      '/img-proxy': {
        target: `http://${BACKEND_IP}:9000`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/img-proxy/, ''),
      },
    },
  },
})
