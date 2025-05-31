@echo off
echo Downloading pre-built PyMuPDF wheel for Pyodide
echo ==============================================

REM Create wheels directory if it doesn't exist
if not exist public\wheels mkdir public\wheels

REM Define the wheel name
set WHEEL_NAME=pymupdf-1.22.5-cp311-cp311-emscripten_3_1_45_wasm32.whl
set WHEEL_URL=https://github.com/pyodide/pyodide/releases/download/0.23.4/pymupdf-1.22.5-cp311-cp311-emscripten_3_1_45_wasm32.whl

REM Download the pre-built PyMuPDF wheel for Pyodide using curl
echo Downloading PyMuPDF wheel from GitHub releases...
curl -L -o public/wheels/%WHEEL_NAME% %WHEEL_URL%

REM Check if the download was successful
if exist public\wheels\%WHEEL_NAME% (
    echo Download successful!
    echo The PyMuPDF wheel has been downloaded to public/wheels/%WHEEL_NAME%
) else (
    echo Download failed. Please check your internet connection and try again.
    echo You may need to manually download a PyMuPDF wheel for Pyodide.
    echo A good source is: https://github.com/pyodide/pyodide/releases/
)

echo.
echo Now you can use this wheel in your PyMuPDFBridge.ts file by updating the PYMUPDF_WHEEL_URL value:
echo const PYMUPDF_WHEEL_URL = '/wheels/%WHEEL_NAME%'; 