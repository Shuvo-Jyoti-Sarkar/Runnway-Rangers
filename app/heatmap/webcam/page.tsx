"use client";

import { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

function WebcamHeatmap() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadModels();
    startWebcam();
  }, []);

  // Load face-api.js models
  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      console.log("Models loaded successfully.");
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadeddata = () => detectFaces();
      }
      
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  // Detect faces and expressions continuously
  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };

    // Set canvas size to match video dimensions
    faceapi.matchDimensions(canvas, displaySize);

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    // Start detection loop
    const detectionLoop = async () => {
      // Detect all faces with landmarks and expressions
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceExpressions();

      // **Log the detections**
      console.log("Detections:", detections);
      // Clear previous heatmap
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        // Resize detections to match video size
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Draw heatmap based on detected stress levels
        drawHeatmap(context, resizedDetections);
      }

      requestAnimationFrame(detectionLoop);
    };

    requestAnimationFrame(detectionLoop);
  };

  // Draw heatmap based on face expressions
  const drawHeatmap = (
    context: CanvasRenderingContext2D,
    detections: faceapi.WithFaceExpressions<
      faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>
    >[]
  ) => {
    detections.forEach((detection) => {
      const { expressions, detection: faceBox } = detection;

      const stressLevel =
        expressions.angry +
        expressions.fearful +
        expressions.sad +
        expressions.disgusted + 
        expressions.neutral;

      const positiveEmotionLevel =
        expressions.happy +
        expressions.surprised;
        
      const { x, y, width, height } = faceBox.box;

      // Determine the dominant emotion type
      let gradientColor: string;

      if (stressLevel > positiveEmotionLevel) {
        // Stress dominates: use red gradient
        const redIntensity = Math.min(Math.floor(stressLevel * 255), 255);
        gradientColor = `rgba(${redIntensity}, 0, 0, 0.5)`;
      } else {
        // Positive emotions dominate: use blue gradient
        const blueIntensity = Math.min(Math.floor(positiveEmotionLevel * 255), 255);
        gradientColor = `rgba(0, 0, ${blueIntensity}, 0.5)`;
      }

      // Create gradient circle
      const gradient = context.createRadialGradient(
        x + width / 2,
        y + height / 2,
        0,
        x + width / 2,
        y + height / 2,
        Math.max(width, height) / 2
      );

      gradient.addColorStop(0, gradientColor);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

      // Apply gradient to the face box
      context.fillStyle = gradient;
      context.fillRect(x, y, width, height);
    });
  };

  return (
    <div className="text-center pt-10">
      <h1 className="text-4xl font-bold mb-6">Stress Level Heatmap</h1>
      <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4 space-y-4 md:space-y-0 w-full h-auto">
        {/* Webcam Video */}
        <video
          ref={videoRef}
          width="640"
          height="480"
          className="border border-gray-300"
        />

        {/* Heatmap Canvas */}
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="border border-gray-300"
        />
      </div>
    </div>
  );
}

export default WebcamHeatmap;