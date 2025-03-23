// scripts/generate-sitemap.cjs
const fs = require('fs');

// Define your website base URL and API endpoints directly in this script
// instead of importing from '../src/config/api'
const API_BASE_URL = 'https://autohafuzi.onrender.com';
const SITE_URL = 'https://autohafuzi.com';

const API_ENDPOINTS = {
  CARS: {
    LIST: `${API_BASE_URL}/api/cars/`,
  },
  MAKES: `${API_BASE_URL}/api/makes/`,
};

// Define static routes with priorities and change frequencies
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

// Define important category pages
const categoryPages = [
  {
    url: '/cars?make=1', // Assuming make=1 is a popular make like Mercedes
    priority: '0.8',
    changefreq: 'weekly'
  },
  {
    url: '/cars?fuel_type=Diesel',
    priority: '0.8', 
    changefreq: 'weekly'
  },
  {
    url: '/cars?fuel_type=Petrol',
    priority: '0.8',
    changefreq: 'weekly'
  },
  {
    url: '/cars?make=2', // Assuming make=2 is another popular make like BMW
    priority: '0.8',
    changefreq: 'weekly'
  }
];

// Define popular search combinations
const popularSearches = [
  {
    url: '/cars?make=6&model=12', // Example: specific make and model combination
    priority: '0.7',
    changefreq: 'weekly'
  },
  {
    url: '/cars?make=1&body_type=SUV', // Example: SUVs from a specific make
    priority: '0.7',
    changefreq: 'weekly'
  },
  {
    url: '/cars?max_price=20000', // Cars under €20,000
    priority: '0.7',
    changefreq: 'weekly'
  },
  {
    url: '/cars?min_year=2020', // Cars from 2020 and newer
    priority: '0.7',
    changefreq: 'weekly'
  }
];

// Generate sitemap XML
function generateSitemap() {
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
  
  // Add category pages
  categoryPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}${page.url}</loc>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  // Add popular search combinations
  popularSearches.forEach(search => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}${search.url}</loc>\n`;
    sitemap += `    <changefreq>${search.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${search.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  // Note: We're skipping the API calls since they might not be accessible during the build
  // Instead, we'll just generate a basic sitemap with static pages
  
  sitemap += '</urlset>';
  
  // Write sitemap to file
  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully!');
  
  // Also update robots.txt to reference the sitemap
  updateRobotsTxt();
}

// Update robots.txt to reference the sitemap
function updateRobotsTxt() {
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

  fs.writeFileSync('public/robots.txt', robotsTxt);
  console.log('robots.txt updated successfully!');
}

// Run the script
generateSitemap();