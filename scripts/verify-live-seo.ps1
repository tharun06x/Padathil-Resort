# Read-only deployed checks. Does not deploy, submit indexing, or change DNS.
param([string]$PreviewUrl)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Net.Http
$seoRoot = Split-Path -Parent $PSScriptRoot
$seoOrigin = 'https://padathilstays.com'
$seoHandler = New-Object System.Net.Http.HttpClientHandler
$seoHandler.AllowAutoRedirect = $false
$seoClient = New-Object System.Net.Http.HttpClient($seoHandler)
$seoClient.Timeout = [TimeSpan]::FromSeconds(15)
$seoClient.DefaultRequestHeaders.UserAgent.ParseAdd('Padathil-SEO-Verification/1.0')
$seoRows = [System.Collections.Generic.List[object]]::new()
$seoFailures = [System.Collections.Generic.List[string]]::new()
function Read-SeoUrl([string]$Url) {
  $response = $seoClient.GetAsync($Url).GetAwaiter().GetResult()
  try {
    $content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    $robotsHeader = if ($response.Headers.Contains('X-Robots-Tag')) { $response.Headers.GetValues('X-Robots-Tag') -join ', ' } else { '' }
    $row = [PSCustomObject]@{
      Url = $Url
      Status = [int]$response.StatusCode
      Location = [string]$response.Headers.Location
      RobotsHeader = $robotsHeader
      Canonical = [regex]::Match($content, '<link[^>]*rel="canonical"[^>]*href="([^"]+)"').Groups[1].Value
      RobotsMeta = [regex]::Match($content, '<meta[^>]*name="robots"[^>]*content="([^"]+)"').Groups[1].Value
      HasSiteNameSchema = $content -match '"@type"\s*:\s*"WebSite"'
    }
    $seoRows.Add($row)
    return @{ Row = $row; Content = $content }
  } finally { $response.Dispose() }
}
function Assert-Seo([bool]$Pass, [string]$Message) { if (-not $Pass) { $seoFailures.Add($Message) } }
try {
  [xml]$seoSitemap = Get-Content -LiteralPath (Join-Path $seoRoot 'sitemap.xml') -Raw
  foreach ($entry in $seoSitemap.urlset.url) {
    $url = [string]$entry.loc
    $result = Read-SeoUrl $url
    Assert-Seo ($result.Row.Status -eq 200) "$url must return 200 without redirect"
    Assert-Seo ($result.Row.Canonical -eq $url) "$url has a different deployed canonical"
    Assert-Seo ($result.Row.RobotsHeader -notmatch 'noindex' -and $result.Row.RobotsMeta -notmatch 'noindex') "$url blocks indexing"
    if ($url -eq "$seoOrigin/") { Assert-Seo $result.Row.HasSiteNameSchema 'Homepage WebSite schema is not deployed' }
    $legacy = if ($url -eq "$seoOrigin/") { "$seoOrigin/index.html" } else { "$url.html" }
    $redirect = Read-SeoUrl $legacy
    $destination = if ($redirect.Row.Location) { ([Uri]::new([Uri]$legacy, $redirect.Row.Location)).AbsoluteUri } else { '' }
    Assert-Seo ($redirect.Row.Status -in 301,308 -and $destination -eq $url) "$legacy must permanently redirect directly to $url"
    foreach ($variantOrigin in 'http://padathilstays.com', 'https://www.padathilstays.com', 'http://www.padathilstays.com') {
      $variantLegacy = $legacy.Replace($seoOrigin, $variantOrigin)
      try {
        $variantResult = Read-SeoUrl $variantLegacy
        $variantDestination = if ($variantResult.Row.Location) { ([Uri]::new([Uri]$variantLegacy, $variantResult.Row.Location)).AbsoluteUri } else { '' }
        Assert-Seo ($variantResult.Row.Status -in 301,308 -and $variantDestination -eq $url) "$variantLegacy does not redirect directly to its final canonical URL"
      } catch { $seoFailures.Add("Cannot verify ${variantLegacy}: $($_.Exception.Message)") }
    }
  }
  $robots = Read-SeoUrl "$seoOrigin/robots.txt"
  Assert-Seo ($robots.Row.Status -eq 200 -and $robots.Content -match 'Allow:\s*/' -and $robots.Content -notmatch 'Disallow:\s*/' -and $robots.Content.Contains("Sitemap: $seoOrigin/sitemap.xml")) 'Live robots.txt must allow crawling and reference the sitemap'
  $sitemap = Read-SeoUrl "$seoOrigin/sitemap.xml"
  Assert-Seo ($sitemap.Row.Status -eq 200) 'Live sitemap must return 200'
  [xml]$deployedSitemap = $sitemap.Content
  $deployedUrls = @($deployedSitemap.urlset.url | ForEach-Object { [string]$_.loc } | Sort-Object)
  $expectedUrls = @($seoSitemap.urlset.url | ForEach-Object { [string]$_.loc } | Sort-Object)
  Assert-Seo (($deployedUrls -join '|') -eq ($expectedUrls -join '|')) 'Deployed sitemap differs from the canonical repository sitemap'
  $missing = Read-SeoUrl "$seoOrigin/nonexistent-seo-verification-route"
  Assert-Seo ($missing.Row.Status -eq 404) 'Unknown routes must return 404, not a soft 404'
  foreach ($variant in 'http://padathilstays.com/', 'https://www.padathilstays.com/', 'http://www.padathilstays.com/') {
    try {
      $result = Read-SeoUrl $variant
      $destination = if ($result.Row.Location) { ([Uri]::new([Uri]$variant, $result.Row.Location)).AbsoluteUri } else { '' }
      Assert-Seo ($result.Row.Status -in 301,308 -and $destination -eq "$seoOrigin/") "$variant must permanently redirect directly to $seoOrigin/"
    } catch { $seoFailures.Add("Cannot verify ${variant}: $($_.Exception.Message)") }
  }
  $development = Read-SeoUrl 'https://padathil-resort.pages.dev/'
  Assert-Seo ($development.Row.RobotsHeader -match 'noindex' -or ($development.Row.Status -in 301,308 -and $development.Row.Location.StartsWith($seoOrigin))) 'Default pages.dev host must be noindex or redirect to production'
  if ($PreviewUrl) {
    $previewUri = [Uri]$PreviewUrl
    if ($previewUri.Scheme -ne 'https' -or -not $previewUri.Host.EndsWith('.padathil-resort.pages.dev')) { throw 'PreviewUrl must be an HTTPS subdomain of padathil-resort.pages.dev' }
    $preview = Read-SeoUrl $PreviewUrl
    Assert-Seo ($preview.Row.RobotsHeader -match 'noindex') 'Preview URL must return an X-Robots-Tag noindex header'
  }
} catch { $seoFailures.Add("Live verification incomplete: $($_.Exception.Message)") }
finally {
  $seoClient.Dispose()
  $seoHandler.Dispose()
  $seoOutput = Join-Path $seoRoot '.impeccable/review/seo'
  New-Item -ItemType Directory -Path $seoOutput -Force | Out-Null
  [PSCustomObject]@{ CheckedAt = [DateTime]::UtcNow.ToString('o'); Requests = $seoRows; Failures = $seoFailures; PreviewChecked = [bool]$PreviewUrl } | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $seoOutput 'live-results.json') -Encoding UTF8
}
$seoRows | Format-Table Url,Status,Location,RobotsHeader -AutoSize
if ($seoFailures.Count) { $seoFailures | ForEach-Object { Write-Output "PENDING: $_" }; exit 1 }
Write-Output "PASS $($seoRows.Count) live endpoint checks."
