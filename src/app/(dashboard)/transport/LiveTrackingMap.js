'use client';
import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import { getLiveLocationsAction, getRoutesAction } from '@/actions/transportActions';
import { hexToRgba } from '@/lib/themeHelper';
import { Route, Navigation } from 'lucide-react';
import StudentAvatarStack from '@/components/ui/StudentAvatarHover';

const ROUTE_COLORS = [
  '#4f46e5', // Indigo
  '#0284c7', // Sky Blue
  '#d97706', // Amber
  '#059669', // Emerald
  '#dc2626'  // Rose
];

// Map bound updater component: Auto-fits bounds to include School Campus + Active Buses + Route Stops
function MapBoundsUpdater({ buses, schoolLocation, routes, selectedRouteId }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (schoolLocation?.latitude && schoolLocation?.longitude) {
      points.push([schoolLocation.latitude, schoolLocation.longitude]);
    }
    if (buses && buses.length > 0) {
      const validBuses = buses.filter(b => b.current_lat && b.current_lng);
      validBuses.forEach(b => points.push([b.current_lat, b.current_lng]));
    }

    if (routes && routes.length > 0) {
      const targetRoutes = selectedRouteId === 'ALL' ? routes : routes.filter(r => r.id === selectedRouteId);
      targetRoutes.forEach(r => {
        if (r.stops && r.stops.length > 0) {
          r.stops.forEach(s => {
            if (s.latitude && s.longitude) points.push([parseFloat(s.latitude), parseFloat(s.longitude)]);
          });
        }
      });
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [buses, schoolLocation, routes, selectedRouteId, map]);
  return null;
}

/**
 * Creates dynamic side-view Yellow School Bus Icon flipped dynamically based on movement direction
 */
function createBusIcon(direction = 'right') {
  if (typeof window === 'undefined' || !L) return null;
  const isFlipped = direction === 'left';
  const transformStyle = isFlipped ? 'transform: scaleX(-1);' : 'transform: scaleX(1);';

  return L.divIcon({
    className: 'custom-bus-div-icon',
    html: `
      <div style="position: relative; width: 56px; height: 36px; display: flex; align-items: center; justify-content: center; overflow: visible;">
        <!-- Live Movement Radar Pulse -->
        <div style="position: absolute; width: 44px; height: 32px; background: rgba(245, 158, 11, 0.35); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- Authentic Side-View Yellow School Bus SVG (Flips left/right dynamically) -->
        <div style="display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease; ${transformStyle}">
          <svg width="54" height="34" viewBox="0 0 64 40" fill="none" style="position: relative; z-index: 2; filter: drop-shadow(0 5px 8px rgba(0,0,0,0.38));">
            <!-- Tires / Wheels -->
            <g>
              <circle cx="16" cy="31" r="7" fill="#0f172a" />
              <circle cx="16" cy="31" r="4" fill="#64748b" />
              <circle cx="16" cy="31" r="1.8" fill="#e2e8f0" />
              
              <circle cx="48" cy="31" r="7" fill="#0f172a" />
              <circle cx="48" cy="31" r="4" fill="#64748b" />
              <circle cx="48" cy="31" r="1.8" fill="#e2e8f0" />
            </g>

            <!-- Main Yellow Bus Body (Side Profile with Sloped Front Hood) -->
            <path d="M4 8C4 5.79 5.79 4 8 4H45C47.21 4 49 5.79 49 8V14H58C59.66 14 61 15.34 61 17V26C61 27.66 59.66 29 58 29H4C2.9 29 2 28.1 2 27V10C2 8.9 2.9 8 4 8Z" fill="#FBBF24" stroke="#D97706" stroke-width="1.6" />

            <!-- Wheel Wells Cutouts -->
            <path d="M9 29C9 25.13 12.13 22 16 22C19.87 22 23 25.13 23 29H9Z" fill="#0f172a" />
            <path d="M41 29C41 25.13 44.13 22 48 22C51.87 22 55 25.13 55 29H41Z" fill="#0f172a" />

            <!-- Black Safety Middle Stripes -->
            <rect x="2" y="20" width="47" height="3" fill="#0f172a" />
            <rect x="49" y="20" width="12" height="3" fill="#0f172a" />

            <!-- Side Passenger Windows (Row of 4) -->
            <rect x="6" y="8" width="8" height="9" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
            <rect x="16" y="8" width="8" height="9" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
            <rect x="26" y="8" width="8" height="9" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
            <rect x="36" y="8" width="8" height="9" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
            
            <!-- Slanted Front Driver Windshield -->
            <path d="M46 8H49L53 14H46V8Z" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />

            <!-- Front Headlight (Glowing Yellow Beam) -->
            <path d="M60 21H62V25H60C59.45 25 59 24.55 59 24V22C59 21.45 59.45 21 60 21Z" fill="#FEF08A" stroke="#EAB308" stroke-width="1" />

            <!-- Front Bumper -->
            <rect x="58" y="26.5" width="4.5" height="4" rx="1" fill="#0f172a" />
            
            <!-- Rear Tail Light (Red) -->
            <rect x="1.5" y="21" width="1.8" height="4" rx="0.6" fill="#EF4444" />

            <!-- Top Roof Safety Flashers -->
            <circle cx="6" cy="3.5" r="1.5" fill="#EF4444" />
            <circle cx="47" cy="3.5" r="1.5" fill="#EF4444" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [56, 36],
    iconAnchor: [28, 18],
    popupAnchor: [0, -22]
  });
}

/**
 * Creates Bus Stop Pin Marker with sequence number
 */
function createStopIcon(sequence = 1, color = '#6366f1') {
  if (typeof window === 'undefined' || !L) return null;
  return L.divIcon({
    className: 'custom-stop-div-icon',
    html: `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="width: 22px; height: 22px; background: #ffffff; border: 2.5px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3); font-size: 10px; font-weight: 900; color: ${color};">
          ${sequence}
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15]
  });
}

