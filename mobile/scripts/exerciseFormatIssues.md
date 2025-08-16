
# Exercise Format Issues to Fix

## Current Problems:
1. Used direct 'gifUrl' and 'supabaseGifUrl' instead of 'media' object
2. Missing 'tips' field (optional but used by service)
3. Missing 'commonMistakes' field (optional but used by service)

## Required Structure:
- media: {
    gifUrl: string,
    supabaseGifUrl: string
  }
- tips: {
    english: string[],
    korean: string[]
  }
- commonMistakes: {
    english: string[],
    korean: string[]
  }

## Exercises Added That Need Fixing:
- All 25 chest exercises
- All 28 back exercises  
- All 25 shoulder exercises
- All 135 temp folder exercises

Total: 213 exercises need their format corrected
