import React from 'react';
import { useEffect } from 'react';
import BatchPDFFormFiller from '../../components/tools/BatchPDFFormFiller';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const BatchPDFFormFillerPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Batch PDF Form Filler - ToolsJockey.com';
  }, []);

  useAnalytics(); // Automatically tracks page views and navigation

  return (
    <ToolPageLayout
      toolId="batch-pdf-form-filler"
      title="Batch PDF Form Filler"
      icon={DocumentDuplicateIcon}
      group="pdf"
      relatedTools={['pdf-suite-dashboard']}
    >
      <BatchPDFFormFiller />
    </ToolPageLayout>
  );
};

export default BatchPDFFormFillerPage; 