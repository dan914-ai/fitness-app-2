#!/bin/bash

echo "Enter your GitHub Personal Access Token:"
echo "(Get one from: https://github.com/settings/tokens)"
read -s GITHUB_TOKEN

echo ""
echo "Pushing to repository..."

git push https://dan914-ai:$GITHUB_TOKEN@github.com/dan914-ai/korean-fitness-app.git main

echo ""
echo "✅ Done! Check your repository at:"
echo "https://github.com/dan914-ai/korean-fitness-app"