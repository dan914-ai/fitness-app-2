# GitHub Repository Initialization Script for PowerShell
Write-Host "=== GitHub Repository Initialization Script ===" -ForegroundColor Cyan

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "Error: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

# Check if gh CLI is installed
$ghInstalled = $false
try {
    gh --version | Out-Null
    $ghInstalled = $true
    Write-Host "✓ GitHub CLI (gh) is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠ GitHub CLI (gh) is not installed" -ForegroundColor Yellow
    Write-Host "You'll need to create the repository manually on GitHub" -ForegroundColor Yellow
}

# Get repository details
Write-Host "`nRepository Setup" -ForegroundColor Cyan
$repoName = Read-Host "Enter repository name (e.g., fitness-app-docs)"

# Validate repository name
if ($repoName -notmatch '^[a-zA-Z0-9_-]+$') {
    Write-Host "Error: Repository name can only contain letters, numbers, hyphens, and underscores" -ForegroundColor Red
    exit 1
}

$visibility = Read-Host "Repository visibility (public/private) [public]"
if ([string]::IsNullOrWhiteSpace($visibility)) {
    $visibility = "public"
}

$description = Read-Host "Repository description (optional)"

# Initialize git if needed
if (!(Test-Path .git)) {
    Write-Host "`nInitializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
} else {
    Write-Host "`nGit repository already initialized" -ForegroundColor Green
}

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

# Create commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Comprehensive fitness app documentation"

# Create GitHub repository
if ($ghInstalled) {
    Write-Host "`nCreating GitHub repository..." -ForegroundColor Yellow
    try {
        if ([string]::IsNullOrWhiteSpace($description)) {
            gh repo create $repoName --$visibility --source=. --remote=origin --push
        } else {
            gh repo create $repoName --$visibility --description "$description" --source=. --remote=origin --push
        }
        Write-Host "✓ Repository created and pushed successfully!" -ForegroundColor Green
        
        # Get repository URL
        $repoUrl = gh repo view --json url -q .url
        Write-Host "`nRepository URL: $repoUrl" -ForegroundColor Cyan
        
        $openBrowser = Read-Host "`nOpen repository in browser? (y/n) [y]"
        if ($openBrowser -ne 'n') {
            Start-Process $repoUrl
        }
    } catch {
        Write-Host "Error creating repository. You may need to authenticate first:" -ForegroundColor Red
        Write-Host "Run: gh auth login" -ForegroundColor Yellow
    }
} else {
    # Manual instructions
    Write-Host "`nManual Setup Required" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create a new repository named: $repoName" -ForegroundColor White
    Write-Host "3. Set visibility to: $visibility" -ForegroundColor White
    if (![string]::IsNullOrWhiteSpace($description)) {
        Write-Host "4. Add description: $description" -ForegroundColor White
    }
    Write-Host "5. DO NOT initialize with README, .gitignore, or license" -ForegroundColor Red
    Write-Host "`nAfter creating the repository on GitHub, run these commands:" -ForegroundColor Yellow
    
    $username = Read-Host "`nEnter your GitHub username"
    Write-Host "`ngit remote add origin https://github.com/$username/$repoName.git" -ForegroundColor Green
    Write-Host "git push -u origin main" -ForegroundColor Green
    
    # Add remote
    $addRemote = Read-Host "`nAdd remote now? (y/n) [y]"
    if ($addRemote -ne 'n') {
        git remote add origin "https://github.com/$username/$repoName.git"
        Write-Host "Remote added. Run 'git push -u origin main' after creating the repository on GitHub" -ForegroundColor Yellow
    }
}

Write-Host "`n✓ Setup complete!" -ForegroundColor Green