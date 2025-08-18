# Upload Exercise GIFs to Supabase

## Files to Upload

1. **Incline Dumbbell Press**
   - Local: `c:\Users\PW1234\Downloads\인클라인 덤벨 프레스.gif`
   - Supabase Path: `exercise-gifs/pectorals/incline-dumbbell-press.gif`
   - URL: `https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/pectorals/incline-dumbbell-press.gif`

2. **Machine Bench Press**
   - Local: `c:\Users\PW1234\Downloads\머신 벤치 프레스.gif`
   - Supabase Path: `exercise-gifs/pectorals/machine-bench-press.gif`
   - URL: `https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/pectorals/machine-bench-press.gif`

## Upload Process

### Using Supabase Dashboard
1. Go to Supabase Dashboard → Storage
2. Navigate to `exercise-gifs/pectorals/` folder
3. Upload both GIF files with the correct names

### Using Supabase CLI
```bash
supabase storage upload exercise-gifs/pectorals/incline-dumbbell-press.gif /path/to/incline-dumbbell-press.gif
supabase storage upload exercise-gifs/pectorals/machine-bench-press.gif /path/to/machine-bench-press.gif
```

### Using JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function uploadGifs() {
  // Upload Incline Dumbbell Press
  const inclineFile = // ... load file
  const { data: inclineData, error: inclineError } = await supabase.storage
    .from('exercise-gifs')
    .upload('pectorals/incline-dumbbell-press.gif', inclineFile);

  // Upload Machine Bench Press
  const machineFile = // ... load file
  const { data: machineData, error: machineError } = await supabase.storage
    .from('exercise-gifs')
    .upload('pectorals/machine-bench-press.gif', machineFile);
}
```

## Verification
After upload, verify the GIFs are accessible at:
- https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/pectorals/incline-dumbbell-press.gif
- https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/pectorals/machine-bench-press.gif