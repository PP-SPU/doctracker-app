import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import DocumentList from '@/pages/DocumentList';
import DocumentCreate from '@/pages/DocumentCreate';
import DocumentDetail from '@/pages/DocumentDetail';
import DocumentEdit from '@/pages/DocumentEdit';
import Reports from '@/pages/Reports';
import ActivityLogs from '@/pages/ActivityLogs';
import Login from '@/pages/Login';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. เช็ค Session ครั้งแรก
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. ติดตามสถานะการเปลี่ยนล็อกอิน (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // หรือใส่ Loading Spinner สวยๆ

  return (
    <BrowserRouter>
      <Routes>
        {/* หน้า Login แบบเดี่ยวๆ (Public Route) */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />

        {/* หน้าที่ต้องล็อกอินก่อน (Protected Routes) */}
        <Route 
          element={session ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/new" element={<DocumentCreate />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/documents/:id/edit" element={<DocumentEdit />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/logs" element={<ActivityLogs />} />
        </Route>

        {/* ถ้าไปหน้าอื่นที่ไม่มีจริง ให้เด้งกลับหน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
