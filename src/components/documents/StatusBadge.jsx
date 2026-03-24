import React from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/lib/docUtils';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <Badge variant="outline" className={cn("font-medium border text-xs", config.color)}>
      {config.label}
    </Badge>
  );
}