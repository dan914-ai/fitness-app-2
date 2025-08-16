
# Pre-Implementation Checklist

## Before Running GIF Implementation:

### 1. Backup Status
- [ ] Database backup created
- [ ] Git commit created  
- [ ] Can rollback if needed

### 2. File System
- [ ] Asset directories exist
- [ ] Write permissions verified
- [ ] Enough disk space

### 3. Korean Filename Handling  
- [ ] Terminal supports UTF-8
- [ ] File system supports Korean characters
- [ ] Git configured for UTF-8

### 4. Dependencies
- [ ] Node.js working properly
- [ ] All npm packages installed
- [ ] No conflicting processes

### 5. Testing Plan
- [ ] Test with 1-2 exercises first
- [ ] Verify app still loads
- [ ] Check GIF display works

## Common Issues to Avoid:

1. **Encoding Issues**
   - Use UTF-8 for all operations
   - Avoid special characters in paths

2. **Path Issues**
   - Always use forward slashes (/)
   - Use relative paths in database
   - Use absolute paths for file operations

3. **Database Corruption**
   - Never edit database while app is running
   - Always create backups
   - Validate JSON syntax

4. **GIF File Issues**
   - Verify files aren't corrupted
   - Check file sizes (not too large)
   - Ensure proper file extensions

## Safe Implementation Commands:

```bash
# 1. Create backup
cp src/data/exerciseDatabase.ts src/data/exerciseDatabase.backup-manual.ts

# 2. Test with one file first
node scripts/testSingleGifUpdate.js

# 3. Run full implementation
node scripts/runSafeGifImplementation.js

# 4. If issues occur, rollback
node scripts/rollbackDatabase.js
```
