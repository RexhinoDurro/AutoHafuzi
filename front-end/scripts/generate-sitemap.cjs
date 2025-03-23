// scripts/generate-sitemap.js
const fs = require('fs');
const axios = require('axios');
const { API_BASE_URL, API_ENDPOINTS } = require('../src/config/api');

// Define your website base URL
const SITE_URL = 'https://autohafuzi.com';

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
  
  try {
    // Fetch all cars to add dynamic car detail pages
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CARS.LIST}?limit=1000`);
    const cars = response.data.results || [];
    
    // Add car detail pages
    cars.forEach(car => {
      sitemap += '  <url>\n';
      // Use slug if available, otherwise use ID
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
  
  // Add makes and models if you have these endpoints
  try {
    const makesResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.MAKES}`);
    const makes = makesResponse.data || [];
    
    // Add make pages
    makes.forEach(make => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${SITE_URL}/cars?make=${make.id}</loc>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
      
      // Optionally fetch and add model pages for each make
      // This depends on your API structure and can be expanded
    });
  } catch (error) {
    console.error('Error fetching makes for sitemap:', error);
  }
  
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