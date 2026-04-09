@echo off
title ShopSphere Public Sharing
echo ==========================================
echo    ShopSphere - Generating Public Link
echo ==========================================
echo [*] Ensure you have already started the site using run_site.bat!
echo [*] Requesting a secure public link...

:: Try to fix Node PATH just in case it wasn't opened in the same session
if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
)

echo.
echo ==========================================
echo   IMPORTANT INSTRUCTIONS FOR YOUR FRIENDS
echo ==========================================
echo 1. When they open the link below, they will see a "Friendly Warning" page.
echo 2. Tell them to click the "Click to Continue" button to visit the site.
echo ==========================================
echo.
echo [*] Generating link now (this may take a few seconds)...
echo.

npx --yes localtunnel --port 3000

echo.
echo [!] The connection was closed or failed. 
pause
