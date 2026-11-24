'use client';

import { useState } from 'react';
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
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Center coordinate: average of all sharing members or SF default
  const sharingMembers = members.filter((m) => m.latitude && m.longitude);
  const centerLat =
    sharingMembers.length > 0
      ? sharingMembers.reduce((sum, m) => sum + m.latitude, 0) / sharingMembers.length
      : 37.7749;
  const centerLng =
    sharingMembers.length > 0
      ? sharingMembers.reduce((sum, m) => sum + m.longitude, 0) / sharingMembers.length
      : -122.4194;

  const bbox = `${centerLng - 0.04}%2C${centerLat - 0.03}%2C${centerLng + 0.04}%2C${centerLat + 0.03}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
      {/* Live Map Iframe Layer */}
      <iframe
        title="Admin Live Family Map"
        width="100%"
        height="100%"
        className="w-full h-full border-0 absolute inset-0"
        src={mapUrl}
      />

      {/* Floating Member Markers Overlay List */}
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
