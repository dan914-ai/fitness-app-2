# 🚀 Supabase GIF Upload Instructions

## Current Status
- ✅ 97 GIFs copied to local project folders
- ✅ Upload scripts created
- ✅ Storage bucket "exercise-gifs" created
- ❌ Uploads blocked by Row Level Security (RLS)

## Quick Fix - Disable RLS (Recommended)

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/ayttqsgttuvdhvbvbnsk/storage/buckets

2. **Click on "exercise-gifs" bucket**

3. **Click Settings (⚙️ icon)**

4. **Toggle OFF "Enable Row Level Security"**

5. **Save changes**

## After Disabling RLS

Run one of these commands:

### Option 1: Node.js Script (Recommended)
```bash
cd /mnt/c/Users/danny/.vscode/new\ finess\ app/mobile
node scripts/uploadToSupabaseSDK.js
```

### Option 2: Shell Script
```bash
cd /mnt/c/Users/danny/.vscode/new\ finess\ app/mobile
./scripts/upload-to-supabase.sh
```

### Option 3: Manual Upload
1. Go to Storage in Supabase Dashboard
2. Click on exercise-gifs bucket
3. Use the file list in `scripts/upload-list.txt`
4. Drag and drop files or use the upload button

## Files Ready for Upload

### By Category:
- **Shoulders**: 11 GIFs
- **Arms**: 36 GIFs (Tricep + Bicep)
- **Legs**: 46 GIFs (Legs + Glutes + Calf)
- **Cardio**: 4 GIFs
- **Total**: 97 GIFs

### File Locations:
- Arms: `/assets/exercise-gifs/arms/`
- Shoulders: `/assets/exercise-gifs/shoulders/`
- Legs: `/assets/exercise-gifs/legs/`
- Cardio: `/assets/exercise-gifs/cardio/`

## Verification

After successful upload, verify with:
```bash
node scripts/verify-uploads.js
```

Or check a sample URL:
```
https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_rear_delt_raise.gif
```

## Alternative: Keep RLS Enabled

If you prefer to keep RLS enabled, run these SQL commands in Supabase SQL Editor:

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'exercise-gifs');

-- Allow anonymous inserts (temporary for upload)
CREATE POLICY "Allow anonymous uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'exercise-gifs');

-- Allow anonymous updates (for upsert)
CREATE POLICY "Allow anonymous updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'exercise-gifs')
WITH CHECK (bucket_id = 'exercise-gifs');
```

## Summary
1. Disable RLS on the exercise-gifs bucket (easiest)
2. Run the upload script
3. Verify uploads
4. The database is already configured with the correct URLs

All the hard work is done - you just need to disable RLS and run the upload!