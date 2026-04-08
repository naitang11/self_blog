Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Start-Sleep -Seconds 2

$shot = [System.Windows.Forms.Screen]::PrimaryScreen
$w = $shot.Bounds.Width
$h = $shot.Bounds.Height
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.CopyFromScreen($shot.Bounds.Location, [System.Drawing.Point]::Empty, $shot.Bounds.Size)
$bmp.Save("C:\Users\yangh\.openclaw\workspace\blog\screenshot.png")
$graphics.Dispose()
$bmp.Dispose()
Write-Output "Screenshot saved: $w x $h"