export default function LiveTrackingMap({ initialSchoolLocation, initialRoutes }) {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState(initialRoutes || []);
  const [routeGeometries, setRouteGeometries] = useState({});
  const [selectedRouteId, setSelectedRouteId] = useState('ALL');
  const [schoolLocation, setSchoolLocation] = useState(initialSchoolLocation || null);
  const [loading, setLoading] = useState(true);

  // Dynamic School Primary Theme Color
  const themeColor = useMemo(() => {
    return schoolLocation?.primary_color || schoolLocation?.primaryColor || '#14b8a6';
  }, [schoolLocation]);

  // 1. Dynamic Teardrop Pin-Drop Marker with School Logo or Building Icon inside
  const schoolIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const primaryHex = themeColor;
    const logoUrl = schoolLocation?.logo || schoolLocation?.logo_url;

    // Inner Content: Shows School Logo if available, else prominent School Building SVG icon
    const innerHtml = logoUrl ? `
      <img 
        src="${logoUrl}" 
        alt="School Logo" 
        style="width: 29px; height: 29px; object-fit: cover; border-radius: 50%; display: block;" 
      />
    ` : `
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="${primaryHex}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
        <path d="m4 6 8-4 8 4"/>
        <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/>
        <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
        <path d="M18 5v17"/>
        <path d="M6 5v17"/>
        <circle cx="12" cy="9" r="2"/>
      </svg>
    `;

    return L.divIcon({
      className: 'custom-school-pin-drop',
      html: `
        <div style="position: relative; width: 46px; height: 54px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; overflow: visible;">
          <!-- SVG Teardrop Pin Drop (Theme Colored Body + White Center) -->
          <svg width="46" height="54" viewBox="0 0 46 54" fill="none" style="position: absolute; top: 0; left: 0; z-index: 1; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.32));">
            <path d="M23 0C10.8497 0 1 9.8497 1 22C1 34.5 23 54 23 54C23 54 45 34.5 45 22C45 9.8497 35.1503 0 23 0Z" fill="${primaryHex}" />
            <circle cx="23" cy="21" r="15.5" fill="#ffffff" />
          </svg>

          <!-- Inner School Logo or Icon (Centered inside the white circle) -->
          <div style="position: absolute; top: 5.5px; left: 7.5px; width: 31px; height: 31px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10; pointer-events: none;">
            ${innerHtml}
          </div>
        </div>
      `,
      iconSize: [46, 54],
      iconAnchor: [23, 54],
      popupAnchor: [0, -54]
    });
  }, [themeColor, schoolLocation?.logo, schoolLocation?.logo_url]);

  useEffect(() => {
    // 1. Initial Fetch of Live Locations, Routes with Stops & School Profile
    const fetchLocationsAndSchool = async () => {
      try {
        const [busRes, routesRes, schoolRes] = await Promise.all([
          getLiveLocationsAction(),
          !initialRoutes ? getRoutesAction() : Promise.resolve(null),
          !initialSchoolLocation ? fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school'}/profile?schoolId=1`, { cache: 'no-store' }).then(r => r.json()) : Promise.resolve(null)
        ]);

        if (busRes && busRes.success && Array.isArray(busRes.data)) {
          setBuses(busRes.data.map(b => ({ ...b, direction: 'right' })));
        }

        if (routesRes && routesRes.success && Array.isArray(routesRes.data)) {
          setRoutes(routesRes.data);
        }

        if (schoolRes && schoolRes.success && schoolRes.data) {
          setSchoolLocation({
            name: schoolRes.data.schoolName || schoolRes.data.school_name || 'School Campus',
            address: schoolRes.data.address || 'Campus Central',
            latitude: schoolRes.data.latitude || 19.1136,
            longitude: schoolRes.data.longitude || 72.8697,
            logo: schoolRes.data.logo || schoolRes.data.logo_url || null,
            primary_color: schoolRes.data.primaryColor || schoolRes.data.primary_color || '#14b8a6'
          });
        }
      } catch (error) {
        console.error("Failed to fetch live locations & school profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocationsAndSchool();

    // 2. Setup Socket.io connection
    const socketUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('Connected to Live Tracking Socket');
    });

    socket.on('busLocationUpdate', (data) => {
      setBuses((prev) => {
        const index = prev.findIndex(b => b.id === data.bus_id);
        if (index > -1) {
          const currentBus = prev[index];
          // Calculate movement direction (West = left, East = right)
          let direction = currentBus.direction || 'right';
          if (currentBus.current_lng !== undefined && currentBus.current_lng !== null) {
            if (data.lng < currentBus.current_lng) {
              direction = 'left';
            } else if (data.lng > currentBus.current_lng) {
              direction = 'right';
            }
          }

          const updated = [...prev];
          updated[index] = { 
            ...updated[index], 
            current_lat: data.lat, 
            current_lng: data.lng, 
            direction,
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
            direction: 'right',
            last_location_update: data.last_update 
          }];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [initialSchoolLocation, initialRoutes]);

  // 🛣️ Fetch Turn-by-Turn Road-Snapped Driving Coordinates via OSRM for all routes
  useEffect(() => {
    if (!routes || routes.length === 0 || !schoolLocation?.latitude || !schoolLocation?.longitude) return;

    const fetchRoadGeometries = async () => {
      const geometries = {};
      
      for (const route of routes) {
        const sortedStops = [...(route.stops || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
        const validStops = sortedStops.filter(s => s.latitude && s.longitude);

        if (validStops.length > 0) {
          // Construct OSRM coordinate list: lng,lat;lng,lat... terminating at School Campus
          const coordParts = validStops.map(s => `${parseFloat(s.longitude)},${parseFloat(s.latitude)}`);
          coordParts.push(`${parseFloat(schoolLocation.longitude)},${parseFloat(schoolLocation.latitude)}`);

          try {
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordParts.join(';')}?overview=full&geometries=geojson`;
            const response = await fetch(osrmUrl);
            const data = await response.json();

            if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
              // Convert [lng, lat] pairs from OSRM to Leaflet [lat, lng]
              geometries[route.id] = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            } else {
              // Fallback straight lines if route routing unavailable
              geometries[route.id] = validStops.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]).concat([[parseFloat(schoolLocation.latitude), parseFloat(schoolLocation.longitude)]]);
            }
          } catch (error) {
            console.warn(`Could not fetch road geometry for route ${route.id}:`, error);
            // Fallback straight lines
            geometries[route.id] = validStops.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]).concat([[parseFloat(schoolLocation.latitude), parseFloat(schoolLocation.longitude)]]);
          }
        }
      }

      setRouteGeometries(geometries);
    };

    fetchRoadGeometries();
  }, [routes, schoolLocation]);

  if (loading) {
    return (
      <div className="h-[420px] w-full bg-slate-100 flex items-center justify-center rounded-2xl animate-pulse text-slate-500 font-medium">
        Loading Live Fleet, Campus & Real Road Driving Routes...
      </div>
    );
  }

  // School Campus Center Coordinates (Fallback: Mumbai Campus)
  const schoolCenter = [
    schoolLocation?.latitude || 19.1136,
    schoolLocation?.longitude || 72.8697
  ];

  const activeBuses = buses.filter(b => b.current_lat && b.current_lng);

  // Filter routes based on selected tab
  const visibleRoutes = selectedRouteId === 'ALL' ? routes : routes.filter(r => r.id === selectedRouteId);

  return (
    <div className="h-[430px] w-full rounded-2xl overflow-hidden relative z-0 border border-slate-200 shadow-inner">
      {/* 🧭 Floating Glassmorphism Route Selector Overlay */}
      {routes && routes.length > 0 && (
        <div className="absolute top-3 right-3 z-[400] max-w-[calc(100%-60px)]">
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200/90 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 px-1 shrink-0">
              <Route size={12} className="text-primary-600 shrink-0" />
              <span className="hidden sm:inline">Routes:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedRouteId('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all shrink-0 cursor-pointer ${
                selectedRouteId === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/90'
              }`}
            >
              All ({routes.length})
            </button>

            {routes.map((route, idx) => {
              const routeColor = ROUTE_COLORS[idx % ROUTE_COLORS.length];
              const isSelected = selectedRouteId === route.id;
              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'text-white shadow-xs'
                      : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90'
                  }`}
                  style={isSelected ? { backgroundColor: routeColor } : {}}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#ffffff' : routeColor }}
                  />
                  {route.route_code || route.route_name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Leaflet Map Container */}
      <MapContainer 
        center={schoolCenter} 
        zoom={12} 
        className="h-full w-full"
      >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBoundsUpdater 
            buses={buses} 
            schoolLocation={schoolLocation} 
            routes={routes} 
            selectedRouteId={selectedRouteId} 
          />

          {/* 🛣️ 1. Draw Real Road Turn-by-Turn Driving Polylines & Stop Pins */}
          {visibleRoutes.map((route, rIndex) => {
            const routeColor = ROUTE_COLORS[rIndex % ROUTE_COLORS.length];
            const sortedStops = [...(route.stops || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
            const validStops = sortedStops.filter(s => s.latitude && s.longitude);
            
            // Get Road Snapped Points from OSRM calculation (or fallback points)
            const roadPoints = routeGeometries[route.id] || validStops.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]).concat([[parseFloat(schoolLocation.latitude), parseFloat(schoolLocation.longitude)]]);

            return (
              <div key={`route-group-${route.id}`}>
                {/* Background Glow Casing Line */}
                {roadPoints.length > 1 && (
                  <Polyline 
                    positions={roadPoints}
                    pathOptions={{ 
                      color: routeColor, 
                      weight: 8, 
                      opacity: 0.25,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }} 
                  />
                )}

                {/* Primary Road-Following Navigation Line */}
                {roadPoints.length > 1 && (
                  <Polyline 
                    positions={roadPoints}
                    pathOptions={{ 
                      color: routeColor, 
                      weight: 4.5, 
                      opacity: 0.95,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }} 
                  />
                )}

                {/* Stop Markers along the route */}
                {validStops.map((stop) => (
                  <Marker
                    key={`stop-${stop.id}`}
                    position={[parseFloat(stop.latitude), parseFloat(stop.longitude)]}
                    icon={createStopIcon(stop.sequence || 1, routeColor)}
                  >
                    <Popup className="rounded-xl overflow-visible shadow-lg">
                      <div className="p-2 w-[170px] space-y-1.5 font-sans overflow-visible">
                        {/* Compact Header */}
                        <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                          <span 
                            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md text-white tracking-wide uppercase" 
                            style={{ backgroundColor: routeColor }}
                          >
                            Stop #{stop.sequence}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 truncate max-w-[70px]">
                            {route.route_code}
                          </span>
                        </div>

                        {/* Stop Title */}
                        <h4 className="font-extrabold text-slate-900 text-[11.5px] m-0 leading-tight truncate">
                          {stop.stop_name}
                        </h4>

                        {/* Compact Timings Row */}
                        <div className="grid grid-cols-2 gap-1 text-[9.5px] bg-slate-50 px-1.5 py-1 rounded-lg border border-slate-100 text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase font-semibold">Pick</span>
                            <span className="font-bold text-slate-800">{stop.pickup_time?.slice(0, 5) || '07:30'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase font-semibold">Drop</span>
                            <span className="font-bold text-slate-800">{stop.drop_off_time?.slice(0, 5) || '14:15'}</span>
                          </div>
                        </div>

                        {/* 👥 Dynamic Compact Student Avatars Stack with Hover Popover */}
                        <StudentAvatarStack students={stop.students || []} size="sm" />
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </div>
            );
          })}

          {/* 🏫 2. Dynamic School Campus Center Teardrop Pin Marker */}
          {schoolLocation?.latitude && schoolLocation?.longitude && (
            <>
              <Circle 
                center={schoolCenter}
                radius={800}
                pathOptions={{ 
                  color: themeColor, 
                  fillColor: themeColor, 
                  fillOpacity: 0.08, 
                  weight: 1.8, 
                  dashArray: '4, 4' 
                }}
              />
              <Marker 
                position={schoolCenter}
                icon={schoolIcon}
              >
                <Popup className="rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-2.5 min-w-[220px] space-y-2 font-sans">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2">
                      {schoolLocation.logo && (
                        <img 
                          src={schoolLocation.logo} 
                          alt="Logo" 
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200" 
                        />
                      )}
                      <h3 className="font-black text-slate-900 text-sm tracking-tight m-0 truncate">
                        {schoolLocation.name}
                      </h3>
                    </div>
                    
                    <span 
                      className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ 
                        backgroundColor: hexToRgba ? hexToRgba(themeColor, 0.12) : '#f0fdf4', 
                        color: themeColor 
                      }}
                    >
                      ● Central Campus Destination
                    </span>

                    <p className="text-xs text-slate-600 m-0 font-medium pt-0.5">
                      <strong>Address:</strong> {schoolLocation.address}
                    </p>

                    <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Routes Terminating: {routes.length}</span>
                      <span style={{ color: themeColor }}>Fleet Hub</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* 🚌 3. Active Bus Fleet Markers (Dynamically Flipped on Movement) */}
          {activeBuses.map((bus) => (
            <Marker 
              key={bus.id} 
              position={[bus.current_lat, bus.current_lng]}
              icon={createBusIcon(bus.direction || 'right')}
            >
              <Popup className="rounded-2xl overflow-hidden shadow-xl">
                <div className="p-2 min-w-[190px] space-y-1.5 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <h3 className="font-black text-slate-900 text-sm tracking-tight m-0">{bus.bus_number}</h3>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 m-0 font-medium">
                    <strong>Driver:</strong> {bus.driver_name || 'Assigned Driver'}
                  </p>
                  <p className="text-xs text-slate-600 m-0 font-medium">
                    <strong>Phone:</strong> {bus.driver_phone || 'N/A'}
                  </p>
                  <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>GPS Signal: High</span>
                    <span>{bus.last_location_update ? new Date(bus.last_location_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  }
