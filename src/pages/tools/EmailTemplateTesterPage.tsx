import React, { useState, useEffect } from 'react';
import FileUploader from '../../components/shared/FileUploader';
import { useAnalytics } from '../../hooks/useAnalytics';

interface DeliverabilityIssue {
  type: 'warning' | 'error';
  message: string;
  line?: number;
}

const EmailTemplateTesterPage: React.FC = () => {
  const { trackButtonClick, trackToolUsage } = useAnalytics();
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [selectedClient, setSelectedClient] = useState('gmail');
  const [deliverabilityIssues, setDeliverabilityIssues] = useState<DeliverabilityIssue[]>([]);
  const [showInlineCSS, setShowInlineCSS] = useState(false);

  // Track page view on component mount
  useEffect(() => {
    trackToolUsage('email_template_tester', 'page_view', {
      page_title: 'Email Template Tester',
      page_path: '/tools/email-template-tester'
    });
  }, [trackToolUsage]);

  const devices = {
    desktop: { name: 'Desktop', width: '100%', height: '600px' },
    tablet: { name: 'Tablet', width: '768px', height: '500px' },
    mobile: { name: 'Mobile', width: '375px', height: '400px' }
  };

  const emailClients = {
    gmail: { name: 'Gmail', description: 'Most common email client' },
    outlook: { name: 'Outlook', description: 'Microsoft Outlook' },
    apple: { name: 'Apple Mail', description: 'iOS and macOS mail client' },
    thunderbird: { name: 'Thunderbird', description: 'Mozilla Thunderbird' }
  };

  // Spam trigger words
  const spamWords = [
    'free', 'limited time', 'act now', 'click here', 'buy now', 'cash', 'cheap',
    'discount', 'earn money', 'fast cash', 'guarantee', 'investment', 'loan',
    'make money', 'no cost', 'offer', 'opportunity', 'profit', 'save money',
    'special promotion', 'urgent', 'winner', 'winning', 'you won', 'congratulations'
  ];

  const checkDeliverability = (html: string) => {
    const issues: DeliverabilityIssue[] = [];

    // Check for missing alt tags
    const imgRegex = /<img[^>]*>/gi;
    const imgMatches = html.match(imgRegex);
    if (imgMatches) {
      imgMatches.forEach(img => {
        if (!img.includes('alt=')) {
          issues.push({
            type: 'warning',
            message: `Image missing alt attribute (accessibility issue)`,
            line: html.substring(0, html.indexOf(img)).split('\n').length
          });
        }
      });
    }

    // Check for spam trigger words
    const lowerHtml = html.toLowerCase();
    spamWords.forEach(word => {
      if (lowerHtml.includes(word.toLowerCase())) {
        issues.push({
          type: 'warning',
          message: `Potential spam trigger word: "${word}"`
        });
      }
    });

    // Check for excessive use of caps
    const capsCount = (html.match(/[A-Z]/g) || []).length;
    const totalChars = html.replace(/\s/g, '').length;
    if (totalChars > 0 && (capsCount / totalChars) > 0.3) {
      issues.push({
        type: 'warning',
        message: 'Excessive use of capital letters (may trigger spam filters)'
      });
    }

    // Check for missing DOCTYPE
    if (!html.includes('<!DOCTYPE html>')) {
      issues.push({
        type: 'warning',
        message: 'Missing DOCTYPE declaration'
      });
    }

    // Check for external CSS
    if (html.includes('<link') && html.includes('stylesheet')) {
      issues.push({
        type: 'error',
        message: 'External CSS links may not work in all email clients'
      });
    }

    // Check for JavaScript
    if (html.includes('<script')) {
      issues.push({
        type: 'error',
        message: 'JavaScript is not supported in email clients'
      });
    }

    setDeliverabilityIssues(issues);
  };

  const handleHtmlChange = (content: string) => {
    setHtmlContent(content);
    checkDeliverability(content);
    
    // Track HTML content changes
    trackToolUsage('email_template_tester', 'html_content_changed', {
      content_length: content.length,
      has_doctype: content.includes('<!DOCTYPE html>'),
      has_external_css: content.includes('<link') && content.includes('stylesheet'),
      has_javascript: content.includes('<script')
    });
  };

  const handleDeviceChange = (device: string) => {
    setSelectedDevice(device);
    trackButtonClick('email_template_tester_device_change', 'EmailTemplateTester');
    trackToolUsage('email_template_tester', 'device_changed', { device });
  };

  const handleClientChange = (client: string) => {
    setSelectedClient(client);
    trackButtonClick('email_template_tester_client_change', 'EmailTemplateTester');
    trackToolUsage('email_template_tester', 'client_changed', { client });
  };

  const inlineCSS = (html: string) => {
    // Simple CSS inlining - in a real implementation, you'd use a proper CSS inliner
    let inlined = html;
    
    // Remove external stylesheets
    inlined = inlined.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '');
    
    // Convert style tags to inline styles (basic implementation)
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const styleMatches = inlined.match(styleRegex);
    
    if (styleMatches) {
      styleMatches.forEach(styleTag => {
        const cssContent = styleTag.replace(/<style[^>]*>([\s\S]*?)<\/style>/i, '$1');
        // This is a simplified version - real CSS inlining is more complex
        inlined = inlined.replace(styleTag, `<!-- Inlined CSS: ${cssContent} -->`);
      });
    }
    
    return inlined;
  };

  const getClientSpecificStyles = () => {
    switch (selectedClient) {
      case 'outlook':
        return `
          <style>
            /* Outlook-specific styles */
            .outlook-table { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            .outlook-p { margin: 0; padding: 0; }
          </style>
        `;
      case 'gmail':
        return `
          <style>
            /* Gmail-specific styles */
            .gmail-fix { display: none; display: none !important; }
          </style>
        `;
      default:
        return '';
    }
  };

  const generatePreviewHTML = () => {
    const device = devices[selectedDevice as keyof typeof devices];
    const client = emailClients[selectedClient as keyof typeof emailClients];
    
    let content = htmlContent;
    if (showInlineCSS) {
      content = inlineCSS(content);
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template Preview - ${client.name}</title>
        ${getClientSpecificStyles()}
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5;
          }
          .preview-container {
            max-width: ${device.width};
            margin: 0 auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .preview-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
            color: #666;
          }
          .preview-content {
            padding: 20px;
            min-height: ${device.height};
            overflow-y: auto;
          }
          .device-indicator {
            display: inline-block;
            padding: 4px 8px;
            background: #007bff;
            color: white;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="preview-header">
            📧 ${client.name} Preview
            <span class="device-indicator">${device.name}</span>
          </div>
          <div class="preview-content">
            ${content}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Email Template Tester</h1>
          <p className="text-xl text-gray-600">
            Test HTML emails across different devices and email clients. Check deliverability and responsive design.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* HTML Input */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">HTML Email Template</h2>
              <div className="mb-4">
                <FileUploader
                  onFileUpload={(files: File[]) => {
                    if (files.length > 0) {
                      files[0].text().then(setHtmlContent);
                    }
                  }}
                  accept=".html,.htm"
                  maxSize={1024 * 1024} // 1MB
                  description="Upload HTML file"
                />
              </div>
              <textarea
                value={htmlContent}
                onChange={(e) => handleHtmlChange(e.target.value)}
                placeholder="Paste your HTML email template here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Preview Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device</label>
                  <select
                    value={selectedDevice}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(devices).map(([key, device]) => (
                      <option key={key} value={key}>{device.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(emailClients).map(([key, client]) => (
                      <option key={key} value={key}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="inlineCSS"
                  checked={showInlineCSS}
                  onChange={(e) => setShowInlineCSS(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="inlineCSS" className="text-sm text-gray-700">
                  Show inline CSS preview
                </label>
              </div>
            </div>

            {/* Deliverability Issues */}
            {deliverabilityIssues.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Deliverability Issues</h3>
                <div className="space-y-2">
                  {deliverabilityIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        issue.type === 'error'
                          ? 'bg-red-50 border-red-400'
                          : 'bg-yellow-50 border-yellow-400'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="mr-2">
                          {issue.type === 'error' ? '❌' : '⚠️'}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {issue.message}
                          </p>
                          {issue.line && (
                            <p className="text-xs text-gray-500 mt-1">
                              Line: {issue.line}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Preview</h2>
              <div className="text-sm text-gray-500">
                {emailClients[selectedClient as keyof typeof emailClients].name} • {devices[selectedDevice as keyof typeof devices].name}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <iframe
                srcDoc={generatePreviewHTML()}
                className="w-full h-96 border-0"
                title="Email Template Preview"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Use table-based layouts for better email client compatibility</li>
                <li>Avoid external CSS - use inline styles instead</li>
                <li>Test images with alt text for accessibility</li>
                <li>Keep file sizes under 100KB for better deliverability</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateTesterPage; 