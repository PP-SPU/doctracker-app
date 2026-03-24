import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase'; // เปลี่ยนเป็น Supabase
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Calendar } from 'lucide-react';
import DocumentCard from '@/components/documents/DocumentCard';
import { STATUS_CONFIG } from '@/lib/docUtils';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const queryClient = useQueryClient();

  // 1. ดึงข้อมูลจาก Supabase แทน Base44
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false }); // เรียงจากเอกสารใหม่สุดไปเก่าสุด
      
      if (error) throw error;
      return data;
    },
  });

  // 2. ระบบ Real-time อัปเดตข้อมูลอัตโนมัติเมื่อมีเอกสารใหม่
  useEffect(() => {
    const channel = supabase
      .channel('public:documents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = documents.filter(doc => {
    const matchSearch = !search || 
      doc.title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
      doc.submitter_name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.contractor_name?.toLowerCase().includes(search.toLowerCase()); // เพิ่มให้ค้นหาชื่อบริษัทได้ด้วย
      
    const matchStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || doc.priority === priorityFilter;
    
    let matchDate = true;
    // เปลี่ยนจาก created_date เป็น created_at ให้ตรงกับฐานข้อมูลใหม่
    if (dateFrom && doc.created_at) {
      matchDate = matchDate && new Date(doc.created_at) >= new Date(dateFrom);
    }
    if (dateTo && doc.created_at) {
      matchDate = matchDate && new Date(doc.created_at) <= new Date(dateTo);
    }
    
    return matchSearch && matchStatus && matchPriority && matchDate;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">รายการเอกสาร</h1>
          <p className="text-sm text-muted-foreground">{documents.length} รายการ</p>
        </div>
        <Link to="/documents/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> สร้างใหม่
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหา ชื่อเรื่อง, เลขกำกับ, ผู้รับเอกสาร, ชื่อบริษัท..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทุกสถานะ</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="ความสำคัญ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทุกระดับ</SelectItem>
              <SelectItem value="LOW">ต่ำ</SelectItem>
              <SelectItem value="MEDIUM">ปานกลาง</SelectItem>
              <SelectItem value="HIGH">สูง</SelectItem>
              <SelectItem value="URGENT">เร่งด่วน</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder="วันที่เริ่มต้น"
              className="w-full sm:w-40"
            />
            <span className="text-sm text-muted-foreground">ถึง</span>
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder="วันที่สิ้นสุด"
              className="w-full sm:w-40"
            />
          </div>
          {(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full sm:w-auto"
            >
              ล้างตัวกรอง
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">ไม่พบเอกสาร</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
        </div>
      )}
    </div>
  );
}