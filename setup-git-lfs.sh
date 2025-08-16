#!/bin/bash

echo "Setting up Git LFS for large files..."

# 1. Install Git LFS (if not already installed)
# On Windows: Download from https://git-lfs.github.com/
# On Ubuntu/WSL: sudo apt-get install git-lfs

# 2. Initialize Git LFS
git lfs install

# 3. Track GIF files with LFS
git lfs track "*.gif"
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track "*.avi"

# 4. Add .gitattributes
git add .gitattributes
git commit -m "Configure Git LFS for media files"

# 5. Migrate existing GIF files to LFS
git lfs migrate import --include="*.gif" --everything

echo "Git LFS setup complete!"
echo "Now you can push to GitHub with:"
echo "git remote add origin https://github.com/YOUR_USERNAME/fitness-app.git"
echo "git push -u origin main"
