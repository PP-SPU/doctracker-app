import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DocumentForm from '@/components/documents/DocumentForm';
import { createLog } from '@/lib/docUtils';
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
      const docs = await base44.entities.Document.filter({ id: docId });
      return docs[0];
    },
    enabled: !!docId,
  });

  const handleSave = async (formData) => {
    setIsSaving(true);
    await base44.entities.Document.update(docId, formData);
    await createLog({
      document_id: docId,
      doc_number: doc.doc_number,
      action: 'UPDATED',
      action_detail: `แก้ไขเอกสาร "${formData.title}"`,
    });
    queryClient.invalidateQueries({ queryKey: ['document', docId] });
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    toast.success('บันทึกสำเร็จ');
    setIsSaving(false);
    navigate(`/documents/${docId}`);
  };

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    const now = new Date().toISOString();
    const history = [...(doc.status_history || []), { status: 'SUBMITTED', timestamp: now }];
    await base44.entities.Document.update(docId, {
      ...formData,
      status: 'SUBMITTED',
      submit_date: new Date().toISOString().split('T')[0],
      status_history: history,
    });
    await createLog({
      document_id: docId,
      doc_number: doc.doc_number,
      action: 'SUBMITTED',
      action_detail: `แก้ไขและส่งเรื่อง "${formData.title}"`,
      new_status: 'SUBMITTED',
    });
    queryClient.invalidateQueries({ queryKey: ['document', docId] });
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    toast.success('บันทึกและส่งเรื่องสำเร็จ');
    setIsSaving(false);
    navigate(`/documents/${docId}`);
  };

  if (isLoading) {
    return <div className="p-4 md:p-6 max-w-3xl mx-auto"><Skeleton className="h-96 rounded-xl" /></div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <DocumentForm
        initialData={doc}
        onSave={handleSave}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}