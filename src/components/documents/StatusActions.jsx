import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Send, CheckCircle, ArrowLeft, Wrench, Lock, Loader2
} from 'lucide-react';

const STATUS_TRANSITIONS = {
  DRAFT: [{ next: 'SUBMITTED', label: 'ส่งเรื่อง', icon: Send }],
  SUBMITTED: [
    { next: 'SECRETARY_REVIEW', label: 'รับเรื่องตรวจสอบ (เลขาฯ)', icon: CheckCircle },
  ],
  SECRETARY_REVIEW: [
    { next: 'DIRECTOR_REVIEW', label: 'ผ่าน → ส่ง ผอ.', icon: CheckCircle },
    { next: 'RETURNED', label: 'ตีกลับ', icon: ArrowLeft, variant: 'destructive', needReason: true, returnedBy: 'SECRETARY' },
  ],
  DIRECTOR_REVIEW: [
    { next: 'PRESIDENT_REVIEW', label: 'เห็นชอบ → ส่งอธิการ', icon: CheckCircle },
    { next: 'RETURNED', label: 'ตีกลับ', icon: ArrowLeft, variant: 'destructive', needReason: true, returnedBy: 'DIRECTOR' },
  ],
  PRESIDENT_REVIEW: [
    { next: 'APPROVED', label: 'อนุมัติ', icon: CheckCircle },
    { next: 'RETURNED', label: 'ไม่อนุมัติ', icon: ArrowLeft, variant: 'destructive', needReason: true, returnedBy: 'PRESIDENT' },
  ],
  APPROVED: [
    { next: 'IN_PROGRESS', label: 'รับงาน (ฝ่ายอาคาร)', icon: Wrench },
  ],
  IN_PROGRESS: [
    { next: 'CLOSED', label: 'ปิดงาน', icon: Lock },
  ],
  RETURNED: [
    { next: 'SUBMITTED', label: 'แก้ไขแล้ว ส่งใหม่', icon: Send },
  ],
};

export default function StatusActions({ currentStatus, onChangeStatus, isUpdating }) {
  const [returnDialog, setReturnDialog] = useState(null);
  const [reason, setReason] = useState('');

  const transitions = STATUS_TRANSITIONS[currentStatus] || [];
  if (transitions.length === 0) return null;

  const handleAction = (transition) => {
    if (transition.needReason) {
      setReturnDialog(transition);
      setReason('');
    } else {
      onChangeStatus(transition.next, null, null);
    }
  };

  const handleReturn = () => {
    onChangeStatus(returnDialog.next, reason, returnDialog.returnedBy);
    setReturnDialog(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <Button
            key={t.next + t.label}
            variant={t.variant || 'default'}
            size="sm"
            onClick={() => handleAction(t)}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <t.icon className="w-4 h-4 mr-1.5" />}
            {t.label}
          </Button>
        ))}
      </div>

      <Dialog open={!!returnDialog} onOpenChange={() => setReturnDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ตีกลับเอกสาร</DialogTitle>
            <DialogDescription>กรุณาระบุเหตุผลในการตีกลับ</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="ระบุเหตุผล..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialog(null)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={handleReturn} disabled={!reason.trim()}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> ยืนยันตีกลับ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}