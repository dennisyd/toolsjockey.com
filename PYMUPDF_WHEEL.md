# Building a PyMuPDF Wheel for Pyodide

This document explains how to build a PyMuPDF wheel that's compatible with Pyodide for browser-based usage.

## Background

PyMuPDF (also known as `fitz`) is a Python binding for MuPDF, a lightweight PDF, XPS, and E-book viewer, renderer, and toolkit. While it's an excellent library, it contains native C/C++ code, which means it can't be directly installed in Pyodide using `micropip.install('pymupdf')`.

To use PyMuPDF in the browser with Pyodide, we need to create a custom wheel that:
1. Contains the compiled WebAssembly binaries
2. Is structured correctly for Pyodide to load

## Prerequisites

- Docker
- Git
- Basic knowledge of Python packaging

## Building Steps

1. **Set up a Pyodide build environment**

   Create a Docker container with the Pyodide build toolchain:

   ```bash
   docker pull pyodide/pyodide-env:latest
   docker run -it --rm -v $(pwd):/src pyodide/pyodide-env:latest bash
   ```

2. **Clone PyMuPDF and prepare for build**

   ```bash
   git clone https://github.com/pymupdf/PyMuPDF.git
   cd PyMuPDF
   ```

3. **Modify setup.py for Pyodide compatibility**

   Edit setup.py to:
   - Remove or adapt native compilation steps
   - Ensure compatibility with Emscripten compiler
   - Use precompiled MuPDF libraries if available

4. **Build the wheel**

   ```bash
   pip wheel . --no-deps
   ```

5. **Host the wheel**

   Host the generated .whl file somewhere accessible via HTTPS (like GitHub releases):
   
   ```bash
   # Example
   git clone https://github.com/yourusername/pymupdf-pyodide-wheel.git
   cp PyMuPDF-x.xx.x-py3-none-any.whl pymupdf-pyodide-wheel/
   cd pymupdf-pyodide-wheel
   git add .
   git commit -m "Add PyMuPDF wheel for Pyodide"
   git push
   ```

## Using the Custom Wheel

In your JavaScript code, use micropip to install the wheel directly from its URL:

```javascript
const micropip = pyodide.pyimport("micropip");
await micropip.install("https://github.com/yourusername/pymupdf-pyodide-wheel/raw/main/PyMuPDF-x.xx.x-py3-none-any.whl");
```

## Alternative Approaches

If building a PyMuPDF wheel proves too challenging, consider these alternatives:

1. **Use PDF.js for PDF manipulation**: A JavaScript library that can handle basic PDF tasks
2. **Create a simplified Python module**: Implement basic redaction functionality without PyMuPDF
3. **Use a server-side approach**: Process PDFs on the server using PyMuPDF

## Resources

- [Pyodide Documentation](https://pyodide.org/en/stable/)
- [PyMuPDF GitHub](https://github.com/pymupdf/PyMuPDF)
- [Emscripten Documentation](https://emscripten.org/docs/index.html) 