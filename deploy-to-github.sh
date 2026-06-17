#!/bin/bash
# VitaTrack - GitHub Deploy Script

echo "============================================"
echo "   VitaTrack - GitHub Deploy Script"
echo "============================================"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "Project: $PROJECT_DIR"
echo ""

if [ ! -d .git ]; then
    echo "Initializing Git..."
    if ! git init; then
        echo "Error: Git not installed."
        exit 1
    fi
else
    echo "Git already initialized"
fi

echo ""
read -p "Your GitHub username: " GITHUB_USER
read -p "Repository name (default: health-tracker): " REPO_NAME
read -p "Branch name (default: main): " BRANCH

REPO_NAME=${REPO_NAME:-health-tracker}
BRANCH=${BRANCH:-main}

echo ""
echo "Adding files..."
git add .

echo "Committing..."
git commit -m "VitaTrack initial commit" || echo "No new changes to commit"

echo "Configuring remote..."
git branch -M "$BRANCH"
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo "Pushing to GitHub..."
if git push -u origin "$BRANCH"; then
    echo ""
    echo "============================================"
    echo "   SUCCESSFULLY UPLOADED"
    echo "============================================"
    echo ""
    echo "URL: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "Next: Connect to Vercel at https://vercel.com/new"
    echo ""
else
    echo ""
    echo "============================================"
    echo "   ERROR: Push failed"
    echo "============================================"
    echo ""
    echo "1. The repo does not exist on GitHub yet"
    echo "2. GitHub credentials not configured"
    echo ""
    echo "FIX:"
    echo "1. Go to https://github.com/new"
    echo "2. Create the repo: $REPO_NAME"
    echo "3. Do NOT check 'Add a README'"
    echo "4. Run this script again"
    echo ""
fi

read -p "Press Enter to close..."
