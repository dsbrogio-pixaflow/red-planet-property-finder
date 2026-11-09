param(
    [string]$HostOverride = "",
    [switch]$InspectOnly,
    [switch]$VerifyOnly,
    [switch]$TrimToTen
)

$ErrorActionPreference = "Stop"
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../.."))
$regionSource = [IO.File]::ReadAllText((Join-Path $repositoryRoot "src/data/marsRegions.ts"))
$regionNames = @([regex]::Matches($regionSource, '\bid:\s*"[^"]+"\s*,\s*name:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
if ($regionNames.Count -eq 0 -or $regionNames.Count -gt 20 -or ($regionNames | Select-Object -Unique).Count -ne $regionNames.Count) {
    throw "Expected 1 to 20 unique registered Mars regions. No database changes were made."
}
$regionsJson = ConvertTo-Json -InputObject $regionNames -Compress
$connectionValue = [Environment]::GetEnvironmentVariable("DATABASE_URL_UNPOOLED")
if ([string]::IsNullOrWhiteSpace($connectionValue)) {
    foreach ($line in [IO.File]::ReadAllLines((Join-Path $repositoryRoot ".env.local"))) {
        if ($line -match '^DATABASE_URL_UNPOOLED\s*=(.*)$') { $connectionValue = $matches[1]; break }
    }
}
if ([string]::IsNullOrWhiteSpace($connectionValue)) { throw "DATABASE_URL_UNPOOLED is required." }
$connectionUri = [Uri]($connectionValue.Trim().Trim([char]34).Trim([char]39))
if ($connectionUri.Scheme -notin @("postgres", "postgresql")) { throw "Expected a PostgreSQL connection." }
$credentials = $connectionUri.UserInfo.Split(':', 2)
if ($credentials.Length -ne 2) { throw "Database credentials are required." }
$targetHost = if ($HostOverride) { $HostOverride } else { $connectionUri.Host }
if ($targetHost -match '-pooler\.') { throw "Use a direct database connection." }

$pgSettings = @{
    PGHOST = $targetHost
    PGPORT = if ($connectionUri.Port -gt 0) { [string]$connectionUri.Port } else { "5432" }
    PGUSER = [Uri]::UnescapeDataString($credentials[0])
    PGPASSWORD = [Uri]::UnescapeDataString($credentials[1])
    PGDATABASE = [Uri]::UnescapeDataString($connectionUri.AbsolutePath.TrimStart('/'))
    PGSSLMODE = "require"
    PGCHANNELBINDING = "require"
    PGCONNECT_TIMEOUT = "15"
    PGCLIENTENCODING = "UTF8"
}
$previousSettings = @{}
$previousOutputEncoding = $OutputEncoding
try {
    $OutputEncoding = New-Object Text.UTF8Encoding $false
    foreach ($key in $pgSettings.Keys) {
        $previousSettings[$key] = [Environment]::GetEnvironmentVariable($key)
        [Environment]::SetEnvironmentVariable($key, $pgSettings[$key], "Process")
    }
    if ($InspectOnly) {
        $sql = "SELECT u.id, u.full_name, u.role, count(p.id) AS existing_listings FROM users u LEFT JOIN properties p ON p.user_id=u.id GROUP BY u.id ORDER BY u.id; SELECT count(*) AS existing_images FROM property_images WHERE image_url ~ '^https?://';"
    } else {
        $sqlFile = if ($VerifyOnly) { "Verify-DemoListings.sql" } elseif ($TrimToTen) { "Trim-DemoListings.sql" } else { "Seed-DemoListings.sql" }
        $sql = [IO.File]::ReadAllText((Join-Path $PSScriptRoot $sqlFile))
        $sql = $sql.Replace("'__MARS_REGIONS_JSON__'", "'" + $regionsJson.Replace("'", "''") + "'")
    }
    $sql | & psql --no-psqlrc --no-password --set ON_ERROR_STOP=1
    if ($LASTEXITCODE -ne 0) { throw "Demo listing operation failed; inspect the SQL error above." }
} finally {
    $OutputEncoding = $previousOutputEncoding
    foreach ($key in $previousSettings.Keys) { [Environment]::SetEnvironmentVariable($key, $previousSettings[$key], "Process") }
}
