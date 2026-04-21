import React, { useMemo, useState } from 'react';
import { supabase } from '@/api/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, TrendingUp, FileText, Banknote } from 'lucide-react';
import { formatBudget } from '@/lib/docUtils';

const MONTH_NAMES = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#64748b', '#14b8a6', '#a855f7'];

function getDocYear(doc) {
  if (!doc?.created_at) return null;
  const year = new Date(doc.created_at).getFullYear();
  return Number.isNaN(year) ? null : year;
}

function getSelectedYearLabel(selectedYear) {
  if (selectedYear === 'ALL') return 'ทุกปี';
  const year = Number(selectedYear);
  if (Number.isNaN(year)) return '-';
  return `ปี ${year + 543}`;
}

export default function Reports() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const availableYears = useMemo(() => {
    const years = new Set();

    documents.forEach((doc) => {
      const year = getDocYear(doc);
      if (year) years.add(year);
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    if (selectedYear === 'ALL') return documents;

    const selected = parseInt(selectedYear, 10);
    return documents.filter((doc) => getDocYear(doc) === selected);
  }, [documents, selectedYear]);

  const monthlyData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, idx) => ({
      month: MONTH_NAMES[idx],
      budget: 0,
      count: 0,
      approved: 0,
    }));

    filteredDocuments.forEach((doc) => {
      if (!doc.created_at) return;

      const date = new Date(doc.created_at);
      const monthIdx = date.getMonth();

      if (Number.isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return;

      data[monthIdx].count += 1;
      data[monthIdx].budget += Number(doc.budget || 0);

      if (['APPROVED', 'IN_PROGRESS', 'CLOSED'].includes(doc.status)) {
        data[monthIdx].approved += Number(doc.budget || 0);
      }
    });

    return data;
  }, [filteredDocuments]);

  const yearlyComparison = useMemo(() => {
    const yearData = {};

    documents.forEach((doc) => {
      const year = getDocYear(doc);
      if (!year) return;

      if (!yearData[year]) {
        yearData[year] = {
          year: year.toString(),
          yearLabel: (year + 543).toString(),
          budget: 0,
          count: 0,
        };
      }

      yearData[year].budget += Number(doc.budget || 0);
      yearData[year].count += 1;
    });

    return Object.values(yearData).sort((a, b) => Number(a.year) - Number(b.year));
  }, [documents]);

  const statusBreakdown = useMemo(() => {
    const counts = {};

    filteredDocuments.forEach((doc) => {
      const status = doc.status || 'UNKNOWN';
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [filteredDocuments]);

  const stats = useMemo(() => {
    const approvedDocs = filteredDocuments.filter((d) =>
      ['APPROVED', 'IN_PROGRESS', 'CLOSED'].includes(d.status)
    );

    return {
      total: filteredDocuments.length,
      totalBudget: filteredDocuments.reduce((sum, d) => sum + Number(d.budget || 0), 0),
      approved: approvedDocs.length,
      approvedBudget: approvedDocs.reduce((sum, d) => sum + Number(d.budget || 0), 0),
    };
  }, [filteredDocuments]);

  const selectedYearLabel = getSelectedYearLabel(selectedYear);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          โหลดข้อมูลรายงานไม่สำเร็จ
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> รายงานสรุปผล
          </h1>
          <p className="text-sm text-muted-foreground">
            วิเคราะห์งบประมาณและจำนวนงานตามเดือนและปี
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 w-40 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="ALL">ทุกปี</option>
            {availableYears.map((year) => (
              <option key={year} value={year.toString()}>
                ปี {year + 543}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold font-heading">{stats.total}</p>
                <p className="text-xs text-muted-foreground">เอกสารทั้งหมด ({selectedYearLabel})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold font-heading">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">อนุมัติแล้ว ({selectedYearLabel})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold font-heading">{formatBudget(stats.totalBudget)}</p>
                <p className="text-xs text-muted-foreground">งบรวม ({selectedYearLabel})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-bold font-heading">{formatBudget(stats.approvedBudget)}</p>
                <p className="text-xs text-muted-foreground">งบอนุมัติ ({selectedYearLabel})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">
              งบประมาณรายเดือน ({selectedYearLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatBudget(value)} />
                <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="งบประมาณรวม" />
                <Bar dataKey="approved" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="งบอนุมัติ" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">
              จำนวนเอกสารรายเดือน ({selectedYearLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="จำนวนเอกสาร"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">เปรียบเทียบรายปี</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="yearLabel" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => (name === 'งบประมาณ' ? formatBudget(value) : value)} />
                <Bar yAxisId="left" dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="งบประมาณ" />
                <Bar yAxisId="right" dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="จำนวนเอกสาร" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">
              สัดส่วนสถานะ ({selectedYearLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} (${entry.value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}