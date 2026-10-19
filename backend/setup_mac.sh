#!/usr/bin/env bash
set -e

GHIDRA_VERSION="11.2"
GHIDRA_DATE="20240926"
GHIDRA_DIR="ghidra_${GHIDRA_VERSION}_PUBLIC"
GHIDRA_URL="https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_${GHIDRA_VERSION}_build/${GHIDRA_DIR}_${GHIDRA_DATE}.zip"
TOOLS_DIR="$(cd "$(dirname "$0")" && pwd)/tools"

echo "==> Checking Homebrew"
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew not found. Install it from https://brew.sh and re-run."
  exit 1
fi

echo "==> Checking C compiler (gcc/clang)"
if ! command -v gcc >/dev/null 2>&1; then
  xcode-select --install || true
  echo "Finish the Xcode Command Line Tools install, then re-run this script."
  exit 1
fi

echo "==> Installing JDK 21"
if ! java -version 2>&1 | grep -q '"2[1-9]'; then
  brew install openjdk@21
  sudo ln -sfn "$(brew --prefix openjdk@21)/libexec/openjdk.jdk" /Library/Java/JavaVirtualMachines/openjdk-21.jdk
fi

echo "==> Installing Ghidra ${GHIDRA_VERSION}"
mkdir -p "$TOOLS_DIR"
if [ ! -d "$TOOLS_DIR/$GHIDRA_DIR" ]; then
  curl -L -o /tmp/ghidra.zip "$GHIDRA_URL"
  unzip -q /tmp/ghidra.zip -d "$TOOLS_DIR"
  rm /tmp/ghidra.zip
fi
chmod +x "$TOOLS_DIR/$GHIDRA_DIR/support/analyzeHeadless"
xattr -dr com.apple.quarantine "$TOOLS_DIR/$GHIDRA_DIR" 2>/dev/null || true

echo "==> Done. Run: python3 converter.py"