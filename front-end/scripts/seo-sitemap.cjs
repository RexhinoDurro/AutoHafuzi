// front-end/scripts/seo-sitemap.cjs
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Set the primary domain consistently for all SEO-related files
const PRIMARY_DOMAIN = 'https://auto-fe.onrender.com';

// Create the XML sitemap content
const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${PRIMARY_DOMAIN}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/favorites</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars?make=1</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars?fuel_type=Diesel</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars?fuel_type=Petrol</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars?make=2</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars?make=6&amp;model=12</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars?make=1&amp;body_type=SUV</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars?max_price=20000</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${PRIMARY_DOMAIN}/cars?min_year=2020</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  return sitemap;
};

// Create the robots.txt content with proper sitemap references
const generateRobotsTxt = () => {
  return `# robots.txt for auto.com
User-agent: *
Allow: /

# Private areas
Disallow: /auth/
Disallow: /admin/

# Allow search engines to access the sitemap
Sitemap: ${PRIMARY_DOMAIN}/sitemap.xml
Sitemap: ${PRIMARY_DOMAIN}/sitemap.xml.gz

# Crawl delay to avoid overloading the server
Crawl-delay: 1
`;
};

// Make sure the public directory exists
const ensurePublicDir = () => {
  // In a build environment, the dist directory is the output directory
  const publicDir = path.resolve(__dirname, '../dist');
  
  if (!fs.existsSync(publicDir)) {
    console.log(`Public directory ${publicDir} does not exist, using 'public' instead`);
    const fallbackDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return fallbackDir;
  }
  return publicDir;
};

// Generate and save the sitemap files
const createSitemaps = () => {
  try {
    const publicDir = ensurePublicDir();
    console.log(`Using directory: ${publicDir} for sitemap files`);
    
    // Generate sitemap content
    const sitemap = generateSitemap();
    
    // Save uncompressed version
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log(`Created sitemap.xml at ${sitemapPath}`);
    
    // Create gzipped version
    const compressed = zlib.gzipSync(sitemap);
    const gzipPath = path.join(publicDir, 'sitemap.xml.gz');
    fs.writeFileSync(gzipPath, compressed);
    console.log(`Created sitemap.xml.gz at ${gzipPath}`);
    
    // Create robots.txt
    const robotsTxt = generateRobotsTxt();
    const robotsPath = path.join(publicDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt);
    console.log(`Created robots.txt at ${robotsPath}`);
    
    console.log('Sitemap generation completed successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the sitemap generator
createSitemaps();