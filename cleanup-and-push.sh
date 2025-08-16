#!/bin/bash

# 1. Create a new clean branch
git checkout -b clean-main

# 2. Remove all large files from tracking
git rm -r --cached backend/node_modules mobile/node_modules 2>/dev/null
git rm --cached fitness-app-backup.tar.gz 2>/dev/null
git rm --cached backend/supabase.tar.gz 2>/dev/null
git rm --cached backend/supabase.exe 2>/dev/null
git rm --cached mobile/critical-fixes*.patch 2>/dev/null

# 3. Update gitignore
cat >> .gitignore << 'GITIGNORE'

# Large files and directories
node_modules/
*.tar.gz
*.exe
*.dll
*.so
.prisma/
prisma/engines/
*.patch
GITIGNORE

# 4. Commit the cleanup
git add .gitignore
git commit -m "Clean repository: Remove large files and update gitignore"

# 5. Create a fresh repository state
echo "Repository cleaned! Now you can:"
echo "1. Push this clean branch: git push origin clean-main"
echo "2. Or create a completely new repo and push there"
