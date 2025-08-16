# Supabase Storage Setup Instructions

## The Issue
The uploads are failing with "new row violates row-level security policy" error. This means the storage bucket has RLS (Row Level Security) enabled but no policies are set up.

## Solution Options

### Option 1: Disable RLS (Easiest for public files)
1. Go to your Supabase Dashboard
2. Navigate to Storage → exercise-gifs bucket
3. Click on the bucket settings (⚙️ icon)
4. Toggle OFF "Enable Row Level Security"
5. Save changes

### Option 2: Create Storage Policies
If you want to keep RLS enabled, create these policies:

1. Go to Storage → Policies
2. Create a new policy for the exercise-gifs bucket:

**Allow public read access:**
```sql
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'exercise-gifs');
```

**Allow anonymous uploads (for development):**
```sql
CREATE POLICY "Allow anonymous uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'exercise-gifs');
```

### Option 3: Use Service Role Key (Not recommended for client-side)
The service role key bypasses RLS but should only be used server-side.

## Recommended Approach
Since these are public exercise GIFs, **Option 1 (Disable RLS)** is the simplest and most appropriate solution.

## After Setup
Once you've disabled RLS or created the policies, run the upload script again:
```bash
node scripts/uploadToSupabaseSDK.js
```