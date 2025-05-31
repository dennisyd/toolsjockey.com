# ToolsJockey.com

Supercharged Multi-Tool Web App

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Accessibility](https://img.shields.io/badge/accessibility-95%2B-brightgreen)

## Overview

**ToolsJockey.com** is a modern, client-side, multi-tool web application designed for productivity, privacy, and speed. It features a rich, colorful UI and groups dozens of utilities for documents, images, code, and more—all in one place. The app is optimized for performance, accessibility, and ad-based monetization.

## ✨ Features
- **Grouped Tools:**
  - Image upscaler, compressor, format converter, EXIF remover, watermark adder
  - QR code generator, color palette extractor, color picker/converter
  - PDF utilities, Word to Markdown, CSV to JSON, CSV merger, JSON formatter
  - Password generator, text case converter, word/character counter, hash generator
  - Unit and currency converters, and more
- **Modern UI:** Responsive, accessible, and visually engaging
- **Ad System:** Modular ad slots for monetization
- **Client-Side Processing:** No file uploads—privacy first
- **Dark Mode:** Seamless theme switching
- **Performance:** Built with Vite, code-splitting, and lazy loading

## 🛠 Tech Stack
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (blazing fast dev/build)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first styling)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [Heroicons](https://heroicons.com/) (icons)
- [jsPDF](https://github.com/parallax/jsPDF), [xlsx](https://github.com/SheetJS/sheetjs), [mammoth.js](https://github.com/mwilliamson/mammoth.js) for file utilities

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or pnpm

### Setup
```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting & Testing
```bash
npm run lint   # Lint code
npm run test   # Run tests (if configured)
```

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## 📄 License
MIT (add your license text here)

## PDF Redaction Tool

The PDF Redaction Tool uses PyMuPDF (through Pyodide) for professional-grade PDF redaction directly in the browser.

### Building PyMuPDF for WebAssembly/Pyodide

PyMuPDF isn't available as a pure Python package in Pyodide by default. You need to build a custom wheel that works with WebAssembly:

#### Prerequisites

- Docker (for the Pyodide build environment)
- Git
- About 10GB of free disk space

#### Build Steps

1. **Clone the Pyodide repository:**

```bash
git clone https://github.com/pyodide/pyodide.git
cd pyodide
```

2. **Create a new directory for PyMuPDF:**

```bash
mkdir packages/pymupdf
```

3. **Create the package definition file:**

Create `packages/pymupdf/meta.yaml` with the following content:

```yaml
package:
  name: pymupdf
  version: 1.22.5

source:
  url: https://github.com/pymupdf/PyMuPDF/archive/refs/tags/1.22.5.tar.gz
  sha256: e73e96d25a9ca7fbfac68d5259ff3436c14f73b13f8dbe8db4a7d94a3f33343c

requirements:
  host:
    - setuptools
    - wheel
    - pillow
    - numpy
  run:
    - pillow
    - numpy

test:
  imports:
    - fitz

about:
  home: https://github.com/pymupdf/PyMuPDF
  PyPI: https://pypi.org/project/PyMuPDF/
  summary: Python bindings for MuPDF
  license: AGPL-3.0-only
```

4. **Create build configuration file:**

Create `packages/pymupdf/config.patch` with the modifications needed for WebAssembly compilation. The patch should modify the PyMuPDF setup.py file to work with the Emscripten compiler. See the separate documentation for the complete patch file.

5. **Build the PyMuPDF wheel:**

```bash
make clean
PYODIDE_PACKAGES="pymupdf" make
```

This will take some time. Once complete, you'll find the wheel file in the `dist/` directory.

6. **Copy the wheel file:**

Copy the wheel file to your project's `public/wheels/` directory:

```bash
mkdir -p public/wheels
cp dist/pymupdf-*.whl public/wheels/
```

### How the Redaction Works

With PyMuPDF loaded in the browser via Pyodide:

1. **Precise Text Search**: Uses PyMuPDF's `page.search_for()` to find exact text positions
2. **Rectangle Creation**: Creates precise redaction rectangles around the found text
3. **PDF Modification**: Uses PyMuPDF's `page.apply_redactions()` to permanently redact the text

This provides the same high-quality redaction as desktop applications, but running entirely in the browser without sending files to a server.

### Usage

To redact text in a PDF:

1. Upload your PDF document
2. Enter specific text to redact or use the automatic pattern detection
3. Preview detected sensitive information
4. Click "Redact and Download" to apply redactions
5. Download your redacted document

All processing happens entirely in your browser - no data is sent to any server.

---

*Made with ❤️ for productivity enthusiasts.*

# PyMuPDF Browser Integration

## Overview

This project uses PyMuPDF (a Python library) directly in the browser through Pyodide (WebAssembly-compiled Python) to provide professional-grade PDF redaction capabilities. This approach gives you desktop-quality redaction functionality while still running entirely in the browser.

## How It Works

1. **Pyodide** - A WebAssembly port of Python that runs in the browser
2. **PyMuPDF** - A powerful PDF manipulation library compiled for WebAssembly
3. **JavaScript Bridge** - Our custom `PyMuPDFBridge.ts` that communicates between JavaScript and Python

When a user uploads a PDF and wants to redact sensitive information:

1. Pyodide loads the Python runtime in the browser
2. PyMuPDF is downloaded and installed via micropip
3. The PDF is processed entirely client-side with precise redaction
4. No data is sent to any server, maintaining privacy

## Deployment to Vercel

This application is optimized to run on Vercel, which provides a Linux-based environment. Here's how to deploy:

1. **Connect your GitHub repository to Vercel**
   ```
   vercel login
   vercel link
   vercel deploy
   ```

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   No special environment variables are needed for the PyMuPDF integration.

## Development Notes

- **Windows Development**: The PyMuPDF integration may not work perfectly in a local Windows development environment due to WebAssembly compatibility issues. We recommend testing on Vercel or using WSL (Windows Subsystem for Linux).

- **Testing on Vercel**: For the most accurate testing, deploy to Vercel where the Linux environment provides better compatibility with Pyodide and WebAssembly.

- **Debugging**: Enable `DEBUG_MODE` in `PDFRedactionTool.tsx` to see detailed logging about the PyMuPDF loading and redaction process.

## Fallback Mechanism

If PyMuPDF fails to load or encounters an error, the application will automatically fall back to a JavaScript-based redaction method that still provides basic functionality.
