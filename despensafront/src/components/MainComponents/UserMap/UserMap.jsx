import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { defaultIcon } from "../../../utils/leafletIcon";
import { createUserIcon } from "../../../utils/userMarkerIcon";

const UserMap = ({ lat, lng, name, location, image, role }) => {
  const position = [parseFloat(lat), parseFloat(lng)];

  const icon = createUserIcon(image, role);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "250px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={position} icon={icon}>
        <Popup>
          <strong>{name}</strong>
          <br />
          {location}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default UserMap;
