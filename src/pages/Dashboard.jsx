import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StatsCards from '@/components/dashboard/StatsCards';
import BudgetChart from '@/components/dashboard/BudgetChart';
import StatusChart from '@/components/dashboard/StatusChart';
import Notifications from '@/components/dashboard/Notifications';
import DocumentCard from '@/components/documents/DocumentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = base44.entities.Document.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    });
    return unsubscribe;
  }, [queryClient]);

  const recentDocs = documents.slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">แดชบอร์ด</h1>
          <p className="text-sm text-muted-foreground">ภาพรวมระบบติดตามเอกสาร</p>
        </div>
        <Link to="/documents/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> สร้างเอกสารใหม่
          </Button>
        </Link>
      </div>

      <StatsCards documents={documents} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BudgetChart documents={documents} />
        </div>
        <Notifications documents={documents} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold">เอกสารล่าสุด</h2>
              <Link to="/documents" className="text-xs text-primary hover:underline">ดูทั้งหมด →</Link>
            </div>
            {recentDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">ยังไม่มีเอกสาร</p>
            ) : (
              recentDocs.map(doc => <DocumentCard key={doc.id} doc={doc} />)
            )}
          </div>
        </div>
        <StatusChart documents={documents} />
      </div>
    </div>
  );
}