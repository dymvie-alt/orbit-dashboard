# ==============================================================================
# Orbit Dashboard (v2.2.0) — Installer & Quick-Launcher for Any Computer
# Installs the plugin into ~/.gemini/config/plugins/orbit-dashboard
# and optionally launches the Multi-Project Hub dashboard immediately!
# ==============================================================================

param(
    [string]$ProjectPath = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetPluginDir = Join-Path $env:USERPROFILE ".gemini\config\plugins\orbit-dashboard"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   🛰️  Orbit Dashboard v2.2.0 — התקנה והפעלה מהירה" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Copy plugin files to ~/.gemini/config/plugins/orbit-dashboard if running from another folder
if ($ScriptDir.ToLower() -ne $TargetPluginDir.ToLower()) {
    Write-Host "`n[1/3] מתקין את הפלאגין בתיקיית Antigravity של המשתמש..." -ForegroundColor Yellow
    if (!(Test-Path $TargetPluginDir)) {
        New-Item -ItemType Directory -Force -Path $TargetPluginDir | Out-Null
    }
    Copy-Item -Path "$ScriptDir\*" -Destination $TargetPluginDir -Recurse -Force
    Write-Host "✓ הפלאגין הותקן בהצלחה בנתיב: $TargetPluginDir" -ForegroundColor Green
} else {
    Write-Host "`n[1/3] הפלאגין כבר ממוקם בתיקיית היעד: $TargetPluginDir" -ForegroundColor Green
}

# 2. Verify Node.js is available
Write-Host "`n[2/3] בודק זמינות סביבת Node.js..." -ForegroundColor Yellow
try {
    $nodeVer = node -v
    Write-Host "✓ נמצא Node.js בגרסה $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "⚠️ לא נמצא Node.js במחשב זה. יש להתקין Node.js (מאתר nodejs.org) כדי להריץ סריקות." -ForegroundColor Red
    exit 1
}

# 3. Determine initial project to scan and launch the dashboard
Write-Host "`n[3/3] סורק פרויקטים ומייצר את מרכז הבקרה (Orbit Multi-Project Hub)..." -ForegroundColor Yellow

if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
    # Check if C:\CLAUDE PROJECTS exists and has any subfolder
    if (Test-Path "C:\CLAUDE PROJECTS") {
        $firstSub = Get-ChildItem -Path "C:\CLAUDE PROJECTS" -Directory | Select-Object -First 1
        if ($firstSub) {
            $ProjectPath = $firstSub.FullName
        }
    }
    if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
        $ProjectPath = $TargetPluginDir
    }
}

$ScannerScript = Join-Path $TargetPluginDir "scripts\orbit-scanner.mjs"
$ScanOut = node $ScannerScript --project "$ProjectPath" | Out-String

$HubHtml = Join-Path $env:USERPROFILE ".gemini\antigravity\orbit\index.html"
if (Test-Path $HubHtml) {
    Write-Host "`n✅ ההתקנה והסריקה הושלמו בהצלחה!" -ForegroundColor Green
    Write-Host "פותח כעת את Orbit Dashboard בדפדפן שלך..." -ForegroundColor Cyan
    Start-Process $HubHtml
} else {
    Write-Host "`n✅ הפלאגין הותקן! להפעלה מתוך Antigravity הקלד: /orbit או דשבורד" -ForegroundColor Green
}
