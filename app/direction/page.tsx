"use client";

import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Polyline, Marker, useLoadScript } from "@react-google-maps/api";

// Map container styles
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Coordinates
const terminal1Coords: google.maps.LatLngLiteral = {
  lat: -33.9376,
  lng: 151.1672,
};

const secureLuggageCoords: google.maps.LatLngLiteral = {
  lat: -33.93615171886124,
  lng: 151.1660525823417,
};

const afterSecurityCoords: google.maps.LatLngLiteral[] = [{ lat: -33.936581354768336, lng: 151.1664257105064 }, 
                                                          { lat: -33.936438934758876, lng: 151.16654104549738 },
                                                          { lat:-33.9366280862863, lng: 151.1670721228795 },
                                                          { lat: -33.93650409135346, lng: 151.16724391743014 },
                                                          { lat: -33.93661146263109, lng: 151.16757517023947 }];

const afterSecurityEastCoords: google.maps.LatLngLiteral[] = [...afterSecurityCoords, { lat: -33.9366258609754, lng: 151.16771317083513 }];
const pierBNorthCoords: google.maps.LatLngLiteral[] = [...afterSecurityEastCoords,  { lat: -33.936601382563374, lng: 151.1678365524572 }];
const pierBEastCoords: google.maps.LatLngLiteral[] = [...afterSecurityEastCoords, { lat: -33.93693612320904, lng: 151.16852222922867 }];
const pierBSouthCoords: google.maps.LatLngLiteral[] = [...afterSecurityCoords, { lat: -33.93680117010118, lng: 151.16758455797108 },
                                                      { lat: -33.936884062676874, lng: 151.167260010683 },          
                                                      { lat: -33.9369708494453, lng: 151.16718356772776 },
                                                      { lat:-33.93733913591015, lng: 151.16649558111897 },
                                                      { lat: -33.93766068985446, lng: 151.16632928415487 },
                                                      { lat: -33.938099069403485, lng: 151.16559301778827 },];

const pierC: google.maps.LatLngLiteral[] = [...pierBSouthCoords, { lat: -33.938765535516865, lng:  151.16574333713015}];

const locations = {
  gates: [
    { name: "Gate 8, 9", coords: [pierBNorthCoords, {lat: -33.93594713882361, lng: 151.1676970775851}] },
    { name: "Gate 10", coords: [pierBNorthCoords, { lat: -33.93621067180966, lng: 151.16782351377438 }] },
    { name: "Gate 24", coords: [pierBEastCoords, { lat: -33.936758098896846, lng:  151.1693389618639 }] },
    { name: "Gate 25", coords: [pierBEastCoords, { lat: -33.93678925317845, lng: 151.16947709562962 }] },
    { name: "Gate 30", coords: [pierBEastCoords, { lat: -33.937184562914176, lng: 151.16861780279194 }] },
    { name: "Gate 31", coords: [pierBEastCoords, { lat: -33.93755637241908, lng: 151.16878047759937 }] },
    { name: "Gate 32", coords: [pierBEastCoords, { lat: -33.93770720021028, lng: 151.16879437763652 }] },
    { name: "Gate 33", coords: [pierBEastCoords, { lat: -33.938203436520475, lng: 151.16899822552574 }] },
    { name: "Gate 34", coords: [pierBEastCoords, { lat: -33.93835920517037, lng: 151.1690196832 }] },
    { name: "Gate 35", coords: [pierBEastCoords, { lat: -33.938547239801736, lng: 151.16911490161786 }] },
    { name: "Gate 36", coords: [pierBEastCoords, { lat: -33.93872303511729, lng: 151.16914172370684 }] },
    { name: "Gate 37", coords: [pierBEastCoords, { lat: -33.93878645485784, lng: 151.16919536789055 }] },
    { name: "Gate 50", coords: [pierBSouthCoords, { lat: -33.938441760474504, lng: 151.16567348405852}] },
    { name: "Gate 51", coords: [pierC, { lat: -33.93898806060249, lng: 151.16562263772713}, { lat: -33.93927066661668, lng: 151.16574065492117}] },
    { name: "Gate 53, 55, 57, 58", coords: [pierC, { lat: -33.93907384601384, lng: 151.1656464343667},
                                              { lat: -33.93927066661668, lng: 151.16574065492117},
                                              { lat: -33.93931517141989, lng: 151.16591633960758},] },
    { name: "Gate 54", coords: [pierC] },
    { name: "Gate 56, 59, 60, 61, 63", coords: [pierC, { lat: -33.939288468542436, lng: 151.16531552479066},
                                                { lat: -33.93957441140837, lng: 151.16523103520854},]},
  ],
  checkInCounters: [
    { name: "Check-in A", coords: [{ lat: -33.9355, lng: 151.1664 }] },
    { name: "Check-in B", coords: [{ lat: -33.93570192462056, lng: 151.16629963444137 }] },
    { name: "Check-in C", coords: [{ lat: -33.93593069012515, lng: 151.16615841020683 }, { lat: -33.93596963335142, lng: 151.1663756691301 }] },
    { name: "Check-in D", coords: [{ lat: -33.93613082555954, lng: 151.1660676551859 }] },
    { name: "Check-in E", coords: [{ lat: -33.93638675757232, lng: 151.16593014847948 }] },
    { name: "Check-in F", coords: [{ lat: -33.9366549077211, lng: 151.1658295656391 }] },
    { name: "Check-in G", coords: [{ lat: -33.936881330567566, lng: 151.16572569436312 }] },
    { name: "Check-in H", coords: [{ lat: -33.937276577948424, lng: 151.165459215742 }] },
    { name: "Check-in J", coords: [{ lat: -33.937276577948424, lng: 151.165459215742 }, { lat: -33.93740944671513, lng: 151.16520880284972 }] },
    { name: "Check-in K", coords: [{ lat: -33.937276577948424, lng: 151.165459215742 }, { lat: -33.93752516167091, lng: 151.16498106786787 }] },
  ],
  retailers: [
    { name: "Retailer 1", coords: [{ lat: -33.9365, lng: 151.1670 }] },
    { name: "Retailer 2", coords: [{ lat: -33.9368, lng: 151.1660 }] },
  ],
};

