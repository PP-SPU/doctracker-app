import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_CONFIG } from '@/lib/docUtils';
import { cn } from '@/lib/utils';

export default function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  return (
    <Badge variant="secondary" className={cn("font-medium text-xs", config.color)}>
      {config.label}
    </Badge>
  );
}