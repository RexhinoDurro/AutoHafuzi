import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { Plugin } from 'vite'

// Custom plugin to ensure sitemap and robots.txt files have correct MIME types
const seoFilesPlugin = (): Plugin => {
  return {
    name: 'seo-files-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('sitemap.xml')) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        } else if (req.url?.endsWith('sitemap.xml.gz')) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Content-Encoding', 'gzip');
        } else if (req.url?.endsWith('robots.txt')) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }
        next();
      });
    },
    
    // Ensure proper build-time handling
    generateBundle(_, bundle) {
      // Find sitemap.xml and robots.txt in the bundle
      Object.keys(bundle).forEach(fileName => {
        if (fileName === 'sitemap.xml') {
          // Set correct Content-Type for sitemap.xml
          if (bundle[fileName] && 'name' in bundle[fileName]) {
            bundle[fileName].type = 'asset';
          }
        } else if (fileName === 'robots.txt') {
          // Set correct Content-Type for robots.txt
          if (bundle[fileName] && 'name' in bundle[fileName]) {
            bundle[fileName].type = 'asset';
          }
        }
      });
    }
  };
};

export default defineConfig({
  plugins: [
    tailwindcss(),
    seoFilesPlugin(),
  ],
  build: {
    // Ensure the sitemap and robots files are properly copied to dist
    assetsInlineLimit: 0, // Prevent inlining of the files
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Ensure no hash added to robots.txt and sitemap.xml
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'robots.txt' || assetInfo.name === 'sitemap.xml' || assetInfo.name === 'sitemap.xml.gz') {
            return '[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  }
})