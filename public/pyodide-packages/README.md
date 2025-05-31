# Pyodide Packages

This directory contains pre-built Python packages for use with Pyodide.

## Usage

1. Download the PyPDF2 wheel file from PyPI:
   - Visit https://pypi.org/project/PyPDF2/#files
   - Download the latest wheel file (e.g., `PyPDF2-3.0.1-py3-none-any.whl`)
   - Place it in this directory

2. Reference the local package in the code:
   ```js
   await micropip.install('/pyodide-packages/PyPDF2-3.0.1-py3-none-any.whl');
   ```

## Troubleshooting

If you encounter issues loading packages, try:
1. Check browser console for errors
2. Verify the wheel file is properly downloaded
3. Try using a CDN-hosted version as fallback 