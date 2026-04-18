$websitePath = Join-Path $PSScriptRoot "..\\website\\index.html"
$resolvedWebsitePath = (Resolve-Path $websitePath).Path

$chromeCandidates = @(
  "$env:ProgramFiles\\Google\\Chrome\\Application\\chrome.exe",
  "${env:ProgramFiles(x86)}\\Google\\Chrome\\Application\\chrome.exe",
  "$env:LocalAppData\\Google\\Chrome\\Application\\chrome.exe"
)

$chromePath = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chromePath) {
  Write-Error "Google Chrome was not found on this machine."
  exit 1
}

Start-Process -FilePath $chromePath -ArgumentList $resolvedWebsitePath
