import React from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import QRCodeGeneratorV2 from '../../components/tools/QRCodeGeneratorV2';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BoltIcon } from '@heroicons/react/24/outline';

const QRCodeGeneratorPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <ToolPageLayout
      toolId="qr-code-generator"
      title="QR Code Generator - Create Custom QR Codes Instantly"
      icon={BoltIcon}
      group="quick"
    >
      <QRCodeGeneratorV2 />
    </ToolPageLayout>
  );
};

export default QRCodeGeneratorPage; 