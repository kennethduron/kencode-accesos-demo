$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot "references\brand\favicon.jpg"
$socialSourcePath = Join-Path $projectRoot "references\brand\og.jpg"
$iconDirectory = Join-Path $projectRoot "public\icons"
$socialDirectory = Join-Path $projectRoot "public\social"
$faviconPath = Join-Path $projectRoot "src\app\favicon.ico"

New-Item -ItemType Directory -Force -Path $iconDirectory, $socialDirectory | Out-Null

$source = [System.Drawing.Image]::FromFile($sourcePath)
$sourceRectangle = New-Object System.Drawing.Rectangle(0, 0, $source.Width, $source.Height)
$navy = [System.Drawing.ColorTranslator]::FromHtml("#020b20")

function Export-Icon([string]$name, [int]$size, [double]$contentScale) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bitmap.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear($navy)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $contentSize = [int][Math]::Round($size * $contentScale)
    $offset = [int][Math]::Round(($size - $contentSize) / 2)
    $destination = New-Object System.Drawing.Rectangle($offset, $offset, $contentSize, $contentSize)
    $graphics.DrawImage($source, $destination, $sourceRectangle, [System.Drawing.GraphicsUnit]::Pixel)
    $bitmap.Save((Join-Path $iconDirectory $name), [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

function Export-Ico([string]$outputPath, [string[]]$pngPaths) {
  $images = New-Object 'System.Collections.Generic.List[byte[]]'
  foreach ($pngPath in $pngPaths) {
    $images.Add([System.IO.File]::ReadAllBytes($pngPath))
  }
  $sizes = @(32, 48)
  $stream = New-Object System.IO.FileStream($outputPath, [System.IO.FileMode]::Create)
  $writer = New-Object System.IO.BinaryWriter($stream)
  try {
    $writer.Write([UInt16]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]$images.Count)
    $offset = 6 + (16 * $images.Count)
    for ($index = 0; $index -lt $images.Count; $index++) {
      $writer.Write([Byte]$sizes[$index])
      $writer.Write([Byte]$sizes[$index])
      $writer.Write([Byte]0)
      $writer.Write([Byte]0)
      $writer.Write([UInt16]1)
      $writer.Write([UInt16]32)
      $writer.Write([UInt32]$images[$index].Length)
      $writer.Write([UInt32]$offset)
      $offset += $images[$index].Length
    }
    foreach ($image in $images) {
      $writer.Write([Byte[]]$image, 0, $image.Length)
    }
  } finally {
    $writer.Dispose()
    $stream.Dispose()
  }
}

try {
  Export-Icon "icon-32x32.png" 32 1.0
  Export-Icon "icon-48x48.png" 48 1.0
  Export-Icon "icon-192.png" 192 1.0
  Export-Icon "icon-512.png" 512 1.0
  # El master ya sitúa el isotipo dentro de la safe zone central (80 % del lienzo).
  Export-Icon "maskable-192.png" 192 1.0
  Export-Icon "maskable-512.png" 512 1.0
  Export-Icon "apple-touch-icon.png" 180 1.0
  Export-Ico $faviconPath @(
    (Join-Path $iconDirectory "icon-32x32.png"),
    (Join-Path $iconDirectory "icon-48x48.png")
  )
  Copy-Item -LiteralPath $socialSourcePath -Destination (Join-Path $socialDirectory "ecoterra-access-demo-og-v1.jpg") -Force
} finally {
  $source.Dispose()
}
