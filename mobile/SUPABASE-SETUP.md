# Supabase Setup Guide for Exercise GIFs

This guide explains how to set up Supabase for storing and managing exercise GIFs in the Korean fitness app.

## Prerequisites

1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Configuration Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Update Environment Variables

Update the `.env` file in the mobile directory:

```bash
# Replace these values with your actual Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 3. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create Bucket**
3. Name the bucket: `exercise-gifs`
4. Set it to **Public** (so the app can access GIF URLs)
5. Click **Create bucket**

### 4. Configure Bucket Policies (Optional)

For production, you may want to set up Row Level Security policies:

```sql
-- Allow public read access to exercise-gifs bucket
CREATE POLICY "Public read access for exercise gifs" ON storage.objects
FOR SELECT USING (bucket_id = 'exercise-gifs');

-- Allow uploads (you can restrict this further if needed)
CREATE POLICY "Upload exercise gifs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'exercise-gifs');
```

## Usage

### Download All Exercise GIFs

After configuring Supabase, run the bulk download:

```bash
npm run download-gifs
```

This will:
- Download all 213 exercise GIFs from their source URLs
- Upload them to your Supabase storage bucket
- Process them in batches of 5 to avoid overwhelming servers

### Verify Downloads

Check if all GIFs were successfully downloaded:

```bash
npm run verify-gifs
```

### Check Storage Statistics

View how many files and total size:

```bash
npm run gif-stats
```

## Expected Results

- **213 exercise GIFs** will be downloaded and stored in Supabase
- Total storage size: ~50-100MB (estimated)
- Each GIF will be accessible via public URLs
- GIFs will be cached for 24 hours for better performance

## Troubleshooting

### Common Issues

1. **"Failed to download GIF"** - Some source URLs may be broken or moved
2. **"Upload failed"** - Check your Supabase credentials and bucket permissions
3. **"Bucket not found"** - Make sure you created the `exercise-gifs` bucket

### Rate Limiting

The download script includes:
- Batch processing (5 GIFs at a time)
- 1-second delays between batches
- Automatic retry logic
- Duplicate download prevention

### Storage Limits

Supabase free tier includes:
- 1GB storage
- 2GB bandwidth per month
- Unlimited API requests

This should be sufficient for the exercise GIFs.

## Next Steps

After successful GIF download:
1. Update exercise database to reference Supabase URLs
2. Implement GIF loading in exercise detail screens
3. Generate thumbnails for list views
4. Set up image optimization if needed