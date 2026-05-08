param(
    [int]$ChunkSize = 500
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Import-EnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#") -or -not $line.Contains("=")) {
            return
        }

        $name, $value = $line.Split("=", 2)
        [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
    }
}

function Convert-ToBoolean {
    param([string]$Value)

    return @("true", "t", "1", "yes", "y") -contains $Value.Trim().ToLowerInvariant()
}

function Convert-EmptyToNull {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    return $Value.Trim()
}

function Invoke-Upsert {
    param(
        [string]$Table,
        [object[]]$Rows
    )

    if ($Rows.Count -eq 0) {
        Write-Host "${Table}: 0"
        return
    }

    $uri = "$($env:NEXT_PUBLIC_SUPABASE_URL)/rest/v1/$Table`?on_conflict=code"
    $headers = @{
        "apikey" = $env:SUPABASE_SERVICE_ROLE_KEY
        "Authorization" = "Bearer $($env:SUPABASE_SERVICE_ROLE_KEY)"
        "Prefer" = "resolution=merge-duplicates"
    }

    for ($start = 0; $start -lt $Rows.Count; $start += $ChunkSize) {
        $end = [Math]::Min($start + $ChunkSize - 1, $Rows.Count - 1)
        $chunk = @($Rows[$start..$end])
        $json = $chunk | ConvertTo-Json -Depth 8 -Compress
        $body = [System.Text.Encoding]::UTF8.GetBytes($json)

        try {
            Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
        } catch {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            throw "${Table}: $responseBody"
        }
        Write-Progress -Activity "Importing $Table" -Status "$($end + 1) / $($Rows.Count)" -PercentComplete ((($end + 1) / $Rows.Count) * 100)
    }

    Write-Progress -Activity "Importing $Table" -Completed
    Write-Host "${Table}: $($Rows.Count)"
}

function Get-TableCount {
    param([string]$Table)

    $uri = "$($env:NEXT_PUBLIC_SUPABASE_URL)/rest/v1/$Table`?select=code&limit=1"
    $headers = @{
        "apikey" = $env:SUPABASE_SERVICE_ROLE_KEY
        "Authorization" = "Bearer $($env:SUPABASE_SERVICE_ROLE_KEY)"
        "Prefer" = "count=exact"
    }

    $response = Invoke-WebRequest -Uri $uri -Method Get -Headers $headers -UseBasicParsing
    $contentRange = $response.Headers["Content-Range"]

    if ($contentRange -match "/(\d+)$") {
        return [int]$Matches[1]
    }

    return $null
}

Import-EnvFile (Join-Path $Root ".env.development")
Import-EnvFile (Join-Path $Root ".env.local")

