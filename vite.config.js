import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Tinklepebble/',

  build: {
    // Output to docs/ so GitHub Pages can serve it from branch root /docs
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Content-hashed filenames bust browser cache on every deploy
        entryFileNames: 'assets/app.[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      }
    }
  },

  // Dev server
  server: {
    port: 3000,
    open: true,
  }
})
