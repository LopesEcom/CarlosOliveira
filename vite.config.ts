import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { pluginSeo } from './scripts/seo.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pluginSeo()],
  server: {
    // O Vite ignora PORT e vai somando a partir da 5173 quando a porta está
    // ocupada. Respeitar a variável deixa quem sobe o servidor escolher a
    // porta, o que importa quando há outro projeto rodando na mesma máquina.
    // Só afeta desenvolvimento: o build é estático e não usa isto.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
