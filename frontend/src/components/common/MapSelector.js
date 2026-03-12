import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// Blue Provider Icon
const providerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Red User Search Icon
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
};

const LocationMarker = ({ setLocation, currentLocation }) => {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  if (!currentLocation) return null;
  return (
    <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
      <Popup><b>Your Location</b></Popup>
    </Marker>
  );
};

export default function MapSelector({ services = [], onLocationSelect, mapLocation, onProviderClick, route }) {
  // Default to India center
  const defaultLocation = { lat: 20.5937, lng: 78.9629 }; 
  const currentLocation = mapLocation || defaultLocation;

  return (
    <MapContainer
      key="main-map"
      center={[currentLocation.lat, currentLocation.lng]}
      zoom={mapLocation ? 13 : 5}
      style={{ height: "400px", width: "100%", borderRadius: "12px", zIndex: 0 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ChangeView center={[currentLocation.lat, currentLocation.lng]} />
      <LocationMarker setLocation={onLocationSelect} currentLocation={mapLocation} />

      {/* THIS DRAWS THE ROAD ROUTE! */}
      {route && route.length > 0 && (
        <Polyline positions={route} color="#f97316" weight={5} opacity={0.8} dashArray="10, 10" />
      )}

      {services.map((service) => {
        if (!service.providerLat || !service.providerLng) return null;
        return (
          <Marker
            key={service.id}
            position={[service.providerLat, service.providerLng]}
            icon={providerIcon}
            eventHandlers={{ click: () => onProviderClick && onProviderClick(service) }}
          >
            <Popup>
              <b>{service.providerName}</b><br/>
              {service.category} - ₹{service.price}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}