// Map styles to hide certain places (e.g., POIs, businesses)
const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi.park",
    stylers: [{ visibility: "off" }], // Hide all parks
  },
  {
    featureType: "poi.school",
    stylers: [{ visibility: "off" }], // Hide all schools
  },
  {
    featureType: "transit.station",
    stylers: [{ visibility: "off" }], // Hide transit stations
  },
  {
    featureType: "road",
    stylers: [{ visibility: "off" }], // Hide road icons
  },
];

export default function MallStyleNavigation() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isGatesOpen, setIsGatesOpen] = useState(false);

  // State to hold the currently selected route
  const [selectedRoute, setSelectedRoute] = useState<google.maps.LatLngLiteral[] | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);

  // Reference to the Google Map instance
  const mapRef = useRef<google.maps.Map | null>(null);

  // Handler to store the map instance when it's loaded
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  useEffect(() => {
    console.log("Selected Route Updated:", selectedRoute);
  }, [selectedRoute]);

  if (!isLoaded) return <div>Loading...</div>;

  // Handler to select a route based on the route key
  const handleRouteSelection = (coords: { lat: number; lng: number; }[]) => {
    setSelectedRoute(null)
    const newPath = [{ lat: secureLuggageCoords.lat, lng: secureLuggageCoords.lng }, ...coords];
    setSelectedRoute(newPath); // Update path
    setSelectedPosition(coords[coords.length - 1]); // Update selected position

    // Zoom in on the selected position
    mapRef.current?.panTo(coords[coords.length - 1]);
    mapRef.current?.setZoom(19);
  };

  // Handler to clear the current route
  const clearRoute = () => {
    console.log("Clearing route...");
    setSelectedRoute(null);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 border-r border-gray-300 p-4 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Locations</h3>
        <div>
        <h4
            className="flex items-center justify-between w-full text-md font-semibold mb-2 px-3 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer focus:outline-none"
            onClick={() => setIsCheckInOpen(!isCheckInOpen)}
          >
            Check-In Counters
          </h4>
          {isCheckInOpen && (
            <div>
              {locations.checkInCounters.map((counter, index) => (
                <button
                  key={index}
                  onClick={() => counter.coords && handleRouteSelection(counter.coords.flat() as { lat: number; lng: number; }[])}
                  className="block w-full text-left px-3 py-2 mb-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  {counter.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
        <h4
            className="flex items-center justify-between w-full text-md font-semibold mb-2 px-3 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer focus:outline-none"
            onClick={() => setIsGatesOpen(!isGatesOpen)}
          >
            Gates
          </h4>
          {isGatesOpen && (
            <div>
              {locations.gates.map((gate, index) => (
                <button
                  key={index}
                  onClick={() => gate.coords && handleRouteSelection(gate.coords.flat() as { lat: number; lng: number; }[])}
                  className="block w-full text-left px-3 py-2 mb-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  {gate.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* <div>
          <h4 className="text-md font-semibold mb-2">Retailers</h4>
          {locations.retailers.map((retailer, index) => (
            <button
              key={index}
              onClick={() => retailer.coords && handleRouteSelection(retailer.coords.flat() as { lat: number; lng: number; }[])}
              className="block w-full text-left px-3 py-2 mb-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
            >
              {retailer.name}
            </button>
          ))}
        </div> */}
        <div>
          <button
            onClick={clearRoute}
            className="mt-4 block w-full text-left px-3 py-2 text-red-700 bg-gray-200 hover:bg-gray-300 rounded"
            aria-label="Clear Route"
          >
            Clear Route
          </button>
        </div>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={terminal1Coords}
        zoom={17}
        mapTypeId="terrain"
        onLoad={onMapLoad}
        options={{ styles: mapStyles }} // Apply custom map styles
      >
        {/* Render Markers */}
        <Marker position={secureLuggageCoords} />
        {selectedPosition && <Marker position={selectedPosition} />}

        <Polyline
          path={selectedRoute || []}
          options={{
            icons: [
              {
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6, // Size of the dot
                  strokeColor: "#0437F2", // Blue color for dots
                  fillColor: "#0437F2",
                  fillOpacity: 1,
                },
                offset: "0",
                repeat: "20px", // Distance between dots
              },
            ],
          }}
        />
      </GoogleMap>
    </div>
  );
}