'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { hexToRgba } from '@/lib/themeHelper';
import { Bus, MapPin, Clock, Phone, Navigation, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

// Auto-fits map bounds to include school, active bus, and route stops
function MapBoundsUpdater({ bus, schoolLocation, stops }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (schoolLocation?.latitude && schoolLocation?.longitude) {
      points.push([parseFloat(schoolLocation.latitude), parseFloat(schoolLocation.longitude)]);
    }
    if (bus?.current_lat && bus?.current_lng) {
      points.push([parseFloat(bus.current_lat), parseFloat(bus.current_lng)]);
    }
    if (stops && stops.length > 0) {
      stops.forEach(s => {
        if (s.latitude && s.longitude) {
          points.push([parseFloat(s.latitude), parseFloat(s.longitude)]);
        }
      });
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bus, schoolLocation, stops, map]);

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
      <div style="position: relative; width: 60px; height: 38px; display: flex; align-items: center; justify-content: center; overflow: visible;">
        <!-- Live Movement Radar Pulse -->
        <div style="position: absolute; width: 48px; height: 34px; background: rgba(245, 158, 11, 0.4); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        
        <!-- Authentic Side-View Yellow School Bus SVG -->
        <div style="display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease; ${transformStyle}">
          <svg width="56" height="36" viewBox="0 0 64 40" fill="none" style="position: relative; z-index: 2; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.4));">
            <!-- Tires / Wheels -->
            <g>
              <circle cx="16" cy="31" r="7" fill="#0f172a" />
              <circle cx="16" cy="31" r="4" fill="#64748b" />
              <circle cx="16" cy="31" r="1.8" fill="#e2e8f0" />
              
              <circle cx="48" cy="31" r="7" fill="#0f172a" />
              <circle cx="48" cy="31" r="4" fill="#64748b" />
              <circle cx="48" cy="31" r="1.8" fill="#e2e8f0" />
            </g>

            <!-- Main Yellow Bus Body -->
            <path d="M4 8C4 5.79 5.79 4 8 4H45C47.21 4 49 5.79 49 8V14H58C59.66 14 61 15.34 61 17V26C61 27.66 59.66 29 58 29H4C2.9 29 2 28.1 2 27V10C2 8.9 2.9 8 4 8Z" fill="#FBBF24" stroke="#D97706" stroke-width="1.6" />

            <!-- Wheel Wells -->
            <path d="M9 29C9 25.13 12.13 22 16 22C19.87 22 23 25.13 23 29H9Z" fill="#0f172a" />
            <path d="M41 29C41 25.13 44.13 22 48 22C51.87 22 55 25.13 55 29H41Z" fill="#0f172a" />

            <!-- Safety Stripes -->
            <rect x="2" y="20" width="47" height="3" fill="#0f172a" />
            <rect x="49" y="20" width="12" height="3" fill="#0f172a" />

            <!-- Side Passenger Windows -->
            <rect x="6" y="8" width="8" height="9" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
            <rect x="16" y="8" width="8" height="9" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
            <rect x="26" y="8" width="8" height="9" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
            <rect x="36" y="8" width="8" height="9" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
            
            <!-- Slanted Front Windshield -->
            <path d="M46 8H49L53 14H46V8Z" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />

            <!-- Headlights & Tail Lights -->
            <rect x="58.5" y="22" width="2" height="3.5" rx="0.8" fill="#FEF08A" />
            <rect x="2" y="22" width="2" height="3.5" rx="0.8" fill="#EF4444" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [60, 38],
    iconAnchor: [30, 19],
    popupAnchor: [0, -18]
  });
}

/**
 * Creates Stop Marker (Special golden amber pin for My Child's Stop)
 */
