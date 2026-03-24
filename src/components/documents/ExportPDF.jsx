import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { formatBudget, formatDate, STATUS_CONFIG } from '@/lib/docUtils';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportPDF({ doc, size = 'sm' }) {
  const handleExport = async () => {
    try {
      toast.info('กำลังสร้างไฟล์ PDF...');

      // Create a temporary container for the PDF content
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.padding = '40px';
      container.style.backgroundColor = '#ffffff';
      container.style.fontFamily = 'IBM Plex Sans Thai, Arial, sans-serif';

      // Build the content
      container.innerHTML = `
        <div style="color: #000;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1e293b;">รายละเอียดเอกสาร</h1>
            <p style="font-size: 14px; color: #64748b; margin: 0;">เลขกำกับงาน: ${doc.doc_number || '-'}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; width: 35%; border: 1px solid #e2e8f0;">ชื่อเรื่อง</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${doc.title || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">สถานะ</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${STATUS_CONFIG[doc.status]?.label || doc.status}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">ต้นเรื่อง</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${doc.submitter_name || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">เลขที่เอกสาร</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${doc.reference_number || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">งบประมาณ</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600; color: #2563eb;">${formatBudget(doc.budget)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">บริษัทที่ทำสัญญา</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${doc.contractor_name || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">ระดับความสำคัญ</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${doc.priority === 'LOW' ? 'ต่ำ' : doc.priority === 'MEDIUM' ? 'ปานกลาง' : doc.priority === 'HIGH' ? 'สูง' : 'เร่งด่วน'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">วันที่ส่งเสนอ ผอ.</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${formatDate(doc.submit_date)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">วันที่อนุมัติ</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${formatDate(doc.approval_date)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f1f5f9; font-weight: 600; border: 1px solid #e2e8f0;">กำหนดส่ง</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${formatDate(doc.due_date)}</td>
            </tr>
          </table>

          ${doc.description ? `
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1e293b;">รายละเอียดของงาน</h3>
              <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; line-height: 1.6;">
                ${doc.description}
              </div>
            </div>
          ` : ''}

          ${doc.notes ? `
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1e293b;">หมายเหตุ</h3>
              <div style="padding: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; line-height: 1.6;">
                ${doc.notes}
              </div>
            </div>
          ` : ''}

          ${doc.return_reason && doc.status === 'RETURNED' ? `
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #dc2626;">เหตุผลที่ตีกลับ</h3>
              <div style="padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b; line-height: 1.6;">
                ${doc.return_reason}
              </div>
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">สร้างเอกสารเมื่อ: ${new Date().toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}</p>
            <p style="margin: 5px 0 0 0;">ระบบติดตามเอกสาร DocTracker</p>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`เอกสาร_${doc.doc_number || doc.id}.pdf`);

      toast.success('ดาวน์โหลดไฟล์ PDF สำเร็จ');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง PDF');
    }
  };

  return (
    <Button variant="outline" size={size} onClick={handleExport}>
      <Download className="w-4 h-4 mr-1.5" />
      ดาวน์โหลด PDF
    </Button>
  );
}