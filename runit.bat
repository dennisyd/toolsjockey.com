   # Create the Docker-specific script
   @"
   #!/bin/bash
   set -e
   cd /build
   
   # Clone Pyodide repository if needed
   if [ ! -d "pyodide" ]; then
     git clone https://github.com/pyodide/pyodide.git
     cd pyodide
   else
     cd pyodide
     git pull
   fi
   
   # Create package definition
   mkdir -p packages/pymupdf
   cat > packages/pymupdf/meta.yaml << EOL
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
   EOL
   
   # Create the patch file (shortened for readability)
   cat > packages/pymupdf/config.patch << EOL
   --- a/setup.py
   +++ b/setup.py
   @@ -19,53 +19,14 @@ INSTALLATION
    ------------------------------------------------------------------------------
    """
    
   -import os, sys, re, glob, subprocess
   +import os, sys, re, glob
    import setuptools
    from setuptools import setup, Extension, Command
    from setuptools.command.build_ext import build_ext
   -from distutils.command.clean import clean
    
   -# check the platform
   -if sys.platform.startswith("linux"):
   -    PLATFORM = "linux"
   -elif sys.platform.startswith("darwin"):
   -    PLATFORM = "darwin"
   -elif sys.platform.startswith("win"):
   -    PLATFORM = "win"
   -else:
   -    PLATFORM = None
   -
   -# enable teaser if you wish
   -ENABLE_TEASER = True
   -
   -PYTEST_FOUND = "pytest not installed" # assume this first
   -# can we use pytest or do we need pytest-runner?
   -try:
   -    import pytest
   -    PYTEST_FOUND = "pytest installed"
   -except ImportError:
   -    pass
   -
   -
   -needs_pytest = {"pytest", "test", "ptr"}.intersection(sys.argv)
   -pytest_runner = ["pytest-runner"] if needs_pytest else []
   -
   -
   -# decide if we run on Read the Docs
   -on_rtd = os.environ.get("READTHEDOCS", "False") == "True"
   -
   -
   -if on_rtd:  # we are on RTD
   -    buildpdf = False  # skip PDF generation on RTD servers
   -else:
   -    buildpdf = False  # standard is False to accelerate CI activities
   +PLATFORM = "emscripten"
   +buildpdf = False
    
   -
   -if sys.version_info[0:2] < (3, 6):
   -    sys.stderr.write("Python %d.%d is not supported.\n" % sys.version_info[0:2])
   -    sys.stderr.write("Use version Python 3.6 or later.\n")
   -    sys.exit(1)
   -
   -
    # location of PyMuPDF/fitz source
   EOL
   
   # Build the wheel
   make clean
   PYODIDE_PACKAGES="pymupdf" make
   
   # Copy the wheel to output
   mkdir -p /output
   cp dist/pymupdf-*.whl /output/
   "@ | Out-File -Encoding utf8 scripts/build_pymupdf_wheel_docker.sh