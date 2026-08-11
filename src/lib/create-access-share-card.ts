import QRCode from "qrcode";
import type { AccessShareCardModel } from "./access-share";

export const ACCESS_SHARE_CARD_WIDTH = 1080;
export const ACCESS_SHARE_CARD_HEIGHT = 1350;

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
  context.font = "700 19px Inter, Arial, sans-serif";
  context.fillText(label.toUpperCase(), x, y);
  context.fillStyle = "#07142F";
  const size = fittedText(context, value, maxWidth, 28, 20, 800);
  context.font = `800 ${size}px Inter, Arial, sans-serif`;
  context.fillText(value, x, y + 38, maxWidth);
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

  context.fillStyle = "rgba(34, 211, 238, 0.12)";
  context.beginPath();
  context.arc(1040, 80, 250, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#FFFFFF";
  context.font = "900 58px Inter, Arial, sans-serif";
  context.fillText(model.brand, 72, 94);
  context.fillStyle = "#A5F3FC";
  context.font = "700 26px Inter, Arial, sans-serif";
  context.fillText(model.product, 72, 139);

  roundRect(context, 72, 176, 424, 68, 34);
  context.fillStyle = "rgba(16, 185, 129, 0.18)";
  context.fill();
  context.strokeStyle = "rgba(110, 231, 183, 0.55)";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#D1FAE5";
  context.font = "900 25px Inter, Arial, sans-serif";
  context.fillText(model.title, 101, 219);

  context.shadowColor = "rgba(2, 8, 23, 0.28)";
  context.shadowBlur = 36;
  context.shadowOffsetY = 16;
  roundRect(context, 62, 278, 956, 962, 42);
  context.fillStyle = "#FFFFFF";
  context.fill();
  context.shadowColor = "transparent";

  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, model.qrPayload, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 560,
    color: { dark: "#07142FFF", light: "#FFFFFFFF" },
  });
  context.imageSmoothingEnabled = false;
  context.drawImage(qrCanvas, 260, 316, 560, 560);
  context.imageSmoothingEnabled = true;

  context.fillStyle = "#475569";
  context.font = "700 24px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(model.instruction, 540, 921);

  context.fillStyle = "#64748B";
  context.font = "800 19px Inter, Arial, sans-serif";
  context.fillText("CÓDIGO DE ACCESO", 540, 966);
  context.fillStyle = "#1D4ED8";
  const codeSize = fittedText(context, model.code, 820, 58, 42, 900);
  context.font = `900 ${codeSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  context.fillText(model.code, 540, 1031);

  context.textAlign = "left";
  context.strokeStyle = "#E2E8F0";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(112, 1066);
  context.lineTo(968, 1066);
  context.stroke();

  drawDetail(context, "Visitante", model.visitor, 112, 1109, 370);
  drawDetail(context, "Vivienda", model.home, 572, 1109, 350);
  drawDetail(context, "Tipo", model.visitType, 112, 1181, 370);
  drawDetail(context, "Vigencia", model.validity, 572, 1181, 350);

  context.fillStyle = "#CFFAFE";
  context.font = "700 22px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(model.footer, 540, 1305);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG generation failed"));
    }, "image/png");
  });
}
