import { useEffect } from 'react';
import PDFRedactionTool from '../../components/tools/PDFRedactionTool';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const PDFRedactionToolPage = () => {
  useEffect(() => {
    document.title = 'PDF Text Redaction Tool - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="pdf-redaction-tool"
      title="PDF Text Redaction Tool"
      icon={DocumentDuplicateIcon}
      group="pdf"
      relatedTools={['batch-pdf-form-filler', 'pdf-suite-dashboard']}
    >
      <PDFRedactionTool />
    </ToolPageLayout>
  );
};

export default PDFRedactionToolPage; 