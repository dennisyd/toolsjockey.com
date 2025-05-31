inputs_sdist=0 \
inputs_PYMUPDF_SETUP_MUPDF_BUILD="git:--recursive --depth 1 --shallow-submodules --branch master https://github.com/ArtifexSoftware/mupdf.git" \
inputs_wheels_default=0 \
inputs_wheels_linux_pyodide=1 \
./scripts/gh_release.py build
