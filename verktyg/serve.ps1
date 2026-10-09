# Enkel webbserver för att testa prototypen lokalt utan Node eller Python.
# Kör:  powershell -ExecutionPolicy Bypass -File verktyg/serve.ps1   och öppna http://localhost:8080
param([int]$Port = 8080, [string]$Root = (Join-Path $PSScriptRoot '..\prototyp'))

$Root = (Resolve-Path $Root).Path
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css'; '.png' = 'image/png'; '.svg' = 'image/svg+xml'; '.json' = 'application/json' }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serverar $Root -> http://localhost:$Port"
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq '') { $path = 'index.html' }
    $file = Join-Path $Root $path
    $full = [IO.Path]::GetFullPath($file)
    if ($full.StartsWith($Root) -and (Test-Path $full -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full)
      $ctx.Response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
      $ctx.Response.Headers.Add('Cache-Control', 'no-store')
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    } catch { Write-Host $_ }
    try { $ctx.Response.Close() } catch { }
  }
} finally { $listener.Stop() }
