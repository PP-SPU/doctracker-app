import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import StatusBadge from '@/components/documents/StatusBadge';
import PriorityBadge from '@/components/documents/PriorityBadge';
import WorkflowStepper from '@/components/documents/WorkflowStepper';
import StatusActions from '@/components/documents/StatusActions';
import StatusTimeline from '@/components/documents/StatusTimeline';
import ExportPDF from '@/components/documents/ExportPDF';
import { formatBudget, formatDate, createLog } from '@/lib/docUtils'; // นำกลับมาใช้แล้ว
import { ArrowLeft, Pencil, Trash2, Hash, User, Calendar, Banknote, Building2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const pathParts = window.location.pathname.split('/');
  const docId = pathParts[pathParts.length - 1];

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', docId],
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('*').eq('id', docId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!docId,
  });

  useEffect(() => {
    if (!docId) return;
    const channel = supabase.channel(`document_${docId}`).on('postgres_changes', 
      { event: '*', schema: 'public', table: 'documents', filter: `id=eq.${docId}` }, 
      () => {
        queryClient.invalidateQueries({ queryKey: ['document', docId] });
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [docId, queryClient]);

  const handleStatusChange = async (newStatus, reason, returnedBy) => {
    setIsUpdating(true);
    const now = new Date().toISOString();
    const history = Array.isArray(doc.status_history) ? [...doc.status_history] : [];
    history.push({ status: newStatus, timestamp: now, note: reason || undefined });

    const updateData = { status: newStatus, status_history: history };
    if (newStatus === 'RETURNED') {
      updateData.return_reason = reason;
      updateData.returned_by = returnedBy;
    }
    if (newStatus === 'APPROVED') {
      updateData.approval_date = now.split('T')[0];
    }

    try {
      const { error } = await supabase.from('documents').update(updateData).eq('id', docId);
      if (error) throw error;

      // บันทึกประวัติ
      await createLog({
        document_id: docId,
        doc_number: doc.doc_number,
        action: newStatus === 'RETURNED' ? 'RETURNED' : 'STATUS_CHANGED',
        action_detail: reason || `เปลี่ยนสถานะเป็น ${newStatus}`,
        old_status: doc.status,
        new_status: newStatus,
        performed_by: returnedBy || 'ผู้ดูแลระบบ', // ใช้ชื่อคนที่กรอก หรือค่าเริ่มต้น
      });

      queryClient.invalidateQueries({ queryKey: ['document', docId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('อัปเดตสถานะสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      // บันทึกประวัติก่อนลบ
      await createLog({
        document_id: docId,
        doc_number: doc.doc_number,
        action: 'DELETED',
        action_detail: `ลบเอกสาร "${doc.title}"`,
      });

      const { error } = await supabase.from('documents').delete().eq('id', docId);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('ลบเอกสารสำเร็จ');
      navigate('/documents');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบเอกสาร');
    }
  };

  if (isLoading) return <div className="p-4 md:p-6"><Skeleton className="h-64 rounded-xl" /></div>;
  if (!doc) return <div className="p-4 text-center">ไม่พบเอกสาร</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/documents')}><ArrowLeft className="w-4 h-4 mr-1.5" /> กลับ</Button>
        <div className="flex gap-2 flex-wrap">
          <ExportPDF doc={doc} />
          {(doc.status === 'DRAFT' || doc.status === 'RETURNED') && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/documents/${docId}/edit`)}>
              <Pencil className="w-4 h-4 mr-1.5" /> แก้ไข
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-1.5" /> ลบ</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle><AlertDialogDescription>การลบเอกสารนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>ยกเลิก</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">ลบเอกสาร</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" />{doc.doc_number || 'ยังไม่มีเลข'}</span>
                <StatusBadge status={doc.status} /><PriorityBadge priority={doc.priority} />
              </div>
              <h1 className="text-xl font-bold font-heading">{doc.title}</h1>
            </div>
            <p className="text-xl font-bold text-primary">{formatBudget(doc.budget)}</p>
          </div>
          {doc.return_reason && doc.status === 'RETURNED' && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
              <p className="text-sm font-medium text-red-700">เหตุผลที่ตีกลับ:</p>
              <p className="text-sm text-red-600">{doc.return_reason}</p>
            </div>
          )}
          <WorkflowStepper status={doc.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">ดำเนินการ</CardTitle></CardHeader>
        <CardContent><StatusActions currentStatus={doc.status} onChangeStatus={handleStatusChange} isUpdating={isUpdating} /></CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">รายละเอียดเอกสาร</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <DetailRow icon={User} label="ต้นเรื่อง" value={doc.submitter_name} />
            <DetailRow icon={FileText} label="เลขที่เอกสาร" value={doc.reference_number} />
            <DetailRow icon={Calendar} label="วันที่ส่งเสนอ" value={formatDate(doc.submit_date)} />
            <DetailRow icon={Calendar} label="วันที่อนุมัติ" value={formatDate(doc.approval_date)} />
            <DetailRow icon={Calendar} label="กำหนดส่ง" value={formatDate(doc.due_date)} />
            <DetailRow icon={Banknote} label="งบประมาณ" value={formatBudget(doc.budget)} />
            <DetailRow icon={Building2} label="บริษัทสัญญา" value={doc.contractor_name} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">ประวัติสถานะ</CardTitle></CardHeader>
          <CardContent><StatusTimeline history={doc.status_history || []} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium">{value || '-'}</span>
    </div>
  );
}