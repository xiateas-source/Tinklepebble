import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Tinklepebble/',

  build: {
    // Output to docs/ so GitHub Pages can serve it from branch root /docs
    outDir: 'docs',
    emptyOutDir: true,
    // Keep asset names predictable (no hash on index.html)
    rollupOptions: {
      output: {
        // Single JS bundle
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      }
    }
  },

  // Dev server
  server: {
    port: 3000,
    open: true,
  }
})
