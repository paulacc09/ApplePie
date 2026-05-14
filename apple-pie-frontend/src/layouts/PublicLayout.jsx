import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="h-screen min-h-screen bg-[#FAF7F2] dark:bg-gray-950">
      <Outlet />
    </div>
  )
}
