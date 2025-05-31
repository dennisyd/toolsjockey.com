# PowerShell script to download PyMuPDF wheel for Pyodide
Write-Host "Downloading pre-built PyMuPDF wheel for Pyodide" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Create wheels directory if it doesn't exist
if (-not (Test-Path -Path "public\wheels")) {
    New-Item -Path "public\wheels" -ItemType Directory | Out-Null
    Write-Host "Created public\wheels directory" -ForegroundColor Green
}

# Define the wheel name and URL
$wheelName = "pymupdf-1.22.5-cp311-cp311-emscripten_3_1_45_wasm32.whl"
$wheelUrl = "https://github.com/pyodide/pyodide/releases/download/0.23.4/$wheelName"
$wheelPath = "public\wheels\$wheelName"

# Download the wheel
Write-Host "Downloading PyMuPDF wheel from GitHub releases..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $wheelUrl -OutFile $wheelPath -UseBasicParsing
    
    if (Test-Path -Path $wheelPath) {
        Write-Host "Download successful!" -ForegroundColor Green
        Write-Host "The PyMuPDF wheel has been downloaded to $wheelPath" -ForegroundColor Green
    } else {
        Write-Host "Download failed. File not found after download." -ForegroundColor Red
    }
} catch {
    Write-Host "Download failed with error: $_" -ForegroundColor Red
    Write-Host "You may need to manually download a PyMuPDF wheel for Pyodide." -ForegroundColor Yellow
    Write-Host "A good source is: https://github.com/pyodide/pyodide/releases/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Now you can use this wheel in your PyMuPDFBridge.ts file by updating the PYMUPDF_WHEEL_URL value:" -ForegroundColor Cyan
Write-Host "const PYMUPDF_WHEEL_URL = '/wheels/$wheelName';" -ForegroundColor Green 