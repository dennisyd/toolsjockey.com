import { useEffect } from 'react';
import BatchPDFFormFiller from '../../components/tools/BatchPDFFormFiller';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const BatchPDFFormFillerPage = () => {
  useEffect(() => {
    document.title = 'Batch PDF Form Filler - ToolsJockey.com';
  }, []);

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