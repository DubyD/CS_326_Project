@echo off
rem Installs the converter's tools for Windows 10/11.
rem Ghidra and a JDK are downloaded into backend\tools\ and run from there.
rem Python and gcc (MinGW-w64) are installed with winget if they are missing.
rem
rem Usage (from the project root):  backend\setup_windows.bat
setlocal

set GHIDRA_VERSION=11.2
set GHIDRA_DATE=20240926
set GHIDRA_NAME=ghidra_%GHIDRA_VERSION%_PUBLIC
set GHIDRA_URL=https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_%GHIDRA_VERSION%_build/%GHIDRA_NAME%_%GHIDRA_DATE%.zip
set JDK_URL=https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse
set TOOLS_DIR=%~dp0tools
set GHIDRA_DIR=%TOOLS_DIR%\%GHIDRA_NAME%
set JDK_DIR=%TOOLS_DIR%\jdk-windows-x64
set NEED_REOPEN=0

echo ==^> Checking Python
where python >nul 2>nul
if errorlevel 1 (
    winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
    set NEED_REOPEN=1
)

echo ==^> Checking C compiler (gcc via MinGW-w64)
where gcc >nul 2>nul
if errorlevel 1 (
    winget install -e --id BrechtSanders.WinLibs.POSIX.UCRT --accept-source-agreements --accept-package-agreements
    set NEED_REOPEN=1
)

if not exist "%TOOLS_DIR%" mkdir "%TOOLS_DIR%"

echo ==^> Installing JDK 21 into backend\tools\jdk-windows-x64
if exist "%JDK_DIR%\bin\java.exe" (
    echo     already installed
) else (
    if exist "%JDK_DIR%" rmdir /s /q "%JDK_DIR%"
    if exist "%TOOLS_DIR%\jdk_tmp" rmdir /s /q "%TOOLS_DIR%\jdk_tmp"
    curl.exe -fL --retry 3 -o "%TOOLS_DIR%\jdk.zip" "%JDK_URL%" || goto :fail
    mkdir "%TOOLS_DIR%\jdk_tmp"
    tar -xf "%TOOLS_DIR%\jdk.zip" -C "%TOOLS_DIR%\jdk_tmp" || goto :fail
    rem The archive has one top-level folder (jdk-21...); rename it to "jdk-windows-x64"
    for /d %%D in ("%TOOLS_DIR%\jdk_tmp\*") do move "%%D" "%JDK_DIR%" >nul
    rmdir /s /q "%TOOLS_DIR%\jdk_tmp"
    del "%TOOLS_DIR%\jdk.zip"
)

echo ==^> Installing Ghidra %GHIDRA_VERSION% into backend\tools\%GHIDRA_NAME%
if exist "%GHIDRA_DIR%\support\analyzeHeadless.bat" (
    echo     already installed
) else (
    if exist "%GHIDRA_DIR%" rmdir /s /q "%GHIDRA_DIR%"
    curl.exe -fL --retry 3 -o "%TOOLS_DIR%\ghidra.zip" "%GHIDRA_URL%" || goto :fail
    tar -xf "%TOOLS_DIR%\ghidra.zip" -C "%TOOLS_DIR%" || goto :fail
    del "%TOOLS_DIR%\ghidra.zip"
)

echo ==^> Checking the local JDK
"%JDK_DIR%\bin\java.exe" -version || goto :fail

echo.
if "%NEED_REOPEN%"=="1" (
    echo ==^> Done. Close and reopen your terminal so PATH picks up Python/gcc, then run: npm start
) else (
    echo ==^> Done. Start the app from the project root with: npm start
)
endlocal
exit /b 0

:fail
echo.
echo Setup failed. Check your internet connection and re-run backend\setup_windows.bat
endlocal
exit /b 1