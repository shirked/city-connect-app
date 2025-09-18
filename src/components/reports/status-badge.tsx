import { Report } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, Send } from 'lucide-react';

interface StatusBadgeProps {
  status: Report['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    Submitted: {
      label: 'Submitted',
      className: 'bg-primary/10 text-primary border-primary/20',
      icon: <Send className="mr-1.5 h-3.5 w-3.5" />
    },
    'In Progress': {
      label: 'In Progress',
      className: 'bg-chart-4/20 text-yellow-700 border-chart-4/30',
      icon: <Clock className="mr-1.5 h-3.5 w-3.5" />
    },
    Resolved: {
      label: 'Resolved',
      className: 'bg-accent/10 text-accent border-accent/20',
      icon: <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
    },
  };
  
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn('font-semibold', config.className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
