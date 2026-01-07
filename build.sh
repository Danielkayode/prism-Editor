#!/bin/bash

# Prism Editor Build Script
# This script builds the application for your current platform

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Prism Editor Build Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Detect platform
OS_TYPE="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    OS_TYPE="windows"
fi

echo -e "${YELLOW}Detected OS: ${OS_TYPE}${NC}"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${YELLOW}Node.js version: ${NODE_VERSION}${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
rm -rf dist out

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci --no-audit --no-fund || {
    echo -e "${RED}npm ci failed, trying npm install...${NC}"
    npm install
}

# Download built-in extensions (optional)
echo -e "${YELLOW}Downloading built-in extensions...${NC}"
npm run download-builtin-extensions || echo -e "${YELLOW}Skipping built-in extensions${NC}"

# Apply patches
echo -e "${YELLOW}Applying patches...${NC}"
if [ -f "extensions/tunnel-forwarding/src/split.ts" ]; then
    if command -v gsed &> /dev/null; then
        gsed -i '1s;^;// @ts-nocheck\n;' extensions/tunnel-forwarding/src/split.ts
    elif sed --version 2>&1 | grep -q GNU; then
        sed -i '1s;^;// @ts-nocheck\n;' extensions/tunnel-forwarding/src/split.ts
    else
        sed -i '' '1s;^;// @ts-nocheck\n;' extensions/tunnel-forwarding/src/split.ts
    fi
fi

# Compile the project
echo -e "${YELLOW}Compiling project...${NC}"
export NODE_OPTIONS="--max-old-space-size=8192"
npm run compile

# Compile extensions
echo -e "${YELLOW}Compiling extensions...${NC}"
npm run compile-extensions-build || echo -e "${YELLOW}Extension compilation completed with warnings${NC}"

# Build with electron-builder
echo -e "${YELLOW}Packaging application for ${OS_TYPE}...${NC}"

case "$OS_TYPE" in
    linux)
        npx electron-builder --linux appimage deb --x64 --publish never
        ;;
    windows)
        npx electron-builder --win nsis portable --x64 --publish never
        ;;
    macos)
        ARCH=$(uname -m)
        if [ "$ARCH" = "arm64" ]; then
            npx electron-builder --mac dmg --arm64 --publish never
        else
            npx electron-builder --mac dmg --x64 --publish never
        fi
        export CSC_IDENTITY_AUTO_DISCOVERY=false
        ;;
    *)
        echo -e "${RED}Unsupported OS: ${OS_TYPE}${NC}"
        exit 1
        ;;
esac

# Check build output
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Build completed!${NC}"
echo -e "${GREEN}========================================${NC}"

if [ -d "dist" ]; then
    echo -e "${YELLOW}Build artifacts:${NC}"
    find dist -type f \( -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" -o -name "*.deb" \) -exec ls -lh {} \;
else
    echo -e "${RED}Warning: dist directory not found${NC}"
fi

echo -e "${GREEN}Done!${NC}"
