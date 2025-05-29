import type { ReactNode } from 'react';

export interface TutorialStep {
  title: string;
  description: string;
  image?: string;
}

export interface Tutorial {
  id: string; // matches tool id
  title: string;
  steps: TutorialStep[];
  tags?: string[];
  note?: ReactNode;
}

export const tutorialsConfig: Tutorial[] = [
  {
    id: 'image-sharpener',
    title: 'How to Sharpen or Upscale an Image',
    steps: [
      {
        title: 'Open the Tool',
        description: 'Go to the Image Sharpener & Upscaler tool on ToolsJockey.com.',
        image: '/tutorials/image-sharpener/step1.png',
      },
      {
        title: 'Upload Your Image',
        description: 'Click "Upload Image" or drag and drop your photo (JPG, PNG, or WebP).',
        image: '/tutorials/image-sharpener/step2.png',
      },
      {
        title: 'Sharpen or Upscale',
        description: 'Choose "Sharpen" to enhance clarity or "Upscale" to enlarge. Adjust the sliders, then click the action button. Download your result when ready.',
        image: '/tutorials/image-sharpener/step3.png',
      },
    ],
    tags: ['image', 'AI', 'upscale'],
  },
  {
    id: 'csv-merger',
    title: 'How to Merge Multiple CSV Files',
    steps: [
      {
        title: 'Open the CSV Merger',
        description: 'Go to the CSV Merger tool on ToolsJockey.com.',
        image: '/tutorials/csv-merger/step1.png',
      },
      {
        title: 'Upload Your Files',
        description: 'Click "Upload CSV Files" and select the files you want to merge.',
        image: '/tutorials/csv-merger/step2.png',
      },
      {
        title: 'Merge and Download',
        description: 'Choose to merge by rows or columns, then click "Merge". Download the combined CSV file.',
        image: '/tutorials/csv-merger/step3.png',
      },
    ],
    tags: ['csv', 'data'],
  },
  {
    id: 'batch-pdf-form-filler',
    title: 'How to Fill PDF Forms in Bulk',
    steps: [
      {
        title: 'Upload Your Fillable PDF',
        description: 'Start by uploading your fillable PDF form to the Batch PDF Form Filler tool.',
        image: '/tutorials/batch-pdf-form-filler/step1.png',
      },
      {
        title: 'Export a CSV or Excel Template',
        description: 'Export a template file with all the PDF field names as columns. This ensures your data matches the form fields.',
        image: '/tutorials/batch-pdf-form-filler/step2.png',
      },
      {
        title: 'Add Data Rows',
        description: 'In the exported file, add a row of data for each PDF you want to generate. Each row will create a separate filled PDF.',
        image: '/tutorials/batch-pdf-form-filler/step3.png',
      },
      {
        title: 'Reload Your PDF (if needed)',
        description: 'If you left the app or want to start over, re-upload your fillable PDF to restore the field mapping.',
        image: '/tutorials/batch-pdf-form-filler/step4.png',
      },
      {
        title: 'Import Your Data File',
        description: 'Upload your completed Excel or CSV file with all your data rows.',
        image: '/tutorials/batch-pdf-form-filler/step5.png',
      },
      {
        title: 'Generate and Download',
        description: 'Click to generate filled PDFs. Download the resulting ZIP file containing all your filled forms.',
        image: '/tutorials/batch-pdf-form-filler/step6.png',
      },
      {
        title: 'Open the ZIP File',
        description: 'Open the ZIP file on your computer to access your filled PDFs.',
        image: '/tutorials/batch-pdf-form-filler/step7.png',
      },
    ],
    tags: ['pdf', 'forms', 'automation'],
    note: (
      <div className="mt-4 text-sm text-accent"><b>Tip:</b> If you edit the CSV in Excel, please open the file in a text editor after saving and remove any quotes from the header row before importing. This helps avoid import errors.</div>
    ),
  },
  // ...add more tutorials for other tools as needed
]; 