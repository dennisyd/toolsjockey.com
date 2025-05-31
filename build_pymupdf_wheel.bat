@echo off
echo Building PyMuPDF for Pyodide (WebAssembly)
echo =========================================

REM Create working directory
if not exist pymupdf_build mkdir pymupdf_build
cd pymupdf_build

REM Clone Pyodide repository
if not exist pyodide (
    echo Cloning Pyodide repository...
    git clone https://github.com/pyodide/pyodide.git
    cd pyodide
) else (
    echo Pyodide repository already exists, updating...
    cd pyodide
    git pull
)

REM Create Python virtual environment
echo Creating Python virtual environment...
python -m venv venv_pyodide
call venv_pyodide\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip wheel pyodide-build

REM Clone emsdk repository
if not exist emsdk (
    echo Cloning emsdk repository...
    git clone https://github.com/emscripten-core/emsdk.git
    cd emsdk
) else (
    echo emsdk repository already exists...
    cd emsdk
)

REM Get Pyodide's Emscripten version
for /f "tokens=*" %%a in ('pyodide config get emscripten_version') do set PYODIDE_EMSCRIPTEN_VERSION=%%a
echo Using Emscripten version: %PYODIDE_EMSCRIPTEN_VERSION%

REM Install and activate correct Emscripten version
call emsdk install %PYODIDE_EMSCRIPTEN_VERSION%
call emsdk activate %PYODIDE_EMSCRIPTEN_VERSION%
call emsdk_env.bat

cd ..

REM Create directory for PyMuPDF
if not exist packages mkdir packages
if not exist packages\pymupdf mkdir packages\pymupdf

REM Create meta.yaml file
echo Creating meta.yaml file...
echo package: > packages\pymupdf\meta.yaml
echo   name: pymupdf >> packages\pymupdf\meta.yaml
echo   version: 1.22.5 >> packages\pymupdf\meta.yaml
echo source: >> packages\pymupdf\meta.yaml
echo   url: https://github.com/pymupdf/PyMuPDF/archive/refs/tags/v1.22.5.tar.gz >> packages\pymupdf\meta.yaml
echo   sha256: 9c62a981829b75a5ef4310cd555d14e60d851312750ba2e665912dae2e39ca0b >> packages\pymupdf\meta.yaml
echo build: >> packages\pymupdf\meta.yaml
echo   exports: whole_archive >> packages\pymupdf\meta.yaml
echo   script: | >> packages\pymupdf\meta.yaml
echo     export PYMUPDF_SETUP_FLAVOUR=pb >> packages\pymupdf\meta.yaml
echo     export PYMUPDF_SETUP_MUPDF_BUILD="git:--recursive --depth 1 --shallow-submodules --branch master https://github.com/ArtifexSoftware/mupdf.git" >> packages\pymupdf\meta.yaml
echo     export PYMUPDF_SETUP_MUPDF_BUILD_TESSERACT=0 >> packages\pymupdf\meta.yaml
echo     export PYMUPDF_SETUP_MUPDF_TESSERACT=0 >> packages\pymupdf\meta.yaml
echo     export HAVE_LIBCRYPTO=no >> packages\pymupdf\meta.yaml
echo     export OS=pyodide >> packages\pymupdf\meta.yaml

REM Build the wheel
echo Building PyMuPDF wheel...
set SKIP_EMSCRIPTEN_VERSION_CHECK=1
set EMCC_DEBUG=1
pyodide build packages/pymupdf

REM Copy the wheel to the project's public/wheels directory
echo Copying wheel to public/wheels directory...
if not exist ..\..\public mkdir ..\..\public
if not exist ..\..\public\wheels mkdir ..\..\public\wheels
copy dist\*.whl ..\..\public\wheels\

echo Build complete!
echo Check the public/wheels directory for the PyMuPDF wheel file. 