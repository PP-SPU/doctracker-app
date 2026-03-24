import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DocumentForm from '@/components/documents/DocumentForm';
import { createLog } from '@/lib/docUtils'; // นำกลับมาใช้แล้ว
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DocumentEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const pathParts = window.location.pathname.split('/');
  const docId = pathParts[pathParts.length - 2];

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', docId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!docId,
  });

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('documents').update(formData).eq('id', docId);
      if (error) throw error;

      // บันทึกประวัติ
      await createLog({
        document_id: docId,
        doc_number: doc.doc_number,
        action: 'UPDATED',
        action_detail: `แก้ไขเอกสาร "${formData.title}"`,
        performed_by: formData.submitter_name,
      });

      queryClient.invalidateQueries({ queryKey: ['document', docId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('บันทึกสำเร็จ');
      navigate(`/documents/${docId}`);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const history = Array.isArray(doc.status_history) ? [...doc.status_history] : [];
      history.push({ status: 'SUBMITTED', timestamp: now });

      const { error } = await supabase.from('documents').update({
        ...formData,
        status: 'SUBMITTED',
        submit_date: now.split('T')[0],
        status_history: history,
      }).eq('id', docId);
      if (error) throw error;

      // บันทึกประวัติ
      await createLog({
        document_id: docId,
        doc_number: doc.doc_number,
        action: 'SUBMITTED',
        action_detail: `แก้ไขและส่งเรื่อง "${formData.title}"`,
        performed_by: formData.submitter_name,
        new_status: 'SUBMITTED',
      });

      queryClient.invalidateQueries({ queryKey: ['document', docId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('บันทึกและส่งเรื่องสำเร็จ');
      navigate(`/documents/${docId}`);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการส่งเรื่อง');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 md:p-6 max-w-3xl mx-auto"><Skeleton className="h-96 rounded-xl" /></div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <DocumentForm initialData={doc} onSave={handleSave} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
}