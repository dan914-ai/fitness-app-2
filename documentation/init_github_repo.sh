#!/bin/bash

# Script to initialize Git repository and push documentation to GitHub
# Usage: ./init_github_repo.sh

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        return 1
    fi
    return 0
}

# Function to validate repository name
validate_repo_name() {
    local repo_name=$1
    if [[ ! $repo_name =~ ^[a-zA-Z0-9._-]+$ ]]; then
        print_error "Invalid repository name. Use only letters, numbers, dots, hyphens, and underscores."
        return 1
    fi
    return 0
}

# Main script starts here
echo "======================================"
echo "   GitHub Repository Setup Script     "
echo "======================================"
echo

# Check required commands
print_info "Checking required commands..."
if ! check_command git; then
    exit 1
fi

if ! check_command gh; then
    print_warning "gh CLI not found. Will use git commands only."
    USE_GH_CLI=false
else
    USE_GH_CLI=true
    # Check if gh is authenticated
    if ! gh auth status &> /dev/null; then
        print_warning "GitHub CLI is not authenticated. Please run 'gh auth login' first."
        echo "Do you want to continue with git commands only? (y/n)"
        read -r continue_without_gh
        if [[ $continue_without_gh != "y" ]]; then
            exit 1
        fi
        USE_GH_CLI=false
    fi
fi

# Get repository details from user
echo
print_info "Please provide repository details:"
echo

# Repository name
while true; do
    read -p "Repository name: " REPO_NAME
    if validate_repo_name "$REPO_NAME"; then
        break
    fi
done

# Repository visibility
echo "Repository visibility:"
echo "  1) Public"
echo "  2) Private"
while true; do
    read -p "Choose (1 or 2): " visibility_choice
    case $visibility_choice in
        1)
            VISIBILITY="public"
            VISIBILITY_FLAG="--public"
            break
            ;;
        2)
            VISIBILITY="private"
            VISIBILITY_FLAG="--private"
            break
            ;;
        *)
            print_error "Please choose 1 or 2"
            ;;
    esac
done

# Repository description
read -p "Repository description (optional): " REPO_DESCRIPTION

# GitHub username (only needed if not using gh CLI)
if [[ $USE_GH_CLI == false ]]; then
    read -p "GitHub username: " GITHUB_USERNAME
fi

# Confirmation
echo
echo "======================================"
echo "Repository Configuration:"
echo "  Name: $REPO_NAME"
echo "  Visibility: $VISIBILITY"
if [[ -n $REPO_DESCRIPTION ]]; then
    echo "  Description: $REPO_DESCRIPTION"
fi
if [[ $USE_GH_CLI == false ]]; then
    echo "  GitHub Username: $GITHUB_USERNAME"
fi
echo "======================================"
echo
read -p "Proceed with these settings? (y/n): " confirm
if [[ $confirm != "y" ]]; then
    print_info "Operation cancelled."
    exit 0
fi

# Change to documentation directory
cd "$(dirname "$0")" || exit 1
print_info "Working in: $(pwd)"

# Initialize Git repository
echo
print_info "Initializing Git repository..."
if [ -d .git ]; then
    print_warning "Git repository already exists in this directory."
    read -p "Do you want to reinitialize? This will keep your history. (y/n): " reinit
    if [[ $reinit != "y" ]]; then
        print_info "Skipping Git initialization."
    else
        git init
        print_success "Git repository reinitialized."
    fi
else
    git init
    print_success "Git repository initialized."
fi

# Check if there are any files to commit
if [ -z "$(ls -A | grep -v '^\.git$')" ]; then
    print_error "No files found in the documentation directory."
    exit 1
fi

# Add all files
echo
print_info "Adding documentation files..."
git add -A
print_success "Files added to staging area."

# Show status
echo
print_info "Current status:"
git status --short

# Create initial commit
echo
print_info "Creating initial commit..."
if git diff --cached --quiet; then
    print_warning "No changes to commit."
else
    git commit -m "Initial commit: Add documentation files"
    print_success "Initial commit created."
fi

# Create GitHub repository and add remote
echo
if [[ $USE_GH_CLI == true ]]; then
    print_info "Creating GitHub repository using gh CLI..."
    
    # Build gh repo create command
    GH_CREATE_CMD="gh repo create $REPO_NAME $VISIBILITY_FLAG"
    if [[ -n $REPO_DESCRIPTION ]]; then
        GH_CREATE_CMD="$GH_CREATE_CMD --description \"$REPO_DESCRIPTION\""
    fi
    GH_CREATE_CMD="$GH_CREATE_CMD --source=. --remote=origin"
    
    # Execute the command
    if eval $GH_CREATE_CMD; then
        print_success "GitHub repository created successfully!"
        REPO_CREATED=true
    else
        print_error "Failed to create GitHub repository."
        REPO_CREATED=false
    fi
else
    print_info "Setting up remote repository..."
    print_warning "Please create a repository named '$REPO_NAME' on GitHub manually."
    echo "Visit: https://github.com/new"
    echo
    read -p "Press Enter after creating the repository..."
    
    # Add remote
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    print_success "Remote 'origin' added."
    REPO_CREATED=true
fi

# Push to GitHub
if [[ $REPO_CREATED == true ]]; then
    echo
    print_info "Pushing to GitHub..."
    
    # Set main branch name
    git branch -M main
    
    # Push with upstream
    if git push -u origin main; then
        print_success "Successfully pushed to GitHub!"
        echo
        echo "======================================"
        echo "✨ Repository setup complete! ✨"
        if [[ $USE_GH_CLI == true ]]; then
            echo "Repository URL: $(gh repo view --json url -q .url)"
        else
            echo "Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
        fi
        echo "======================================"
    else
        print_error "Failed to push to GitHub."
        echo
        print_info "Troubleshooting tips:"
        echo "  1. Make sure you have the correct permissions"
        echo "  2. Check if the repository was created on GitHub"
        echo "  3. Verify your authentication (SSH key or token)"
        echo "  4. Try: git remote -v (to check remote URL)"
        echo "  5. Try: git push -u origin main --force (if this is a new repo)"
        exit 1
    fi
fi

# Optional: Open repository in browser
if [[ $USE_GH_CLI == true ]] && [[ $REPO_CREATED == true ]]; then
    echo
    read -p "Open repository in browser? (y/n): " open_browser
    if [[ $open_browser == "y" ]]; then
        gh repo view --web
    fi
fi

echo
print_success "Script completed successfully!"