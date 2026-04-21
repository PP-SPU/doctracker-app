import React, { useMemo, useState } from 'react';
import { supabase } from '@/api/supabase';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar } from 'lucide-react';
import DocumentCard from '@/components/documents/DocumentCard';
import { STATUS_CONFIG } from '@/lib/docUtils';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');

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

  const filtered = useMemo(() => {
    const filteredDocs = documents.filter((doc) => {
      const searchText = search.toLowerCase().trim();

      const matchSearch =
        !searchText ||
        doc.title?.toLowerCase().includes(searchText) ||
        doc.reference_number?.toLowerCase().includes(searchText) ||
        doc.doc_number?.toLowerCase().includes(searchText) ||
        doc.submitter_name?.toLowerCase().includes(searchText) ||
        doc.contractor_name?.toLowerCase().includes(searchText);

      const matchStatus = statusFilter === 'ALL' || doc.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || doc.priority === priorityFilter;

      let matchDate = true;

      if (dateFrom && doc.created_at) {
        matchDate = matchDate && new Date(doc.created_at) >= new Date(dateFrom);
      }

      if (dateTo && doc.created_at) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        matchDate = matchDate && new Date(doc.created_at) <= endDate;
      }

      return matchSearch && matchStatus && matchPriority && matchDate;
    });

    filteredDocs.sort((a, b) => {
      if (sortBy === 'created_desc') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }

      if (sortBy === 'created_asc') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }

      if (sortBy === 'doc_desc') {
        return (b.doc_number || '').localeCompare(a.doc_number || '', 'th', {
          numeric: true,
          sensitivity: 'base',
        });
      }

      if (sortBy === 'doc_asc') {
        return (a.doc_number || '').localeCompare(b.doc_number || '', 'th', {
          numeric: true,
          sensitivity: 'base',
        });
      }

      return 0;
    });

    return filteredDocs;
  }, [documents, search, statusFilter, priorityFilter, dateFrom, dateTo, sortBy]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">รายการเอกสาร</h1>
          <p className="text-sm text-muted-foreground">{documents.length} รายการ</p>
        </div>

        <Link to="/documents/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            สร้างใหม่
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหา"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full sm:w-44 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="ALL">ทุกสถานะ</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 w-full sm:w-36 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="ALL">ทุกระดับ</option>
            <option value="LOW">ต่ำ</option>
            <option value="MEDIUM">ปานกลาง</option>
            <option value="HIGH">สูง</option>
            <option value="URGENT">เร่งด่วน</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 w-full sm:w-52 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="created_desc">เรียง: ล่าสุด</option>
            <option value="created_asc">เรียง: เก่าสุด</option>
            <option value="doc_desc">เลขเอกสาร: มากไปน้อย</option>
            <option value="doc_asc">เลขเอกสาร: น้อยไปมาก</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full sm:w-40"
            />
            <span className="text-sm text-muted-foreground">ถึง</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>

          {(search ||
            statusFilter !== 'ALL' ||
            priorityFilter !== 'ALL' ||
            dateFrom ||
            dateTo ||
            sortBy !== 'created_desc') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setDateFrom('');
                setDateTo('');
                setSortBy('created_desc');
              }}
              className="w-full sm:w-auto"
            >
              ล้างตัวกรอง
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          โหลดข้อมูลเอกสารไม่สำเร็จ
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">ไม่พบเอกสาร</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}