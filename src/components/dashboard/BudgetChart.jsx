import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function BudgetChart({ documents }) {
  const data = useMemo(() => {
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { month: MONTH_NAMES[d.getMonth()], budget: 0, count: 0 };
    }
    documents.forEach(doc => {
      if (!doc.created_date) return;
      const d = new Date(doc.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        monthMap[key].budget += doc.budget || 0;
        monthMap[key].count += 1;
      }
    });
    return Object.values(monthMap);
  }, [documents]);

  const formatTooltip = (value) => {
    return new Intl.NumberFormat('th-TH').format(value) + ' บาท';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-heading">งบประมาณรายเดือน (6 เดือนล่าสุด)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="งบประมาณ" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}