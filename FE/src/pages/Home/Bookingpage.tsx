import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const BookingPage: React.FC = () => {
  const center = { lat: 21.0285, lng: 105.8542 }; // Example center location

  const branches = [
    { name: "LuLuSpa Branch 1", lat: 21.0285, lng: 105.8542 },
    { name: "LuLuSpa Branch 2", lat: 21.0290, lng: 105.8550 },
  ];

  return (
    <div className="container mx-auto py-16">
      <h2 className="text-4xl font-bold text-center mb-10">Select Your Branch</h2>
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={center}
          zoom={15}
        >
          {branches.map((branch, index) => (
            <Marker key={index} position={{ lat: branch.lat, lng: branch.lng }} label={branch.name} />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default BookingPage;
