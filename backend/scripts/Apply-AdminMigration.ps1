param(
    [string]$HostOverride = "",
    [switch]$VerifyOnly
)

$ErrorActionPreference = "Stop"
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "../.."))
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
if ($targetHost -match '-pooler\.') { throw "Use a direct database connection for migrations." }

$pgSettings = @{
    PGHOST = $targetHost
    PGPORT = if ($connectionUri.Port -gt 0) { [string]$connectionUri.Port } else { "5432" }
    PGUSER = [Uri]::UnescapeDataString($credentials[0])
    PGPASSWORD = [Uri]::UnescapeDataString($credentials[1])
    PGDATABASE = [Uri]::UnescapeDataString($connectionUri.AbsolutePath.TrimStart('/'))
    PGSSLMODE = "require"
    PGCHANNELBINDING = "require"
    PGCONNECT_TIMEOUT = "15"
}
$previousSettings = @{}
try {
    foreach ($key in $pgSettings.Keys) {
        $previousSettings[$key] = [Environment]::GetEnvironmentVariable($key)
        [Environment]::SetEnvironmentVariable($key, $pgSettings[$key], "Process")
    }
    if (-not $VerifyOnly) {
        & psql --no-psqlrc --no-password --set ON_ERROR_STOP=1 --file (Join-Path $repositoryRoot "backend/src/main/resources/db/migrations/V20261108__administrator_role.sql")
        if ($LASTEXITCODE -ne 0) { throw "Administrator migration failed; inspect the SQL error above." }
    }
    & psql --no-psqlrc --no-password --set ON_ERROR_STOP=1 --command "SELECT count(*) AS users_total, count(*) FILTER (WHERE role = 'ADMIN') AS administrators FROM users; SELECT id, full_name, email, role FROM users WHERE lower(trim(email)) = 'master@master.com';"
    if ($LASTEXITCODE -ne 0) { throw "Administrator verification failed." }
} finally {
    foreach ($key in $previousSettings.Keys) { [Environment]::SetEnvironmentVariable($key, $previousSettings[$key], "Process") }
}
