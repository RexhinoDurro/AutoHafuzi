// scripts/generate-sitemap.js
const fs = require('fs');
const axios = require('axios');
const { API_BASE_URL, API_ENDPOINTS } = require('../src/config/api');

// Define your website base URL
const SITE_URL = 'https://autohafuzi.com';

// Define static routes
const staticRoutes = [
  {
    url: '/',
    priority: '1.0',
    changefreq: 'daily'
  },
  {
    url: '/cars',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    url: '/about',
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    url: '/contact',
    priority: '0.8',
    changefreq: 'monthly'
  },
  {
    url: '/favorites',
    priority: '0.7',
    changefreq: 'weekly'
  }
];

// Generate sitemap XML
async function generateSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static routes
  staticRoutes.forEach(route => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}${route.url}</loc>\n`;
    sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${route.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  try {
    // Fetch all cars to add dynamic car detail pages
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CARS.LIST}`);
    const cars = response.data.results || [];
    
    // Add car detail pages
    cars.forEach(car => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${SITE_URL}/car/${car.slug || car.id}</loc>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      
      // Add lastmod if we have created_at date
      if (car.created_at) {
        const date = new Date(car.created_at).toISOString().split('T')[0];
        sitemap += `    <lastmod>${date}</lastmod>\n`;
      }
      
      sitemap += '  </url>\n';
    });
  } catch (error) {
    console.error('Error fetching cars for sitemap:', error);
  }
  
  sitemap += '</urlset>';
  
  // Write sitemap to file
  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully!');
}

// Run the script
generateSitemap();