import { supabase } from '@/api/supabase'; // 1. เปลี่ยนเป็น supabase

export const STATUS_CONFIG = {
  DRAFT: { label: 'ร่าง', color: 'bg-slate-100 text-slate-700 border-slate-300', step: 0 },
  SUBMITTED: { label: 'ส่งเรื่องแล้ว', color: 'bg-blue-100 text-blue-800 border-blue-300', step: 1 },
  SECRETARY_REVIEW: { label: 'เลขานุการตรวจสอบ', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', step: 2 },
  DIRECTOR_REVIEW: { label: 'ผอ. พิจารณา', color: 'bg-violet-100 text-violet-800 border-violet-300', step: 3 },
  PRESIDENT_REVIEW: { label: 'อธิการพิจารณา', color: 'bg-amber-100 text-amber-900 border-amber-300', step: 4 },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', step: 5 },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', step: 6 },
  CLOSED: { label: 'ปิดงาน', color: 'bg-green-100 text-green-800 border-green-300', step: 7 },
  RETURNED: { label: 'ตีกลับ', color: 'bg-rose-100 text-rose-800 border-rose-300', step: -1 },
};

export const PRIORITY_CONFIG = {
  LOW: { label: 'ต่ำ', color: 'bg-slate-200 text-slate-800 border border-slate-300' },
  MEDIUM: { label: 'ปานกลาง', color: 'bg-blue-200 text-blue-900 border border-blue-300' },
  HIGH: { label: 'สูง', color: 'bg-orange-200 text-orange-900 border border-orange-300' },
  URGENT: { label: 'เร่งด่วน', color: 'bg-red-600 text-white border border-red-700' },
};

// Deprecated: ให้ Supabase สร้าง doc_number ผ่าน trigger แทน
export function generateDocNumber() {
  console.warn('generateDocNumber() is deprecated. Use Supabase trigger instead.');
  return '';
}

// 2. แก้คำสั่งให้บันทึกลง Supabase
export async function createLog(data) {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert([data]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
}

export function isOverdue(doc) {
  if (!doc.due_date || doc.status === 'CLOSED' || doc.status === 'APPROVED') return false;
  return new Date(doc.due_date) < new Date();
}

export function isNewToday(doc) {
  // 3. เปลี่ยน created_date เป็น created_at
  if (!doc.created_at) return false;
  const created = new Date(doc.created_at);
  const today = new Date();
  return created.toDateString() === today.toDateString();
}

export function formatBudget(amount) {
  if (amount === null || amount === undefined || amount === '') return '-';

  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}