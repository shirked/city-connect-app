
"use client";

import 'maplibre-gl/dist/maplibre-gl.css';
import { useState } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { Report } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { ReportDialog } from './report-dialog';

interface ReportsMapProps {
  reports: Report[];
}

const getPinColor = (iconName: string) => {
    const colorMap: { [key: string]: string } = {
        'Car': 'text-blue-700 fill-blue-700/40',
        'SprayCan': 'text-purple-700 fill-purple-700/40',
        'LightbulbOff': 'text-yellow-700 fill-yellow-700/40',
        'Trash2': 'text-green-700 fill-green-700/40',
        'Wrench': 'text-orange-700 fill-orange-700/40',
        'TrafficCone': 'text-red-700 fill-red-700/40',
        'Waves': 'text-cyan-700 fill-cyan-700/40',
        'Trees': 'text-emerald-700 fill-emerald-700/40',
        'Bug': 'text-lime-700 fill-lime-700/40',
        'HelpCircle': 'text-gray-700 fill-gray-700/40',
    };
    return colorMap[iconName] || colorMap['HelpCircle'];
};

export function ReportsMap({ reports }: ReportsMapProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const initialLat = reports.length > 0 ? reports.reduce((sum, r) => sum + r.location.lat, 0) / reports.length : 23.6393;
  const initialLng = reports.length > 0 ? reports.reduce((sum, r) => sum + r.location.lng, 0) / reports.length : 85.3441;

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  if (!mapTilerKey || mapTilerKey === 'YOUR_MAPTILER_API_KEY_HERE') {
    return (
        <div className="flex flex-col justify-center items-center h-full bg-muted">
            <h3 className="text-lg font-semibold mb-2">Map Service Configuration Needed</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
                Please add your free API key from a provider like MapTiler to the <code className="bg-primary/10 text-primary p-1 rounded-sm">.env.local</code> file to enable the map.
            </p>
        </div>
    );
  }

  const mapStyle = `https://api.maptiler.com/maps/streets/style.json?key=${mapTilerKey}`;
  
  return (
    <TooltipProvider>
      <Map
        initialViewState={{
          longitude: initialLng,
          latitude: initialLat,
          zoom: reports.length > 1 ? 11 : 13
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle={mapStyle}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />
        
        {reports.map((report) => {
          const pinColor = getPinColor(report.iconName);
          return (
            <Marker
              key={report.id}
              longitude={report.location.lng}
              latitude={report.location.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedReport(report);
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer">
                    <MapPin className={cn("h-8 w-8", pinColor)} strokeWidth={1.5} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{report.description}</p>
                </TooltipContent>
              </Tooltip>
            </Marker>
          );
        })}
      </Map>

      {selectedReport && (
        <ReportDialog 
            report={selectedReport} 
            open={!!selectedReport} 
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedReport(null);
                }
            }}
        />
      )}
    </TooltipProvider>
  );
}
