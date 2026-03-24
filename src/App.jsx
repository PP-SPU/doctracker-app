import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

// นำเข้าหน้าต่างๆ ของแอป
import Dashboard from './pages/Dashboard';
import DocumentList from './pages/DocumentList';
import DocumentCreate from './pages/DocumentCreate';
import DocumentDetail from './pages/DocumentDetail';
import DocumentEdit from './pages/DocumentEdit';
import ActivityLogs from './pages/ActivityLogs';
import Reports from './pages/Reports';
import AppLayout from './components/layout/AppLayout';

// สร้างตัวจัดการข้อมูล
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* โครงสร้างหลักของแอป */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<DocumentList />} />
            <Route path="/documents/new" element={<DocumentCreate />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/documents/:id/edit" element={<DocumentEdit />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/logs" element={<ActivityLogs />} />
          </Route>
        </Routes>
      </Router>
      {/* ระบบแจ้งเตือน */}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}