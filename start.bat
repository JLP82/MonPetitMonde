@echo off
rem Starts a local web server for mon Petit monde! and opens it in your browser.
cd /d "%~dp0"
if not exist "css\base.css" (
  echo The css, js and assets folders are missing next to start.bat.
  echo Right-click the zip, choose "Extract All...", then run start.bat from the extracted folder.
  pause
  exit /b 1
)
set PORT=8765
start "" "http://localhost:%PORT%/"
where py >nul 2>nul && (py -m http.server %PORT% & goto :eof)
where python >nul 2>nul && (python -m http.server %PORT% & goto :eof)
where npx >nul 2>nul && (npx --yes serve -l %PORT% . & goto :eof)
echo No Python or Node.js found. Install Python from python.org, or just double-click index.html
echo (it also works straight from the extracted folder).
start "" "%~dp0index.html"
pause
