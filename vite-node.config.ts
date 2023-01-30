import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'process.browser': true
  },
  server: {
    port: 3000,
    cors: false,
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: './lib/indexNode.js',
      name: 'OneModel',
      fileName: 'onemodel',
      formats: ['cjs'],
    },
    target: 'esnext',
  }
})
