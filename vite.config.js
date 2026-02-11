import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    host: true, // Questo espone il server sulla rete (0.0.0.0)
    port: 5173,
    historyApiFallback: true, // <--- FONDAMENTALE: Dice al server "se non trovi il file, dai index.html"
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})