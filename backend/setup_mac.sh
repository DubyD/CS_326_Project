#!/usr/bin/env bash
# Installs the converter's tools for macOS and Linux.
# Ghidra and a JDK are downloaded into backend/tools/ and run from there;
# nothing is installed system-wide except gcc/python3 if they are missing.
#
# Usage (from the project root):  bash backend/setup_mac_linux.sh
set -euo pipefail

GHIDRA_VERSION="11.2"
GHIDRA_DATE="20240926"
GHIDRA_NAME="ghidra_${GHIDRA_VERSION}_PUBLIC"
GHIDRA_URL="https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_${GHIDRA_VERSION}_build/${GHIDRA_NAME}_${GHIDRA_DATE}.zip"
JDK_MAJOR="21"

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$BACKEND_DIR/tools"
GHIDRA_DIR="$TOOLS_DIR/$GHIDRA_NAME"
JDK_DIR="$TOOLS_DIR/jdk"

case "$(uname -s)" in
  Darwin) OS="mac" ;;
  Linux)  OS="linux" ;;
  *) echo "Unsupported OS: $(uname -s). Use setup_windows.bat on Windows."; exit 1 ;;
esac

case "$(uname -m)" in
  x86_64|amd64)  ARCH="x64" ;;
  arm64|aarch64) ARCH="aarch64" ;;
  *) echo "Unsupported CPU: $(uname -m)"; exit 1 ;;
esac

JDK_URL="https://api.adoptium.net/v3/binary/latest/${JDK_MAJOR}/ga/${OS}/${ARCH}/jdk/hotspot/normal/eclipse"

# Install a missing system package on Debian/Ubuntu (e.g. the dev container).
apt_install() {
  if ! command -v apt-get >/dev/null 2>&1; then
    echo "Please install '$1' with your package manager and re-run this script."
    exit 1
  fi
  local SUDO=""
  if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi
  $SUDO apt-get update -y
  $SUDO apt-get install -y "$@"
}

echo "==> Checking curl and tar"
for cmd in curl tar; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    if [ "$OS" = "linux" ]; then apt_install "$cmd"; else echo "$cmd is required."; exit 1; fi
  fi
done

echo "==> Checking Python 3"
if ! command -v python3 >/dev/null 2>&1; then
  if [ "$OS" = "linux" ]; then
    apt_install python3
  else
    echo "python3 not found. Install the Xcode Command Line Tools (xcode-select --install) and re-run."
    exit 1
  fi
fi

echo "==> Checking C compiler (gcc)"
if [ "$OS" = "mac" ]; then
  if ! xcode-select -p >/dev/null 2>&1; then
    xcode-select --install || true
    echo "Finish the Xcode Command Line Tools install, then re-run this script."
    exit 1
  fi
elif ! command -v gcc >/dev/null 2>&1; then
  apt_install gcc libc6-dev
fi

mkdir -p "$TOOLS_DIR"

echo "==> Installing JDK ${JDK_MAJOR} into backend/tools/jdk"
if [ -x "$JDK_DIR/bin/java" ] || [ -x "$JDK_DIR/Contents/Home/bin/java" ]; then
  echo "    already installed"
else
  rm -rf "$JDK_DIR"
  mkdir -p "$JDK_DIR"
  curl -fL --retry 3 -o "$TOOLS_DIR/jdk.tar.gz" "$JDK_URL"
  tar -xzf "$TOOLS_DIR/jdk.tar.gz" -C "$JDK_DIR" --strip-components=1
  rm -f "$TOOLS_DIR/jdk.tar.gz"
fi

echo "==> Installing Ghidra ${GHIDRA_VERSION} into backend/tools/${GHIDRA_NAME}"
if [ -f "$GHIDRA_DIR/support/analyzeHeadless" ]; then
  echo "    already installed"
else
  rm -rf "$GHIDRA_DIR"
  curl -fL --retry 3 -o "$TOOLS_DIR/ghidra.zip" "$GHIDRA_URL"
  if command -v unzip >/dev/null 2>&1; then
    unzip -q "$TOOLS_DIR/ghidra.zip" -d "$TOOLS_DIR"
  else
    # Python fallback that keeps the executable bits Ghidra needs
    python3 - "$TOOLS_DIR/ghidra.zip" "$TOOLS_DIR" <<'PY'
import os, sys, zipfile
src, dest = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(src) as z:
    for info in z.infolist():
        path = z.extract(info, dest)
        mode = (info.external_attr >> 16) & 0o777
        if mode:
            os.chmod(path, mode)
PY
  fi
  rm -f "$TOOLS_DIR/ghidra.zip"
fi
chmod +x "$GHIDRA_DIR/support/analyzeHeadless" "$GHIDRA_DIR/support/launch.sh"

if [ "$OS" = "mac" ]; then
  # Downloaded binaries are quarantined by Gatekeeper; clear that flag
  xattr -dr com.apple.quarantine "$GHIDRA_DIR" "$JDK_DIR" 2>/dev/null || true
fi

# Ghidra ships prebuilt decompiler binaries for linux_x86_64, mac_x86_64,
# mac_arm_64 and win_x86_64 only.
case "$OS-$ARCH" in
  linux-x64)     NATIVE="linux_x86_64" ;;
  linux-aarch64) NATIVE="linux_arm_64" ;;
  mac-x64)       NATIVE="mac_x86_64" ;;
  mac-aarch64)   NATIVE="mac_arm_64" ;;
esac
if [ ! -x "$GHIDRA_DIR/Ghidra/Features/Decompiler/os/$NATIVE/decompile" ]; then
  echo "WARNING: Ghidra has no prebuilt decompiler for $NATIVE."
  echo "         Use the provided dev container (it runs as linux/amd64) or build"
  echo "         the natives with: $GHIDRA_DIR/support/buildNatives"
fi

echo "==> Checking the local JDK"
if [ -x "$JDK_DIR/Contents/Home/bin/java" ]; then
  "$JDK_DIR/Contents/Home/bin/java" -version
else
  "$JDK_DIR/bin/java" -version
fi

echo "==> Done. Start the app from the project root with: npm start"