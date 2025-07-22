"use client";

import React, { useEffect, useRef } from "react";
import { decode } from "blurhash";

interface BlurhashCanvasProps {
  hash: string;
  width: number;
  height: number;
  punch?: number;
  className?: string;
}

const BlurhashCanvas: React.FC<BlurhashCanvasProps> = ({
  hash,
  width,
  height,
  punch = 1,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!hash || !canvasRef.current) return;

    const pixels = decode(hash, width, height, punch);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }, [hash, width, height, punch]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default BlurhashCanvas;