"use client"

import { Users, BarChart3, Home, Calendar, Heart, HelpCircle, MessageCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  userType: "patient" | "doctor" | "analyst" | "staff"
  activeItem: string
}

export function Sidebar({ userType, activeItem }: SidebarProps) {
  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: "Dashboard", href: "#dashboard", id: "dashboard" },
      { icon: MessageCircle, label: "Messages", href: "#messages", id: "messages" },
      { icon: HelpCircle, label: "Help", href: "#help", id: "help" },
    ]

    const patientItems = [
      { icon: Home, label: "Dashboard", href: "#dashboard", id: "dashboard" },
      { icon: Calendar, label: "Appointments", href: "#appointments", id: "appointments" },
      { icon: Heart, label: "My Health", href: "#health", id: "health" },
      { icon: MessageCircle, label: "Messages", href: "#messages", id: "messages" },
      { icon: HelpCircle, label: "Help", href: "#help", id: "help" },
    ]

    const doctorItems = [
      { icon: Home, label: "Dashboard", href: "#dashboard", id: "dashboard" },
      { icon: Users, label: "Patients", href: "#patients", id: "patients" },
      { icon: Calendar, label: "Calendar", href: "#calendar", id: "calendar" },
      { icon: BarChart3, label: "Planning", href: "#planning", id: "planning" },
      { icon: MessageCircle, label: "Messages", href: "#messages", id: "messages" },
      { icon: HelpCircle, label: "Help", href: "#help", id: "help" },
    ]

    const analystItems = [
      { icon: Home, label: "Dashboard", href: "#dashboard", id: "dashboard" },
      { icon: BarChart3, label: "Analytics", href: "#analytics", id: "analytics" },
      { icon: Users, label: "Hospitals", href: "#hospitals", id: "hospitals" },
      { icon: MessageCircle, label: "Messages", href: "#messages", id: "messages" },
      { icon: HelpCircle, label: "Help", href: "#help", id: "help" },
    ]

    const staffItems = [
      { icon: Home, label: "Dashboard", href: "#dashboard", id: "dashboard" },
      { icon: Users, label: "Patients", href: "#patients", id: "patients" },
      { icon: Calendar, label: "Appointments", href: "#appointments", id: "appointments" },
      { icon: MessageCircle, label: "Messages", href: "#messages", id: "messages" },
      { icon: HelpCircle, label: "Help", href: "#help", id: "help" },
    ]

    switch (userType) {
      case "patient":
        return patientItems
      case "doctor":
        return doctorItems
      case "analyst":
        return analystItems
      case "staff":
        return staffItems
      default:
        return baseItems
    }
  }

  const items = getMenuItems()

  return (
    <aside className="w-64 bg-white border-r border-blue-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">e</span>
          </div>
          <span className="font-bold text-gray-900">eHospital</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => {}}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-blue-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium">
          <Send className="w-5 h-5" />
          Feedback
        </button>
      </div>
    </aside>
  )
}
