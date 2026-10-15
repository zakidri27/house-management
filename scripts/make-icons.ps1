Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$res  = Join-Path $root 'android\app\src\main\res'

$c1 = [System.Drawing.Color]::FromArgb(255, 139, 92, 246)
$c2 = [System.Drawing.Color]::FromArgb(255, 37, 99, 235)
$door = [System.Drawing.Color]::FromArgb(255, 109, 40, 217)

$dens = @{ 'mdpi' = 48; 'hdpi' = 72; 'xhdpi' = 96; 'xxhdpi' = 144; 'xxxhdpi' = 192 }

function RoundedPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function DrawMark($g, [single]$size, [bool]$round, [bool]$transparent) {
  $s = $size / 48.0
  $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
  if (-not $transparent) {
    $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45)
    if ($round) { $g.FillEllipse($grad, $rect) }
    else { $rp = RoundedPath 0 0 $size $size (14 * $s); $g.FillPath($grad, $rp); $rp.Dispose() }
  }
  $white = [System.Drawing.Brushes]::White
  $roof = New-Object 'System.Drawing.PointF[]' 3
  $roof[0] = [System.Drawing.PointF]::new([single](24 * $s), [single](9.5 * $s))
  $roof[1] = [System.Drawing.PointF]::new([single](39.5 * $s), [single](22 * $s))
  $roof[2] = [System.Drawing.PointF]::new([single](8.5 * $s), [single](22 * $s))
  $g.FillPolygon($white, $roof)
  $bp = RoundedPath (12.8 * $s) (20.5 * $s) (22.4 * $s) (18 * $s) (2 * $s)
  $g.FillPath($white, $bp); $bp.Dispose()
  $dp = RoundedPath (20 * $s) (27.5 * $s) (8 * $s) (11 * $s) (1.6 * $s)
  $g.FillPath((New-Object System.Drawing.SolidBrush($door)), $dp); $dp.Dispose()
  $g.FillEllipse($white, (21.6 * $s), (21.8 * $s), (4.8 * $s), (4.8 * $s))
}

foreach ($k in $dens.Keys) {
  $size = $dens[$k]
  $dir = Join-Path $res "mipmap-$k"
  foreach ($variant in @('ic_launcher', 'ic_launcher_round', 'ic_launcher_foreground')) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::Transparent)
    if ($variant -eq 'ic_launcher_foreground') { DrawMark $g $size $false $true }
    elseif ($variant -eq 'ic_launcher_round') { DrawMark $g $size $true $false }
    else { DrawMark $g $size $false $false }
    $g.Dispose()
    $out = Join-Path $dir "$variant.png"
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
  }
  Write-Host "icons: mipmap-$k ($size px)"
}
Write-Host 'Launcher icons generated.' -ForegroundColor Green
