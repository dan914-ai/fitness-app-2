# PowerShell script to generate JPEG thumbnails from GIFs using FFmpeg

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
    Write-Host "Please run download-ffmpeg-simple.bat first" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "Using FFmpeg: $ffmpegPath" -ForegroundColor Cyan
Write-Host ""

# Create target directory if it doesn't exist
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
}

$totalGifs = 0
$successCount = 0
$failedFiles = @()

# Get all muscle group directories
$muscleGroups = Get-ChildItem -Path $sourceDir -Directory

foreach ($group in $muscleGroups) {
    $groupName = $group.Name
    Write-Host "Processing $groupName..." -ForegroundColor Yellow
    
    # Create target subdirectory
    $targetGroupDir = Join-Path $targetDir $groupName
    if (!(Test-Path $targetGroupDir)) {
        New-Item -ItemType Directory -Path $targetGroupDir | Out-Null
    }
    
    # Get all GIF files in this group
    $gifFiles = Get-ChildItem -Path $group.FullName -Filter "*.gif"
    
    foreach ($gif in $gifFiles) {
        $totalGifs++
        $jpegName = $gif.BaseName + ".jpg"
        $jpegPath = Join-Path $targetGroupDir $jpegName
        
        # Skip if thumbnail already exists
        if (Test-Path $jpegPath) {
            Write-Host "  [SKIP] $jpegName already exists" -ForegroundColor Gray
            $successCount++
            continue
        }
        
        try {
            # Extract first frame using FFmpeg
            $arguments = @(
                "-i", "`"$($gif.FullName)`"",
                "-vframes", "1",
                "-vf", "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white",
                "-q:v", "2",
                "`"$jpegPath`"",
                "-y"
            )
            
            $process = Start-Process -FilePath $ffmpegPath -ArgumentList $arguments -Wait -PassThru -NoNewWindow -RedirectStandardError "NUL" -RedirectStandardOutput "NUL"
            
            if (Test-Path $jpegPath) {
                Write-Host "  [OK] Generated $jpegName" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  [ERROR] Failed to generate $jpegName" -ForegroundColor Red
                $failedFiles += "$groupName/$($gif.Name)"
            }
        }
        catch {
            Write-Host "  [ERROR] Exception processing $($gif.Name): $_" -ForegroundColor Red
            $failedFiles += "$groupName/$($gif.Name)"
        }
    }
    Write-Host ""
}

# Calculate total size
$thumbnailSize = 0
Get-ChildItem -Path $targetDir -Recurse -Filter "*.jpg" | ForEach-Object {
    $thumbnailSize += $_.Length
}
$thumbnailSizeMB = [Math]::Round($thumbnailSize / 1MB, 2)

Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "     THUMBNAIL GENERATION COMPLETE" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "Total GIFs found: $totalGifs" -ForegroundColor Cyan
Write-Host "Successfully generated: $successCount" -ForegroundColor Green
if ($failedFiles.Count -gt 0) {
    Write-Host "Failed: $($failedFiles.Count)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed files:" -ForegroundColor Red
    $failedFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
Write-Host ""
Write-Host "Thumbnail folder size: $thumbnailSizeMB MB" -ForegroundColor Cyan
Write-Host "Space saved: ~$([Math]::Round(994 - $thumbnailSizeMB, 0)) MB vs full GIFs" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Thumbnails saved to: $targetDir" -ForegroundColor Green
Write-Host ""
pause