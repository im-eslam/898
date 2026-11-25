// Phone photos are often 3 to 8 MB and far bigger than a menu needs. Anything that is
// too large, too wide, or not a JPEG/PNG/WebP is redrawn here at a sensible size, so the
// upload is small and the server's size limit is never reached.
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.86;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const SERVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class ImageError extends Error {
  readonly reason: "type" | "read";
  constructor(reason: "type" | "read") {
    super(reason);
    this.name = "ImageError";
    this.reason = reason;
  }
}

// Some phones report no type at all for a photo, so an empty type is allowed to try.
export function isPhotoFile(file: File): boolean {
  return file.type === "" || file.type.startsWith("image/");
}

export async function prepareImage(file: File): Promise<File> {
  if (!isPhotoFile(file)) throw new ImageError("type");

  let bitmap: ImageBitmap;
  try {
    // Honour the EXIF rotation so phone photos are not drawn sideways after the redraw.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("read");
  }

  try {
    const { width, height } = bitmap;
    const fitsAlready = Math.max(width, height) <= MAX_EDGE;
    if (fitsAlready && SERVER_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES) {
      return file;
    }

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new ImageError("read");

    // Redraw on white so transparent PNGs don't turn black in JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await toBlob(canvas, "image/jpeg", JPEG_QUALITY);
    if (!blob) throw new ImageError("read");
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
