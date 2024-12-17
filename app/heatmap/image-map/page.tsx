"use client";

import { useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import Link from 'next/link';

const TestPage = () => {
  const imageRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Load the image first
    const image = new Image();
    image.src = "../images/emotions.png";
    image.onload = () => {
      drawImageToCanvas(image); // Draw the image immediately
  
      // Load models in parallel
      loadModels();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const drawImageToCanvas = (image: HTMLImageElement) => {
    if (!imageRef.current) return;
    const ctx = imageRef.current.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, imageRef.current.width, imageRef.current.height);
  };
  

  // LOAD MODELS FROM FACE API
  const loadModels = ()=>{
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")

      ]).then(() => {
        detectFaceExpressions();
        console.log('Models loaded');
      })
      .catch((err) => {
        console.error('Error loading models:', err);
      });
  }

  // Detect faces and expressions when the image loads
  const detectFaceExpressions = async () => {
    if (!imageRef.current) {
      console.log('Image reference is null');
      return;
    }

    // Perform face detection with expressions
    const detections = await faceapi
      .detectAllFaces(
        imageRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceExpressions();

    if (!detections || detections.length === 0) {
      console.log('No faces detected');
      return;
    } else {
      console.log('Faces detected:', detections.length);
    }

    // Resize results to match the image dimensions
    const displaySize = {
      width: imageRef.current.width,
      height: imageRef.current.height,
    };

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Generate heatmap
    drawEmotionHeatmap(resizedDetections);
  };

  const drawEmotionHeatmap = (detections: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>[]) => {
    if (!heatmapRef.current) return;
    const ctx = heatmapRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, heatmapRef.current.width, heatmapRef.current.height);
  
    // Iterate through detections to generate heatmap
    detections.forEach((detection) => {
      const { expressions } = detection;
  
      // Calculate an "emotion intensity" based on stress-related emotions
      const stressLevel = expressions.angry + expressions.disgusted + expressions.fearful + expressions.sad;

      console.log(stressLevel);
  
      // Normalize the stress level between 0 and 1
      const normalizedStress = stressLevel;
      // const normalizedStress = Math.min(1, Math.max(0, stressLevel));

      // console.log(normalizedStress);
  
      // Map stress level to red intensity
      const redIntensity = Math.floor(normalizedStress * 255); // 0 to 255
      const { x, y, width, height } = detection.detection.box;
  
      // Draw a gradient circle around the detection
      const gradient = ctx.createRadialGradient(
        x + width / 2,
        y + height / 2,
        0,
        x + width / 2,
        y + height / 2,
        Math.max(width, height)
      );
  
      gradient.addColorStop(0, `rgba(${redIntensity}, 0, 0, 1)`); // Intense red at the center
      gradient.addColorStop(0.5, `rgba(${redIntensity}, 0, 0, 0.5)`); // Semi-transparent red
      gradient.addColorStop(1, `rgba(${redIntensity}, 0, 0, 0)`); // Fades out at edges
  
      ctx.fillStyle = gradient;
      ctx.fillRect(x - width, y - height, width * 3, height * 3); // Spread the gradient
    });
  
    // Add heatmap blending
    ctx.globalCompositeOperation = "source-over";
  };

  return (
    <div className="pt-10 px-20 text-center">
      <h1 className='text-4xl font-bold mb-7'>Stress Level Heatmap</h1>
      <div className="mb-5">
        <Link href="/heatmap/webcam" className="px-4 py-2 border border-gray-300 text-white rounded">
          Go to Webcam Page
        </Link>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4 space-y-4 md:space-y-0 w-full h-auto">
        <canvas  ref={imageRef} className="border border-gray-300" width="600" height="600"></canvas>
        <canvas ref={heatmapRef} className="border border-gray-300" width="600" height="600"></canvas>
      </div>
    </div>
  );
};

export default TestPage;