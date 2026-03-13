import React, { useEffect, useMemo, useRef, useState } from 'react';

let googleMapsScriptPromise = null;

const loadGoogleMaps = (apiKey) => {
  if (!apiKey) return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Failed to load Google Maps SDK'));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
};

const GoogleLiveMap = ({ center, markers = [], height = 260, className = '' }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const mapMarkersRef = useRef([]);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  const normalizedCenter = useMemo(() => {
    if (Number.isFinite(center?.lat) && Number.isFinite(center?.lng)) return center;
    return { lat: 6.5244, lng: 3.3792 };
  }, [center]);

  useEffect(() => {
    let cancelled = false;
    setError('');
    setReady(false);

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapNodeRef.current) return;
        mapRef.current = new window.google.maps.Map(mapNodeRef.current, {
          center: normalizedCenter,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, normalizedCenter.lat, normalizedCenter.lng]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return;

    mapMarkersRef.current.forEach((marker) => marker.setMap(null));
    mapMarkersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(normalizedCenter);

    markers.forEach((item) => {
      if (!Number.isFinite(item?.lat) || !Number.isFinite(item?.lng)) return;
      const marker = new window.google.maps.Marker({
        map: mapRef.current,
        position: { lat: item.lat, lng: item.lng },
        title: item.label || 'Worker',
      });
      if (item.info) {
        const infoWindow = new window.google.maps.InfoWindow({ content: item.info });
        marker.addListener('click', () => infoWindow.open({ map: mapRef.current, anchor: marker }));
      }
      mapMarkersRef.current.push(marker);
      bounds.extend({ lat: item.lat, lng: item.lng });
    });

    if (markers.length > 0) {
      mapRef.current.fitBounds(bounds, 70);
    } else {
      mapRef.current.setCenter(normalizedCenter);
      mapRef.current.setZoom(12);
    }
  }, [ready, markers, normalizedCenter]);

  if (error) {
    return (
      <div className={`overflow-hidden rounded-md border border-border bg-[#eef4ea] ${className}`} style={{ height }}>
        <div className="relative h-full w-full bg-[linear-gradient(0deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:40px_40px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(78,173,102,0.2),transparent_16%),radial-gradient(circle_at_70%_40%,rgba(78,173,102,0.12),transparent_18%),linear-gradient(180deg,#f2efe8,#e7efe0)]" />
          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-[12%] top-[18%] h-1 w-[38%] rotate-[16deg] bg-[#d8c8bb]" />
            <div className="absolute left-[26%] top-[42%] h-1 w-[48%] -rotate-[10deg] bg-[#d8c8bb]" />
            <div className="absolute left-[18%] top-[66%] h-1 w-[54%] rotate-[4deg] bg-[#d8c8bb]" />
            <div className="absolute left-[56%] top-[12%] h-[76%] w-1 rotate-[6deg] bg-[#d8c8bb]" />
          </div>
          <div className="absolute left-6 top-6 rounded-md bg-white shadow">
            <button className="block border-b border-border px-3 py-2 text-lg">+</button>
            <button className="block px-3 py-2 text-lg">-</button>
          </div>
          <div className="absolute bottom-6 right-6 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg">
            Live preview fallback
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-md border border-border bg-background ${className}`}>
      <div ref={mapNodeRef} style={{ width: '100%', height }} />
    </div>
  );
};

export default GoogleLiveMap;
