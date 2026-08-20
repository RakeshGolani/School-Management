'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import { getLiveLocationsAction } from '@/actions/transportActions';

// Fix Leaflet's default icon path issues with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// A custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1036/1036131.png', // A free bus icon URL for demo
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Map bound updater component
function MapBoundsUpdater({ buses }) {
  const map = useMap();
  useEffect(() => {
    if (buses.length > 0) {
      const validBuses = buses.filter(b => b.current_lat && b.current_lng);
      if (validBuses.length > 0) {
        const bounds = L.latLngBounds(validBuses.map(b => [b.current_lat, b.current_lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [buses, map]);
  return null;
}

export default function LiveTrackingMap() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Fetch of Live Locations
    const fetchLocations = async () => {
      try {
        const res = await getLiveLocationsAction();
        if (res.success && res.data) {
          setBuses(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch live locations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();

    // 2. Setup Socket.io connection
    const socketUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('Connected to Live Tracking Socket');
    });

    socket.on('busLocationUpdate', (data) => {
      // data: { bus_id, bus_number, route_id, lat, lng, last_update }
      setBuses((prev) => {
        const index = prev.findIndex(b => b.id === data.bus_id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = { 
            ...updated[index], 
            current_lat: data.lat, 
            current_lng: data.lng, 
            last_location_update: data.last_update 
          };
          return updated;
        } else {
          return [...prev, { 
            id: data.bus_id, 
            bus_number: data.bus_number, 
            route_id: data.route_id, 
            current_lat: data.lat, 
            current_lng: data.lng, 
            last_location_update: data.last_update 
          }];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return <div className="h-[500px] w-full bg-slate-100 flex items-center justify-center rounded-2xl animate-pulse text-slate-500 font-medium">Loading Live Map...</div>;
  }

  // Default center if no buses have locations (e.g. India center)
  const defaultCenter = [22.9734, 78.6569];

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 z-0">
      <MapContainer center={defaultCenter} zoom={5} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsUpdater buses={buses} />
        
        {buses.filter(b => b.current_lat && b.current_lng).map((bus) => (
          <Marker 
            key={bus.id} 
            position={[bus.current_lat, bus.current_lng]}
            icon={busIcon}
          >
            <Popup className="rounded-xl overflow-hidden">
              <div className="p-1">
                <h3 className="font-black text-slate-900 text-sm mb-1">{bus.bus_number}</h3>
                <p className="text-xs text-slate-600 m-0">Driver: {bus.driver_name || 'N/A'}</p>
                <p className="text-xs text-slate-600 m-0">Phone: {bus.driver_phone || 'N/A'}</p>
                <div className="mt-2 text-[10px] text-slate-400">
                  Updated: {new Date(bus.last_location_update).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
