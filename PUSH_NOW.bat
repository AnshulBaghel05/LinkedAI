@echo off
echo ====================================
echo Push to GitHub Repository
echo ====================================
echo.
echo Repository: https://github.com/AnshulBaghel05/LinkedAI
echo Account: AnshulBaghel05
echo.
echo You need a GitHub Personal Access Token to push.
echo.
echo To get your token:
echo 1. Go to: https://github.com/settings/tokens/new
echo 2. Name: LinkedAI Development
echo 3. Select scope: [X] repo
echo 4. Click Generate token
echo 5. Copy the token (starts with ghp_)
echo.
set /p TOKEN="Paste your GitHub token here and press Enter: "
echo.
echo Pushing to GitHub...
echo.

git push https://%TOKEN%@github.com/AnshulBaghel05/LinkedAI.git main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================
    echo SUCCESS! Changes pushed to GitHub
    echo ====================================
    echo.
    echo Vercel will now auto-deploy your changes.
    echo Check: https://vercel.com/dashboard
) else (
    echo ====================================
    echo FAILED! Push unsuccessful
    echo ====================================
    echo.
    echo Please check:
    echo - Token is valid
    echo - Token has 'repo' scope
    echo - You have access to AnshulBaghel05/LinkedAI
)
echo.
pause
