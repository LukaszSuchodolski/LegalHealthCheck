param(
  [int]$LargeKB = 200,            # próg "dużych" plików w KB
  [string]$Repo = "C:\LegalHealthCheck",
  [switch]$Hash                     # włącz obliczanie SHA256 (wolniejsze)
)

$ErrorActionPreference = "Stop"
Set-Location $Repo

function Inventory($root) {
  Write-Host ">> Inwentaryzacja: $root"
  $rows = Get-ChildItem -LiteralPath $root -Recurse -File | ForEach-Object {
    $sha = ""
    if ($Hash) {
      try {
        $sha = (Get-FileHash -Path $_.FullName -Algorithm SHA256).Hash
      } catch {
        $sha = ""
      }
    }
    [PSCustomObject]@{
      FullName = $_.FullName
      RelPath  = $_.FullName.Replace((Resolve-Path $root), '').TrimStart('\')
      Ext      = $_.Extension
      SizeKB   = [math]::Round($_.Length/1KB,2)
      Modified = $_.LastWriteTime
      SHA256   = $sha
    }
  }
  return $rows
}

# 1) Pełny spis repo
$all = Inventory $Repo
$all | Sort-Object RelPath | Export-Csv -NoTypeInformation -Encoding UTF8 "$Repo\reports\inventory_all.csv"

# 2) Duże pliki
$large = $all | Where-Object { $_.SizeKB -ge $LargeKB }
$large | Sort-Object -Property SizeKB -Descending | Export-Csv -NoTypeInformation -Encoding UTF8 "$Repo\reports\inventory_large_${LargeKB}KB_plus.csv"

# 3) Podejrzane nazwy (kopie, backupy, stare)
$patterns = @('(?i)\bcopy\b','(?i)\bkopia\b','(?i)\bbackup\b','(?i)\bold\b','(?i)\bstash\b','(?i)\btmp\b','(?i)\btemp\b','(?i)\b__trash\b','(?i)\b__old\b','(?i)\b\(1\)\.','(?i)\bfinal\b')
$suspicious = $all | Where-Object {
  $name = Split-Path -Leaf $_.RelPath
  foreach ($pat in $patterns) {
    if ($name -match $pat) { return $true }
  }
  return $false
}
$suspicious | Sort-Object RelPath | Export-Csv -NoTypeInformation -Encoding UTF8 "$Repo\reports\inventory_suspicious_names.csv"

# 4) Duplikaty nazw (ta sama nazwa pliku, różne ścieżki)
$dupNames = $all | Group-Object { Split-Path -Leaf $_.RelPath } | Where-Object { $_.Count -gt 1 } |
  ForEach-Object {
    $_.Group | Select-Object @{n='FileName';e={ Split-Path -Leaf $_.RelPath }}, RelPath, SizeKB, Modified
  }
$dupNames | Export-Csv -NoTypeInformation -Encoding UTF8 "$Repo\reports\duplicates_by_name.csv"

# 5) Duplikaty zawartości (wymaga -Hash)
if ($Hash) {
  $dupHash = $all | Where-Object { $_.SHA256 } | Group-Object SHA256 | Where-Object { $_.Count -gt 1 } |
    ForEach-Object {
      $_.Group | Select-Object SHA256, RelPath, SizeKB, Modified
    }
  $dupHash | Export-Csv -NoTypeInformation -Encoding UTF8 "$Repo\reports\duplicates_by_hash.csv"
}

# 6) Frontend: pliki w src/, których nikt nie importuje (przybliżone)
$src = Join-Path $Repo "frontend\src"
$allJs = @()
if (Test-Path $src) {
  $allJs = Get-ChildItem $src -Recurse -File -Include *.js,*.jsx,*.ts,*.tsx
  $imports = New-Object System.Collections.Generic.HashSet[string]
  foreach ($f in $allJs) {
    $txt = Get-Content $f.FullName -Raw
    # import ... from '...';
    # require('...')
    $matches = Select-String -InputObject $txt -Pattern "from\s+['""]([^'""]+)['""]|require\(\s*['""]([^'""]+)['""]\s*\)" -AllMatches
    foreach ($m in $matches.Matches) {
      $g = $m.Groups[1].Value
      if (-not $g) { $g = $m.Groups[2].Value }
      if ($g -and ($g.StartsWith('.') -or $g.StartsWith('@'))) {
        [void]$imports.Add($g)
      }
    }
  }

  # Zbuduj mapę rel ścieżek -> czy jest referencja (heurystyka: bez rozwiązywania rozszerzeń i indeksów)
  $byRel = @()
  foreach ($f in $allJs) {
    $rel = $f.FullName.Replace((Resolve-Path $src), '').TrimStart('\').Replace('\','/')
    $base = [System.IO.Path]::ChangeExtension($rel, $null)
    $isImported = $false
    foreach ($imp in $imports) {
      if ($imp.StartsWith('@')) {
        # alias – pomijamy, bo wymaga znajomości vite.config.js
        continue
      }
      $norm = ($imp.TrimStart('./')).TrimEnd('/')
      if ($base.EndsWith($norm)) { $isImported = $true; break }
    }
    $byRel += [PSCustomObject]@{ RelPath=$rel; Imported=$isImported }
  }
  $unused = $byRel | Where-Object { -not $_.Imported } | Sort-Object RelPath
  $unused | Export-Csv -NoTypeInformation -Encoding UTF8 "$Repo\reports\frontend_unused_candidates.csv"
}

# 7) Backend: testy osierocone vs. pliki źródłowe
$backendApp = Join-Path $Repo "backend\app"
if (Test-Path $backendApp) {
  $pyFiles = Get-ChildItem $backendApp -Recurse -File -Include *.py | Where-Object { $_.FullName -notmatch '\\tests\\' }
  $tests   = Get-ChildItem $backendApp -Recurse -File -Include test_*.py,*_test.py
  $noTests = $pyFiles | Where-Object {
    $stem = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    -not ($tests | Where-Object { $_.Name -match [regex]::Escape($stem) })
  } | Select-Object FullName, @{n='RelPath';e={$_.FullName.Replace((Resolve-Path $backendApp), '').TrimStart('\')}}
  $noTests | Export-Csv -NoTypeInformation -Encoding UTF8 "$Repo\reports\backend_files_without_matching_tests.csv"
}

# 8) Podsumowanie folderów śmieciowych do przeglądu
$trashDirs = @('tmp','temp','__trash','__old','_old','_backup','_stash')
$trashFound = foreach ($t in $trashDirs) {
  Get-ChildItem $Repo -Recurse -Directory -Filter $t | Select-Object FullName
}
$trashFound | Export-Csv -NoTypeInformation -Encoding UTF8 "$Repo\reports\trashlike_dirs.csv"

Write-Host "`nRaporty zapisane w: $Repo\reports"
