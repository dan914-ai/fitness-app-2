# Steps to Create a Clean Repository

## 1. Create a new GitHub repository
Go to GitHub and create a new repository (e.g., "fitness-app-clean")

## 2. Prepare your local files
```bash
# Remove all large files and directories that shouldn't be in Git
rm -rf backend/node_modules
rm -rf mobile/node_modules
rm -f fitness-app-backup.tar.gz
rm -f backend/supabase.tar.gz
rm -f backend/supabase.exe
rm -f mobile/*.patch
```

## 3. Initialize a new Git repository
```bash
cd /mnt/c/Users/PW1234/.vscode/new\ finess\ app
rm -rf .git  # Remove old Git history
git init     # Start fresh
git add .
git commit -m "Initial commit - Clean repository"
```

## 4. Push to new repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/fitness-app-clean.git
git branch -M main
git push -u origin main
```

## Important files to keep:
- All source code (*.js, *.ts, *.tsx, *.jsx)
- Configuration files (package.json, tsconfig.json, etc.)
- Assets (images, icons) - but consider using Git LFS for large ones
- Documentation files

## Files to exclude (add to .gitignore):
- node_modules/
- .expo/
- dist/
- build/
- *.log
- .env
- *.tar.gz
- *.exe
- *.patch
