import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // เพิ่มส่วนนี้เข้าไปครับ
  build: {
    chunkSizeWarningLimit: 2000, // ขยับเพดานการแจ้งเตือนไปที่ 2000 KB
  },
})
