// Updated create-gzipped-sitemap.js
const fs = require('fs');
const zlib = require('zlib');

// Set the primary domain consistently for all SEO-related files
const PRIMARY_DOMAIN = 'https://autohafuzi-fe.onrender.com';

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

// Save uncompressed version
fs.writeFileSync('public/sitemap.xml', sitemap);
console.log('Created sitemap.xml');

// Create gzipped version
const compressed = zlib.gzipSync(sitemap);
fs.writeFileSync('public/sitemap.xml.gz', compressed);
console.log('Created sitemap.xml.gz');

