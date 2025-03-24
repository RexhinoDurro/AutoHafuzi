// front-end/scripts/create-sitemap.js
const fs = require('fs');
const zlib = require('zlib');

// Set the primary domain consistently for all SEO-related files
const PRIMARY_DOMAIN = 'https://autohafuzi-fe.onrender.com';

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
  return `# robots.txt for autohafuzi.com
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
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
};

// Generate and save the sitemap files
const createSitemaps = () => {
  try {
    ensurePublicDir();
    
    // Generate sitemap content
    const sitemap = generateSitemap();
    
    // Save uncompressed version
    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('Created sitemap.xml');
    
    // Create gzipped version
    const compressed = zlib.gzipSync(sitemap);
    fs.writeFileSync('public/sitemap.xml.gz', compressed);
    console.log('Created sitemap.xml.gz');
    
    // Create robots.txt
    const robotsTxt = generateRobotsTxt();
    fs.writeFileSync('public/robots.txt', robotsTxt);
    console.log('Created robots.txt');
    
    console.log('Sitemap generation completed successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
};

// Run the sitemap generator
createSitemaps();