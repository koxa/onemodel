import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3002,
    cors: false,
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: './src/server.js',
      name: 'TestServer',
      fileName: 'test-server',
      formats: ['cjs'],
    },
    target: 'esnext',
  }
})
