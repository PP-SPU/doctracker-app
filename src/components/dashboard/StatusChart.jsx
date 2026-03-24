import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { STATUS_CONFIG } from '@/lib/docUtils';

const COLORS = ['#94a3b8', '#3b82f6', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#14b8a6', '#22c55e', '#ef4444'];

export default function StatusChart({ documents }) {
  const data = useMemo(() => {
    const counts = {};
    documents.forEach(doc => {
      counts[doc.status] = (counts[doc.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status: STATUS_CONFIG[status]?.label || status,
      count,
      key: status,
    }));
  }, [documents]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-heading">สถานะเอกสาร</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="status" type="category" tick={{ fontSize: 10 }} width={100} />
            <Tooltip />
            <Bar dataKey="count" name="จำนวน" radius={[0, 4, 4, 0]}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}