// src/api/base44Client.js

// นี่คือ Mock Object ที่สร้างมาหลอกระบบชั่วคราว เพื่อไม่ให้โปรเจกต์ Error
export const base44 = {
  auth: {
    me: async () => ({ id: 1, name: 'Admin', role: 'admin' }),
    logout: () => console.log('Mock: Logout triggered'),
    redirectToLogin: () => console.log('Mock: Redirect to login'),
  },
  entities: {
    Document: {
      list: async () => [], // คืนค่าเป็น Array ว่างๆ แทนรายการเอกสาร
      filter: async () => [],
      create: async (data) => console.log('Mock: Document created', data),
      update: async (id, data) => console.log(`Mock: Document ${id} updated`, data),
      delete: async (id) => console.log(`Mock: Document ${id} deleted`),
      subscribe: () => { return () => {} }, // Dummy function สำหรับ unsubscribe
    },
    ActivityLog: {
      list: async () => [],
      create: async (data) => console.log('Mock: Log created', data),
      subscribe: () => { return () => {} },
    }
  }
};