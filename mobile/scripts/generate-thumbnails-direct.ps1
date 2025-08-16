# Direct FFmpeg thumbnail generation - no redirection issues

$sourceDir = "..\assets\exercise-gifs"
$targetDir = "..\assets\exercise-thumbnails"
$ffmpegPath = ".\ffmpeg\ffmpeg.exe"

Write-Host "===========================================" -ForegroundColor Green
Write-Host "   Generate JPEG Thumbnails from GIFs" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Check if FFmpeg exists
if (!(Test-Path $ffmpegPath)) {
    Write-Host "ERROR: FFmpeg not found at $ffmpegPath" -ForegroundColor Red
    exit
}

# Create target directory
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
}

$totalCount = 0
$successCount = 0

# Process each muscle group
Get-ChildItem -Path $sourceDir -Directory | ForEach-Object {
    $groupName = $_.Name
    Write-Host "Processing $groupName..." -ForegroundColor Yellow
    
    # Create target subdirectory
    $targetGroupDir = Join-Path $targetDir $groupName
    if (!(Test-Path $targetGroupDir)) {
        New-Item -ItemType Directory -Path $targetGroupDir | Out-Null
    }
    
    # Process each GIF
    Get-ChildItem -Path $_.FullName -Filter "*.gif" | ForEach-Object {
        $totalCount++
        $gifPath = $_.FullName
        $jpegName = $_.BaseName + ".jpg"
        $jpegPath = Join-Path $targetGroupDir $jpegName
        
        # Skip if exists
        if (Test-Path $jpegPath) {
            Write-Host "  [SKIP] $jpegName" -ForegroundColor Gray
            $successCount++
        } else {
            # Run FFmpeg directly
            & $ffmpegPath -i $gifPath -vframes 1 -vf "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 2 $jpegPath -y 2>$null
            
            if (Test-Path $jpegPath) {
                Write-Host "  [OK] $jpegName" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  [ERROR] $jpegName" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "Complete: $successCount of $totalCount thumbnails" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Yellow
pause