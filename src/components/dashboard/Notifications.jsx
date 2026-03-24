import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Sparkles, Bell, Clock, ArrowLeft } from 'lucide-react';
import { isOverdue, isNewToday, formatDate } from '@/lib/docUtils';

export default function Notifications({ documents }) {
  const overdueItems = documents.filter(isOverdue);
  const newItems = documents.filter(isNewToday);
  const pendingApproval = documents.filter(d => ['SECRETARY_REVIEW', 'DIRECTOR_REVIEW', 'PRESIDENT_REVIEW'].includes(d.status));
  const returnedDocs = documents.filter(d => d.status === 'RETURNED');

  const totalNotifications = overdueItems.length + newItems.length + pendingApproval.length + returnedDocs.length;

  if (totalNotifications === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Bell className="w-4 h-4" /> การแจ้งเตือน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">ไม่มีการแจ้งเตือน</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <Bell className="w-4 h-4" /> การแจ้งเตือน
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {totalNotifications}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-72 overflow-y-auto">
        {returnedDocs.map(doc => (
          <Link key={doc.id} to={`/documents/${doc.id}`} className="block">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200">
              <ArrowLeft className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-orange-900 truncate">{doc.title}</p>
                <p className="text-[10px] text-orange-700">ถูกตีกลับ - ต้องแก้ไข</p>
                {doc.return_reason && (
                  <p className="text-[10px] text-orange-600 mt-0.5 italic truncate">เหตุผล: {doc.return_reason}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
        {pendingApproval.map(doc => (
          <Link key={doc.id} to={`/documents/${doc.id}`} className="block">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-800 truncate">{doc.title}</p>
                <p className="text-[10px] text-blue-600">รออนุมัติ</p>
              </div>
            </div>
          </Link>
        ))}
        {overdueItems.map(doc => (
          <Link key={doc.id} to={`/documents/${doc.id}`} className="block">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-red-800 truncate">{doc.title}</p>
                <p className="text-[10px] text-red-600">กำหนดส่ง: {formatDate(doc.due_date)}</p>
              </div>
            </div>
          </Link>
        ))}
        {newItems.map(doc => (
          <Link key={doc.id} to={`/documents/${doc.id}`} className="block">
            <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-amber-800 truncate">{doc.title}</p>
                <p className="text-[10px] text-amber-600">สร้างเมื่อวันนี้</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}