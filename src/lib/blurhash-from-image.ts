// lib/blurhash-from-image.ts
import { encode } from "blurhash";

export default async function getBlurhashFromImage(file: Blob): Promise<string> {
  try {
    const imageBitmap = await createImageBitmap(file);

    const maxSize = 32;
    let { width, height } = imageBitmap;
    if (width > maxSize || height > maxSize) {
      const scale = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    ctx.drawImage(imageBitmap, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    return encode(imageData.data, imageData.width, imageData.height, 4, 3);
  } catch (error) {
    console.error("Blurhash generation failed:", error);
    throw new Error("Failed to generate blurhash");
  }
}