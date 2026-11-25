'use client';

import { useEffect, useRef, useState } from 'react';
import { SelectedMember } from './MemberDetailDrawer';

interface GoogleMapWrapperProps {
  members: SelectedMember[];
  onSelectMember: (member: SelectedMember) => void;
  selectedMemberId?: string;
}

export default function GoogleMapWrapper({
  members,
  onSelectMember,
  selectedMemberId,
}: GoogleMapWrapperProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const circlesRef = useRef<{ [key: string]: any }>({});
  const [isMapReady, setIsMapReady] = useState(false);

  const sharingMembers = members.filter((m) => m.latitude && m.longitude);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted || mapInstanceRef.current) return;

      // Default center: first sharing member or Surat/SF
      const firstMember = sharingMembers[0];
      const defaultLat = firstMember?.latitude ?? 21.23016;
      const defaultLng = firstMember?.longitude ?? 72.78533;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: firstMember ? 15 : 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Circles when members change
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    import('leaflet').then(({ default: L }) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const currentIds = new Set<string>();

      sharingMembers.forEach((member) => {
        const id = member.userId || member.id;
        currentIds.add(id);

        const lat = member.latitude;
        const lng = member.longitude;
        const isSelected = selectedMemberId === id;
        const isStale = member.isStale;
        const initial = (member.name || 'M').charAt(0).toUpperCase();

        const badgeColor = isStale ? '#f59e0b' : '#10b981';
        const ringColor = isSelected ? '#2563eb' : '#3b82f6';

        // Custom HTML Marker Icon
        const customIcon = L.divIcon({
          className: 'custom-member-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: ${ringColor};
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 800;
                font-size: 16px;
                font-family: sans-serif;
                position: relative;
              ">
                ${initial}
                <span style="
                  position: absolute;
                  bottom: -2px;
                  right: -2px;
                  width: 14px;
                  height: 14px;
                  background-color: ${badgeColor};
                  border: 2px solid white;
                  border-radius: 50%;
                "></span>
              </div>
              <div style="
                position: absolute;
                top: 48px;
                background: rgba(15, 23, 42, 0.9);
                color: white;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              ">
                ${member.name}
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        // Add or update Marker
        if (markersRef.current[id]) {
          markersRef.current[id].setLatLng([lat, lng]);
          markersRef.current[id].setIcon(customIcon);
        } else {
          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
          marker.on('click', () => onSelectMember(member));
          markersRef.current[id] = marker;
        }

        // Add or update accuracy circle
        const accuracy = member.accuracy || 25;
        if (circlesRef.current[id]) {
          circlesRef.current[id].setLatLng([lat, lng]);
          circlesRef.current[id].setRadius(accuracy);
        } else {
          const circle = L.circle([lat, lng], {
            radius: accuracy,
            color: '#3b82f6',
            fillColor: '#60a5fa',
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(map);
          circlesRef.current[id] = circle;
        }
      });

      // Remove stale markers no longer sharing
      Object.keys(markersRef.current).forEach((id) => {
        if (!currentIds.has(id)) {
          map.removeLayer(markersRef.current[id]);
          delete markersRef.current[id];
          if (circlesRef.current[id]) {
            map.removeLayer(circlesRef.current[id]);
            delete circlesRef.current[id];
          }
        }
      });

      // Pan to selected member or fit all sharing members
      if (selectedMemberId && markersRef.current[selectedMemberId]) {
        const selected = sharingMembers.find((m) => (m.userId || m.id) === selectedMemberId);
        if (selected) {
          map.flyTo([selected.latitude, selected.longitude], 16, { animate: true, duration: 1.2 });
        }
      } else if (sharingMembers.length > 0) {
        const bounds = L.latLngBounds(sharingMembers.map((m) => [m.latitude, m.longitude]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      }
    });
  }, [isMapReady, members, selectedMemberId]);

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
      {/* Real Interactive Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Floating Active Members List */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-xs">
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Active Members ({sharingMembers.length})
          </p>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {members.length === 0 ? (
              <p className="text-xs text-slate-400">No members registered yet.</p>
            ) : (
              members.map((m) => {
                const isSelected = selectedMemberId === (m.userId || m.id);
                const isSharing = m.sharingStatus === 'active';
                const isStale = m.isStale;

                return (
                  <button
                    key={m.userId || m.id}
                    onClick={() => onSelectMember(m)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isSharing
                            ? isStale
                            ? 'bg-amber-400 ring-2 ring-amber-200'
                            : 'bg-emerald-500 ring-2 ring-emerald-200 animate-pulse'
                            : 'bg-slate-300'
                        }`}
                      />
                      <span className="truncate">{m.name}</span>
                    </div>
                    <span className="text-[10px] opacity-80 shrink-0 ml-2">
                      {isSharing ? (isStale ? 'Stale' : 'Live') : 'Off'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Status Legend Floating Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Sharing Live</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Stale (&gt;5m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>Off / Paused</span>
        </div>
      </div>
    </div>
  );
}
