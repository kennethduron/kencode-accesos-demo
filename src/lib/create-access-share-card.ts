import QRCode from "qrcode";
import type { AccessShareCardModel } from "./access-share";

export const ACCESS_SHARE_CARD_WIDTH = 1080;
export const ACCESS_SHARE_CARD_HEIGHT = 1350;
export const ACCESS_SHARE_HEADER_HEIGHT = 190;
export const ACCESS_SHARE_FOOTER_HEIGHT = 90;
export const ACCESS_SHARE_QR_SIZE = 500;
export const ACCESS_SHARE_CODE_FONT_SIZE = 68;

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function fittedText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  weight = 800,
) {
  let size = initialSize;
  while (size > minSize) {
    context.font = `${weight} ${size}px Inter, Arial, sans-serif`;
    if (context.measureText(value).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function drawDetail(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  context.fillStyle = "#64748B";
  context.font = "750 17px Inter, Arial, sans-serif";
  context.fillText(label.toUpperCase(), x, y);
  context.fillStyle = "#07142F";
  const size = fittedText(context, value, maxWidth, 27, 17, 800);
  context.font = `800 ${size}px Inter, Arial, sans-serif`;
  context.fillText(value, x, y + 36, maxWidth);
}

function drawValidityDetail(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  const [duration, validUntil] = value.split(" · válido hasta ");
  context.fillStyle = "#64748B";
  context.font = "750 17px Inter, Arial, sans-serif";
  context.fillText("VIGENCIA", x, y);
  context.fillStyle = "#1D4ED8";
  context.font = "800 25px Inter, Arial, sans-serif";
  context.fillText(duration, x, y + 36, maxWidth);
  context.fillStyle = "#334155";
  const detail = validUntil ? `Válido hasta ${validUntil}` : value;
  const size = fittedText(context, detail, maxWidth, 19, 16, 750);
  context.font = `750 ${size}px Inter, Arial, sans-serif`;
  context.fillText(detail, x, y + 66, maxWidth);
}

export async function createAccessShareCard(model: AccessShareCardModel): Promise<Blob> {
  if (!model.shareable) throw new Error("Access is not shareable");

  const canvas = document.createElement("canvas");
  canvas.width = ACCESS_SHARE_CARD_WIDTH;
  canvas.height = ACCESS_SHARE_CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  const background = context.createLinearGradient(0, 0, ACCESS_SHARE_CARD_WIDTH, ACCESS_SHARE_CARD_HEIGHT);
  background.addColorStop(0, "#07142F");
  background.addColorStop(0.56, "#0B2C58");
  background.addColorStop(1, "#075985");
  context.fillStyle = background;
  context.fillRect(0, 0, ACCESS_SHARE_CARD_WIDTH, ACCESS_SHARE_CARD_HEIGHT);

  context.fillStyle = "#FFFFFF";
  context.font = "900 40px Inter, Arial, sans-serif";
  context.fillText(model.brand, 64, 72);
  context.fillStyle = "#A5F3FC";
  context.font = "700 20px Inter, Arial, sans-serif";
  context.fillText(model.product, 64, 108);

  const badgeWidth = model.title === "ACCESO AUTORIZADO" ? 320 : 276;
  const badgeX = ACCESS_SHARE_CARD_WIDTH - badgeWidth - 64;
  roundRect(context, badgeX, 45, badgeWidth, 54, 27);
  context.fillStyle = "rgba(16, 185, 129, 0.18)";
  context.fill();
  context.strokeStyle = "rgba(110, 231, 183, 0.55)";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#D1FAE5";
  context.font = "900 20px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(model.title, badgeX + badgeWidth / 2, 79);
  context.textAlign = "left";

  context.shadowColor = "rgba(2, 8, 23, 0.28)";
  context.shadowBlur = 32;
  context.shadowOffsetY = 14;
  roundRect(context, 52, 160, 976, 1095, 42);
  context.fillStyle = "#FFFFFF";
  context.fill();
  context.shadowColor = "transparent";

  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, model.qrPayload, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: ACCESS_SHARE_QR_SIZE,
    color: { dark: "#07142FFF", light: "#FFFFFFFF" },
  });
  context.imageSmoothingEnabled = false;
  context.drawImage(qrCanvas, 290, 194, ACCESS_SHARE_QR_SIZE, ACCESS_SHARE_QR_SIZE);
  context.imageSmoothingEnabled = true;

  context.fillStyle = "#64748B";
  context.font = "800 19px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("CÓDIGO DE ACCESO", 540, 742);
  context.fillStyle = "#1D4ED8";
  const codeSize = fittedText(context, model.code, 820, ACCESS_SHARE_CODE_FONT_SIZE, 48, 900);
  context.font = `900 ${codeSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  context.fillText(model.code, 540, 815);

  context.fillStyle = "#475569";
  context.font = "700 22px Inter, Arial, sans-serif";
  context.fillText(model.instruction, 540, 868);

  context.textAlign = "left";
  context.strokeStyle = "#E2E8F0";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(112, 906);
  context.lineTo(968, 906);
  context.stroke();

  drawDetail(context, "Visitante", model.visitor, 112, 956, 370);
  drawValidityDetail(context, model.validity, 572, 956, 390);
  drawDetail(context, "Vivienda", model.home, 112, 1064, 370);
  drawDetail(context, "Tipo", model.visitType, 572, 1064, 390);

  context.fillStyle = "#CFFAFE";
  context.font = "700 20px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(model.footer, 540, 1310);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG generation failed"));
    }, "image/png");
  });
}
