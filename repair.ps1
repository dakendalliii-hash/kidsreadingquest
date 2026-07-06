Write-Host "=== Cleaning Next.js / Turbopack caches ==="

# Delete .next
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

# Delete global Next.js cache
if (Test-Path "$env:LOCALAPPDATA\next") {
    Remove-Item -Recurse -Force "$env:LOCALAPPDATA\next"
}

# Delete panic logs
Get-ChildItem "$env:LOCALAPPDATA\Temp" -Filter "next-panic-*" | Remove-Item -Force

# Delete PostCSS/Tailwind cache
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
}

# Delete node_modules + lockfile
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "=== Reinstalling dependencies ==="
npm install

Write-Host "=== Repair complete. Run: npm run dev ==="
