'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader2, Check, X } from 'lucide-react';

// Custom Pin Icon for Location Picker
function createPickerPinIcon() {
  if (typeof window === 'undefined' || !L) return null;
  return L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div style="position: relative; width: 32px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <svg width="32" height="38" viewBox="0 0 32 38" fill="none" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
          <path d="M16 0C7.16344 0 0 7.16344 0 16C0 25.5 16 38 16 38C16 38 32 25.5 32 16C32 7.16344 24.8366 0 16 0Z" fill="#ef4444" />
          <circle cx="16" cy="15" r="6" fill="#ffffff" />
        </svg>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38]
  });
}

// Helper to center and pan map when location changes
function MapViewRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [center, map]);
  return null;
}

// Map Click Handler for user to click anywhere on map to drop pin
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    }
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  defaultCenter = [19.1136, 72.8697], // Mumbai default
  label = "Search Stop Address or Drop Pin on Map"
}) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const isSelectingRef = useRef(false);

  const currentLat = latitude ? parseFloat(latitude) : null;
  const currentLng = longitude ? parseFloat(longitude) : null;

  const markerPosition = useMemo(() => {
    if (currentLat && currentLng && !isNaN(currentLat) && !isNaN(currentLng)) {
      return [currentLat, currentLng];
    }
    return null;
  }, [currentLat, currentLng]);

  const mapCenter = markerPosition || defaultCenter;
  const pickerPinIcon = useMemo(() => createPickerPinIcon(), []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Address Search via Nominatim OpenStreetMap Geocoding
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1&countrycodes=in`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowDropdown(data.length > 0);
        }
      } catch (err) {
        console.warn('Geocoding search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Initial reverse geocode if latitude/longitude are provided (e.g. edit mode)
  useEffect(() => {
    if (latitude && longitude && !query) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
        .then(r => r.json())
        .then(data => {
          if (data && data.display_name) {
            isSelectingRef.current = true;
            setQuery(data.display_name);
          }
        })
        .catch(() => {});
    }
  }, [latitude, longitude]);

  const handleSelectSuggestion = (item) => {
    isSelectingRef.current = true;
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setQuery(item.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    onLocationChange({
      latitude: lat,
      longitude: lon,
      displayName: item.display_name
    });
  };

  const handleMapClick = async (lat, lng) => {
    const formattedLat = parseFloat(lat.toFixed(6));
    const formattedLng = parseFloat(lng.toFixed(6));
    
    onLocationChange({
      latitude: formattedLat,
      longitude: formattedLng
    });

    try {
      setSearching(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${formattedLat}&lon=${formattedLng}&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        isSelectingRef.current = true;
        setQuery(data.display_name);
        onLocationChange({
          latitude: formattedLat,
          longitude: formattedLng,
          displayName: data.display_name
        });
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">
        {label}
      </label>

      {/* Address Search Bar */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Type address, station, landmark (e.g. Borivali East, Malad)..."
            value={query}
            onChange={(e) => {
              isSelectingRef.current = false;
              setQuery(e.target.value);
            }}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="w-full pl-9 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all shadow-xs"
          />
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {searching ? <Loader2 size={16} className="animate-spin text-primary-600" /> : <Search size={16} />}
          </div>
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 cursor-pointer transition-colors"
                title="Clear address"
              >
                <X size={13} />
              </button>
            )}
            {markerPosition && (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                <Check size={12} /> Pin Set
              </span>
            )}
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-start gap-2 border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
              >
                <MapPin size={15} className="text-primary-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.display_name.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {item.display_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Mini Map */}
      <div className="h-[200px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewRecenter center={markerPosition || defaultCenter} />
          <MapClickHandler onLocationSelect={handleMapClick} />

          {markerPosition && (
            <Marker position={markerPosition} icon={pickerPinIcon} />
          )}
        </MapContainer>

        {/* Map Helper Overlay Badge */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-[400]">
          <span className="text-[10px] font-semibold bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg shadow-sm">
            {markerPosition 
              ? `📍 ${markerPosition[0].toFixed(4)}, ${markerPosition[1].toFixed(4)}`
              : '👉 Click anywhere on map to drop pin'}
          </span>
          <span className="text-[10px] font-medium bg-white/90 text-slate-600 px-2 py-1 rounded-lg shadow-sm border border-slate-200">
            Click map to adjust
          </span>
        </div>
      </div>
    </div>
  );
}
