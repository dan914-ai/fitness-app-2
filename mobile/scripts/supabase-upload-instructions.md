# Supabase Upload Instructions

## Summary
- **Total GIFs to upload**: 97
- **Categories**: 
  - Shoulders: 11 GIFs
  - Arms: 36 GIFs (Tricep + Bicep)
  - Legs: 46 GIFs (Legs + Glutes + Calf)
  - Cardio: 4 GIFs

## Upload Methods

### Method 1: Using Supabase CLI (Recommended)
1. Install Supabase CLI if not already installed
2. Authenticate with your Supabase project
3. Run the upload script:
   ```bash
   cd /mnt/c/Users/danny/.vscode/new\ finess\ app/mobile/scripts
   ./upload-to-supabase.sh
   ```

### Method 2: Manual Upload via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Storage → exercise-gifs bucket
3. Use the file list in `upload-list.txt` as reference
4. Upload each file with the corresponding English filename

### Method 3: Using the generated list
The `upload-list.txt` file contains a tab-separated list of:
- English filename (to use in Supabase)
- Full local path (source file)

## Important Notes
1. All files should be uploaded to the `exercise-gifs` bucket
2. Files should be public (already configured in bucket settings)
3. The database already contains the Supabase URLs for all exercises
4. After upload, you can verify using the `verify-uploads.js` script

## Verification
After uploading, run:
```bash
node verify-uploads.js
```

This will check if all URLs are accessible and return ✅ or ❌ for each file.

## Database Integration
The exercise database has already been prepared with:
- Korean names for all exercises
- Proper category assignments
- Supabase URLs pointing to the uploaded files

No further database updates are needed after the upload is complete.