import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AccessibilityPanel from '../components/AccessibilityPanel.jsx'
import BottomNav from '../components/BottomNav.jsx'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const showBottomNav = user?.rol === 'estudiante' || user?.rol === 'mentora'

  return (
    <div className="min-h-screen w-full overflow-hidden bg-cream">
      <Navbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen w-full overflow-hidden pt-16">
        <div className="hidden w-60 shrink-0 md:block" aria-hidden="true" />
        <main className="h-[calc(100vh-4rem)] min-w-0 flex-1 overflow-auto">
          <div className={showBottomNav ? 'pb-24 md:pb-6' : 'pb-6'}>
            <Outlet />
          </div>
        </main>
      </div>
      {showBottomNav ? <BottomNav /> : null}
      <AccessibilityPanel />
    </div>
  )
}
