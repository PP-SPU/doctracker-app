import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. นำเข้าเครื่องมือ React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. สร้างตัวจัดการ
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. เอา Provider มาครอบ App ของเราไว้ */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);