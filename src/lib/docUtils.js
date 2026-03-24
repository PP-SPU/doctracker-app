import { supabase } from '@/api/supabase'; // 1. เปลี่ยนเป็น supabase

export const STATUS_CONFIG = {
  DRAFT: { label: 'ร่าง', color: 'bg-gray-100 text-gray-700 border-gray-200', step: 0 },
  SUBMITTED: { label: 'ส่งเรื่องแล้ว', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 1 },
  SECRETARY_REVIEW: { label: 'เลขานุการตรวจสอบ', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 2 },
  DIRECTOR_REVIEW: { label: 'ผอ. พิจารณา', color: 'bg-purple-50 text-purple-700 border-purple-200', step: 3 },
  PRESIDENT_REVIEW: { label: 'อธิการพิจารณา', color: 'bg-amber-50 text-amber-700 border-amber-200', step: 4 },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 5 },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'bg-teal-50 text-teal-700 border-teal-200', step: 6 },
  CLOSED: { label: 'ปิดงาน', color: 'bg-green-50 text-green-800 border-green-200', step: 7 },
  RETURNED: { label: 'ตีกลับ', color: 'bg-red-50 text-red-700 border-red-200', step: -1 },
};

export const PRIORITY_CONFIG = {
  LOW: { label: 'ต่ำ', color: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'ปานกลาง', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'สูง', color: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'เร่งด่วน', color: 'bg-red-100 text-red-700' },
};

export function generateDocNumber() {
  const now = new Date();
  const y = now.getFullYear() + 543; // Buddhist year
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `DOC-${y}${m}-${random}`;
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
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
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