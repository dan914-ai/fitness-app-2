# Setting Up Supabase Exercise GIFs Bucket

The app can't display GIFs because the Supabase bucket doesn't exist yet. Follow these steps:

## 1. Create the Bucket

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets
2. Click **"New bucket"**
3. Enter these settings:
   - **Name**: `exercise-gifs`
   - **Public bucket**: ✅ Enable this (IMPORTANT!)
   - **Allowed MIME types**: `image/gif` (or leave empty to allow all)
   - **File size limit**: 10MB (or 10485760 bytes)
4. Click **Create**

## 2. Upload Exercise GIFs

After creating the bucket, you have two options:

### Option A: Manual Upload (Quick Test)
1. Go to the bucket in Supabase dashboard
2. Upload a few test GIFs with names like:
   - `barbell-bench-press.gif`
   - `squat.gif`
   - `deadlift.gif`

### Option B: Bulk Upload Script (Recommended)
I've already prepared the GIF download service. Once the bucket exists, run this in the mobile app:

```javascript
// In your app, this will download GIFs from InspireUSA and upload to Supabase
import { gifService } from './src/services/gif.service';
import EXERCISE_DATABASE from './src/data/exerciseDatabase';

// Get exercises with GIF URLs
const exercisesWithGifs = EXERCISE_DATABASE
  .filter(e => e.media?.gifUrl && !e.media?.gifUnavailable)
  .map(e => ({ id: e.id, gifUrl: e.media.gifUrl }));

// Download and upload to Supabase
await gifService.bulkDownloadGifs(exercisesWithGifs);
```

## 3. Verify Setup

After creating the bucket, test if it's working:

```bash
# This should return 404 (not found) instead of 400 (bad request)
curl -I "https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/test.gif"
```

## Current Status
- ✅ Supabase credentials configured in .env
- ✅ Exercise database with 230+ exercises
- ✅ GIF service ready to download/upload
- ❌ Bucket needs to be created
- ❌ GIFs need to be uploaded

Once you create the bucket, the app will automatically start showing GIFs!