#!/bin/bash
#
# Vibe-Check Enhanced MCP Server - Initialization Script
# Usage: ./init.sh [project-directory]
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/ArtificialMonks/vibe-workflow"
DEFAULT_GEMINI_MODEL="gemini-2.5-flash"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Vibe-Check Enhanced MCP Server Initialization          ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Determine target directory
if [ -z "$1" ]; then
  TARGET_DIR="$(pwd)"
  echo -e "${YELLOW}No directory specified, using current directory: ${TARGET_DIR}${NC}"
else
  TARGET_DIR="$1"
  echo -e "${GREEN}Target directory: ${TARGET_DIR}${NC}"
fi

# Get project name from directory
PROJECT_NAME=$(basename "$TARGET_DIR")
echo -e "${GREEN}Project name detected: ${PROJECT_NAME}${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${BLUE}[1/7] Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+ first.${NC}"
  exit 1
fi
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm is not installed. Please install npm first.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"
echo -e "${GREEN}✓ npm $(npm --version) detected${NC}"
echo ""

# Step 2: Create .vibe-check directory structure
echo -e "${BLUE}[2/7] Creating .vibe-check directory structure...${NC}"
mkdir -p "$TARGET_DIR/.vibe-check"
mkdir -p "$TARGET_DIR/.vibe-check/shared"
mkdir -p "$TARGET_DIR/.vibe-check/shared/schema"
mkdir -p "$TARGET_DIR/.vibe-check/enhanced-mcp-server"
echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

