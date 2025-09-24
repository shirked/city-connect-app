
"use client";

import 'maplibre-gl/dist/maplibre-gl.css';
import { useState } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import type { Report } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MapPin, Car, SprayCan, LightbulbOff, Trash2, Wrench, TrafficCone, Waves, Trees, Bug, HelpCircle } from 'lucide-react';
import { ReportDialog } from './report-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ReportsMapProps {
  reports: Report[];
}

const legendItems = [
    { label: "Road & Traffic", color: "bg-blue-700" },
    { label: "Graffiti", color: "bg-purple-700" },
    { label: "Streetlight/Power", color: "bg-yellow-700" },
    { label: "Litter & Dumping", color: "bg-green-700" },
    { label: "Broken Item", color: "bg-orange-700" },
    { label: "Hazard/Blockage", color: "bg-red-700" },
    { label: "Flooding/Leak", color: "bg-cyan-700" },
    { label: "Tree/Plant Issue", color: "bg-emerald-700" },
    { label: "Pest Control", color: "bg-lime-700" },
    { label: "Other", color: "bg-gray-700" },
];

const getPinConfig = (iconName: string) => {
    const iconMap: { [key: string]: { icon: React.ElementType, color: string } } = {
        'Car': { icon: Car, color: 'text-blue-700 fill-blue-700/40' },
        'SprayCan': { icon: SprayCan, color: 'text-purple-700 fill-purple-700/40' },
        'LightbulbOff': { icon: LightbulbOff, color: 'text-yellow-700 fill-yellow-700/40' },
        'Trash2': { icon: Trash2, color: 'text-green-700 fill-green-700/40' },
        'Wrench': { icon: Wrench, color: 'text-orange-700 fill-orange-700/40' },
        'TrafficCone': { icon: TrafficCone, color: 'text-red-700 fill-red-700/40' },
        'Waves': { icon: Waves, color: 'text-cyan-700 fill-cyan-700/40' },
        'Trees': { icon: Trees, color: 'text-emerald-700 fill-emerald-700/40' },
        'Bug': { icon: Bug, color: 'text-lime-700 fill-lime-700/40' },
        'HelpCircle': { icon: HelpCircle, color: 'text-gray-700 fill-gray-700/40' },
    };
    return iconMap[iconName] || iconMap['HelpCircle'];
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
          const pinConfig = getPinConfig(report.iconName);
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
                    <MapPin className={cn("h-8 w-8", pinConfig.color)} strokeWidth={1.5} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{report.description}</p>
                </TooltipContent>
              </Tooltip>
            </Marker>
          );
        })}

        <div className="absolute bottom-4 right-4">
            <Card className="max-w-xs bg-background/80 backdrop-blur-sm">
                <CardHeader className="p-3">
                    <CardTitle className="text-base">Map Legend</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        {legendItems.map(item => {
                            return (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className={cn("h-3 w-3 rounded-sm shrink-0", item.color)} />
                                    <span className="text-xs">{item.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
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
