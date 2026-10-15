$ErrorActionPreference = 'Stop'

$root  = Split-Path -Parent $PSScriptRoot
$tools = Join-Path $env:TEMP 'opencode\apk-tools'

if (-not (Test-Path $tools)) {
  Write-Host "Android build tools not found at: $tools" -ForegroundColor Red
  Write-Host "Need JDK 17 + Android SDK (platform 34, build-tools 34.0.0)."
  exit 1
}

$jdk = Get-ChildItem (Join-Path $tools 'jdk') -Directory | Select-Object -First 1
$env:JAVA_HOME        = $jdk.FullName
$env:ANDROID_HOME     = Join-Path $tools 'android-sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path             = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

Push-Location $root
try {
  node (Join-Path $root 'scripts\copy-web.js')
  npx cap sync android
  & (Join-Path $root 'android\gradlew.bat') "-p" (Join-Path $root 'android') assembleDebug --no-daemon
  $apk = Join-Path $root 'android\app\build\outputs\apk\debug\app-debug.apk'
  Write-Host "`nAPK ready: $apk" -ForegroundColor Green
} finally {
  Pop-Location
}
