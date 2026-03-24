import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import DocumentForm from '@/components/documents/DocumentForm';
import { generateDocNumber, createLog } from '@/lib/docUtils';
import { toast } from 'sonner';

export default function DocumentCreate() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async (formData) => {
    setIsSaving(true);
    const docNumber = generateDocNumber();
    const now = new Date().toISOString();
    const doc = await base44.entities.Document.create({
      ...formData,
      doc_number: docNumber,
      status: 'DRAFT',
      status_history: [{ status: 'DRAFT', timestamp: now, by: formData.submitter_name }],
    });
    await createLog({
      document_id: doc.id,
      doc_number: docNumber,
      action: 'CREATED',
      action_detail: `สร้างเอกสาร "${formData.title}"`,
      performed_by: formData.submitter_name,
      new_status: 'DRAFT',
    });
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    toast.success('สร้างเอกสารสำเร็จ');
    setIsSaving(false);
    navigate(`/documents/${doc.id}`);
  };

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    const docNumber = generateDocNumber();
    const now = new Date().toISOString();
    const doc = await base44.entities.Document.create({
      ...formData,
      doc_number: docNumber,
      status: 'SUBMITTED',
      submit_date: new Date().toISOString().split('T')[0],
      status_history: [
        { status: 'DRAFT', timestamp: now, by: formData.submitter_name },
        { status: 'SUBMITTED', timestamp: now, by: formData.submitter_name },
      ],
    });
    await createLog({
      document_id: doc.id,
      doc_number: docNumber,
      action: 'SUBMITTED',
      action_detail: `สร้างและส่งเรื่อง "${formData.title}"`,
      performed_by: formData.submitter_name,
      new_status: 'SUBMITTED',
    });
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    toast.success('สร้างและส่งเรื่องสำเร็จ');
    setIsSaving(false);
    navigate(`/documents/${doc.id}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <DocumentForm onSave={handleSave} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
}