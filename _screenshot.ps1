Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class NativeWin {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
    public const int SW_RESTORE = 9;
    public const int SW_SHOW = 5;
}
"@

Start-Sleep -Milliseconds 500

$procs = Get-Process msedge -ErrorAction SilentlyContinue
$targetHwnd = [IntPtr]::Zero

foreach ($p in $procs) {
    $hwnd = $p.MainWindowHandle
    if ($hwnd -ne [IntPtr]::Zero) {
        $title = $p.MainWindowTitle
        Write-Output "Window: $title (handle=$hwnd)"
        if ($title -like "*blog*" -or $title -like "*index*" -or $title -eq "") {
            $targetHwnd = $hwnd
        }
    }
}

# Use first found window
if ($targetHwnd -eq [IntPtr]::Zero -and $procs.Count -gt 0) {
    $targetHwnd = $procs[0].MainWindowHandle
}

if ($targetHwnd -ne [IntPtr]::Zero) {
    [NativeWin]::ShowWindow($targetHwnd, [NativeWin]::SW_RESTORE) | Out-Null
    [NativeWin]::SetForegroundWindow($targetHwnd) | Out-Null
    [NativeWin]::BringWindowToTop($targetHwnd) | Out-Null
    Write-Output "Activated window with handle $targetHwnd"
}

Start-Sleep -Milliseconds 800

$shot = [System.Windows.Forms.Screen]::PrimaryScreen
$w = $shot.Bounds.Width
$h = $shot.Bounds.Height
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($shot.Bounds.Location, [System.Drawing.Point]::Empty, $shot.Bounds.Size)
$bmp.Save("C:\Users\yangh\.openclaw\workspace\blog\screenshot3.png")
$g.Dispose()
$bmp.Dispose()
Write-Output "Screenshot: $w x $h"
