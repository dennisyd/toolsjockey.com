import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';

// Minimal markdown parser (for demo, use a real one for production)
function simpleMarkdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*?)\*/gim, '<i>$1</i>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" style="max-width:100%;">')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '<br/><br/>');
  // Lists
  html = html.replace(/^\s*[-*] (.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  // Tables (very basic)
  html = html.replace(/\|(.+)\|/g, '<tr><td>$1</td></tr>');
  return html;
}

const emailSafeStyles = `
  body { font-family: Arial, sans-serif; background: #fff; color: #222; }
  h1, h2, h3 { color: #2563eb; }
  a { color: #2563eb; text-decoration: underline; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ddd; padding: 8px; }
  ul { padding-left: 20px; }
`;

const MarkdownToEmailPage: React.FC = () => {
  const { trackButtonClick, trackToolUsage } = useAnalytics();
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');

  const handleMarkdownChange = (md: string) => {
    setMarkdown(md);
    setHtml(simpleMarkdownToHtml(md));
    
    // Track markdown content changes
    trackToolUsage('markdown_to_email', 'markdown_changed', {
      content_length: md.length,
      has_headers: md.includes('#'),
      has_links: md.includes('[') && md.includes(']('),
      has_images: md.includes('!['),
      has_bold: md.includes('**'),
      has_italic: md.includes('*')
    });
  };

  const getEmailHtml = () => {
    return `<!DOCTYPE html><html><head><style>${emailSafeStyles}</style></head><body>${html}</body></html>`;
  };

  const copyToClipboard = async () => {
    trackButtonClick('markdown_to_email_copy', 'MarkdownToEmail');
    trackToolUsage('markdown_to_email', 'copy_html', {
      html_length: getEmailHtml().length
    });
    
    try {
      await navigator.clipboard.writeText(getEmailHtml());
      alert('Copied HTML to clipboard!');
    } catch (err) {
      alert('Failed to copy');
    }
  };

  const downloadHtml = () => {
    trackButtonClick('markdown_to_email_download', 'MarkdownToEmail');
    trackToolUsage('markdown_to_email', 'download_html', {
      html_length: getEmailHtml().length
    });
    
    const blob = new Blob([getEmailHtml()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Markdown to Email Converter</h1>
          <p className="text-xl text-gray-600">
            Convert Markdown to email-optimized HTML with live preview and export options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Markdown Input */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Markdown Input</h2>
            <textarea
              value={markdown}
              onChange={e => handleMarkdownChange(e.target.value)}
              placeholder="Write your email in Markdown..."
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* HTML Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Live Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >Copy HTML</button>
                <button
                  onClick={downloadHtml}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >Download .html</button>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Supported Markdown Features</h3>
          <ul className="list-disc list-inside text-blue-700">
            <li>Headers (#, ##, ###)</li>
            <li>Bold (**bold**), Italic (*italic*)</li>
            <li>Links, Images</li>
            <li>Lists</li>
            <li>Tables (basic)</li>
            <li>Line breaks</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarkdownToEmailPage; 