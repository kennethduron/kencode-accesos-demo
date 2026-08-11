$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot "public\brand\ken-code-logo.jpg"
$outputDirectory = Join-Path $projectRoot "public\icons"
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$source = [System.Drawing.Image]::FromFile($sourcePath)
$crop = New-Object System.Drawing.Rectangle(0, 50, 520, 520)
$navy = [System.Drawing.ColorTranslator]::FromHtml("#030b1d")

function Export-Icon([string]$name, [int]$size, [double]$contentScale) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bitmap.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear($navy)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $contentSize = [int][Math]::Round($size * $contentScale)
  $offset = [int][Math]::Round(($size - $contentSize) / 2)
  $destination = New-Object System.Drawing.Rectangle($offset, $offset, $contentSize, $contentSize)
  $graphics.DrawImage($source, $destination, $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $bitmap.Save((Join-Path $outputDirectory $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

try {
  Export-Icon "icon-192.png" 192 0.94
  Export-Icon "icon-512.png" 512 0.94
  Export-Icon "maskable-192.png" 192 0.78
  Export-Icon "maskable-512.png" 512 0.78
  Export-Icon "apple-touch-icon.png" 180 0.88
} finally {
  $source.Dispose()
}
