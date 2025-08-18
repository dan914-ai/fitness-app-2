# Fix Supabase GIF Organization

## Problem
GIF files are at the root level but database expects them in folders.

## Files to Move

Based on your screenshot, these files need to be moved:

### Move to `/abdominals/` folder:
- alternate-heel-touches.gif

### Move to `/deltoids/` folder:
- arnold-press.gif

### Move to `/triceps/` folder:
- assisted_tricep_dips.gif

### Move to `/back/` folder:
- assisted-pull-ups.gif
- band-pull-apart.gif
- banded-face-pull.gif

### Move to `/pectorals/` folder:
- barbell_bench_press.gif

### Move to `/biceps/` folder:
- barbell_bicep_curl.gif

### Move to `/quadriceps/` folder:
- barbell_bulgarian_split_[...].gif
- barbell_front_squat.gif

### Move to `/glutes/` folder:
- barbell_good_morning.gif

## How to Fix in Supabase Dashboard

1. Go to Supabase Dashboard → Storage → exercise-gifs
2. For each file at root level:
   - Click the file's menu (3 dots)
   - Select "Move"
   - Enter the destination path (e.g., `abdominals/alternate-heel-touches.gif`)
   - Click Move

## Alternative: Update Database URLs

If moving files is difficult, you could update the database to use root-level paths:

```typescript
// Change from:
"imageUrl": "https://[...]/exercise-gifs/abdominals/alternate-heel-touches.gif"
// To:
"imageUrl": "https://[...]/exercise-gifs/alternate-heel-touches.gif"
```

But moving files to folders is the better solution for organization.

## For New Uploads

When uploading the new GIFs:
- `인클라인 덤벨 프레스.gif` → Upload to `/pectorals/incline-dumbbell-press.gif`
- `머신 벤치 프레스.gif` → Upload to `/pectorals/machine-bench-press.gif`

Make sure they go INSIDE the pectorals folder, not at root level!