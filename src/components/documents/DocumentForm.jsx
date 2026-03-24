import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Send, Loader2 } from 'lucide-react';

export default function DocumentForm({ initialData, onSave, onSubmit, isSaving }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    submitter_name: '',
    reference_number: '',
    contractor_name: '',
    notes: '',
    priority: 'MEDIUM',
    due_date: '',
    ...initialData,
    budget: initialData?.budget?.toString() || '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const prepareData = () => ({
    ...form,
    budget: form.budget ? parseFloat(form.budget) : null,
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-heading">
          {initialData?.id ? 'แก้ไขเอกสาร' : 'สร้างเอกสารใหม่'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <Label>ชื่อเรื่อง / รายการงาน *</Label>
            <Input
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="ระบุชื่อเรื่อง"
            />
          </div>

          <div className="space-y-1.5">
            <Label>ชื่อต้นเรื่อง / ผู้รับเอกสาร *</Label>
            <Input
              value={form.submitter_name}
              onChange={e => handleChange('submitter_name', e.target.value)}
              placeholder="ระบุชื่อ"
            />
          </div>

          <div className="space-y-1.5">
            <Label>เลขที่เอกสาร</Label>
            <Input
              value={form.reference_number}
              onChange={e => handleChange('reference_number', e.target.value)}
              placeholder="เลขที่เอกสาร"
            />
          </div>

          <div className="space-y-1.5">
            <Label>งบประมาณ (บาท)</Label>
            <Input
              type="number"
              value={form.budget}
              onChange={e => handleChange('budget', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1.5">
            <Label>บริษัทที่ทำสัญญา</Label>
            <Input
              value={form.contractor_name}
              onChange={e => handleChange('contractor_name', e.target.value)}
              placeholder="ชื่อบริษัท"
            />
          </div>

          <div className="space-y-1.5">
            <Label>ระดับความสำคัญ</Label>
            <Select value={form.priority} onValueChange={v => handleChange('priority', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">ต่ำ</SelectItem>
                <SelectItem value="MEDIUM">ปานกลาง</SelectItem>
                <SelectItem value="HIGH">สูง</SelectItem>
                <SelectItem value="URGENT">เร่งด่วน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>กำหนดส่ง</Label>
            <Input
              type="date"
              value={form.due_date}
              onChange={e => handleChange('due_date', e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label>รายละเอียดของงาน</Label>
            <Textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="ระบุรายละเอียด..."
              rows={3}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label>หมายเหตุ</Label>
            <Textarea
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => onSave(prepareData())}
            disabled={!form.title || !form.submitter_name || isSaving}
            variant="outline"
            className="flex-1"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            บันทึกร่าง
          </Button>
          <Button
            onClick={() => onSubmit(prepareData())}
            disabled={!form.title || !form.submitter_name || isSaving}
            className="flex-1"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            บันทึกและส่งเรื่อง
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}