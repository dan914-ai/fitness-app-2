# Supabase Bucket Policies Setup

The upload is failing due to Row Level Security (RLS) policies. You need to configure the bucket to allow anonymous uploads.

## Fix the Bucket Policies

### Option 1: Disable RLS (Simplest)
1. Go to your Supabase dashboard
2. Click **SQL Editor** in sidebar
3. Run this SQL:

```sql
-- Allow public uploads to exercise-gifs bucket
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'exercise-gifs');

-- Allow public reads from exercise-gifs bucket
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (bucket_id = 'exercise-gifs');
```

### Option 2: Update Bucket Settings (Recommended)
1. Go to **Storage** → **exercise-gifs** bucket
2. Click **Configuration** 
3. Set these policies:
   - **Public**: ✅ Enabled
   - **File uploads**: ✅ Allow anonymous uploads
   - **File downloads**: ✅ Allow anonymous downloads

### Option 3: Use Service Role Key (For Bulk Operations)
If the above doesn't work, you can temporarily use the service role key for bulk uploads:

1. Get your **service_role** key from Settings → API
2. Replace the anon key temporarily:

```bash
# In .env - ONLY for bulk upload, then change back
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-service-role-key-here
```

⚠️ **Warning**: Service role key has full access - only use for bulk uploads, then switch back!

## Test After Changes

Run this to test:
```bash
node scripts/testUpload.mjs
```

Should see:
```
✅ Upload successful!
📁 File path: test-barbell-squat.gif
🌐 Public URL: https://your-project.supabase.co/storage/v1/object/public/exercise-gifs/test-barbell-squat.gif
📊 URL status: 200 OK
```

## Once Working

After policies are fixed, we can bulk download all 213 exercise GIFs:

```bash
node scripts/bulkDownload.mjs
```