#!/usr/bin/env python3
"""
Generate clean, static thumbnail images from abdominal exercise GIFs.
Extracts a representative frame from each GIF to create stable thumbnails.
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageSequence

def extract_best_frame(gif_path, output_path):
    """
    Extract a clean, representative frame from a GIF.
    Uses the middle frame as it typically shows the exercise clearly.
    """
    try:
        with Image.open(gif_path) as gif:
            frames = list(ImageSequence.Iterator(gif))
            
            # Get middle frame (most representative of the exercise)
            middle_index = len(frames) // 2
            frame = frames[middle_index].convert('RGB')
            
            # Save as high-quality JPEG
            frame.save(output_path, 'JPEG', quality=95, optimize=True)
            return True
            
    except Exception as e:
        print(f"Error processing {gif_path}: {e}")
        return False

def main():
    # Setup paths
    base_dir = Path('/mnt/c/Users/PW1234/.vscode/new finess app/mobile/assets')
    gif_dir = base_dir / 'exercise-gifs' / 'abdominals'
    thumb_dir = base_dir / 'exercise-thumbnails' / 'abdominals'
    
    # Ensure thumbnail directory exists
    thumb_dir.mkdir(parents=True, exist_ok=True)
    
    # Process each GIF
    gif_files = list(gif_dir.glob('*.gif'))
    
    if not gif_files:
        print("No GIF files found in", gif_dir)
        return
    
    print(f"Found {len(gif_files)} GIF files to process")
    
    success_count = 0
    for gif_file in gif_files:
        # Create corresponding thumbnail filename
        thumb_name = gif_file.stem + '.jpg'
        thumb_path = thumb_dir / thumb_name
        
        print(f"Processing: {gif_file.name} -> {thumb_name}")
        
        if extract_best_frame(gif_file, thumb_path):
            success_count += 1
            print(f"  ✓ Created: {thumb_name}")
        else:
            print(f"  ✗ Failed: {thumb_name}")
    
    print(f"\nCompleted: {success_count}/{len(gif_files)} thumbnails generated")

if __name__ == "__main__":
    main()