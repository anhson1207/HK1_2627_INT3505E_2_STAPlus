@REM Maven Wrapper launcher
@echo off
setlocal
set MAVEN_PROJECTBASEDIR=%~dp0
where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  mvn %*
  exit /b %ERRORLEVEL%
)
echo Maven executable not found. Keep/copy the original mvnw.cmd from your repository if you rely on Maven Wrapper.
exit /b 1
