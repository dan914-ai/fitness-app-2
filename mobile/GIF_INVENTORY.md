# Complete GIF Inventory

## LOCATION 1: LOCAL GIFs
**Path:** `/assets/exercise-gifs/`

### By Muscle Group:
- **abdominals**: 24 GIFs
- **arms**: 2 GIFs  
- **back**: 52 GIFs
- **biceps**: 25 GIFs
- **calves**: 6 GIFs
- **cardio**: 5 GIFs
- **compound**: 10 GIFs
- **deltoids**: 39 GIFs
- **forearms**: 5 GIFs
- **glutes**: 16 GIFs
- **hamstrings**: 17 GIFs
- **legs**: 1 GIF
- **matched**: 7 GIFs (duplicates folder)
- **pectorals**: 47 GIFs
- **quadriceps**: 52 GIFs
- **traps**: 11 GIFs
- **triceps**: 27 GIFs

**TOTAL LOCAL GIFs:** 340 files

## LOCATION 2: BACKED UP GIFs  
**Path:** `/backup-exercises/gifs/`
**Count:** 36 GIFs
**Reason:** These exercises were removed because they don't have Supabase URLs (you deleted them from Supabase intentionally)

## LOCATION 3: DATABASE
**Path:** `/src/data/exerciseDatabase.ts`
**Count:** 271 exercises
**Note:** Each exercise points to a Supabase URL for the GIF

## LOCATION 4: SUPABASE (Remote)
**URL:** `https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/`
**Count:** 271 working GIFs (matches database)

## SUMMARY:
- **Total Local GIFs:** 340 (in assets/exercise-gifs/)
- **Backed up GIFs:** 36 (in backup-exercises/)
- **Database Entries:** 271 (with working Supabase URLs)
- **Discrepancy:** 340 local - 271 in database = 69 unused local GIFs

## NOTES:
1. You have more local GIFs (340) than database entries (271)
2. 36 GIFs were backed up and removed from database (no Supabase URLs)
3. The "matched" folder appears to contain duplicates
4. Some muscle groups have multiple versions of the same exercise (e.g., leg-extension.gif and leg-extension-2.gif)

## For Manual Overhaul:
All GIFs are in these locations:
1. **Active local GIFs:** `/mobile/assets/exercise-gifs/[muscle-group]/`
2. **Backed up GIFs:** `/mobile/backup-exercises/gifs/`
3. **Remote Supabase:** Access via Supabase dashboard