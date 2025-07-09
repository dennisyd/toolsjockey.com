import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth/mammoth.browser';
import AdSlot from '../ads/AdSlot';

const WordToMarkdownConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { '.docx': ['.docx'] },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      setError('');
      setMarkdown('');
      setFile(null);
      const docx = acceptedFiles[0];
      if (!docx || !docx.name.endsWith('.docx')) {
        setError('Only .docx files are supported.');
        return;
      }
      setFile(docx);
      setIsProcessing(true);
      try {
        const arrayBuffer = await docx.arrayBuffer();
        // @ts-ignore: mammoth types do not include convertToMarkdown or images.inline
        const { value } = await (mammoth as any).convertToMarkdown({ arrayBuffer }, {
          // @ts-ignore: mammoth types do not include images.inline
          convertImage: (mammoth as any).images.inline(async (element: any) => {
            // Convert images to base64 data URLs
            return element.read('base64').then((imageBuffer: string) => {
              return {
                src: `data:${element.contentType};base64,${imageBuffer}`
              };
            });
          })
        });
        setMarkdown(value);
      } catch (e: any) {
        setError('Failed to convert file. ' + (e.message || ''));
      }
      setIsProcessing(false);
    },
  });

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (file?.name.replace(/\.docx$/, '') || 'document') + '.md';
    link.click();
  };

  return (
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Header Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="header" className="mb-4" />
      </div>
      {/* Sidebar Ad */}
      <div className="hidden md:block md:col-span-3">
        <AdSlot slot="sidebar" className="sticky top-6" />
      </div>
      {/* Main Content */}
      <div className="md:col-span-6">
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold mb-4">Word to Markdown Converter</h1>
          <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
            <b>Instructions:</b><br />
            - Only <b>.docx</b> files are supported (not .doc).<br />
            - Images and tables are converted to Markdown where possible.<br />
            - All processing is done in your browser. Your files never leave your device.<br />
          </div>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4">
            <input {...getInputProps()} />
            <span className="text-gray-500">Drag & drop a .docx file here, or click to select</span>
          </div>
          {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
          {isProcessing && <div className="text-accent text-sm mb-2">Converting...</div>}
          {markdown && (
            <>
              <div className="mb-2 flex justify-between items-center">
                <span className="font-medium">Markdown Preview</span>
                <button className="btn btn-primary btn-sm" onClick={handleDownload}>Download .md</button>
              </div>
              <pre className="bg-gray-100 dark:bg-primary rounded p-3 text-xs overflow-auto max-h-96 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 mb-2">
                {markdown}
              </pre>
            </>
          )}
        </div>
        {/* Between tools ad */}
        <AdSlot slot="native" className="my-6" />
      </div>
      {/* Sidebar Ad (mobile) */}
      <div className="md:hidden col-span-12">
        <AdSlot slot="mobile" />
      </div>
      {/* Footer Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="footer" className="mt-4" />
      </div>
    </div>
  );
};

export default WordToMarkdownConverter; 