import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* แถบเมนูด้านซ้าย */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* พื้นที่เนื้อหาหลักด้านขวา */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header สำหรับมือถือ (แสดงปุ่มแฮมเบอร์เกอร์) */}
        <header className="h-14 lg:hidden border-b flex items-center px-4 shrink-0 bg-background z-10">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2">
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-sm font-heading">DocTracker</span>
        </header>
        
        {/* พื้นที่แสดงหน้าเว็บต่างๆ (Dashboard, สร้างเอกสาร ฯลฯ) */}
        <main className="flex-1 overflow-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}