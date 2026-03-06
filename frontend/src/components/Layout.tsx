import { Outlet, Link, useLocation } from "react-router-dom"
import { BarChart3, Users, Settings, PenTool } from "lucide-react"

export function Layout() {
  const location = useLocation()

  const navItems = [
    { name: "Ranking Report", path: "/", icon: BarChart3 },
    { name: "Employee Details", path: "/employees", icon: Users },
    { name: "Manual Entry", path: "/manual-entry", icon: PenTool },
    { name: "Config Manager", path: "/config", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold tracking-tight">PerfManage</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || (location.pathname.startsWith('/employees') && item.path === '/employees')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
