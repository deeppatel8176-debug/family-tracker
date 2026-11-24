'use client';

import { useEffect, useRef } from 'react';

interface MapViewProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  name?: string;
}

export default function MapView({ latitude, longitude, accuracy, name }: MapViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const lat = latitude ?? 37.7749;
  const lng = longitude ?? -122.4194;
  const zoom = latitude ? 16 : 12;

  // OpenStreetMap embed URL with interactive controls
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.008}%2C${lng + 0.008}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <iframe
        ref={iframeRef}
        title="Live Map"
        width="100%"
        height="100%"
        className="w-full h-full border-0"
        src={mapSrc}
      />
      {latitude && longitude && (
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs text-slate-800">
          <p className="font-semibold">{name || 'Your Location'}</p>
          <p className="text-[11px] text-slate-500 font-mono">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
          {accuracy && (
            <p className="text-[10px] text-blue-600 font-medium">±{accuracy.toFixed(1)}m accuracy</p>
          )}
        </div>
      )}
    </div>
  );
}
