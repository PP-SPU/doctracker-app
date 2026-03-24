import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase'; // เปลี่ยนเป็น Supabase
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, History, FileText, Pencil, Send, ArrowLeft, Trash2, Lock, CheckCircle, MessageSquare } from 'lucide-react';
import { formatDateTime } from '@/lib/docUtils';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ACTION_CONFIG = {
  CREATED: { label: 'สร้าง', icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  UPDATED: { label: 'แก้ไข', icon: Pencil, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  SUBMITTED: { label: 'ส่งเรื่อง', icon: Send, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  APPROVED: { label: 'อนุมัติ', icon: CheckCircle, color: 'bg-green-50 text-green-700 border-green-200' },
  RETURNED: { label: 'ตีกลับ', icon: ArrowLeft, color: 'bg-red-50 text-red-700 border-red-200' },
  STATUS_CHANGED: { label: 'เปลี่ยนสถานะ', icon: History, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  DELETED: { label: 'ลบ', icon: Trash2, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  CLOSED: { label: 'ปิดงาน', icon: Lock, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  COMMENT: { label: 'ความเห็น', icon: MessageSquare, color: 'bg-sky-50 text-sky-700 border-sky-200' },
};

export default function ActivityLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const queryClient = useQueryClient();

  // ดึงข้อมูลจากตาราง activity_logs ใน Supabase
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      return data || [];
    },
  });

  // ระบบ Real-time แจ้งเตือนเมื่อมี Log ใหม่
  useEffect(() => {
    const channel = supabase
      .channel('public:activity_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_logs' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.action_detail?.toLowerCase().includes(search.toLowerCase()) ||
      log.doc_number?.toLowerCase().includes(search.toLowerCase()) ||
      log.performed_by?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <History className="w-6 h-6" /> ประวัติการทำงาน
        </h1>
        <p className="text-sm text-muted-foreground">บันทึก Log ทุกกิจกรรมในระบบ</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหา เลขกำกับ, รายละเอียด..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="ประเภท" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ทั้งหมด</SelectItem>
            {Object.entries(ACTION_CONFIG).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">ไม่พบประวัติ</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(log => {
            const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.STATUS_CHANGED;
            const Icon = config.icon;
            return (
              <Card key={log.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-[10px]", config.color)}>
                        {config.label}
                      </Badge>
                      {log.doc_number && (
                        <Link
                          to={`/documents/${log.document_id}`}
                          className="text-xs font-mono text-primary hover:underline"
                        >
                          {log.doc_number}
                        </Link>
                      )}
                    </div>
                    <p className="text-sm mt-0.5">{log.action_detail}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {/* เปลี่ยน created_date เป็น created_at */}
                      <span>{formatDateTime(log.created_at)}</span>
                      {log.performed_by && <span>โดย: {log.performed_by}</span>}
                      {log.old_status && log.new_status && (
                        <span>{log.old_status} → {log.new_status}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}