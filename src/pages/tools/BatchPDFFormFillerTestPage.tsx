import React from 'react';
import { Helmet } from 'react-helmet';
import PageHeading from '../../components/PageHeading';
import BatchPDFFormFillerTest from '../../components/tools/BatchPDFFormFillerTest';

const BatchPDFFormFillerTestPage: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>Batch PDF Form Filler (TEST VERSION) | ToolsJockey</title>
        <meta name="description" content="Fill multiple PDF forms at once with data from a CSV or Excel file - TEST VERSION with enhanced debugging." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <PageHeading
          title="Batch PDF Form Filler (TEST VERSION)"
          subtitle="Fill multiple PDF forms at once with data from a CSV or Excel file"
        />
        <BatchPDFFormFillerTest />
      </div>
    </div>
  );
};

export default BatchPDFFormFillerTestPage; 