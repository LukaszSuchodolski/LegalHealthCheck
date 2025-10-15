param(
  [switch]$Apply,
  [string]$Repo = "C:\LegalHealthCheck"
)

$ErrorActionPreference = "Stop"
Set-Location $Repo

function New-FolderIfMissing($path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

function Move-IfExists($from, $to) {
  if (Test-Path $from) {
    if ($Apply) {
      New-FolderIfMissing (Split-Path $to)
      git mv $from $to
      Write-Host "MOVED  $from  ->  $to"
    } else {
      Write-Host "[DRY]  $from  ->  $to"
    }
  }
}

function Remove-EmptyDirs($root) {
  Get-ChildItem -LiteralPath $root -Recurse -Directory |
    Sort-Object FullName -Descending |
    ForEach-Object {
      if (-not (Get-ChildItem $_.FullName -Force | Where-Object { $_.Name -notin @('.git','.gitkeep') })) {
        if ($Apply) {
          Remove-Item $_.FullName -Force
          Write-Host "RMDIR  $($_.FullName)"
        } else {
          Write-Host "[DRY] RMDIR $($_.FullName)"
        }
      }
    }
}

# Katalogi docelowe
$paths = @(
  "$Repo\backend\app\api",
  "$Repo\backend\app\models",
  "$Repo\backend\app\schemas",
  "$Repo\backend\app\services",
  "$Repo\backend\app\core",
  "$Repo\backend\app\tests",
  "$Repo\frontend\src\api",
  "$Repo\frontend\src\components",
  "$Repo\frontend\src\pages",
  "$Repo\frontend\src\hooks",
  "$Repo\frontend\src\utils",
  "$Repo\frontend\src\assets",
  "$Repo\frontend\src\styles",
  "$Repo\reports"
)
$paths | ForEach-Object { New-FolderIfMissing $_ }

# Konkretne ruchy (dopasuj pod repo – idempotentne)
Move-IfExists "$Repo\frontend\src\NavBar.jsx"            "$Repo\frontend\src\components\NavBar.jsx"
Move-IfExists "$Repo\frontend\src\Loader.jsx"            "$Repo\frontend\src\components\Loader.jsx"
Move-IfExists "$Repo\frontend\src\http.js"               "$Repo\frontend\src\api\http.js"
Move-IfExists "$Repo\frontend\src\api\_stash\checkup.js" "$Repo\frontend\src\api\checkup.js"

# Przeniesienie „klientów” API rozproszonych po src/
Get-ChildItem "$Repo\frontend\src" -Recurse -File -Include *.js,*.ts,*.jsx,*.tsx |
  Where-Object { $_.BaseName -match 'http|api|client|service' -and $_.FullName -notmatch '\\src\\api\\' } |
  ForEach-Object {
    $target = Join-Path "$Repo\frontend\src\api" $_.Name
    Move-IfExists $_.FullName $target
  }

# Sprzątanie katalogów trash-like
$trash = @('tmp','temp','__trash','__old','_old','_backup','_stash')
foreach ($t in $trash) {
  Get-ChildItem $Repo -Recurse -Directory -Filter $t |
    ForEach-Object {
      if ($Apply) {
        try { Remove-Item $_.FullName -Recurse -Force } catch {}
        Write-Host "CLEAN  $($_.FullName)"
      } else {
        Write-Host "[DRY] CLEAN $($_.FullName)"
      }
    }
}

Remove-EmptyDirs "$Repo\frontend\src"
Remove-EmptyDirs "$Repo\backend\app"

Write-Host "`nDone. Run with -Apply to perform changes."
