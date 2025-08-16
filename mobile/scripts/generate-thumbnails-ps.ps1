# Generate thumbnails for downloaded GIFs using PowerShell
Write-Host "=========================================="
Write-Host "   Generate Thumbnails for Downloaded GIFs"
Write-Host "=========================================="
Write-Host ""

$ffmpegPath = Join-Path $PSScriptRoot "ffmpeg\ffmpeg.exe"
$sourceDir = Join-Path $PSScriptRoot "..\assets\exercise-gifs"
$targetDir = Join-Path $PSScriptRoot "..\assets\exercise-thumbnails"

# Check if FFmpeg exists
if (!(Test-Path $ffmpegPath)) {
    Write-Host "❌ FFmpeg not found at: $ffmpegPath" -ForegroundColor Red
    Write-Host "   Please run download-ffmpeg-simple.bat first" -ForegroundColor Red
    exit 1
}

Write-Host "✅ FFmpeg found" -ForegroundColor Green
Write-Host ""

$count = 0
$failed = 0
$processed = @()

# Get all GIF files from all subdirectories
$gifFiles = Get-ChildItem -Path $sourceDir -Filter "*.gif" -Recurse

Write-Host "Found $($gifFiles.Count) GIF files total"
Write-Host ""

foreach ($gif in $gifFiles) {
    $folder = $gif.Directory.Name
    $filename = [System.IO.Path]::GetFileNameWithoutExtension($gif.Name)
    $targetFolder = Join-Path $targetDir $folder
    $targetPath = Join-Path $targetFolder "$filename.jpg"
    
    # Check if thumbnail already exists
    if (Test-Path $targetPath) {
        # Skip if already exists
        continue
    }
    
    # Create target folder if needed
    if (!(Test-Path $targetFolder)) {
        New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
    }
    
    Write-Host "Processing: $folder/$filename.gif... " -NoNewline
    
    # Generate thumbnail
    $args = @(
        "-i", "`"$($gif.FullName)`"",
        "-vframes", "1",
        "-vf", "`"scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white`"",
        "-q:v", "2",
        "`"$targetPath`"",
        "-y"
    )
    
    $process = Start-Process -FilePath $ffmpegPath -ArgumentList $args -NoNewWindow -Wait -PassThru -RedirectStandardError "NUL"
    
    if (Test-Path $targetPath) {
        Write-Host "✅" -ForegroundColor Green
        $count++
        $processed += "$folder/$filename"
    } else {
        Write-Host "❌" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "              COMPLETE!"
Write-Host "=========================================="
Write-Host "✅ Thumbnails created: $count" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "❌ Failed: $failed" -ForegroundColor Red
}
Write-Host ""

if ($count -gt 0) {
    Write-Host "Created thumbnails for:"
    $processed | ForEach-Object { Write-Host "  - $_" }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")