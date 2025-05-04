"use client";

// pages/ocr.tsx
import { useRef, useState } from "react";
import Tesseract, { createWorker } from "tesseract.js";

const OCRPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const captureAndReadText = async () => {
    setLoading(true);
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;

      canvasRef.current.width = width;
      canvasRef.current.height = height;
      context?.drawImage(videoRef.current, 0, 0, width, height);

      const imageData = context?.getImageData(0, 0, width, height);
      if (imageData && context) {
        context.putImageData(imageData, 0, 0);
      }

      const worker = await createWorker("por");
      const {
        data: { text },
      } = await worker.recognize(canvasRef.current);
      await worker.terminate();

      // const cleanedText = text.replace(/[^A-Za-z0-9\s]/g, "");
      setText(text);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">OCR from Camera</h1>
      <video ref={videoRef} className="w-full max-w-md" />
      <div className="my-4 flex gap-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={startCamera}
        >
          Start Camera
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={captureAndReadText}
        >
          Capture & Read Text
        </button>
      </div>
      {loading && <p>Processing...</p>}
      <canvas ref={canvasRef} className="hidden" />
      {text && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Detected Text:</h2>
          <pre className="p-2 rounded">{text}</pre>
        </div>
      )}
    </div>
  );
};

export default OCRPage;
