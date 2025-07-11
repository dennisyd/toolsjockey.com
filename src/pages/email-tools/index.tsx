import React from 'react';
import ToolCard from '../../components/shared/ToolCard';
import { EnvelopeIcon, PencilSquareIcon, DevicePhoneMobileIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const emailTools = [
  {
    id: 'email-validator',
    title: 'Email Validator',
    description: 'Validate single emails or bulk validate via CSV upload. Check format, disposable domains, and export results.',
    icon: EnvelopeIcon,
    path: '/tools/email-validator',
  },
  {
    id: 'email-signature-generator',
    title: 'Email Signature Generator',
    description: 'Create professional email signatures with multiple templates. Live preview and export options.',
    icon: PencilSquareIcon,
    path: '/tools/email-signature-generator',
  },
  {
    id: 'email-template-tester',
    title: 'Email Template Tester',
    description: 'Test HTML emails across different devices and email clients. Check deliverability and responsive design.',
    icon: DevicePhoneMobileIcon,
    path: '/tools/email-template-tester',
  },
  {
    id: 'markdown-to-email',
    title: 'Markdown to Email Converter',
    description: 'Convert Markdown to email-optimized HTML with live preview and export options.',
    icon: DocumentTextIcon,
    path: '/tools/markdown-to-email',
  }
];

const EmailToolsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Email Tools</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional email utilities for validation, signature creation, template testing, and markdown conversion.
          All tools work entirely in your browser with no data sent to servers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {emailTools.map((tool) => (
          <ToolCard
            key={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            path={tool.path}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Email Tools?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Professional Validation</h3>
            <p className="text-blue-700">Validate email addresses for format, disposable domains, and bulk processing.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Signature Creation</h3>
            <p className="text-green-700">Create professional email signatures with multiple templates and live preview.</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Template Testing</h3>
            <p className="text-purple-700">Test HTML emails across different devices and email clients for compatibility.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailToolsPage; 