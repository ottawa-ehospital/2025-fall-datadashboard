import { Bell, User, Zap } from "lucide-react"

interface TopbarProps {
  userType: string
  breadcrumb: string
}

export function Topbar({ userType, breadcrumb }: TopbarProps) {
  return (
    <header className="bg-blue-50 border-b border-blue-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="text-sm text-gray-600">{breadcrumb}</div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
          <Zap className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <Bell className="w-5 h-5 text-gray-700" />
        </button>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
          <User className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </header>
  )
}
