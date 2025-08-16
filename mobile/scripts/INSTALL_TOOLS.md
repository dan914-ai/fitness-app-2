# Install Image Processing Tools for Thumbnail Generation

Choose ONE of these options:

## Option 1: FFmpeg (Recommended - Most Powerful)

### Windows:
1. Download from: https://www.gyan.dev/ffmpeg/builds/
2. Click "release builds" → "full" → Download the ZIP
3. Extract to `C:\ffmpeg`
4. Add `C:\ffmpeg\bin` to your PATH:
   - Right-click "This PC" → Properties → Advanced System Settings
   - Environment Variables → System Variables → Path → Edit
   - Add `C:\ffmpeg\bin`
5. Restart terminal and test: `ffmpeg -version`

### Alternative - Using Chocolatey (if you have it):
```powershell
choco install ffmpeg
```

### Alternative - Using Scoop:
```powershell
# Install Scoop first if needed:
irm get.scoop.sh | iex

# Then install ffmpeg:
scoop install ffmpeg
```

## Option 2: ImageMagick

### Windows:
1. Download from: https://imagemagick.org/script/download.php#windows
2. Download the Windows Binary Release (64-bit, DLL version)
3. Run the installer
4. Check "Add to PATH" during installation
5. Test: `magick -version`

## Option 3: Python with Pillow (Simple)

### Windows:
1. Install Python from: https://www.python.org/downloads/
2. During installation, CHECK "Add Python to PATH"
3. Open PowerShell and run:
```powershell
pip install Pillow
```

## Option 4: Node.js Canvas (Already have Node.js)

### In your project directory:
```bash
# Install Windows Build Tools first (Run PowerShell as Administrator):
npm install --global windows-build-tools

# Then install canvas:
cd "C:\Users\PW1234\.vscode\new finess app\mobile"
npm install canvas
```

---

## Quick Test After Installation

Once installed, I'll run the thumbnail generation script for you!