@echo off
setlocal

set GHIDRA_VERSION=11.2
set GHIDRA_DATE=20240926
set GHIDRA_DIR=ghidra_%GHIDRA_VERSION%_PUBLIC
set GHIDRA_URL=https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_%GHIDRA_VERSION%_build/%GHIDRA_DIR%_%GHIDRA_DATE%.zip
set TOOLS_DIR=%~dp0tools

echo ==^> Checking Python
where python >nul 2>nul || winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements

echo ==^> Checking JDK 21
where java -version 2>&1 | findstr /R /C:"version .2[1-9]" >nul || winget install -e --id Microsoft.OpenJDK.21 --accept-source-agreements --accept-package-agreements

echo ==^> Checking C compiler (gcc via MinGW-w64)
where gcc >nul 2>nul || winget install -e --id BrechtSanders.WinLibs.POSIX.UCRT --accept-source-agreements --accept-package-agreements

echo ==^> Installing Ghidra %GHIDRA_VERSION%
if not exist "%TOOLS_DIR%" mkdir "%TOOLS_DIR%"
if not exist "%TOOLS_DIR%\%GHIDRA_DIR%" (
    powershell -NoProfile -Command "Invoke-WebRequest -Uri '%GHIDRA_URL%' -OutFile '%TEMP%\ghidra.zip'"
    powershell -NoProfile -Command "Expand-Archive -Path '%TEMP%\ghidra.zip' -DestinationPath '%TOOLS_DIR%' -Force"
    del "%TEMP%\ghidra.zip"
)

echo.
echo ==^> Done. Close and reopen your terminal (so PATH updates), then run: python converter.py
endlocal