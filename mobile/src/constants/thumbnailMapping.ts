// Import local thumbnail mapping from staticThumbnails
import { getStaticThumbnail } from './staticThumbnails';

export const thumbnailMapping: Record<string, any> = {};

export const getThumbnail = (exerciseId: string | number) => {
  // Use local thumbnails from staticThumbnails.ts
  return getStaticThumbnail(exerciseId);
};

export const hasThumbnail = (exerciseId: string | number) => {
  const thumbnail = getStaticThumbnail(exerciseId);
  return thumbnail !== null;
};

// For HybridThumbnail component compatibility
export const getThumbnailAsset = getThumbnail;