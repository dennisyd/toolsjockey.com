// Centralized tool metadata for ToolsJockey
import {
  DocumentDuplicateIcon,
  TableCellsIcon,
  CodeBracketIcon,
  PhotoIcon,
  BoltIcon,
  ArrowsRightLeftIcon,
  EyeDropperIcon,
  KeyIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

export type ToolBadge = 'NEW' | 'POPULAR' | 'UPDATED';

export interface ToolMeta {
  id: string;
  title: string;
  path: string;
  description: string;
  icon: any;
  badges?: ToolBadge[];
  group: string;
}

export const toolsConfig: ToolMeta[] = [
  // PDF Tools
  {
    id: 'batch-pdf-form-filler',
    title: 'Batch PDF Form Filler',
    path: '/tools/batch-pdf-form-filler',
    description: 'Fill PDF forms in bulk using spreadsheet data.',
    icon: DocumentDuplicateIcon,
    group: 'pdf',
  },
  {
    id: 'pdf-suite-dashboard',
    title: 'PDF Suite (All PDF Tools)',
    path: '/pdf-tools',
    description: 'Access all PDF utilities: merge, split, compress, convert, and more.',
    icon: DocumentDuplicateIcon,
    badges: ['POPULAR'],
    group: 'pdf',
  },
  // Word & Document Tools
  {
    id: 'word-to-markdown',
    title: 'Word to Markdown Converter',
    path: '/tools/word-to-markdown',
    description: 'Convert Word documents (.docx) to Markdown format.',
    icon: PencilSquareIcon,
    group: 'word',
  },
  // Excel & CSV Tools
  {
    id: 'excel-merger-splitter',
    title: 'Excel Merger & Splitter',
    path: '/tools/excel-merger-splitter',
    description: 'Merge or split Excel sheets. Batch process .xlsx files.',
    icon: TableCellsIcon,
    group: 'excelcsv',
  },
  {
    id: 'csv-merger',
    title: 'CSV Merger',
    path: '/tools/csv-merger',
    description: 'Merge multiple CSV files by rows or columns.',
    icon: TableCellsIcon,
    group: 'excelcsv',
  },
  {
    id: 'csv-to-json',
    title: 'CSV to JSON Converter',
    path: '/tools/csv-to-json',
    description: 'Convert CSV files to JSON format.',
    icon: TableCellsIcon,
    group: 'excelcsv',
  },
  {
    id: 'column-filter',
    title: 'CSV/Excel Column Filter',
    path: '/tools/column-filter',
    description: 'Filter columns in CSV or Excel files.',
    icon: TableCellsIcon,
    group: 'excelcsv',
  },
  {
    id: 'remove-duplicates',
    title: 'CSV/Excel Duplicate Remover',
    path: '/tools/remove-duplicates',
    description: 'Remove duplicate rows from CSV or Excel files.',
    icon: TableCellsIcon,
    group: 'excelcsv',
  },
  // Image Tools
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    path: '/tools/image-compressor',
    description: 'Compress images to reduce file size.',
    icon: PhotoIcon,
    group: 'image',
  },
  {
    id: 'image-sharpener',
    title: 'Image Sharpener/Upscaler',
    path: '/tools/image-sharpener',
    description: 'Sharpen or upscale images using AI.',
    icon: PhotoIcon,
    group: 'image',
  },
  {
    id: 'image-format-converter',
    title: 'Image Format Converter',
    path: '/tools/image-format-converter',
    description: 'Convert images between formats (JPG, PNG, WebP, etc).',
    icon: PhotoIcon,
    group: 'image',
  },
  {
    id: 'watermark-adder',
    title: 'Watermark Adder',
    path: '/tools/watermark-adder',
    description: 'Add styled text overlays to images or PDFs.',
    icon: PhotoIcon,
    group: 'image',
  },
  {
    id: 'exif-remover',
    title: 'EXIF Data Remover',
    path: '/tools/exif-remover',
    description: 'Remove EXIF metadata from images.',
    icon: PhotoIcon,
    group: 'image',
  },
  // Color & Design Tools
  {
    id: 'color-palette-generator',
    title: 'Color Palette Generator',
    path: '/tools/color-palette-generator',
    description: 'Extract and generate color palettes from images.',
    icon: EyeDropperIcon,
    group: 'color',
  },
  {
    id: 'color-picker',
    title: 'Color Picker',
    path: '/tools/color-picker',
    description: 'Pick a color and get HEX, RGB, and HSL values instantly.',
    icon: EyeDropperIcon,
    group: 'color',
  },
  {
    id: 'contrast-checker',
    title: 'Contrast Checker',
    path: '/tools/contrast-checker',
    description: 'Check color contrast ratio and WCAG accessibility rating.',
    icon: EyeDropperIcon,
    group: 'color',
  },
  {
    id: 'gradient-generator',
    title: 'Gradient Generator',
    path: '/tools/gradient-generator',
    description: 'Create CSS gradients with multiple colors and directions.',
    icon: EyeDropperIcon,
    group: 'color',
  },
  {
    id: 'color-format-converter',
    title: 'HEX ↔ RGB ↔ HSL Converter',
    path: '/tools/color-format-converter',
    description: 'Convert between HEX, RGB, and HSL color formats.',
    icon: EyeDropperIcon,
    group: 'color',
  },
  // Developer Tools
  {
    id: 'json-formatter',
    title: 'JSON Formatter/Validator',
    path: '/tools/json-formatter',
    description: 'Format and validate JSON data instantly.',
    icon: CodeBracketIcon,
    badges: ['POPULAR'],
    group: 'developer',
  },
  {
    id: 'hash-generator',
    title: 'Hash Generator (MD5, SHA256)',
    path: '/tools/hash-generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes.',
    icon: KeyIcon,
    badges: ['NEW'],
    group: 'developer',
  },
  {
    id: 'css-minifier',
    title: 'CSS Minifier',
    path: '/tools/css-minifier',
    description: 'Minify and compress CSS code.',
    icon: CodeBracketIcon,
    group: 'developer',
  },
  {
    id: 'base64-encoder',
    title: 'Base64 Encoder/Decoder',
    path: '/tools/base64-encoder',
    description: 'Encode or decode Base64 text.',
    icon: CodeBracketIcon,
    group: 'developer',
  },
  {
    id: 'text-diff',
    title: 'Text Diff Viewer',
    path: '/tools/text-diff',
    description: 'Compare and highlight differences between two texts.',
    icon: CodeBracketIcon,
    badges: ['NEW'],
    group: 'developer',
  },
  {
    id: 'regex-tester',
    title: 'Regex Tester',
    path: '/tools/regex-tester',
    description: 'Test and debug regular expressions.',
    icon: CodeBracketIcon,
    badges: ['NEW'],
    group: 'developer',
  },
  {
    id: 'markdown-table-generator',
    title: 'Markdown Table Generator',
    path: '/tools/markdown-table-generator',
    description: 'Generate Markdown tables from CSV or tabular data.',
    icon: CodeBracketIcon,
    badges: ['NEW'],
    group: 'developer',
  },
  // Quick Utilities
  {
    id: 'qr-code-generator',
    title: 'QR Code Generator',
    path: '/tools/qr-code-generator',
    description: 'Generate QR codes for text, URLs, WiFi, and more.',
    icon: BoltIcon,
    group: 'quick',
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    path: '/tools/password-generator',
    description: 'Generate strong, random passwords.',
    icon: BoltIcon,
    group: 'quick',
  },
  {
    id: 'text-case-converter',
    title: 'Text Case Converter',
    path: '/tools/text-case-converter',
    description: 'Convert text between upper, lower, title, and other cases.',
    icon: BoltIcon,
    group: 'quick',
  },
  {
    id: 'word-counter',
    title: 'Word/Character Counter',
    path: '/tools/word-counter',
    description: 'Count words and characters in your text.',
    icon: BoltIcon,
    group: 'quick',
  },
  // Converters
  {
    id: 'unit-converter',
    title: 'Unit Converter',
    path: '/tools/unit-converter',
    description: 'Convert between units of measurement.',
    icon: ArrowsRightLeftIcon,
    group: 'converter',
  },
  {
    id: 'currency-converter',
    title: 'Currency Converter',
    path: '/tools/currency-converter',
    description: 'Convert between currencies with live rates.',
    icon: ArrowsRightLeftIcon,
    group: 'converter',
  },
];

// Optionally, export group metadata for section headers, icons, etc.
export const toolGroups = [
  { id: 'pdf', label: '📄 PDF Tools', icon: DocumentDuplicateIcon },
  { id: 'word', label: '📝 Word & Document Tools', icon: PencilSquareIcon },
  { id: 'excelcsv', label: '📊 Excel & CSV Tools', icon: TableCellsIcon },
  { id: 'image', label: '🖼️ Image Tools', icon: PhotoIcon },
  { id: 'color', label: '🎨 Color & Design Tools', icon: EyeDropperIcon },
  { id: 'developer', label: '⚙️ Developer Tools', icon: CodeBracketIcon },
  { id: 'quick', label: '🔑 Quick Utilities', icon: BoltIcon },
  { id: 'converter', label: '🌍 Converters', icon: ArrowsRightLeftIcon },
]; 