import React, { useState, useRef } from 'react';

interface SignatureData {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
  logo?: string;
}

const EmailSignatureGeneratorPage: React.FC = () => {
  const [signatureData, setSignatureData] = useState<SignatureData>({
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState('corporate');
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = {
    corporate: {
      name: 'Corporate',
      description: 'Professional and clean design suitable for business use'
    },
    modern: {
      name: 'Modern',
      description: 'Contemporary design with bold typography'
    },
    minimal: {
      name: 'Minimal',
      description: 'Simple and clean with minimal styling'
    },
    creative: {
      name: 'Creative',
      description: 'Colorful and creative design for personal use'
    }
  };

  const handleInputChange = (field: keyof SignatureData, value: string) => {
    setSignatureData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignatureData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSignatureHTML = () => {
    const { name, title, company, phone, email, website, linkedin, twitter, instagram, facebook, logo } = signatureData;

    switch (selectedTemplate) {
      case 'corporate':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; border-left: 4px solid #2563eb; padding-left: 20px; margin: 20px 0;">
            ${logo ? `<img src="${logo}" alt="${name}" style="max-height: 60px; margin-bottom: 15px;">` : ''}
            <div style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">${name}</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">${title}</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">${company}</div>
            <div style="font-size: 12px; color: #374151; line-height: 1.6;">
              ${phone ? `<div>📞 ${phone}</div>` : ''}
              ${email ? `<div>📧 <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></div>` : ''}
              ${website ? `<div>🌐 <a href="${website}" style="color: #2563eb; text-decoration: none;">${website}</a></div>` : ''}
            </div>
            ${(linkedin || twitter || instagram || facebook) ? `
              <div style="margin-top: 15px;">
                ${linkedin ? `<a href="${linkedin}" style="margin-right: 10px; color: #0077b5; text-decoration: none;">LinkedIn</a>` : ''}
                ${twitter ? `<a href="${twitter}" style="margin-right: 10px; color: #1da1f2; text-decoration: none;">Twitter</a>` : ''}
                ${instagram ? `<a href="${instagram}" style="margin-right: 10px; color: #e4405f; text-decoration: none;">Instagram</a>` : ''}
                ${facebook ? `<a href="${facebook}" style="margin-right: 10px; color: #1877f2; text-decoration: none;">Facebook</a>` : ''}
              </div>
            ` : ''}
          </div>
        `;

      case 'modern':
        return `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; color: white;">
            ${logo ? `<img src="${logo}" alt="${name}" style="max-height: 70px; margin-bottom: 20px; border-radius: 5px;">` : ''}
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">${name}</div>
            <div style="font-size: 16px; opacity: 0.9; margin-bottom: 12px;">${title}</div>
            <div style="font-size: 16px; opacity: 0.9; margin-bottom: 20px;">${company}</div>
            <div style="font-size: 14px; line-height: 1.8;">
              ${phone ? `<div style="margin-bottom: 8px;">📞 ${phone}</div>` : ''}
              ${email ? `<div style="margin-bottom: 8px;">📧 <a href="mailto:${email}" style="color: white; text-decoration: underline;">${email}</a></div>` : ''}
              ${website ? `<div style="margin-bottom: 8px;">🌐 <a href="${website}" style="color: white; text-decoration: underline;">${website}</a></div>` : ''}
            </div>
            ${(linkedin || twitter || instagram || facebook) ? `
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
                ${linkedin ? `<a href="${linkedin}" style="margin-right: 15px; color: white; text-decoration: none; font-weight: 600;">LinkedIn</a>` : ''}
                ${twitter ? `<a href="${twitter}" style="margin-right: 15px; color: white; text-decoration: none; font-weight: 600;">Twitter</a>` : ''}
                ${instagram ? `<a href="${instagram}" style="margin-right: 15px; color: white; text-decoration: none; font-weight: 600;">Instagram</a>` : ''}
                ${facebook ? `<a href="${facebook}" style="margin-right: 15px; color: white; text-decoration: none; font-weight: 600;">Facebook</a>` : ''}
              </div>
            ` : ''}
          </div>
        `;

      case 'minimal':
        return `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; padding: 20px 0; border-top: 1px solid #e5e7eb;">
            ${logo ? `<img src="${logo}" alt="${name}" style="max-height: 50px; margin-bottom: 15px;">` : ''}
            <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 4px;">${name}</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${title}</div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">${company}</div>
            <div style="font-size: 13px; color: #374151; line-height: 1.5;">
              ${phone ? `<div style="margin-bottom: 4px;">${phone}</div>` : ''}
              ${email ? `<div style="margin-bottom: 4px;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></div>` : ''}
              ${website ? `<div style="margin-bottom: 4px;"><a href="${website}" style="color: #2563eb;">${website}</a></div>` : ''}
            </div>
            ${(linkedin || twitter || instagram || facebook) ? `
              <div style="margin-top: 12px; font-size: 12px;">
                ${linkedin ? `<a href="${linkedin}" style="margin-right: 12px; color: #6b7280;">LinkedIn</a>` : ''}
                ${twitter ? `<a href="${twitter}" style="margin-right: 12px; color: #6b7280;">Twitter</a>` : ''}
                ${instagram ? `<a href="${instagram}" style="margin-right: 12px; color: #6b7280;">Instagram</a>` : ''}
                ${facebook ? `<a href="${facebook}" style="margin-right: 12px; color: #6b7280;">Facebook</a>` : ''}
              </div>
            ` : ''}
          </div>
        `;

      case 'creative':
        return `
          <div style="font-family: 'Comic Sans MS', cursive, sans-serif; max-width: 600px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4); padding: 25px; border-radius: 15px; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            ${logo ? `<img src="${logo}" alt="${name}" style="max-height: 80px; margin-bottom: 20px; border-radius: 10px; border: 3px solid white;">` : ''}
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${name}</div>
            <div style="font-size: 18px; margin-bottom: 12px; opacity: 0.95;">${title}</div>
            <div style="font-size: 18px; margin-bottom: 20px; opacity: 0.95;">${company}</div>
            <div style="font-size: 16px; line-height: 1.8;">
              ${phone ? `<div style="margin-bottom: 10px;">📞 ${phone}</div>` : ''}
              ${email ? `<div style="margin-bottom: 10px;">📧 <a href="mailto:${email}" style="color: white; text-decoration: underline; font-weight: bold;">${email}</a></div>` : ''}
              ${website ? `<div style="margin-bottom: 10px;">🌐 <a href="${website}" style="color: white; text-decoration: underline; font-weight: bold;">${website}</a></div>` : ''}
            </div>
            ${(linkedin || twitter || instagram || facebook) ? `
              <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid rgba(255,255,255,0.4);">
                ${linkedin ? `<a href="${linkedin}" style="margin-right: 15px; color: white; text-decoration: none; font-weight: bold; font-size: 16px;">LinkedIn</a>` : ''}
                ${twitter ? `<a href="${twitter}" style="margin-right: 15px; color: white; text-decoration: none; font-weight: bold; font-size: 16px;">Twitter</a>` : ''}
                ${instagram ? `<a href="${instagram}" style="margin-right: 15px; color: white; text-decoration: none; font-weight: bold; font-size: 16px;">Instagram</a>` : ''}
                ${facebook ? `<a href="${facebook}" style="margin-right: 15px; color: white; text-decoration: none; font-weight: bold; font-size: 16px;">Facebook</a>` : ''}
              </div>
            ` : ''}
          </div>
        `;

      default:
        return '';
    }
  };

  const generateSignatureText = () => {
    const { name, title, company, phone, email, website, linkedin, twitter, instagram, facebook } = signatureData;
    
    let text = '';
    if (name) text += `${name}\n`;
    if (title) text += `${title}\n`;
    if (company) text += `${company}\n`;
    text += '\n';
    if (phone) text += `Phone: ${phone}\n`;
    if (email) text += `Email: ${email}\n`;
    if (website) text += `Website: ${website}\n`;
    
    if (linkedin || twitter || instagram || facebook) {
      text += '\nSocial Media:\n';
      if (linkedin) text += `LinkedIn: ${linkedin}\n`;
      if (twitter) text += `Twitter: ${twitter}\n`;
      if (instagram) text += `Instagram: ${instagram}\n`;
      if (facebook) text += `Facebook: ${facebook}\n`;
    }
    
    return text;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const downloadHTML = () => {
    const html = generateSignatureHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-signature.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Email Signature Generator</h1>
          <p className="text-xl text-gray-600">
            Create professional email signatures with multiple templates. Live preview and export options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Signature Details</h2>

            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedTemplate === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={signatureData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={signatureData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your job title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={signatureData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={signatureData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={signatureData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={signatureData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {/* Social Media Links */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Social Media Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={signatureData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input
                      type="url"
                      value={signatureData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Twitter profile URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input
                      type="url"
                      value={signatureData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Instagram profile URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input
                      type="url"
                      value={signatureData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Facebook profile URL"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo (Optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Upload your company logo (max 2MB)</p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('html')}
                  className={`px-3 py-1 rounded text-sm ${
                    previewMode === 'html'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setPreviewMode('text')}
                  className={`px-3 py-1 rounded text-sm ${
                    previewMode === 'text'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Text
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
              {previewMode === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
              ) : (
                <pre className="whitespace-pre-wrap text-sm">{generateSignatureText()}</pre>
              )}
            </div>

            {/* Export Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => copyToClipboard(previewMode === 'html' ? generateSignatureHTML() : generateSignatureText())}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Copy to Clipboard
              </button>
              {previewMode === 'html' && (
                <button
                  onClick={downloadHTML}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Download HTML
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSignatureGeneratorPage; 