'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { SelectedMember } from './MemberDetailDrawer';

export interface SafeZone {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive?: boolean;
}

interface GoogleMapWrapperProps {
  members: SelectedMember[];
  geofences?: SafeZone[];
  onSelectMember: (member: SelectedMember) => void;
  selectedMemberId?: string;
  onSelectGeofence?: (zone: SafeZone) => void;
  selectedGeofenceId?: string;
}

export default function GoogleMapWrapper({
  members,
  geofences = [],
  onSelectMember,
  selectedMemberId,
  onSelectGeofence,
  selectedGeofenceId,
}: GoogleMapWrapperProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const circlesRef = useRef<{ [key: string]: any }>({});
  const geofenceMarkersRef = useRef<{ [key: string]: any }>({});
  const geofenceCirclesRef = useRef<{ [key: string]: any }>({});
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'zones'>('members');
  const [isListExpanded, setIsListExpanded] = useState(false);

  const sharingMembers = members.filter((m) => m.latitude && m.longitude);
  const activeFences = geofences.filter(
    (g) => typeof g.latitude === 'number' && typeof g.longitude === 'number' && !isNaN(g.latitude) && !isNaN(g.longitude)
  );

  // Auto-expand list only on large desktop screens on first load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsListExpanded(true);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted || mapInstanceRef.current) return;

      // Default center: first sharing member, or first safe zone, or Surat/India
      const firstMember = sharingMembers[0];
      const firstFence = activeFences[0];
      const defaultLat = firstMember?.latitude ?? firstFence?.latitude ?? 21.23016;
      const defaultLng = firstMember?.longitude ?? firstFence?.longitude ?? 72.78533;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: firstMember || firstFence ? 14 : 12,
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

  // Update Member Markers and Accuracy Circles
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

        // Custom HTML Member Marker Icon
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

      // Pan to selected member
      if (selectedMemberId && markersRef.current[selectedMemberId]) {
        const selected = sharingMembers.find((m) => (m.userId || m.id) === selectedMemberId);
        if (selected) {
          map.flyTo([selected.latitude, selected.longitude], 16, { animate: true, duration: 1.2 });
        }
      } else if (sharingMembers.length > 0 && activeFences.length === 0) {
        const bounds = L.latLngBounds(sharingMembers.map((m) => [m.latitude, m.longitude]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
      }
    });
  }, [isMapReady, members, selectedMemberId]);

  // Update Safe Zone (Geofence) Markers and Perimeter Circles
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    import('leaflet').then(({ default: L }) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const currentFenceIds = new Set<string>();

      activeFences.forEach((zone) => {
        const id = zone._id;
        currentFenceIds.add(id);

        const lat = zone.latitude;
        const lng = zone.longitude;
        const radius = zone.radius || 200;
        const isSelected = selectedGeofenceId === id;

        // Custom HTML Marker for Safe Zone
        const customFenceIcon = L.divIcon({
          className: 'custom-safezone-marker',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="
                width: 36px;
                height: 36px;
                border-radius: 12px;
                background: ${isSelected ? '#047857' : '#059669'};
                border: 2.5px solid white;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
              ">
                🛡️
              </div>
              <div style="
                margin-top: 3px;
                background: rgba(6, 78, 59, 0.95);
                color: white;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                border: 1px solid rgba(255,255,255,0.25);
              ">
                ${zone.name} (${radius}m)
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        // Add or update Geofence Center Marker
        if (geofenceMarkersRef.current[id]) {
          geofenceMarkersRef.current[id].setLatLng([lat, lng]);
          geofenceMarkersRef.current[id].setIcon(customFenceIcon);
        } else {
          const marker = L.marker([lat, lng], { icon: customFenceIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 170px;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                <span style="font-size:20px;">🛡️</span>
                <strong style="color: #065f46; font-size: 14px;">${zone.name}</strong>
              </div>
              <div style="font-size: 12px; color: #334155; line-height: 1.6;">
                <p style="margin: 0;"><strong>Perimeter Radius:</strong> ${radius} meters</p>
                <p style="margin: 0;"><strong>Coordinates:</strong> ${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
                <p style="margin: 0;"><strong>Status:</strong> <span style="color:#059669; font-weight:600;">Active Safe Zone</span></p>
              </div>
            </div>
          `);
          marker.on('click', () => {
            if (onSelectGeofence) onSelectGeofence(zone);
          });
          geofenceMarkersRef.current[id] = marker;
        }

        // Add or update Geofence Boundary Circle
        if (geofenceCirclesRef.current[id]) {
          geofenceCirclesRef.current[id].setLatLng([lat, lng]);
          geofenceCirclesRef.current[id].setRadius(radius);
        } else {
          const circle = L.circle([lat, lng], {
            radius: radius,
            color: '#059669',
            fillColor: '#10b981',
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '6, 6',
          }).addTo(map);
          geofenceCirclesRef.current[id] = circle;
        }
      });

      // Remove deleted geofences
      Object.keys(geofenceMarkersRef.current).forEach((id) => {
        if (!currentFenceIds.has(id)) {
          map.removeLayer(geofenceMarkersRef.current[id]);
          delete geofenceMarkersRef.current[id];
          if (geofenceCirclesRef.current[id]) {
            map.removeLayer(geofenceCirclesRef.current[id]);
            delete geofenceCirclesRef.current[id];
          }
        }
      });

      // Fly to selected Safe Zone
      if (selectedGeofenceId && geofenceMarkersRef.current[selectedGeofenceId]) {
        const target = activeFences.find((g) => g._id === selectedGeofenceId);
        if (target) {
          map.flyTo([target.latitude, target.longitude], 16, { animate: true, duration: 1.2 });
          geofenceMarkersRef.current[selectedGeofenceId].openPopup();
        }
      } else if (sharingMembers.length === 0 && activeFences.length > 0) {
        const bounds = L.latLngBounds(activeFences.map((g) => [g.latitude, g.longitude]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
    });
  }, [isMapReady, geofences, selectedGeofenceId, onSelectGeofence]);

  return (
    <div className="relative w-full h-full min-h-[460px] sm:min-h-[580px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
      {/* Real Interactive Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Floating Active Elements Drawer (Mobile Responsive) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 max-w-[calc(100vw-24px)] sm:w-72">
        {!isListExpanded ? (
          <button
            onClick={() => setIsListExpanded(true)}
            className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <span className="flex items-center gap-1 text-blue-600">
              <Users className="w-3.5 h-3.5" />
              <span>{members.length} Members</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span>🛡️ {activeFences.length} Zones</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>
        ) : (
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl w-72 max-w-[calc(100vw-24px)] animate-in fade-in zoom-in-95 duration-150">
            {/* Header with Minimize Button */}
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Map Elements</p>
              <button
                onClick={() => setIsListExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Collapse list"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all text-center ${
                  activeTab === 'members'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Members ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('zones')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all text-center ${
                  activeTab === 'zones'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Safe Zones ({activeFences.length})
              </button>
            </div>

            {activeTab === 'members' ? (
              <div className="space-y-1.5 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                {members.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">No members registered yet.</p>
                ) : (
                  members.map((m) => {
                    const isSelected = selectedMemberId === (m.userId || m.id);
                    const isSharing = m.sharingStatus === 'active';
                    const isStale = m.isStale;

                    return (
                      <button
                        key={m.userId || m.id}
                        onClick={() => {
                          onSelectMember(m);
                          if (typeof window !== 'undefined' && window.innerWidth < 640) {
                            setIsListExpanded(false);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
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
            ) : (
              <div className="space-y-1.5 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                {activeFences.length === 0 ? (
                  <div className="text-center py-3 text-xs text-slate-400 space-y-1">
                    <p>No Safe Zones configured.</p>
                    <p className="text-[10px] text-slate-500">Go to Safe Zones page to create one.</p>
                  </div>
                ) : (
                  activeFences.map((zone) => {
                    const isSelected = selectedGeofenceId === zone._id;
                    return (
                      <button
                        key={zone._id}
                        onClick={() => {
                          if (onSelectGeofence) onSelectGeofence(zone);
                          if (mapInstanceRef.current && geofenceMarkersRef.current[zone._id]) {
                            mapInstanceRef.current.flyTo([zone.latitude, zone.longitude], 16, { animate: true });
                            geofenceMarkersRef.current[zone._id].openPopup();
                          }
                          if (typeof window !== 'undefined' && window.innerWidth < 640) {
                            setIsListExpanded(false);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-sm'
                            : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 border border-emerald-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">🛡️</span>
                          <div className="truncate">
                            <p className="truncate font-semibold">{zone.name}</p>
                            <p className="text-[10px] opacity-75">{zone.radius}m perimeter</p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold shrink-0 opacity-75">
                          Focus
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Legend Floating Bottom-Left (Hidden on small mobile to avoid map clash) */}
      <div className="hidden sm:flex absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Live</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Stale (&gt;5m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>Off</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <span className="text-emerald-600 font-bold">🛡️</span>
          <span className="font-semibold text-emerald-800">Safe Zones ({activeFences.length})</span>
        </div>
      </div>
    </div>
  );
}
