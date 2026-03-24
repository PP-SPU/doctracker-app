import React from 'react';
import { STATUS_CONFIG } from '@/lib/docUtils';
import { cn } from '@/lib/utils';
import { Check, Clock, ArrowLeft } from 'lucide-react';

const STEPS = [
  { key: 'DRAFT', label: 'ร่าง' },
  { key: 'SUBMITTED', label: 'ส่งเรื่อง' },
  { key: 'SECRETARY_REVIEW', label: 'เลขาฯ ตรวจสอบ' },
  { key: 'DIRECTOR_REVIEW', label: 'ผอ. พิจารณา' },
  { key: 'PRESIDENT_REVIEW', label: 'อธิการ อนุมัติ' },
  { key: 'APPROVED', label: 'อนุมัติแล้ว' },
  { key: 'IN_PROGRESS', label: 'ดำเนินการ' },
  { key: 'CLOSED', label: 'ปิดงาน' },
];

export default function WorkflowStepper({ status }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  const isReturned = status === 'RETURNED';

  return (
    <div className="w-full">
      {isReturned && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          เอกสารถูกตีกลับ — กรุณาแก้ไขและส่งใหม่
        </div>
      )}
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isCurrent = currentStep === idx && !isReturned;
          return (
            <div key={step.key} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isCompleted ? "bg-primary text-primary-foreground" :
                  isCurrent ? "bg-primary/20 text-primary ring-2 ring-primary" :
                  "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> :
                   isCurrent ? <Clock className="w-3.5 h-3.5" /> :
                   idx + 1}
                </div>
                <span className={cn(
                  "text-[10px] mt-1 text-center whitespace-nowrap max-w-[60px] truncate",
                  isCurrent ? "font-semibold text-primary" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "w-6 h-0.5 mx-0.5 mt-[-14px]",
                  isCompleted ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}