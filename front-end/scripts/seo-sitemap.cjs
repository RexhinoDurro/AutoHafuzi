// create-gzipped-sitemap.js
const fs = require('fs');
const zlib = require('zlib');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://autohafuzi-fe.onrender.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/favorites</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars?make=1</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars?fuel_type=Diesel</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars?fuel_type=Petrol</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars?make=2</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars?make=6&amp;model=12</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars?make=1&amp;body_type=SUV</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars?max_price=20000</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://autohafuzi-fe.onrender.com/cars?min_year=2020</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

// Save uncompressed version
fs.writeFileSync('public/sitemap.xml', sitemap);
console.log('Created sitemap.xml');

// Create gzipped version
const compressed = zlib.gzipSync(sitemap);
fs.writeFileSync('public/sitemap.xml.gz', compressed);
console.log('Created sitemap.xml.gz');

// Update robots.txt to reference both versions
const robotsTxt = `# robots.txt for autohafuzi.com
User-agent: *
Allow: /

# Private areas
Disallow: /auth/
Disallow: /admin/

# Allow search engines to access the sitemap
Sitemap: https://autohafuzi-fe.onrender.com/sitemap.xml
Sitemap: https://autohafuzi-fe.onrender.com/sitemap.xml.gz

# Crawl delay to avoid overloading the server
Crawl-delay: 1
`;

fs.writeFileSync('public/robots.txt', robotsTxt);
console.log('Updated robots.txt');