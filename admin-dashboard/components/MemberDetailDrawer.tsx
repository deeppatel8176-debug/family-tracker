'use client';

import { useState } from 'react';
import {
  X,
  MapPin,
  Battery,
  Clock,
  Navigation,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export interface SelectedMember {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  profileImage?: string;
  relationship?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  batteryPercentage?: number;
  sharingStatus: string;
  recordedAt: string;
  isStale: boolean;
  isOnline: boolean;
}

interface MemberDetailDrawerProps {
  member: SelectedMember | null;
  onClose: () => void;
}

export default function MemberDetailDrawer({ member, onClose }: MemberDetailDrawerProps) {
  if (!member) return null;

  const targetId = member.userId || member.id;
  const isStale = member.isStale;
  const isSharing = member.sharingStatus === 'active';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div className="space-y-6">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
              {member.name?.[0]?.toUpperCase() || 'M'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{member.name}</h2>
              <p className="text-xs text-slate-500">{member.relationship || 'Family Member'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill Banner */}
        <div className="flex items-center gap-2">
          {isSharing ? (
            isStale ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Stale Location (&gt; 5 min ago)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Active Sharing
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Location Sharing Stopped
            </span>
          )}
        </div>

        {/* Detailed Metrics List */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              Coordinates
            </span>
            <span className="font-mono font-semibold text-slate-800">
              {member.latitude.toFixed(5)}, {member.longitude.toFixed(5)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600" />
              GPS Accuracy
            </span>
            <span className="font-semibold text-slate-800">
              ±{member.accuracy ? member.accuracy.toFixed(1) : 0} meters
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Battery className="w-4 h-4 text-emerald-600" />
              Device Battery
            </span>
            <span className="font-semibold text-slate-800">
              {member.batteryPercentage !== undefined ? `${member.batteryPercentage}%` : 'Not reported'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Last Location Time
            </span>
            <span className="font-semibold text-slate-800">
              {member.recordedAt ? new Date(member.recordedAt).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 leading-relaxed">
          Coordinates are recorded voluntarily and with explicit member consent. Stale indicators automatically flag devices that have stopped sending fresh GPS pulses.
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100">
        <Link
          href={`/history?userId=${targetId}`}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-200"
        >
          <span>View Recorded Location History</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
