#!/usr/bin/env python3
"""
Generate static JPEG thumbnails from GIF files
Extracts the first frame from each GIF and saves it as a JPEG
"""

import os
import requests
from PIL import Image
from io import BytesIO

SUPABASE_BASE = 'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs'

# Map of exercise IDs to their GIF URLs
exercise_gifs = {
    # Abdominals
    '1': '/abdominals/alternate-heel-touches.gif',
    '2': '/abdominals/body-saw-plank.gif',
    '3': '/abdominals/captains-chair-leg-raise.gif',
    '4': '/abdominals/knee-touch-crunch.gif',
    '5': '/abdominals/tuck-crunch.gif',
    '348': '/abdominals/45-degree-extension.gif',
    '349': '/abdominals/ab-roller.gif',
    '350': '/abdominals/decline-sit-up.gif',
    '351': '/abdominals/leg-raise.gif',
    '352': '/abdominals/mountain-climber.gif',
    '353': '/abdominals/machine-crunch.gif',
    '354': '/abdominals/bicycle-crunch.gif',
    '355': '/abdominals/side-plank.gif',
    '356': '/abdominals/sit-up.gif',
    '357': '/abdominals/weighted-russian-twist.gif',
    '358': '/abdominals/weighted-cable-crunch.gif',
    '359': '/abdominals/weighted-plank.gif',
    '360': '/abdominals/captains-chair-knee-raise.gif',
    '361': '/abdominals/crunch.gif',
    '362': '/abdominals/cross-body-crunch.gif',
    '363': '/abdominals/toes-to-bar.gif',
    '365': '/abdominals/plank.gif',
    '366': '/abdominals/flutter-kick.gif',
    '367': '/abdominals/hanging-leg-raise.gif',
    # Pectorals
    '364': '/pectorals/push-up.gif'
}

def generate_static_thumbnails():
    """Download GIFs and extract first frame as JPEG"""
    
    # Create output directory
    output_dir = 'mobile/assets/static-thumbnails'
    os.makedirs(output_dir, exist_ok=True)
    
    success_count = 0
    error_count = 0
    
    print('Generating static JPEG thumbnails from GIFs...\n')
    
    for exercise_id, gif_path in exercise_gifs.items():
        gif_url = SUPABASE_BASE + gif_path
        file_name = os.path.basename(gif_path).replace('.gif', '')
        output_path = os.path.join(output_dir, f'{exercise_id}-{file_name}.jpg')
        
        try:
            print(f'Processing {file_name}...')
            
            # Download the GIF
            response = requests.get(gif_url, timeout=30)
            response.raise_for_status()
            
            # Open the GIF with PIL
            gif = Image.open(BytesIO(response.content))
            
            # Extract the first frame
            gif.seek(0)  # Go to first frame
            
            # Convert to RGB if necessary (GIFs might be in palette mode)
            if gif.mode != 'RGB':
                first_frame = gif.convert('RGB')
            else:
                first_frame = gif
            
            # Save as JPEG with good quality
            first_frame.save(output_path, 'JPEG', quality=90, optimize=True)
            
            print(f'✅ Generated: {exercise_id}-{file_name}.jpg')
            success_count += 1
            
        except Exception as e:
            print(f'❌ Error processing {file_name}: {str(e)}')
            error_count += 1
    
    print('\n' + '='*50)
    print('Static thumbnail generation complete!')
    print(f'✅ Success: {success_count} files')
    print(f'❌ Errors: {error_count} files')
    print(f'📁 Output directory: {output_dir}')
    print('='*50)

if __name__ == '__main__':
    try:
        import PIL
        import requests
    except ImportError as e:
        print('❌ Missing required package:', str(e))
        print('Please install required packages:')
        print('pip install Pillow requests')
        exit(1)
    
    generate_static_thumbnails()