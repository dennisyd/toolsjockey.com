import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { useAnalytics } from '../hooks/useAnalytics';

// FAQ data: Add or edit questions/answers here
type FAQItemType = {
  question: string;
  answer: string | React.ReactNode;
  icon?: React.ReactNode;
};

const faqData: FAQItemType[] = [
  {
    question: 'What is ToolsJockey.com?',
    answer: 'ToolsJockey.com is a free, modular web app offering a suite of productivity, developer, and file tools (PDF, Excel/CSV, JSON, color, and more) — all 100% client-side, private, and easy to use.',
    icon: <QuestionMarkCircleIcon className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />,
  },
  {
    question: 'Are the tools free to use?',
    answer: 'Yes! All tools on ToolsJockey.com are completely free to use, with no registration or hidden fees.',
  },
  {
    question: 'Is my data safe? Do you store uploaded files?',
    answer: 'Your privacy is our priority. All processing happens locally in your browser. We do not store, view, or transmit your files or data.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No account is required. Just visit the site and use any tool instantly.',
  },
  {
    question: 'Can I use ToolsJockey on mobile devices?',
    answer: 'Yes! The site is fully responsive and works great on phones, tablets, and desktops.',
  },
  {
    question: 'How do I suggest a new tool or feature?',
    answer: 'We welcome feedback! Use the contact form (coming soon) or email us at support@toolsjockey.com.',
  },
  {
    question: 'Are there limits on file size or usage?',
    answer: 'Most tools have generous file size limits suitable for typical use. For very large files, performance may depend on your device.',
  },
  {
    question: 'Do the tools work offline?',
    answer: 'Some tools may work offline after your first visit, but full offline support is coming soon.',
  },
  {
    question: 'Who builds and maintains ToolsJockey.com?',
    answer: 'ToolsJockey.com is built and maintained by a small team of passionate developers focused on privacy-first, user-friendly web tools.',
  },
  {
    question: 'How do I report a bug or issue?',
    answer: 'Please email support@toolsjockey.com or use the feedback form (coming soon). We appreciate your help in making ToolsJockey better!',
  },
  {
    question: 'How do I fill multiple PDF forms at once?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Upload your fillable PDF form to the Batch PDF Form Filler tool.</li>
          <li>Export a CSV or Excel template (with all PDF field names as columns).</li>
          <li>Add a row of data for each PDF you want to generate.</li>
          <li>If you left the app or want to start over, re-upload your PDF to restore the field mapping.</li>
          <li>Import your completed Excel or CSV file.</li>
          <li>Click to generate filled PDFs and download the ZIP file.</li>
          <li>Open the ZIP file on your computer to access your filled PDFs.</li>
        </ol>
        <div className="mt-2 text-sm text-accent"><b>Tip:</b> All processing is local—your files never leave your device.</div>
      </>
    ),
  },
  {
    question: 'Where can I find all PDF tools in one place?',
    answer: (
      <>
        <div>Visit the <b>PDF Suite Dashboard</b> on ToolsJockey.com to access all PDF tools: Merge, Split, Compress, Reorder, Rotate, Extract Text, Convert, Edit Metadata, and more.</div>
        <div className="mt-2">Just click the tool you need—no uploads or sign-up required.</div>
      </>
    ),
  },
  {
    question: 'How do I convert a Word document to Markdown?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Word to Markdown Converter</b> tool.</li>
          <li>Click <b>Upload Word File</b> and select your .docx document.</li>
          <li>The Markdown version will appear instantly.</li>
          <li>Click <b>Copy Markdown</b> or <b>Download</b> to save your result.</li>
        </ol>
        <div className="mt-2 text-sm text-accent">Your document is never uploaded to a server.</div>
      </>
    ),
  },
  {
    question: 'How do I merge or split Excel files?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Excel Merger & Splitter</b> tool.</li>
          <li>Click <b>Upload Excel Files</b> and select one or more .xlsx files.</li>
          <li>Choose <b>Merge</b> to combine sheets, or <b>Split</b> to separate them.</li>
          <li>Click <b>Process</b> and download your new Excel files.</li>
        </ol>
        <div className="mt-2 text-sm text-accent">All processing is done in your browser for privacy.</div>
      </>
    ),
  },
  {
    question: 'How do I combine multiple CSV files?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>CSV Merger</b> tool.</li>
          <li>Click <b>Upload CSV Files</b> and select your files.</li>
          <li>Choose to merge by <b>Rows</b> or <b>Columns</b>.</li>
          <li>Click <b>Merge</b> and download the combined CSV.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I convert a CSV file to JSON?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>CSV to JSON Converter</b> tool.</li>
          <li>Click <b>Upload CSV</b> and select your file.</li>
          <li>Instantly view and copy the JSON output, or click <b>Download JSON</b>.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I filter columns in a CSV or Excel file?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>CSV/Excel Column Filter</b> tool.</li>
          <li>Upload your CSV or Excel file.</li>
          <li>Select the columns you want to keep or remove.</li>
          <li>Click <b>Filter</b> and download the new file.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I remove duplicate rows from a CSV or Excel file?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>CSV/Excel Duplicate Remover</b> tool.</li>
          <li>Upload your CSV or Excel file.</li>
          <li>Click <b>Remove Duplicates</b>.</li>
          <li>Download your cleaned file.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I compress images to reduce file size?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Image Compressor</b> tool.</li>
          <li>Click <b>Upload Image</b> or drag and drop your photo.</li>
          <li>Adjust the <b>Quality</b> and <b>Max Width</b> sliders as needed.</li>
          <li>Click <b>Compress Image</b>.</li>
          <li>Download your optimized image.</li>
        </ol>
        <div className="mt-2 text-sm text-accent">Your images never leave your device.</div>
      </>
    ),
  },
  {
    question: 'How do I sharpen or upscale an image?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Image Sharpener & Upscaler</b> tool.</li>
          <li>Click <b>Upload Image</b> or drag and drop your photo (JPG, PNG, or WebP).</li>
          <li>Choose <b>Sharpen</b> (to enhance clarity) or <b>Upscale</b> (to enlarge).</li>
          <li>Adjust the <b>Sharpness Level</b> or <b>Upscale Factor</b>.</li>
          <li>Click <b>Apply Sharpening</b> or <b>Upscale</b>.</li>
          <li>Preview and click <b>Download</b> to save your result.</li>
        </ol>
        <div className="mt-2 text-sm text-accent"><b>Pro Tip:</b> Upscale first, then sharpen for best results. All processing is local for privacy.</div>
      </>
    ),
  },
  {
    question: 'How do I convert images between formats?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Image Format Converter</b> tool.</li>
          <li>Click <b>Upload Images</b> and select your files.</li>
          <li>Choose the output format (<b>JPG</b>, <b>PNG</b>, or <b>WebP</b>).</li>
          <li>Click <b>Convert</b>.</li>
          <li>Download your converted images.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I add a watermark to an image or PDF?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Watermark Adder</b> tool.</li>
          <li>Upload your image or PDF.</li>
          <li>Choose <b>Text</b> or <b>Image</b> watermark.</li>
          <li>Enter your watermark text or upload a watermark image.</li>
          <li>Adjust <b>Opacity</b> and position as needed.</li>
          <li>Click <b>Apply Watermark</b> and download your file.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I remove EXIF metadata from images?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>EXIF Data Remover</b> tool.</li>
          <li>Click <b>Upload Images</b> and select your JPG or PNG files.</li>
          <li>Click <b>Remove Metadata</b>.</li>
          <li>Download your cleaned images.</li>
        </ol>
        <div className="mt-2 text-sm text-accent"><b>Tip:</b> This strips sensitive info before sharing.</div>
      </>
    ),
  },
  {
    question: 'How do I generate a color palette from an image?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Color Palette Generator</b> tool.</li>
          <li>Upload an image.</li>
          <li>Instantly view the extracted color palette.</li>
          <li>Copy HEX codes or download the palette for your design work.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I pick a color and get its HEX code?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Color Picker</b> tool.</li>
          <li>Use the color picker or enter a HEX/RGB value.</li>
          <li>Instantly see HEX, RGB, and HSL values.</li>
          <li>Copy any value for use in your projects.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I check color contrast for accessibility?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Contrast Checker</b> tool.</li>
          <li>Enter or pick your foreground and background colors.</li>
          <li>Instantly see the contrast ratio and WCAG rating.</li>
          <li>Adjust colors as needed for accessibility.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I create a CSS gradient?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Gradient Generator</b> tool.</li>
          <li>Pick your colors and adjust the gradient direction.</li>
          <li>Instantly preview the gradient.</li>
          <li>Copy the generated CSS code for your site or app.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I convert between HEX, RGB, and HSL color formats?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>HEX ↔ RGB ↔ HSL Converter</b> tool.</li>
          <li>Enter any color value.</li>
          <li>Instantly see the equivalent HEX, RGB, and HSL values.</li>
          <li>Copy the format you need.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I format or validate JSON data?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>JSON Formatter/Validator</b> tool.</li>
          <li>Paste or upload your JSON data.</li>
          <li>Instantly see formatted and validated output.</li>
          <li>Copy or download the result.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I generate MD5, SHA-1, SHA-256, or SHA-512 hashes?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Hash Generator</b> tool.</li>
          <li>Enter your text or upload a file.</li>
          <li>Select the hash type (<b>MD5</b>, <b>SHA-1</b>, <b>SHA-256</b>, <b>SHA-512</b>).</li>
          <li>Instantly see and copy the hash value.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I minify and compress CSS code?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>CSS Minifier</b> tool.</li>
          <li>Paste or upload your CSS code.</li>
          <li>Click <b>Minify</b>.</li>
          <li>Copy or download the minified CSS.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I encode or decode Base64 text?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Base64 Encoder/Decoder</b> tool.</li>
          <li>Enter your text or upload a file.</li>
          <li>Choose <b>Encode</b> or <b>Decode</b>.</li>
          <li>Instantly see and copy the result.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I compare and highlight differences between two texts?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Text Diff Viewer</b> tool.</li>
          <li>Paste or upload the two texts you want to compare.</li>
          <li>Instantly see highlighted differences.</li>
          <li>Copy or download the diff result.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I test and debug regular expressions?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Regex Tester</b> tool.</li>
          <li>Enter your regex pattern and test string.</li>
          <li>Instantly see matches and errors as you type.</li>
          <li>Adjust your regex and test again.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I generate Markdown tables from CSV or tabular data?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Markdown Table Generator</b> tool.</li>
          <li>Paste or upload your CSV/tabular data.</li>
          <li>Instantly see the generated Markdown table.</li>
          <li>Copy the Markdown for your docs or GitHub.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I generate a QR code for text, URLs, or WiFi?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>QR Code Generator</b> tool.</li>
          <li>Enter your text, URL, or WiFi info.</li>
          <li>Instantly see the QR code.</li>
          <li>Click <b>Download</b> to save the QR code image.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I generate strong, random passwords?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Password Generator</b> tool.</li>
          <li>Set your desired length and character options.</li>
          <li>Click <b>Generate</b>.</li>
          <li>Copy your new password.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I convert text between upper, lower, and title case?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Text Case Converter</b> tool.</li>
          <li>Paste or type your text.</li>
          <li>Choose the desired case (upper, lower, title, etc.).</li>
          <li>Instantly see and copy the converted text.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I count words and characters in my text?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Word/Character Counter</b> tool.</li>
          <li>Paste or type your text.</li>
          <li>Instantly see the word and character count.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I convert between units of measurement?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <b>Unit Converter</b> tool.</li>
          <li>Select the units to convert from and to.</li>
          <li>Enter your value.</li>
          <li>Instantly see the converted result.</li>
        </ol>
      </>
    ),
  },
  {
    question: 'How do I convert between currencies?',
    answer: (
      <>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Go to the <b>Currency Converter</b> tool.</li>
          <li>Select the currencies to convert from and to.</li>
          <li>Enter your amount.</li>
          <li>Instantly see the converted value using live rates.</li>
        </ol>
        <div className="mt-2 text-sm text-accent">All calculations are done locally for privacy.</div>
      </>
    ),
  },
];

