// Hardcoded static thumbnail URLs from Supabase
// These are REAL STATIC JPEGs, NOT GIFs!

const SUPABASE_BASE = 'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs';
const PLACEHOLDER = 'https://via.placeholder.com/120x120/cccccc/666666?text=Exercise';

// Map exercise IDs to STATIC JPEG URLs (the -static.jpg versions we uploaded)
export const hardcodedThumbnails: Record<string, string> = {
  // Abdominals - these are REAL STATIC JPEGs on Supabase
  '1': `${SUPABASE_BASE}/abdominals/alternate-heel-touches-static.jpg`,
  '2': `${SUPABASE_BASE}/abdominals/body-saw-plank-static.jpg`,
  '3': `${SUPABASE_BASE}/abdominals/captains-chair-leg-raise-static.jpg`,
  '4': `${SUPABASE_BASE}/abdominals/knee-touch-crunch-static.jpg`,
  '5': `${SUPABASE_BASE}/abdominals/tuck-crunch-static.jpg`,
  '348': `${SUPABASE_BASE}/abdominals/45-degree-extension-static.jpg`,
  '349': `${SUPABASE_BASE}/abdominals/ab-roller-static.jpg`,
  '350': `${SUPABASE_BASE}/abdominals/decline-sit-up-static.jpg`,
  '351': `${SUPABASE_BASE}/abdominals/leg-raise-static.jpg`,
  '352': `${SUPABASE_BASE}/abdominals/mountain-climber-static.jpg`,
  '353': `${SUPABASE_BASE}/abdominals/machine-crunch-static.jpg`,
  '354': `${SUPABASE_BASE}/abdominals/bicycle-crunch-static.jpg`,
  '355': `${SUPABASE_BASE}/abdominals/side-plank-static.jpg`,
  '356': `${SUPABASE_BASE}/abdominals/sit-up-static.jpg`,
  '357': `${SUPABASE_BASE}/abdominals/weighted-russian-twist-static.jpg`,
  '358': `${SUPABASE_BASE}/abdominals/weighted-cable-crunch-static.jpg`,
  '359': `${SUPABASE_BASE}/abdominals/weighted-plank-static.jpg`,
  '360': `${SUPABASE_BASE}/abdominals/captains-chair-knee-raise-static.jpg`,
  '361': `${SUPABASE_BASE}/abdominals/crunch-static.jpg`,
  '362': `${SUPABASE_BASE}/abdominals/cross-body-crunch-static.jpg`,
  '363': `${SUPABASE_BASE}/abdominals/toes-to-bar-static.jpg`,
  '365': `${SUPABASE_BASE}/abdominals/plank-static.jpg`,
  '366': `${SUPABASE_BASE}/abdominals/flutter-kick-static.jpg`,
  '367': `${SUPABASE_BASE}/abdominals/hanging-leg-raise-static.jpg`,
  
  // Pectorals  
  '364': `${SUPABASE_BASE}/pectorals/push-up-static.jpg`,
};

// For all other exercises, use placeholder
export const getHardcodedThumbnail = (exerciseId: string | number): string => {
  const id = exerciseId.toString();
  return hardcodedThumbnails[id] || PLACEHOLDER;
};