import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
  Polyline,
  Circle,
} from "react-leaflet";
import L from "leaflet";

// Blue Icon (Customer/Service)
const providerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Red Icon (You / Your Location)
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// ... (keep the providerIcon and userIcon definitions at the top)

// Automatically zooms and pans the map to perfectly fit the entire route!
const FitBounds = ({ route }) => {
  const map = useMap();
  useEffect(() => {
    if (route && route.length > 1) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [route, map]);
  return null;
};

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LocationMarker = ({ currentLocation, isProviderView }) => {
  const activeLocation = currentLocation || { lat: 13.0827, lng: 80.2707 };

  // Removed the click event listener to keep marker stable.

  return (
    <>
      <Marker
        position={[activeLocation.lat, activeLocation.lng]}
        icon={userIcon}
      >
        <Popup className="custom-dark-popup">
          <b className="text-white">
            {isProviderView ? "Customer Location" : "Your Location"}
          </b>
        </Popup>
      </Marker>

      {!isProviderView && (
        <Circle
          center={[activeLocation.lat, activeLocation.lng]}
          radius={10000}
          pathOptions={{
            color: "#f97316",
            fillColor: "#f97316",
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
      )}
    </>
  );
};

export default function MapSelector({
  services = [],
  onLocationSelect,
  mapLocation,
  onProviderClick,
  route,
  isProviderView = false,
}) {
  const defaultLocation = { lat: 13.0827, lng: 80.2707 };
  const currentLocation = mapLocation || defaultLocation;

  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper { background: #1f2937; color: white; border-radius: 1rem; padding: 0; overflow: hidden; border: 1px solid #374151; }
        .leaflet-popup-tip { background: #1f2937; }
        .leaflet-popup-content { margin: 0; }
        .leaflet-popup-close-button { color: #9ca3af !important; top: 8px !important; right: 8px !important; }
      `}</style>

      <MapContainer
        key="main-map"
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={13}
        style={{
          height: "350px",
          width: "100%",
          borderRadius: "16px",
          zIndex: 0,
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />

        {(!route || route.length === 0) && (
          <ChangeView center={[currentLocation.lat, currentLocation.lng]} />
        )}
        <FitBounds route={route} />
        <LocationMarker
          currentLocation={mapLocation}
          isProviderView={isProviderView}
        />

        {/* Route highlight */}
        {route && route.length > 0 && (
          <>
            <Polyline
              positions={route}
              color="#fdba74"
              weight={8}
              opacity={0.4}
            />
            <Polyline
              positions={route}
              color="#ea580c"
              weight={4}
              opacity={1}
            />
          </>
        )}

        {services.map((service) => {
          if (!service.providerLat || !service.providerLng) return null;
          return (
            <Marker
              key={service.id}
              position={[service.providerLat, service.providerLng]}
              icon={providerIcon}
            >
              <Popup className="custom-dark-popup">
                <div className="p-4 min-w-[220px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center font-bold text-lg">
                      {service.providerName
                        ? service.providerName.charAt(0)
                        : "P"}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm m-0 leading-tight">
                        {service.providerName}
                      </p>
                      <p className="text-xs text-dark-400 m-0">
                        {service.category}
                      </p>
                    </div>
                  </div>

                  {/* Hide price/actions in provider view */}
                  {!isProviderView && (
                    <div className="flex justify-between items-center mb-4 bg-dark-900/50 p-2 rounded-lg">
                      <span className="text-xs text-dark-400">Starting at</span>
                      <span className="font-bold text-brand-400">
                        ₹{service.price}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!isProviderView ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onProviderClick) onProviderClick(service);
                          }}
                          className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 text-white text-xs rounded-lg transition-colors border border-dark-600"
                        >
                          📍 Distance
                        </button>
                        <a
                          href={`/customer/services/${service.id}`}
                          className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs text-center rounded-lg transition-colors"
                        >
                          Book Now
                        </a>
                      </>
                    ) : (
                      <div className="text-xs text-center w-full text-dark-300 bg-dark-800 border border-dark-600 py-2 rounded-lg font-medium">
                        📍 Provider Location
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}