// Accordion item component with Framer Motion
const FAQItem: React.FC<{
  question: string;
  answer: string | React.ReactNode;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, icon, isOpen, onClick }) => (
  <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
    <button
      className={`w-full flex items-center justify-between gap-4 py-4 px-2 sm:px-4 text-left transition-colors rounded-lg
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
        hover:bg-accent/5 dark:hover:bg-accent/10
        ${isOpen ? 'bg-accent/5 dark:bg-accent/10' : ''}
      `}
      aria-expanded={isOpen}
      onClick={onClick}
    >
      <span className="flex items-center gap-2 text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100">
        {icon}
        {question}
      </span>
      <ChevronDownIcon
        className={`w-5 h-5 text-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { height: 'auto', opacity: 1 },
            collapsed: { height: 0, opacity: 0 },
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
          aria-hidden={!isOpen}
        >
          <div className="pb-4 px-2 sm:px-4 text-slate-700 dark:text-slate-200 text-sm sm:text-base">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Main FAQ page component with search/filter
const FAQ: React.FC = () => {
  const { trackEngagement } = useAnalytics();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  // Filtered FAQ list based on search
  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqData;
    const q = search.toLowerCase();
    return faqData.filter(
      item =>
        item.question.toLowerCase().includes(q) ||
        String(item.answer).toLowerCase().includes(q)
    );
  }, [search]);

  // Reset openItems if search changes and current open item is filtered out
  React.useEffect(() => {
    if (openItems.length > 0 && !filteredFaqs[openItems[0]]) setOpenItems([]);
  }, [search, filteredFaqs, openItems]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    trackEngagement('faq_expand', 1, { question_index: index });
  };

  return (
    <div className="container-app max-w-2xl mx-auto px-2 sm:px-4 py-10 sm:py-16">
      <h1 className="text-4xl font-bold mb-2 text-center text-slate-900 dark:text-white">Frequently Asked Questions</h1>
      <p className="mb-8 text-center text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-base sm:text-lg">
        Find answers to common questions about ToolsJockey.com, privacy, features, and how to get the most out of our free, privacy-first web tools.
      </p>
      <div className="mb-6 flex items-center justify-center">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Search FAQs"
          />
        </div>
      </div>
      <div className="bg-white dark:bg-primary-light rounded-2xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
        {filteredFaqs.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">No FAQs match your search.</div>
        ) : (
          filteredFaqs.map((item, idx) => (
            <FAQItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              icon={item.icon}
              isOpen={openItems.includes(idx)}
              onClick={() => toggleItem(idx)}
            />
          ))
        )}
      </div>
      <div className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
        Can't find your answer? Contact us at{' '}
        <a href="mailto:support@toolsjockey.com" className="text-accent underline hover:text-accent-dark">
          support@toolsjockey.com
        </a>
        .
      </div>
    </div>
  );
};

export default FAQ; 