import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { formatBudget, formatDate, isOverdue, isNewToday } from '@/lib/docUtils';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Clock, AlertTriangle, Sparkles, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DocumentCard({ doc }) {
  const overdue = isOverdue(doc);
  const isNew = isNewToday(doc);

  return (
    <Link to={`/documents/${doc.id}`}>
      <Card className={cn(
        "hover:shadow-md transition-all duration-200 cursor-pointer border-l-4",
        overdue ? "border-l-red-500" :
        doc.status === 'CLOSED' ? "border-l-green-500" :
        doc.status === 'APPROVED' ? "border-l-emerald-500" :
        doc.status === 'RETURNED' ? "border-l-red-400" :
        "border-l-primary"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                  <Hash className="w-3 h-3" />{doc.doc_number}
                </span>
                <StatusBadge status={doc.status} />
                <PriorityBadge priority={doc.priority} />
                {overdue && (
                  <span className="text-xs text-red-600 flex items-center gap-0.5 font-medium">
                    <AlertTriangle className="w-3 h-3" /> ล่าช้า
                  </span>
                )}
                {isNew && (
                  <span className="text-xs text-amber-600 flex items-center gap-0.5 font-medium">
                    <Sparkles className="w-3 h-3" /> ใหม่
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm truncate">{doc.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{doc.submitter_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold">{formatBudget(doc.budget)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                <Clock className="w-3 h-3" />
                {formatDate(doc.created_date)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}