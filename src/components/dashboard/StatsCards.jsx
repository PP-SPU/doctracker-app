import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatBudget } from '@/lib/docUtils';
import { FileText, Clock, CheckCircle, AlertTriangle, Banknote, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsCards({ documents }) {
  const total = documents.length;
  const inProgress = documents.filter(d => !['DRAFT', 'CLOSED'].includes(d.status)).length;
  const closed = documents.filter(d => d.status === 'CLOSED').length;
  const overdue = documents.filter(d => {
    if (!d.due_date || d.status === 'CLOSED') return false;
    return new Date(d.due_date) < new Date();
  }).length;
  const totalBudget = documents.reduce((sum, d) => sum + (d.budget || 0), 0);
  const approvedBudget = documents
    .filter(d => ['APPROVED', 'IN_PROGRESS', 'CLOSED'].includes(d.status))
    .reduce((sum, d) => sum + (d.budget || 0), 0);

  const stats = [
    { label: 'เอกสารทั้งหมด', value: total, icon: FileText, iconColor: 'text-primary bg-primary/10' },
    { label: 'กำลังดำเนินการ', value: inProgress, icon: Clock, iconColor: 'text-amber-600 bg-amber-50' },
    { label: 'ปิดงานแล้ว', value: closed, icon: CheckCircle, iconColor: 'text-green-600 bg-green-50' },
    { label: 'งานล่าช้า', value: overdue, icon: AlertTriangle, iconColor: 'text-red-600 bg-red-50' },
    { label: 'งบประมาณรวม', value: formatBudget(totalBudget), icon: Banknote, iconColor: 'text-purple-600 bg-purple-50' },
    { label: 'งบอนุมัติแล้ว', value: formatBudget(approvedBudget), icon: TrendingUp, iconColor: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", s.iconColor)}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-lg font-bold font-heading">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}