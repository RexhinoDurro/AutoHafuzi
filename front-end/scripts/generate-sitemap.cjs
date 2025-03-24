// scripts/fixed-sitemap.cjs
const fs = require('fs');
const path = require('path');

// Define your website base URL
const SITE_URL = 'https://autohafuzi-fe.onrender.com';

// Static routes with priorities and change frequencies
const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/cars', priority: '0.9', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/favorites', priority: '0.7', changefreq: 'weekly' }
];

// Category pages
const categoryPages = [
  { url: '/cars?make=1', priority: '0.8', changefreq: 'weekly' },
  { url: '/cars?fuel_type=Diesel', priority: '0.8', changefreq: 'weekly' },
  { url: '/cars?fuel_type=Petrol', priority: '0.8', changefreq: 'weekly' },
  { url: '/cars?make=2', priority: '0.8', changefreq: 'weekly' }
];

// Popular searches
const popularSearches = [
  { url: '/cars?make=6&model=12', priority: '0.7', changefreq: 'weekly' },
  { url: '/cars?make=1&body_type=SUV', priority: '0.7', changefreq: 'weekly' },
  { url: '/cars?max_price=20000', priority: '0.7', changefreq: 'weekly' },
  { url: '/cars?min_year=2020', priority: '0.7', changefreq: 'weekly' }
];

// Generate sitemap XML
function generateSitemap() {
  // Start with XML declaration
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Function to add a URL entry
  const addUrl = (url, changefreq, priority) => {
    sitemap += '  <url>\n';
    // Make sure to encode ampersands and other special characters
    const encodedUrl = url.replace(/&/g, '&amp;');
    sitemap += `    <loc>${SITE_URL}${encodedUrl}</loc>\n`;
    sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;
    sitemap += '  </url>\n';
  };
  
  // Add all routes
  staticRoutes.forEach(route => {
    addUrl(route.url, route.changefreq, route.priority);
  });
  
  categoryPages.forEach(page => {
    addUrl(page.url, page.changefreq, page.priority);
  });
  
  popularSearches.forEach(search => {
    addUrl(search.url, search.changefreq, search.priority);
  });
  
  // Close the sitemap
  sitemap += '</urlset>';
  
  // Write to files
  writeFiles(sitemap);
}

// Write files to both public and dist directories
function writeFiles(sitemap) {
  // Write sitemap to public directory
  try {
    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('✅ Sitemap generated in public/sitemap.xml');
  } catch (error) {
    console.error('❌ Error writing to public/sitemap.xml:', error);
  }
  
  // Write to dist directory if it exists
  const distDir = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distDir)) {
    try {
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);
      console.log('✅ Sitemap generated in dist/sitemap.xml');
    } catch (error) {
      console.error('❌ Error writing to dist/sitemap.xml:', error);
    }
  } else {
    console.log('ℹ️ Dist directory not found. This is normal if running before build.');
  }
  
  // Generate robots.txt
  generateRobotsTxt();
}

// Generate robots.txt
function generateRobotsTxt() {
  const robotsTxt = `# robots.txt for autohafuzi.com
User-agent: *
Allow: /

# Private areas
Disallow: /auth/
Disallow: /admin/

# Allow search engines to access the sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay to avoid overloading the server
Crawl-delay: 1
`;

  // Write to public directory
  try {
    fs.writeFileSync('public/robots.txt', robotsTxt);
    console.log('✅ robots.txt updated in public/robots.txt');
  } catch (error) {
    console.error('❌ Error writing to public/robots.txt:', error);
  }
  
  // Write to dist directory if it exists
  const distDir = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distDir)) {
    try {
      fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt);
      console.log('✅ robots.txt updated in dist/robots.txt');
    } catch (error) {
      console.error('❌ Error writing to dist/robots.txt:', error);
    }
  }
}

// Run the script
generateSitemap();