#!/bin/bash

echo "Pushing to GitHub repository: dan914-ai/korean-fitness-app"
echo ""
echo "GitHub will ask for your username and password/token."
echo "For password, use a Personal Access Token (PAT) from:"
echo "https://github.com/settings/tokens"
echo ""

# Push to GitHub
git push -u origin main

echo ""
echo "✅ If successful, your repository is now at:"
echo "https://github.com/dan914-ai/korean-fitness-app"