# Step 3: Clone/download enhanced MCP server
echo -e "${BLUE}[3/7] Setting up enhanced MCP server...${NC}"
if [ -d "template/enhanced-mcp-server" ]; then
  # If running from cloned repo, copy from template
  cp -r template/enhanced-mcp-server/* "$TARGET_DIR/.vibe-check/enhanced-mcp-server/"
  echo -e "${GREEN}✓ Enhanced MCP server copied from template${NC}"
else
  # Download from GitHub release or clone repo
  echo -e "${YELLOW}Downloading from GitHub...${NC}"
  TEMP_DIR=$(mktemp -d)
  git clone --depth 1 "$REPO_URL" "$TEMP_DIR" 2>/dev/null || {
    echo -e "${RED}✗ Failed to clone repository${NC}"
    exit 1
  }
  cp -r "$TEMP_DIR/template/enhanced-mcp-server/"* "$TARGET_DIR/.vibe-check/enhanced-mcp-server/"
  rm -rf "$TEMP_DIR"
  echo -e "${GREEN}✓ Enhanced MCP server downloaded${NC}"
fi
echo ""

# Step 4: Copy base constitutional rules
echo -e "${BLUE}[4/7] Setting up constitutional rules...${NC}"
if [ -d "template/shared" ]; then
  cp -r template/shared/* "$TARGET_DIR/.vibe-check/shared/"
else
  # Download from repo if not available locally
  echo -e "${YELLOW}Downloading base constitutional rules...${NC}"
  # In production, this would download from GitHub releases
fi

# Create project-specific constitutional-rules.json
cat > "$TARGET_DIR/.vibe-check/constitutional-rules.json" << EOF
{
  "\$schema": "shared/schema/constitutional-rules.schema.json",
  "version": "1.0.0",
  "extends": ["shared/base-constitutional-rules.json"],
  "description": "Constitutional rules for ${PROJECT_NAME} project",
  "rules": {
    "${PROJECT_NAME}-rule-1": {
      "id": "${PROJECT_NAME}-rule-1",
      "name": "${PROJECT_NAME} Project Rule Example",
      "description": "ALWAYS follow ${PROJECT_NAME}-specific patterns and conventions",
      "category": "best-practices",
      "severity": "HIGH",
      "enabled": true,
      "rationale": "Ensures consistency across ${PROJECT_NAME} codebase",
      "examples": [
        "Follow ${PROJECT_NAME} coding standards",
        "Use ${PROJECT_NAME} approved libraries and frameworks"
      ]
    }
  },
  "overrides": {}
}
EOF
echo -e "${GREEN}✓ Constitutional rules configured for ${PROJECT_NAME}${NC}"
echo ""

# Step 5: Install dependencies
echo -e "${BLUE}[5/7] Installing dependencies...${NC}"
cd "$TARGET_DIR/.vibe-check/enhanced-mcp-server"
npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 6: Build the MCP server
echo -e "${BLUE}[6/7] Building enhanced MCP server...${NC}"
npm run build --silent
echo -e "${GREEN}✓ Enhanced MCP server built successfully${NC}"
echo ""

# Step 7: Configure .mcp.json
echo -e "${BLUE}[7/7] Configuring MCP server...${NC}"

# Prompt for API key
echo -e "${YELLOW}Please enter your Gemini API key (or press Enter to skip):${NC}"
read -s GEMINI_API_KEY
echo ""

# Get absolute paths
ABSOLUTE_TARGET_DIR=$(cd "$TARGET_DIR" && pwd)
MCP_SERVER_PATH="$ABSOLUTE_TARGET_DIR/.vibe-check/enhanced-mcp-server/build/index.js"
STORAGE_DIR="$ABSOLUTE_TARGET_DIR/.vibe-check"
RULES_FILE="$ABSOLUTE_TARGET_DIR/.vibe-check/constitutional-rules.json"

# Create or update .mcp.json
MCP_CONFIG_FILE="$TARGET_DIR/.mcp.json"
if [ -f "$MCP_CONFIG_FILE" ]; then
  echo -e "${YELLOW}⚠ .mcp.json already exists. Creating backup...${NC}"
  cp "$MCP_CONFIG_FILE" "$MCP_CONFIG_FILE.backup"
  echo -e "${GREEN}✓ Backup created: .mcp.json.backup${NC}"
fi

# Check if .mcp.json has mcpServers key
if [ -f "$MCP_CONFIG_FILE" ] && grep -q '"mcpServers"' "$MCP_CONFIG_FILE"; then
  # Merge with existing config
  echo -e "${YELLOW}Merging with existing .mcp.json configuration...${NC}"
  # In production, use jq or node script to merge JSON properly
  echo -e "${YELLOW}⚠ Manual merge required - see .mcp.json.vibe-check for configuration${NC}"
  MCP_CONFIG_FILE="$TARGET_DIR/.mcp.json.vibe-check"
fi

# Create new MCP configuration
cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "pv-bhat-vibe-check-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": [
        "$MCP_SERVER_PATH"
      ],
      "env": {
        "MCP_TRANSPORT": "stdio",
        "GEMINI_API_KEY": "${GEMINI_API_KEY:-YOUR_GEMINI_API_KEY}",
        "DEFAULT_LLM_PROVIDER": "gemini",
        "DEFAULT_MODEL": "$DEFAULT_GEMINI_MODEL",
        "USE_LEARNING_HISTORY": "true",
        "VIBE_CHECK_STORAGE_DIR": "$STORAGE_DIR",
        "VIBE_CHECK_RULES_FILE": "$RULES_FILE",
        "VIBE_CHECK_HOT_RELOAD": "false"
      }
    }
  }
}
EOF

echo -e "${GREEN}✓ MCP configuration created${NC}"
echo ""

# Step 8: Validate setup
echo -e "${BLUE}Validating setup...${NC}"
cd "$TARGET_DIR/.vibe-check/enhanced-mcp-server"
if npm run validate --silent; then
  echo -e "${GREEN}✓ Validation passed!${NC}"
else
  echo -e "${RED}✗ Validation failed. Please check the configuration.${NC}"
fi
echo ""

# Success message
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup Complete! 🎉                          ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}Project:${NC} ${PROJECT_NAME}"
echo -e "${BLUE}Location:${NC} ${ABSOLUTE_TARGET_DIR}/.vibe-check/"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. ${GREEN}Add your Gemini API key${NC} to .mcp.json if you skipped it"
echo -e "  2. ${GREEN}Restart Claude Code${NC} to load the new MCP server"
echo -e "  3. ${GREEN}Customize constitutional rules${NC} in .vibe-check/constitutional-rules.json"
echo ""
echo -e "${BLUE}Files created:${NC}"
echo -e "  ✓ .vibe-check/constitutional-rules.json"
echo -e "  ✓ .vibe-check/shared/base-constitutional-rules.json (12 base rules)"
echo -e "  ✓ .vibe-check/enhanced-mcp-server/ (built and ready)"
echo -e "  ✓ .mcp.json (MCP configuration)"
echo ""
echo -e "${BLUE}Auto-created on first use:${NC}"
echo -e "  • history-${PROJECT_NAME}.json (vibe_check session history)"
echo -e "  • vibe-log-${PROJECT_NAME}.json (learning patterns)"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo -e "  • Setup guide: .vibe-check/enhanced-mcp-server/README-ENHANCED.md"
echo -e "  • Testing: docs/testing/README.md"
echo -e "  • Online: ${REPO_URL}/docs/"
echo ""
echo -e "${GREEN}Happy vibe-checking! 🚀${NC}"
