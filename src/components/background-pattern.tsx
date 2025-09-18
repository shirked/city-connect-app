"use client";

import { useEffect, useState } from 'react';
import { MapPin, CheckCircle, Circle, AlertTriangle, Wrench, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = [
  { icon: MapPin, className: 'text-primary/10' },
  { icon: CheckCircle, className: 'text-accent/10' },
  { icon: AlertTriangle, className: 'text-destructive/10' },
  { icon: Wrench, className: 'text-chart-2/10' },
  { icon: Trash2, className: 'text-chart-4/10' },
  { icon: Circle, className: 'text-chart-5/10' },
];

const Icon = ({ icon: IconComponent, className, style }: { icon: React.ElementType, className: string, style: React.CSSProperties }) => {
    return (
        <div className={cn('absolute transition-all ease-in-out', className)} style={{ ...style, transitionDuration: '2000ms' }}>
            <IconComponent strokeWidth={1.5} className="w-full h-full" />
        </div>
    );
};

export function BackgroundPattern() {
  const [iconElements, setIconElements] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const generateIcons = () => {
        const newIcons = Array.from({ length: 25 }).map((_, i) => {
            const selected = icons[i % icons.length];
            const size = Math.floor(Math.random() * 40) + 20;
            const style = {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: Math.random() * 0.6 + 0.1,
            };
            return <Icon key={i} icon={selected.icon} className={selected.className} style={style} />;
        });
        setIconElements(newIcons);
    };
    generateIcons();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen -z-50 overflow-hidden bg-background">
      {iconElements}
    </div>
  );
}
