import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav.jsx'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'

export default function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      <Navbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-[calc(100vh-4rem)] w-full pt-16 transition-[margin,padding] duration-200 md:ml-60">
        <div className="p-4 pb-24 md:p-6 md:pb-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
