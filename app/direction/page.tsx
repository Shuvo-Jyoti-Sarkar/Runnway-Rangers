"use client";

import React, { useState } from "react";
import { GoogleMap, Polyline, Marker, useLoadScript } from "@react-google-maps/api";

// Map container styles
const mapContainerStyle = {
  width: "100%",
  height: "80vh",
  borderRadius: "15px",
};

// Center the map around Sydney Airport
const sydneyAirportCoords = {
  lat: -33.9399,
  lng: 151.1753,
};

// Sample data for categories
const destinations = {
  Gates: [
    { name: "Gate A1", position: { lat: -33.9435, lng: 151.175 } },
    { name: "Gate B3", position: { lat: -33.941, lng: 151.172 } },
  ],
  Parking: [
    { name: "Parking Lot A", position: { lat: -33.9418, lng: 151.1739 } },
    { name: "Parking Lot B", position: { lat: -33.938, lng: 151.170 } },
  ],
  Services: [
    { name: "Customer Service", position: { lat: -33.9405, lng: 151.176 } },
    { name: "Shuttle Bus Stop", position: { lat: -33.9358, lng: 151.1702 } },
  ],
};

// Simulated route
const exampleRoute = [
  { lat: -33.9435, lng: 151.175 },
  { lat: -33.9418, lng: 151.1739 },
];

export default function MallStyleNavigation() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  // Define the type for activeCategory
  type CategoryType = keyof typeof destinations;
  const [activeCategory, setActiveCategory] = useState<CategoryType>("Gates");
  const [selectedDestination, setSelectedDestination] = useState<null | { name: string; position: { lat: number; lng: number } }>(null);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Floating Navigation Menu */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          padding: "10px",
          background: "#f8f8f8",
          borderRadius: "10px",
        }}
      >
        {Object.keys(destinations).map((category) => (
          <button
            key={category}
            style={{
              background: activeCategory === category ? "#007BFF" : "#E0E0E0",
              color: activeCategory === category ? "white" : "black",
              border: "none",
              borderRadius: "5px",
              padding: "8px 15px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onClick={() => setActiveCategory(category as CategoryType)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={sydneyAirportCoords}
        zoom={16}
        mapTypeId="terrain" // Change map type to terrain for elevation
      >
        {/* Display destinations of the selected category */}
        {destinations[activeCategory].map((place, index) => (
          <Marker
            key={index}
            position={place.position}
            label={{
              text: place.name,
              fontSize: "12px",
              fontWeight: "bold",
            }}
            onClick={() => setSelectedDestination(place)}
          />
        ))}

        {/* Highlighted Route */}
        {selectedDestination && (
          <Polyline
            path={exampleRoute}
            options={{
              strokeColor: "#FF5733",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
