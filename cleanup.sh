#!/bin/bash
echo "Cleaning up temporary files..."

# Remove backup files
rm -f claude-config-backup.json
rm -f open_config.bat
rm -f create_mcp_servers.sh
rm -f /tmp/add_mcp_servers.sh
rm -f /tmp/open_config.bat

# Build taskmaster server
echo "Building taskmaster server..."
cd mcp-servers/taskmaster
npm install
npm run build

# Build context7 server  
echo "Building context7 server..."
cd ../context7
npm install
npm run build

echo "Cleanup complete!"