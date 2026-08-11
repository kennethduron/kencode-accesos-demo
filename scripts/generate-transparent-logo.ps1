$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot "references\brand\kencode.jpg"
$outputPath = Join-Path $projectRoot "public\brand\ken-code-logo-transparent.png"

Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

public static class ConnectedBackgroundRemoval
{
    private const double TransparentDistance = 6.0;
    private const double ExteriorDistance = 96.0;

    private static double DistanceFromWhite(Color color)
    {
        int red = 255 - color.R;
        int green = 255 - color.G;
        int blue = 255 - color.B;
        return Math.Sqrt((red * red) + (green * green) + (blue * blue));
    }

    private static bool IsExteriorCandidate(Color color)
    {
        return DistanceFromWhite(color) <= ExteriorDistance;
    }

    private static int UnmatteChannel(int channel, double alpha)
    {
        if (alpha <= 0.0) return 0;
        double value = (channel - (255.0 * (1.0 - alpha))) / alpha;
        return Math.Max(0, Math.Min(255, (int)Math.Round(value)));
    }

    public static void Convert(string sourcePath, string outputPath)
    {
        using (var source = new Bitmap(sourcePath))
        using (var output = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
        {
            int width = source.Width;
            int height = source.Height;
            var exterior = new bool[width * height];
            var queue = new Queue<int>();

            Action<int, int> enqueue = (x, y) =>
            {
                int index = (y * width) + x;
                if (exterior[index] || !IsExteriorCandidate(source.GetPixel(x, y))) return;
                exterior[index] = true;
                queue.Enqueue(index);
            };

            for (int x = 0; x < width; x++)
            {
                enqueue(x, 0);
                enqueue(x, height - 1);
            }
            for (int y = 0; y < height; y++)
            {
                enqueue(0, y);
                enqueue(width - 1, y);
            }

            while (queue.Count > 0)
            {
                int index = queue.Dequeue();
                int x = index % width;
                int y = index / width;
                if (x > 0) enqueue(x - 1, y);
                if (x + 1 < width) enqueue(x + 1, y);
                if (y > 0) enqueue(x, y - 1);
                if (y + 1 < height) enqueue(x, y + 1);
            }

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    Color color = source.GetPixel(x, y);
                    int index = (y * width) + x;
                    if (!exterior[index])
                    {
                        output.SetPixel(x, y, Color.FromArgb(255, color.R, color.G, color.B));
                        continue;
                    }

                    double distance = DistanceFromWhite(color);
                    if (distance <= TransparentDistance)
                    {
                        output.SetPixel(x, y, Color.Transparent);
                        continue;
                    }

                    double alpha = Math.Min(1.0, (distance - TransparentDistance) / (ExteriorDistance - TransparentDistance));
                    int alphaByte = (int)Math.Round(alpha * 255.0);
                    if (alphaByte < 32)
                    {
                        output.SetPixel(x, y, Color.Transparent);
                        continue;
                    }
                    output.SetPixel(
                        x,
                        y,
                        Color.FromArgb(
                            alphaByte,
                            UnmatteChannel(color.R, alpha),
                            UnmatteChannel(color.G, alpha),
                            UnmatteChannel(color.B, alpha)
                        )
                    );
                }
            }

            output.SetResolution(source.HorizontalResolution, source.VerticalResolution);
            output.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[ConnectedBackgroundRemoval]::Convert($sourcePath, $outputPath)
