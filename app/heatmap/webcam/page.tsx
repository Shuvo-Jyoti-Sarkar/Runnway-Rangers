"use client";

import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { GoogleMap, LoadScript, HeatmapLayer } from "@react-google-maps/api";

function WebcamHeatmap() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [heatmapData, setHeatmapData] = useState<google.maps.visualization.WeightedLocation[]>([]);

  // Coordinates for Sydney Airport Terminal 1
  const terminal1Coords: google.maps.LatLngLiteral = {
    lat: -33.93615171886124,
    lng: 151.166052582341,
  };

  useEffect(() => {
    loadModels();
    startWebcam();
  }, []);

  // Load face-api.js models
  const loadModels = async () => {
    try {
      console.log("Loading face-api.js models...");
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
  const startWebcam = () => {
    if (navigator.mediaDevices.getUserMedia) {
      console.log("Accessing webcam...");
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            videoRef.current.onloadeddata = () => detectFaces();
            console.log("Webcam stream started.");
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam: ", err);
        });
    } else {
      console.error("getUserMedia not supported in this browser.");
    }
  };

  // Detect faces and expressions continuously
  const detectFaces = async () => {
    if (!videoRef.current) return;

    // Start detection loop
    const detectionLoop = async () => {
      // Detect all faces with landmarks and expressions
      if (!videoRef.current) return;
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceExpressions();

      // **Log the detections**
      console.log("Detections:", detections);

      if (detections.length > 0) {
        // Process detections for Google Maps heatmap
        processDetections(detections);
      } else {
        // Clear heatmap if no detections
        setHeatmapData([]);
      }

      requestAnimationFrame(detectionLoop);
    };

    requestAnimationFrame(detectionLoop);
  };

  // Process detections and update heatmap data
  const processDetections = (
    detections: faceapi.WithFaceExpressions<
      faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>
    >[]
  ) => {
    if (detections.length === 0) {
      console.log("No detections found.");
      setHeatmapData([]);
      return;
    }

    const MAX_STRESS_LEVEL = 5; // Define based on your scoring system

    const newHeatmapData: google.maps.visualization.WeightedLocation[] = [];

    detections.forEach((detection) => {
      const { expressions } = detection;

      const stressLevel =
        expressions.angry +
        expressions.fearful +
        expressions.sad +
        expressions.disgusted +
        expressions.neutral;

      const positiveEmotionLevel = expressions.happy + expressions.surprised;

      const latitude = terminal1Coords.lat;
      const longitude = terminal1Coords.lng;

      // Determine if stress levels dominate
      if (stressLevel > positiveEmotionLevel) {
        // Stress dominates: use red
        const normalizedStress = Math.min(stressLevel / MAX_STRESS_LEVEL, 1);

        // Slightly vary the coordinates for visualization purposes
        // const latitudeVariation = (Math.random() - 0.5) * 0.001; // +/- 0.0005 degrees
        // const longitudeVariation = (Math.random() - 0.5) * 0.001; // +/- 0.0005 degrees

        // const latitude = terminal1Coords.lat + latitudeVariation;
        // const longitude = terminal1Coords.lng + longitudeVariation;

        newHeatmapData.push({
          location: new google.maps.LatLng(latitude, longitude),
          weight: normalizedStress, // Assign normalized stress as weight
        });
      }
      // If positive emotions dominate, do nothing
    });

    console.log("Processed Heatmap Data:", newHeatmapData);

    setHeatmapData(newHeatmapData);
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Side: Webcam Video */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-100">
        {/* Webcam Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          width="640"
          height="480"
          className="border border-gray-300"
          style={{ borderRadius: "8px" }}
        />
      </div>

      {/* Right Side: Google Map Heatmap */}
      <div className="w-full md:w-1/2 relative">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
          libraries={["visualization"]}
        >
          <GoogleMap
            center={terminal1Coords}
            zoom={17}
            mapContainerStyle={{ height: "100%", width: "100%" }}
            mapTypeId="terrain"
          >
            <HeatmapLayer
              data={heatmapData}
              options={{
                radius: 30, // Increased radius for broader coverage
                opacity: 1,  // Set opacity to full for maximum color intensity
                gradient: [
                  "rgba(255, 0, 0, 0)",      // Transparent
                  "rgba(255, 0, 0, 0.2)",    // Light Red
                  "rgba(255, 0, 0, 0.4)",    // Medium Light Red
                  "rgba(255, 0, 0, 0.6)",    // Medium Red
                  "rgba(255, 0, 0, 0.8)",    // Darker Red
                  "rgba(255, 0, 0, 1)"       // Solid Red
                ],
                maxIntensity: 1,
              }}
            />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default WebcamHeatmap;