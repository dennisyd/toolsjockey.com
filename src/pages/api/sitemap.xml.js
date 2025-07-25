// Format the date for sitemap (YYYY-MM-DD)
const formatDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

// Since we can't directly import TypeScript files in this context, we'll define tool paths manually
// These should match the paths in your toolsConfig.ts file
const toolPaths = [
  '/tools/batch-pdf-form-filler',
  '/pdf-tools',
  '/tools/word-to-markdown',
  '/tools/markdown-table-generator',
  '/tools/mail-merge-tool',
  '/tools/video-converter',
  '/tools/video-clipper',
  '/tools/video-compressor',
  '/tools/video-to-gif',
  '/tools/frame-extractor',
  '/tools/video-merger',
  '/tools/audio-extractor',
  '/tools/excel-merger-splitter',
  '/tools/csv-merger',
  '/tools/csv-to-json',
  '/tools/column-filter',
  '/tools/remove-duplicates',
  '/tools/excel-to-formats',
  '/tools/image-compressor',
  '/tools/image-sharpener',
  '/tools/image-format-converter',
  '/tools/watermark-adder',
  '/tools/exif-remover',
  '/tools/color-palette-generator',
  '/tools/color-picker',
  '/tools/contrast-checker',
  '/tools/gradient-generator',
  '/tools/color-format-converter',
  '/tools/json-formatter',
  '/tools/hash-generator',
  '/tools/css-minifier',
  '/tools/base64-encoder',
  '/tools/text-diff',
  '/tools/regex-tester',
  '/tools/qr-code-generator',
  '/tools/password-generator',
  '/tools/text-case-converter',
  '/tools/word-counter',
  '/tools/unit-converter',
  '/tools/currency-converter'
];

// Blog post IDs (manually extracted from blogPosts.tsx)
const blogPostIds = [
  'main',
  'video-converter',
  'audio-extractor',
  'pdf-tips',
  'csv-excel',
  'dev-utilities',
  'batch-pdf-form-filler',
  'excel-to-everything',
  'mail-merge-tool'
];

export default function handler(req, res) {
  // Set the appropriate content type
  res.setHeader('Content-Type', 'text/xml');
  
  // Generate the XML
  const xml = generateSitemapXml();
  
  // Send the XML response
  res.status(200).send(xml);
}

function generateSitemapXml() {
  const baseUrl = 'https://toolsjockey.com';
  const today = formatDate();
  
  // Start the XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add the homepage
  xml += `  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>\n`;
  
  // Add static key pages
  const staticPages = [
    '/pdf-tools',
    '/word-docs',
    '/video-tools',
    '/about',
    '/contact',
    '/blog'
  ];
  
  staticPages.forEach(page => {
    xml += `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  });
  
  // Add tool pages
  toolPaths.forEach(toolPath => {
    xml += `  <url>
    <loc>${baseUrl}${toolPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  });
  
  // Add blog posts
  blogPostIds.forEach(postId => {
    xml += `  <url>
    <loc>${baseUrl}/blog/${postId}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
  });
  
  // Close the XML
  xml += '</urlset>';
  
  return xml;
} 