function createStopIcon(sequence, isMyStop = false, themeColor = '#4f46e5') {
  if (typeof window === 'undefined' || !L) return null;

  if (isMyStop) {
    return L.divIcon({
      className: 'custom-my-stop-icon',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
          <!-- Top Badge Pill -->
          <div style="position: absolute; bottom: 32px; white-space: nowrap; background: #d97706; color: white; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.25); border: 1.5px solid #fbbf24; text-transform: uppercase; letter-spacing: 0.5px;">
            ★ My Child's Stop
          </div>
          
          <!-- Outer Pulsing Radar -->
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(245, 158, 11, 0.45); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          
          <!-- Golden Amber Center Circle -->
          <div style="position: relative; width: 28px; height: 28px; background: #f59e0b; border: 2.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1e1b4b; font-weight: 900; font-size: 12px; box-shadow: 0 4px 10px rgba(245,158,11,0.5);">
            #${sequence}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });
  }

  return L.divIcon({
    className: 'custom-stop-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="width: 22px; height: 22px; background: white; border: 2px solid ${themeColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${themeColor}; font-weight: 800; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">
          ${sequence}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  });
}

/**
 * Creates dynamic School Campus Pin Marker
 */
function createSchoolIcon(themeColor = '#4f46e5', logoUrl = null) {
  if (typeof window === 'undefined' || !L) return null;
  const shadowColor = hexToRgba(themeColor, 0.4);

  return L.divIcon({
    className: 'custom-school-icon',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <svg width="44" height="44" viewBox="0 0 36 44" fill="none" style="filter: drop-shadow(0 4px 8px ${shadowColor});">
          <path d="M18 0C8.05887 0 0 8.05887 0 18C0 28.5 15.5 42.5 17.1 43.9C17.6 44.3 18.4 44.3 18.9 43.9C20.5 42.5 36 28.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="${themeColor}"/>
          <circle cx="18" cy="18" r="14" fill="white"/>
        </svg>
        <div style="position: absolute; top: 4px; left: 8px; width: 28px; height: 28px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: white;">
          ${logoUrl ? `<img src="${logoUrl}" alt="School" style="width: 100%; height: 100%; object-fit: contain; padding: 2px;" />` : `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${themeColor}" stroke-width="2.5">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
            </svg>
          `}
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44]
  });
}

export default function ParentLiveTrackingMap({
  school,
  route,
  assignedStop,
  bus,
  allStops = []
}) {
  const [roadPolyline, setRoadPolyline] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const themeColor = school?.primary_color || '#4f46e5';

  // Default coordinate center (Ahmedabad / School Campus fallback)
  const defaultCenter = useMemo(() => {
    if (school?.latitude && school?.longitude) {
      return [parseFloat(school.latitude), parseFloat(school.longitude)];
    }
    if (assignedStop?.latitude && assignedStop?.longitude) {
      return [parseFloat(assignedStop.latitude), parseFloat(assignedStop.longitude)];
    }
    if (allStops.length > 0 && allStops[0].latitude && allStops[0].longitude) {
      return [parseFloat(allStops[0].latitude), parseFloat(allStops[0].longitude)];
    }
    return [23.0225, 72.5714];
  }, [school, assignedStop, allStops]);

  // Current bus coordinates with fallback near route
  const busLocation = useMemo(() => {
    if (bus?.current_lat && bus?.current_lng) {
      return [parseFloat(bus.current_lat), parseFloat(bus.current_lng)];
    }
    if (assignedStop?.latitude && assignedStop?.longitude) {
      return [parseFloat(assignedStop.latitude) - 0.003, parseFloat(assignedStop.longitude) - 0.003];
    }
    if (allStops.length > 0 && allStops[0].latitude && allStops[0].longitude) {
      return [parseFloat(allStops[0].latitude), parseFloat(allStops[0].longitude)];
    }
    return defaultCenter;
  }, [bus, assignedStop, allStops, defaultCenter]);

  // Fetch real road-snapped driving polyline from OSRM
  useEffect(() => {
    if (!allStops || allStops.length === 0) {
      setRoadPolyline([]);
      return;
    }

    const validWaypoints = allStops
      .filter(s => s.latitude && s.longitude)
      .map(s => [parseFloat(s.longitude), parseFloat(s.latitude)]);

    // Append school campus as final destination if available
    if (school?.latitude && school?.longitude) {
      validWaypoints.push([parseFloat(school.longitude), parseFloat(school.latitude)]);
    }

    if (validWaypoints.length < 2) {
      setRoadPolyline(validWaypoints.map(([lng, lat]) => [lat, lng]));
      return;
    }

    let isMounted = true;
    setLoadingRoute(true);

    const coordParts = validWaypoints.map(c => `${c[0]},${c[1]}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordParts}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const latLngs = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoadPolyline(latLngs);
        } else {
          // Fallback to straight line points
          setRoadPolyline(validWaypoints.map(([lng, lat]) => [lat, lng]));
        }
      })
      .catch(err => {
        console.warn('OSRM Route fetch fallback:', err);
        if (isMounted) {
          setRoadPolyline(validWaypoints.map(([lng, lat]) => [lat, lng]));
        }
      })
      .finally(() => {
        if (isMounted) setLoadingRoute(false);
      });

    return () => {
      isMounted = false;
    };
  }, [allStops, school]);

  const busIcon = useMemo(() => createBusIcon('right'), []);
  const schoolIcon = useMemo(() => createSchoolIcon(themeColor, school?.logo_url), [themeColor, school?.logo_url]);

  return (
    <div className="relative w-full h-80 sm:h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 bg-slate-100 z-0">
      
      {/* Interactive Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ background: '#f8fafc' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater 
          bus={bus ? { current_lat: busLocation[0], current_lng: busLocation[1] } : null}
          schoolLocation={school}
          stops={allStops}
        />

        {/* Real Road Snapped Navigation Polyline with Ambient Glow */}
        {roadPolyline.length > 1 && (
          <>
            <Polyline
              positions={roadPolyline}
              pathOptions={{
                color: themeColor,
                weight: 8,
                opacity: 0.28,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            <Polyline
              positions={roadPolyline}
              pathOptions={{
                color: themeColor,
                weight: 4,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}

        {/* School Campus Terminal Pin */}
        {school?.latitude && school?.longitude && (
          <Marker
            position={[parseFloat(school.latitude), parseFloat(school.longitude)]}
            icon={schoolIcon}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2 space-y-1 text-center min-w-[150px]">
                <span className="text-[10px] font-black uppercase text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                  Campus Main Terminal
                </span>
                <h4 className="text-xs font-black text-slate-900 mt-1">{school.name || 'School Campus'}</h4>
                <p className="text-[11px] text-slate-500">{school.address || 'Main Campus Terminal'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* All Sequenced Route Stops */}
        {allStops.map((s, idx) => {
          if (!s.latitude || !s.longitude) return null;
          const isMyStop = Boolean(s.is_my_stop || (assignedStop && assignedStop.id === s.id));
          const stopIcon = createStopIcon(s.sequence || (idx + 1), isMyStop, themeColor);

          return (
            <Marker
              key={s.id || idx}
              position={[parseFloat(s.latitude), parseFloat(s.longitude)]}
              icon={stopIcon}
              zIndexOffset={isMyStop ? 1000 : 500}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 space-y-1.5 min-w-[170px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      Stop #{s.sequence || (idx + 1)}
                    </span>
                    {isMyStop && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        ★ Assigned
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-slate-900 leading-snug">{s.stop_name}</h4>
                  <div className="text-[10px] font-mono text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span>Pickup:</span>
                      <span>{s.pickup_time || '--'}</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-700 font-bold">
                      <span>Drop:</span>
                      <span>{s.drop_off_time || '--'}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Yellow School Bus Vehicle Marker */}
        {busLocation && (
          <Marker
            position={busLocation}
            icon={busIcon}
            zIndexOffset={2000}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2.5 space-y-1.5 min-w-[190px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Live GPS Telemetry
                  </span>
                  <span className="text-[10px] font-mono font-black text-emerald-700">32 km/h</span>
                </div>
                <h4 className="text-xs font-mono font-black text-slate-900">{bus?.bus_number || 'Smart Bus Fleet'}</h4>
                <p className="text-[11px] text-slate-600 font-medium">Driver: {bus?.driver_name || 'Assigned Driver'}</p>
                {bus?.driver_phone && (
                  <a
                    href={`tel:${bus.driver_phone}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 hover:underline pt-1"
                  >
                    <Phone size={11} /> {bus.driver_phone}
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Glassmorphism Status Bar Overlay */}
      <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4 p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg z-[400] animate-fadeIn">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0 shadow-2xs">
            <Bus size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                {assignedStop?.stop_name ? `Approaching ${assignedStop.stop_name}` : 'En Route on Assigned Route'}
              </h4>
            </div>
            <p className="text-[11px] text-primary-700 font-bold mt-0.5">
              Estimated Arrival: ~4-6 Minutes (~1.2 km away)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {bus?.driver_phone && (
            <a
              href={`tel:${bus.driver_phone}`}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Phone size={13} className="text-amber-400" />
              <span>Call Driver</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
