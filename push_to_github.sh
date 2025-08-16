#!/bin/bash

# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
# Replace REPO_NAME with your repository name

echo "Enter your GitHub username:"
read GITHUB_USERNAME

echo "Enter your repository name (e.g., korean-fitness-app):"
read REPO_NAME

# Add remote origin
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Push to GitHub
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"