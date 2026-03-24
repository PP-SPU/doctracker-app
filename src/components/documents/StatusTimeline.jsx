import React from 'react';
import { STATUS_CONFIG, formatDateTime } from '@/lib/docUtils';
import { cn } from '@/lib/utils';

export default function StatusTimeline({ history }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มีประวัติ</p>;
  }

  return (
    <div className="space-y-0">
      {history.map((item, idx) => {
        const config = STATUS_CONFIG[item.status] || {};
        const isLast = idx === history.length - 1;
        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-3 h-3 rounded-full flex-shrink-0 mt-1.5",
                isLast ? "bg-primary ring-2 ring-primary/20" : "bg-muted-foreground/30"
              )} />
              {!isLast && <div className="w-px flex-1 bg-border" />}
            </div>
            <div className={cn("pb-4", isLast && "pb-0")}>
              <p className="text-sm font-medium">{config.label || item.status}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</p>
              {item.by && <p className="text-xs text-muted-foreground">โดย: {item.by}</p>}
              {item.note && (
                <p className="text-xs mt-1 px-2 py-1 bg-muted rounded text-muted-foreground">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}