export const blogPosts = [
  {
    id: 'main',
    pinned: true,
    title: 'Welcome to ToolsJockey: Your All-in-One Online Toolbox',
    category: 'FEATURED',
    date: 'May 20, 2025',
    author: 'ToolsJockey Team',
    readTime: '4 min read',
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
    excerpt: `Discover why ToolsJockey.com is the ultimate privacy-first, client-only web app for all your productivity, file, and developer needs. Explore our suite of free tools—no sign-up, no uploads, just instant results.`,
    content: (
      <>
        <p>
          <b>ToolsJockey.com</b> is your go-to destination for a growing suite of free, privacy-first web tools. Our mission is simple: empower you to get things done—faster, safer, and without ever uploading your files or data.
        </p>
        <p className="mt-3">
          <b>Why client-only?</b> All our tools run 100% in your browser. That means your files never leave your device, ensuring maximum privacy and blazing-fast performance. No sign-ups, no waiting for uploads, and no risk of data leaks.
        </p>
        <p className="mt-3">
          <b>What can you do on ToolsJockey?</b>
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><b>PDF Suite:</b> Merge, split, compress, reorder, rotate, extract text, redact, convert, edit metadata, add watermarks, and more.</li>
          <li><b>Excel/CSV Tools:</b> Merge, split, filter, convert (including Excel to Everything), and clean up spreadsheets—no Excel required.</li>
          <li><b>Mail Merge & Redaction:</b> Generate personalized documents or securely redact PDFs, all in your browser.</li>
          <li><b>Developer Utilities:</b> JSON formatter, hash generator, regex tester, text diff, and more.</li>
          <li><b>Color & Image Tools:</b> Color palette generator, image compressor, format converter, QR code generator, and more.</li>
          <li><b>Quick Utilities:</b> Word/character counter, password generator, case converter, and more.</li>
        </ul>
        <p className="mt-3">
          We're always adding new tools and features. <b>Bookmark ToolsJockey.com</b> and supercharge your workflow—no matter what device you're on!
        </p>
      </>
    ),
  },
  {
    id: 'video-converter',
    title: 'Privacy-First Video Converter: Convert Video Files Without Uploading Them',
    category: 'VIDEO TOOLS',
    date: 'June 24, 2025',
    author: 'ToolsJockey Team',
    readTime: '3 min read',
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80",
    excerpt: "Convert videos between formats without ever uploading your files. Our browser-based Video Converter uses FFmpeg.wasm to process videos locally with professional quality.",
    content: (
      <>
        <p>
          We're excited to announce our new <b>Video Converter</b>—a powerful, completely local video conversion tool that runs 100% in your browser.
        </p>
        
        <h3 className="mt-6 mb-2 text-xl font-bold">Features and Capabilities</h3>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><b>Privacy-First:</b> Your videos never leave your device—all processing happens locally.</li>
          <li><b>Multiple Formats:</b> Convert between MP4, WebM, AVI, MOV, MKV, and more.</li>
          <li><b>Quality Options:</b> Choose from preset quality levels (Low, Medium, High) or customize your settings.</li>
          <li><b>Advanced Controls:</b> Fine-tune codecs, bitrates, resolution, and framerate for professional results.</li>
          <li><b>Batch Processing:</b> Convert multiple videos in a single session.</li>
        </ul>

        <h3 className="mt-6 mb-2 text-xl font-bold">How It Works</h3>
        <p>
          Our Video Converter uses FFmpeg.wasm, a WebAssembly port of the popular FFmpeg library, bringing professional-grade video processing directly to your browser. This eliminates the need to install complex software or upload your sensitive videos to third-party servers.
        </p>

        <h3 className="mt-6 mb-2 text-xl font-bold">Perfect For...</h3>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Content creators needing quick format conversions</li>
          <li>Professionals working with sensitive or confidential video material</li>
          <li>Anyone wanting to optimize videos for specific platforms or devices</li>
          <li>Users who need video conversion but can't install desktop software</li>
        </ul>

        <p className="mt-4">
          <b>Try it now:</b> Visit the <a href="/tools/video-converter" className="text-blue-600 hover:underline">Video Converter</a> and experience the power of local video processing—no uploads, no waiting, no privacy concerns.
        </p>
      </>
    ),
  },
  {
    id: 'audio-extractor',
    title: 'Extract Audio from Videos with Our New Browser-Based Tool',
    category: 'AUDIO TOOLS',
    date: 'June 28, 2025',
    author: 'ToolsJockey Team',
    readTime: '3 min read',
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
    excerpt: "Easily extract audio tracks from videos in multiple formats without uploading your files. Our new Audio Extractor tool processes everything locally in your browser.",
    content: (
      <>
        <p>
          We're excited to introduce our new <b>Audio Extractor</b> tool—the latest addition to our video processing suite. This powerful tool allows you to extract audio tracks from any video file, all processed locally in your browser for maximum privacy and speed.
        </p>
        
        <h3 className="mt-6 mb-2 text-xl font-bold">Key Features</h3>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><b>Multiple Audio Formats:</b> Extract audio as MP3, WAV, AAC, or OGG Vorbis</li>
          <li><b>Quality Control:</b> Choose from various bitrate options for compressed formats</li>
          <li><b>Time Range Selection:</b> Extract audio from specific sections of your video</li>
          <li><b>Metadata Preservation:</b> Optionally keep video metadata in the extracted audio file</li>
          <li><b>Real-time Preview:</b> Listen to the audio before downloading</li>
          <li><b>100% Client-side Processing:</b> Your files never leave your device</li>
        </ul>

        <h3 className="mt-6 mb-2 text-xl font-bold">How to Use the Audio Extractor</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li><b>Upload your video file</b> (supports MP4, WebM, AVI, MOV, MKV, and more)</li>
          <li><b>Select your desired audio format</b> and quality settings</li>
          <li><b>Choose the time range</b> if you only want to extract part of the audio</li>
          <li><b>Click "Extract Audio"</b> and wait for processing to complete</li>
          <li><b>Preview the extracted audio</b> in the built-in player</li>
          <li><b>Download the audio file</b> to your device</li>
        </ol>

        <h3 className="mt-6 mb-2 text-xl font-bold">Perfect For</h3>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Content creators who need to separate audio from video</li>
          <li>Podcasters extracting audio from recorded interviews</li>
          <li>Musicians who want to save audio tracks from music videos</li>
          <li>Anyone who needs audio-only versions of video content</li>
        </ul>

        <p className="mt-4">
          <b>Try it now:</b> Visit our <a href="/tools/audio-extractor" className="text-blue-600 hover:underline">Audio Extractor</a> tool and experience the convenience of browser-based audio extraction—no software installation required, no uploads, just fast and private processing right on your device.
        </p>
      </>
    ),
  },
  {
    id: 'pdf-tips',
    title: 'How to Merge, Split, and Redact PDFs Instantly—No Uploads Needed',
    category: 'PDF TOOLS',
    date: 'June 2, 2025',
    author: 'ToolsJockey Team',
    readTime: '3 min read',
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    excerpt: "Learn how to combine, split, or redact PDF files in seconds using ToolsJockey's client-only PDF suite. No sign-up, no file uploads, just instant results.",
    content: (
      <>
        <p>
          With ToolsJockey's PDF suite, you can merge, split, or redact PDF files instantly—right in your browser. No uploads, no waiting, and your files stay private.
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Merge multiple PDFs into one</li>
          <li>Split a PDF into separate files</li>
          <li>Redact sensitive text from PDFs</li>
          <li>Reorder, rotate, or delete pages</li>
          <li>Compress and optimize PDFs</li>
        </ul>
        <p className="mt-3">Try it now on the PDF Tools dashboard!</p>
      </>
    ),
  },
  {
    id: 'csv-excel',
    title: 'Excel & CSV Tools: Clean, Convert, and Merge Data Effortlessly',
    category: 'EXCEL/CSV',
    date: 'May 28, 2025',
    author: 'ToolsJockey Team',
    readTime: '2 min read', 
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    excerpt: "Discover how ToolsJockey's spreadsheet utilities help you merge, split, and clean up your data—right in your browser.",
    content: (
      <>
        <p>
          Our Excel/CSV tools let you merge, split, filter, and convert spreadsheets with ease. All processing is done locally for privacy and speed.
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Merge or split CSV/Excel files</li>
          <li>Convert between formats (including Excel to Everything Converter)</li>
          <li>Remove duplicates, filter columns, and more</li>
        </ul>
      </>
    ),
  },
  {
    id: 'dev-utilities',
    title: 'Developer Utilities: JSON, Hashes, Regex, and More',
    category: 'DEVELOPER',
    date: 'June 7, 2025',
    author: 'ToolsJockey Team',
    readTime: '2 min read',
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    excerpt: "Explore our growing set of developer tools, including JSON formatter, hash generator, and regex tester—all client-side and free.",
    content: (
      <>
        <p>
          ToolsJockey offers a suite of developer utilities to make your workflow easier:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>JSON Formatter & Validator</li>
          <li>Hash Generator (MD5, SHA, etc.)</li>
          <li>Regex Tester</li>
          <li>Text Diff Viewer</li>
        </ul>
        <p className="mt-3">All tools are free and require no sign-up.</p>
      </>
    ),
  },
  {
    id: 'batch-pdf-form-filler',
    title: 'Batch PDF Form Filler: Automate Your Document Workflow',
    category: 'PDF TOOLS',
    date: 'June 12, 2025',
    author: 'ToolsJockey Team',
    readTime: '5 min read',
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
    excerpt: "Discover how the Batch PDF Form Filler can save you hours by automating the process of filling out multiple PDF forms at once. Perfect for HR, education, legal, and more.",
    content: (
      <>
        <p>
          The <b>Batch PDF Form Filler</b> is one of the most powerful and time-saving tools on ToolsJockey.com. If you've ever had to fill out dozens or even hundreds of PDF forms with different data—whether for HR onboarding, school admissions, legal paperwork, or surveys—you know how tedious and error-prone it can be.
        </p>
        <p className="mt-3">
          <b>Why is this tool important?</b> Most PDF editors only let you fill one form at a time. Our Batch PDF Form Filler lets you upload a PDF template and a spreadsheet (CSV/Excel) of data, and instantly generate a filled PDF for each row—100% client-side, with no uploads or privacy worries.
        </p>
        <h3 className="mt-6 mb-2 text-xl font-bold">How to Use the Batch PDF Form Filler</h3>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <b>Prepare your PDF form:</b> Make sure your PDF has fillable fields (you can create these in Adobe Acrobat, LibreOffice, or other PDF editors).
          </li>
          <li>
            <b>Prepare your data:</b> Create a CSV or Excel file where each column matches a field name in your PDF, and each row is a set of values to fill.
          </li>
          <li>
            <b>Go to the Batch PDF Form Filler tool</b> on ToolsJockey.com.
          </li>
          <li>
            <b>Upload your PDF form</b> and your CSV/Excel data file.
          </li>
          <li>
            <b>Map your columns to PDF fields</b> (the tool will help you match them up).
          </li>
          <li>
            <b>Click "Fill Forms"</b>—the tool will generate a filled PDF for each row of your data, all in your browser.
          </li>
          <li>
            <b>Download your filled PDFs</b> as a ZIP file or individually.
          </li>
        </ol>
        <p className="mt-4">
          <b>Pro tip:</b> All processing is done locally in your browser, so your sensitive data never leaves your device. This makes it perfect for confidential or regulated workflows.
        </p>
        <p className="mt-4">
          Try the <b>Batch PDF Form Filler</b> today and see how much time you can save!
        </p>
      </>
    ),
  },
  // New blog posts for latest tools:
  {
    id: 'excel-to-everything',
    title: 'New: Excel to Everything Converter – Instantly Convert Excel to CSV, JSON, HTML, PDF, and Google Sheets',
    category: 'EXCEL/CSV',
    date: 'June 15, 2025',
    author: 'ToolsJockey Team',
    readTime: '3 min read',
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    excerpt: "Convert Excel files to multiple formats in seconds—no uploads, no privacy worries. Batch, preview, and customize your output with our new all-in-one converter.",
    content: (
      <>
        <p>
          We're excited to announce the <b>Excel to Everything Converter</b>—the fastest way to convert Excel files to CSV, JSON, HTML, PDF, and Google Sheets formats, all 100% client-side.
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Batch upload Excel files and preview your data instantly</li>
          <li>Customize output for each format (delimiters, templates, etc.)</li>
          <li>Export to CSV, JSON, HTML, PDF, or Google Sheets-compatible CSV</li>
          <li>All processing is done in your browser for maximum privacy</li>
        </ul>
        <p className="mt-3">
          Try it now on the <b>Excel to Everything Converter</b> page!
        </p>
      </>
    ),
  },
  {
    id: 'mail-merge-tool',
    title: 'Mail Merge Tool: Personalized Documents in Seconds',
    category: 'WORD/DOCUMENTS',
    date: 'June 18, 2025',
    author: 'ToolsJockey Team',
    readTime: '2 min read',
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
    excerpt: "Generate personalized letters, labels, or forms from templates and spreadsheets—no software required.",
    content: (
      <>
        <p>
          The new <b>Mail Merge Tool</b> lets you create hundreds of personalized documents from a single template and a spreadsheet of data. Perfect for letters, labels, certificates, and more.
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Upload a DOCX or PDF template</li>
          <li>Import your data as Excel or CSV</li>
          <li>Preview and download all merged documents—no uploads, no privacy risk</li>
        </ul>
        <p className="mt-3">
          Try the <b>Mail Merge Tool</b> today and automate your document workflow!
        </p>
      </>
    ),
  },

]; 