if ([string]::IsNullOrWhiteSpace($env:NEXT_PUBLIC_SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($env:SUPABASE_SERVICE_ROLE_KEY)) {
    throw "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
}

$ProvinceCodes = @{}
Import-Csv (Join-Path $Root "database/reference-data/psgc/psgc_provinces.updated.csv") | ForEach-Object {
    $ProvinceCodes[$_.code] = $true
}

$LegacyProvinceRows = @(
    [pscustomobject]@{ code = "0997"; name = "Basilan (Legacy)"; region_code = "09"; is_active = $true },
    [pscustomobject]@{ code = "1298"; name = "Cotabato City (Legacy)"; region_code = "12"; is_active = $true },
    [pscustomobject]@{ code = "1339"; name = "City of Manila"; region_code = "13"; is_active = $true },
    [pscustomobject]@{ code = "1374"; name = "NCR Second District"; region_code = "13"; is_active = $true },
    [pscustomobject]@{ code = "1375"; name = "NCR Third District"; region_code = "13"; is_active = $true },
    [pscustomobject]@{ code = "1376"; name = "NCR Fourth District"; region_code = "13"; is_active = $true },
    [pscustomobject]@{ code = "1538"; name = "Maguindanao (Legacy)"; region_code = "15"; is_active = $true }
)

$LegacyProvinceRows | ForEach-Object {
    $ProvinceCodes[$_.code] = $true
}

$ManilaDistrictRows = 1..14 | ForEach-Object {
    [pscustomobject]@{
        code = "1339{0:D2}" -f $_
        name = "City of Manila District $_"
        province_code = "1339"
        type = "city district"
        is_independent = $false
        is_active = $true
    }
}

$LegacyPsocSubMajorRows = @(
    [pscustomobject]@{ code = "61"; title = "Market-Oriented Skilled Agricultural Workers"; major_code = "6" }
)

$LegacyPsocMinorRows = @(
    [pscustomobject]@{ code = "611"; title = "Market Gardeners And Crop Growers"; sub_major_code = "61" }
)

$imports = @(
    @{
        Table = "psgc_regions"
        File = "database/reference-data/psgc/psgc_regions.updated.csv"
        Map = {
            param($row)
            [pscustomobject]@{ code = $row.code; name = $row.name; is_active = $true }
        }
    },
    @{
        Table = "psgc_provinces"
        File = "database/reference-data/psgc/psgc_provinces.updated.csv"
        Map = {
            param($row)
            [pscustomobject]@{ code = $row.code; name = $row.name; region_code = $row.region_code; is_active = $true }
        }
        ExtraRows = $LegacyProvinceRows
    },
    @{
        Table = "psgc_cities_municipalities"
        File = "database/reference-data/psgc/psgc_cities_municipalities.updated.fixed.csv"
        Map = {
            param($row)
            $isIndependent = Convert-ToBoolean $row.is_independent
            $provinceCode = Convert-EmptyToNull $row.province_code
            [pscustomobject]@{
                code = $row.code
                name = $row.name
                province_code = if ($isIndependent -or -not $provinceCode -or -not $ProvinceCodes.ContainsKey($provinceCode)) { $null } else { $provinceCode }
                type = $row.type
                is_independent = $isIndependent
                is_active = $true
            }
        }
        ExtraRows = $ManilaDistrictRows
    },
    @{
        Table = "psgc_barangays"
        File = "database/reference-data/psgc/psgc_barangays.updated.csv"
        Map = {
            param($row)
            [pscustomobject]@{ code = $row.code; name = $row.name; city_municipality_code = $row.city_municipality_code; is_active = $true }
        }
    },
    @{
        Table = "psoc_major_groups"
        File = "database/reference-data/psoc/psoc_major_groups_clean_from_user.csv"
        Map = {
            param($row)
            [pscustomobject]@{ code = $row.code; title = $row.title }
        }
    },
    @{
        Table = "psoc_sub_major_groups"
        File = "database/reference-data/psoc/psoc_sub_major_groups_clean_from_user.csv"
        Map = {
            param($row)
            [pscustomobject]@{ code = $row.code; title = $row.title; major_code = $row.major_code }
        }
        ExtraRows = $LegacyPsocSubMajorRows
    },
    @{
        Table = "psoc_minor_groups"
        File = "database/reference-data/psoc/psoc_minor_groups_clean_from_user.csv"
        Map = {
            param($row)
            [pscustomobject]@{ code = $row.code; title = $row.title; sub_major_code = $row.sub_major_code }
        }
        ExtraRows = $LegacyPsocMinorRows
    },
    @{
        Table = "psoc_unit_groups"
        File = "database/reference-data/psoc/psoc_unit_groups_clean_from_user.csv"
        Map = {
            param($row)
            [pscustomobject]@{ code = $row.code; title = $row.title; minor_code = $row.minor_code }
        }
    }
)

foreach ($import in $imports) {
    $csvPath = Join-Path $Root $import.File
    $rows = @(Import-Csv $csvPath | ForEach-Object { & $import.Map $_ })
    if ($import.ContainsKey("ExtraRows")) {
        $rows = @($rows + $import.ExtraRows)
    }
    Invoke-Upsert -Table $import.Table -Rows $rows
}

Write-Host ""
Write-Host "Counts after import:"
foreach ($import in $imports) {
    $count = Get-TableCount $import.Table
    Write-Host "$($import.Table): $count"
}
