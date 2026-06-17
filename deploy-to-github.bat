@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================
echo   VitaTrack - GitHub Deploy
echo ============================================
echo.

set "DIR=%~dp0"
cd /d "%DIR%"

if not exist .git (
    echo [1/5] Initializing Git...
    git init
    if errorlevel 1 ( echo ERROR: Git not installed. Download from https://git-scm.com/ & pause & exit /b 1 )
)

set /p USER="GitHub username: "
set /p REPO="Repository name (default: vitatrack): "
if "!REPO!"=="" set REPO=vitatrack

echo [2/5] Adding files...
git add .

echo [3/5] Committing...
git commit -m "VitaTrack v1.0 - health tracker app"

echo [4/5] Configuring remote...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/!USER!/!REPO!.git

echo [5/5] Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ERROR: Push failed. Possible causes:
    echo 1. Repo does not exist on GitHub yet
    echo 2. Credentials not configured
    echo.
    echo FIX: Go to https://github.com/new, create !REPO!, do NOT add README, then run again.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   SUCCESS! ^|^| https://github.com/!USER!/!REPO!
echo ============================================
echo Next: Connect to Vercel at https://vercel.com/new
echo.
pause
