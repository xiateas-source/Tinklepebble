import { defineConfig } from 'vite'

export default defineConfig({
  // If GitHub Pages serves at a subdirectory (e.g. /tinklepebble/),
  // change base to '/tinklepebble/'. For a custom domain or user page, keep '/'.
  base: '/',

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
