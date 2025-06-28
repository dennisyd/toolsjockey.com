// Use Node.js fs and path modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Format the date for sitemap (YYYY-MM-DD)
const formatDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

// Define site structure with proper organization and metadata
const siteStructure = {
  // Core Pages
  corePaths: [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/about/', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact/', priority: '0.7', changefreq: 'monthly' },
    { path: '/blog/', priority: '0.8', changefreq: 'weekly' },
    { path: '/faq/', priority: '0.7', changefreq: 'monthly' }
  ],
  
  // Tool Categories
  toolCategories: [
    { path: '/tools/pdf-suite/', priority: '0.8', changefreq: 'weekly' },
    { path: '/pdf-tools/', priority: '0.8', changefreq: 'weekly' },
    { path: '/video-tools/', priority: '0.8', changefreq: 'weekly' },
    { path: '/excel-csv-tools/', priority: '0.8', changefreq: 'weekly' },
    { path: '/image-tools/', priority: '0.8', changefreq: 'weekly' },
    { path: '/document-tools/', priority: '0.8', changefreq: 'weekly' },
    { path: '/developer-tools/', priority: '0.8', changefreq: 'weekly' },
    { path: '/color-design-tools/', priority: '0.8', changefreq: 'weekly' },
    { path: '/utility-tools/', priority: '0.8', changefreq: 'weekly' }
  ],
  
  // PDF Tools
  pdfTools: [
    { path: '/tools/merge-pdf/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/split-pdf/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/compress-pdf/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/rotate-pdf/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/extract-text-from-pdf/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/pdf-to-word/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/pdf-to-images/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/images-to-pdf/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/edit-pdf-metadata/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/watermark-pdf/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/delete-pdf-pages/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/reorder-pdf-pages/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/batch-pdf-form-filler/', priority: '0.7', changefreq: 'weekly' }
  ],
  
  // Excel/CSV Tools
  excelTools: [
    { path: '/tools/excel-merger-splitter/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/csv-merger/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/csv-to-json/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/duplicate-remover/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/column-filter/', priority: '0.7', changefreq: 'weekly' }
  ],
  
  // Video Tools
  videoTools: [
    { path: '/tools/video-converter/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/video-compressor/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/video-merger/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/video-clipper/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/video-to-gif/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/audio-extractor/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/frame-extractor/', priority: '0.7', changefreq: 'weekly' }
  ],
  
  // Image Tools
  imageTools: [
    { path: '/tools/image-compressor/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/image-format-converter/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/image-sharpener/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/text-from-image/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/exif-remover/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/watermark-adder/', priority: '0.7', changefreq: 'weekly' }
  ],
  
  // Document Tools
  documentTools: [
    { path: '/tools/word-to-markdown/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/mail-merge-tool/', priority: '0.7', changefreq: 'weekly' }
  ],
  
  // Developer Tools
  devTools: [
    { path: '/tools/json-formatter/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/hash-generator/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/regex-tester/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/text-diff-viewer/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/css-minifier/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/base64-encoder/', priority: '0.7', changefreq: 'weekly' }
  ],
  
  // Color & Design Tools
  designTools: [
    { path: '/tools/color-palette-generator/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/color-picker/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/color-format-converter/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/gradient-generator/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/contrast-checker/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/qr-code-generator/', priority: '0.7', changefreq: 'weekly' }
  ],
  
  // Utility Tools
  utilityTools: [
    { path: '/tools/word-counter/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/password-generator/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/text-case-converter/', priority: '0.7', changefreq: 'weekly' },
    { path: '/tools/markdown-table-generator/', priority: '0.7', changefreq: 'weekly' }
  ],
  
  // Blog Posts
  blogPosts: [
    { id: 'main', priority: '0.6', changefreq: 'monthly' },
    { id: 'video-converter', priority: '0.6', changefreq: 'monthly' },
    { id: 'audio-extractor', priority: '0.6', changefreq: 'monthly' },
    { id: 'pdf-tips', priority: '0.6', changefreq: 'monthly' },
    { id: 'csv-excel', priority: '0.6', changefreq: 'monthly' },
    { id: 'dev-utilities', priority: '0.6', changefreq: 'monthly' },
    { id: 'batch-pdf-form-filler', priority: '0.6', changefreq: 'monthly' },
    { id: 'excel-to-everything', priority: '0.6', changefreq: 'monthly' },
    { id: 'mail-merge-tool', priority: '0.6', changefreq: 'monthly' }
  ]
};

// Generate the sitemap XML content
function generateSitemapXml() {
  const baseUrl = 'https://toolsjockey.com';
  const today = formatDate();
  
  // Start the XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add core pages
  xml += '  <!-- Core Pages -->\n';
  siteStructure.corePaths.forEach(page => {
    xml += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  });
  
  // Add Tool Categories
  xml += '\n  <!-- Tool Categories -->\n';
  siteStructure.toolCategories.forEach(category => {
    xml += `  <url>
    <loc>${baseUrl}${category.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${category.changefreq}</changefreq>
    <priority>${category.priority}</priority>
  </url>\n`;
  });
  
  // Add PDF Tools
  xml += '\n  <!-- PDF Tools -->\n';
  siteStructure.pdfTools.forEach(tool => {
    xml += `  <url>
    <loc>${baseUrl}${tool.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>\n`;
  });
  
  // Add Excel/CSV Tools
  xml += '\n  <!-- Excel/CSV Tools -->\n';
  siteStructure.excelTools.forEach(tool => {
    xml += `  <url>
    <loc>${baseUrl}${tool.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>\n`;
  });
  
  // Add Video Tools
  xml += '\n  <!-- Video Tools -->\n';
  siteStructure.videoTools.forEach(tool => {
    xml += `  <url>
    <loc>${baseUrl}${tool.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>\n`;
  });
  
  // Add Image Tools
  xml += '\n  <!-- Image Tools -->\n';
  siteStructure.imageTools.forEach(tool => {
    xml += `  <url>
    <loc>${baseUrl}${tool.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>\n`;
  });
  
  // Add Document Tools
  xml += '\n  <!-- Document Tools -->\n';
  siteStructure.documentTools.forEach(tool => {
    xml += `  <url>
    <loc>${baseUrl}${tool.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>\n`;
  });
  
  // Add Developer Tools
  xml += '\n  <!-- Developer Tools -->\n';
  siteStructure.devTools.forEach(tool => {
    xml += `  <url>
    <loc>${baseUrl}${tool.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>\n`;
  });
  
  // Add Color & Design Tools
  xml += '\n  <!-- Color & Design Tools -->\n';
  siteStructure.designTools.forEach(tool => {
    xml += `  <url>
    <loc>${baseUrl}${tool.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>\n`;
  });
  
  // Add Utility Tools
  xml += '\n  <!-- Utility Tools -->\n';
  siteStructure.utilityTools.forEach(tool => {
    xml += `  <url>
    <loc>${baseUrl}${tool.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${tool.changefreq}</changefreq>
    <priority>${tool.priority}</priority>
  </url>\n`;
  });
  
  // Add Blog Posts (grouped at the end as requested)
  xml += '\n  <!-- Blog Posts -->\n';
  siteStructure.blogPosts.forEach(post => {
    xml += `  <url>
    <loc>${baseUrl}/blog/${post.id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>
  </url>\n`;
  });
  
  // Close the XML
  xml += '</urlset>';
  
  return xml;
}

// Write the sitemap to a file
function writeSitemap() {
  const sitemap = generateSitemapXml();
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write the sitemap file
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
}

// Execute the sitemap generation
writeSitemap(); 