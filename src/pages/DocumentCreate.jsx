import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { useQueryClient } from '@tanstack/react-query';
import DocumentForm from '@/components/documents/DocumentForm';
import { createLog } from '@/lib/docUtils';
import { toast } from 'sonner';

export default function DocumentCreate() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const documentData = {
        title: formData.title,
        description: formData.description,
        submitter_name: formData.submitter_name,
        reference_number: formData.reference_number,
        budget: formData.budget,
        contractor_name: formData.contractor_name,
        notes: formData.notes,
        priority: formData.priority || 'MEDIUM',
        due_date: formData.due_date || null,
        status: 'DRAFT',
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select()
        .single();

      if (error) throw error;

      await createLog({
        document_id: data.id,
        doc_number: data.doc_number,
        action: 'CREATED',
        action_detail: `สร้างเอกสาร "${formData.title}"`,
        performed_by: formData.submitter_name,
        new_status: 'DRAFT',
      });

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('บันทึกร่างเอกสารสำเร็จ');
      navigate(`/documents/${data.id}`);
    } catch (error) {
      console.error('Supabase Error:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    try {
      const now = new Date().toISOString();

      const documentData = {
        title: formData.title,
        description: formData.description,
        submitter_name: formData.submitter_name,
        reference_number: formData.reference_number,
        budget: formData.budget,
        contractor_name: formData.contractor_name,
        notes: formData.notes,
        priority: formData.priority || 'MEDIUM',
        due_date: formData.due_date || null,
        status: 'SUBMITTED',
        submit_date: now.split('T')[0],
        status_history: [
          { status: 'DRAFT', timestamp: now, by: formData.submitter_name },
          { status: 'SUBMITTED', timestamp: now, by: formData.submitter_name },
        ],
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select()
        .single();

      if (error) throw error;

      await createLog({
        document_id: data.id,
        doc_number: data.doc_number,
        action: 'SUBMITTED',
        action_detail: `สร้างและส่งเรื่อง "${formData.title}"`,
        performed_by: formData.submitter_name,
        new_status: 'SUBMITTED',
      });

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('สร้างและส่งเรื่องสำเร็จ');
      navigate(`/documents/${data.id}`);
    } catch (error) {
      console.error('Supabase Error:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งเรื่อง');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <DocumentForm onSave={handleSave} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
}