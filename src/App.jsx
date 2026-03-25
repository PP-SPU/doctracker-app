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
    // 1. ตรวจสอบ Session ทันทีที่เปิดแอป
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. คอยเฝ้าดูการเปลี่ยนสถานะ (เช่น กด Logout หรือ Login สำเร็จ)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ระหว่างที่รอเช็คสถานะ ให้โชว์หน้าว่างๆ ไปก่อน (ป้องกันหน้ากระพริบ)
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* --- ส่วนที่ 1: หน้าที่ "ไม่ต้อง" ล็อกอิน (Public) --- */}
        {/* ถ้าล็อกอินแล้ว ดันทะลึ่งจะเข้าหน้า Login อีก ให้ดีดกลับไปหน้าแรกทันที */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />

        {/* --- ส่วนที่ 2: หน้าที่ "ต้อง" ล็อกอิน (Private) --- */}
        {/* ถ้ายังไม่ล็อกอิน แล้วพยายามจะเข้าหน้าข้างใน ให้ดีดไปหน้า Login ทันที */}
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

        {/* ถ้าพิมพ์ URL มั่วๆ ให้ดีดกลับไปหน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
