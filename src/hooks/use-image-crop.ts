// hooks/use-image-crop.tsx
import { useCallback, useState, useEffect } from "react";
import { Area } from "react-easy-crop";
import { toast } from "sonner";

export function useImageCrop() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ⬇️ Reset all states to initial values
  const reset = useCallback(() => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMinZoom(0.1);
    setMaxZoom(3);
    setCroppedAreaPixels(null);
    setCroppedImage(null);
    setLoading(false);
  }, []);

  // ⬇️ Load dropped image and calculate min/max zoom
  const handleFileDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
      setCroppedImage(null);

      const img = new Image();
      img.onload = () => {
        const aspectRatio = 4 / 1;
        const { naturalWidth, naturalHeight } = img;

        // Calculate crop area size to fit the image within 4:1 aspect ratio
        const { width: cropWidth, height: cropHeight } = croppedAreaSize(
          naturalWidth,
          naturalHeight,
          aspectRatio
        );

        // For maxZoom, align crop area width with image width
        const maxZoom = naturalWidth / cropWidth;

        // For minZoom, allow zooming in (smaller than maxZoom)
        const zoomX = cropWidth / naturalWidth;
        const zoomY = cropHeight / naturalHeight;
        const fittedMinZoom = Math.min(zoomX, zoomY, maxZoom); // Ensure minZoom <= maxZoom

        setMinZoom(fittedMinZoom);
        setZoom(maxZoom); // Start with maxZoom to align with image width
        setMaxZoom(maxZoom); // Set maxZoom to align with image width

        // Initialize crop to align with top-left edge of the image
        setCrop({
          x: 0,
          y: 0,
        });
      };
      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  // ⬇️ Helper to calculate required cropping area size based on aspect ratio
  const croppedAreaSize = (width: number, height: number, aspect: number) => {
    const imgAspect = width / height;
    if (imgAspect > aspect) {
      // Image is wider
      const cropHeight = height;
      const cropWidth = cropHeight * aspect;
      return { width: cropWidth, height: cropHeight };
    } else {
      // Image is taller (e.g., 360x480)
      const cropWidth = width;
      const cropHeight = cropWidth / aspect;
      return { width: cropWidth, height: cropHeight };
    }
  };

  // ⬇️ Generate cropped image when crop area changes
    const getCroppedImage = useCallback(async (): Promise<File | null> => {
    if (!imageSrc || !croppedAreaPixels) return null;

    setLoading(true);

    try {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // 👇 Fill background with white (before drawing the image)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 👇 Draw the image with transparency on top of white
        ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
        );

        return await new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
            toast.error("Failed to crop image");
            setLoading(false);
            return resolve(null);
            }

            const file = new File([blob], "cropped.jpeg", { type: "image/jpeg" });
            setCroppedImage(file);
            setLoading(false);
            resolve(file);
        }, "image/jpeg", 0.9);
        });
    } catch (error) {
        console.error(error);
        toast.error("Image cropping failed");
        setLoading(false);
        return null;
    }
    }, [imageSrc, croppedAreaPixels]);

  // ⬇️ Update cropped image when crop area changes
  const onCropComplete = useCallback(
    async (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
      await getCroppedImage(); // Generate cropped image automatically
    },
    [getCroppedImage]
  );

  // ⬇️ Optional: Effect to handle initial crop after image load
  useEffect(() => {
    if (imageSrc && croppedAreaPixels && !croppedImage) {
      getCroppedImage(); // Ensure cropped image is generated initially
    }
  }, [imageSrc, croppedAreaPixels, croppedImage, getCroppedImage]);

  return {
    imageSrc,
    crop,
    zoom,
    minZoom,
    maxZoom,
    setCrop,
    setZoom,
    onCropComplete,
    handleFileDrop,
    getCroppedImage,
    croppedImage,
    loading,
    reset,
  };
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}