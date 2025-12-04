// src/admin/DashboardLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  Users,
  ClipboardList,
  LogOut,
  Store,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200">
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">
            Scuffers Admin
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Panel interno de gestión
          </p>
        </div>

        <nav className="flex flex-col px-4 py-4 space-y-1">
          <DashboardLink to="/dashboard" icon={<Home size={18} />}>
            Dashboard
          </DashboardLink>

          <DashboardLink to="/dashboard/products" icon={<Package size={18} />}>
            Productos
          </DashboardLink>

          <DashboardLink
            to="/dashboard/orders"
            icon={<ClipboardList size={18} />}
          >
            Pedidos
          </DashboardLink>

          <DashboardLink to="/dashboard/users" icon={<Users size={18} />}>
            Usuarios
          </DashboardLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 px-10 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Panel
            </span>
            <span className="text-slate-700">/</span>
            <span className="font-medium text-slate-800">
              {user?.first_name || user?.username || "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Store size={14} />
              Ver tienda
            </button>

            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-medium text-slate-800">
                {user?.first_name || "Administrador"}
              </span>
              <span className="text-[11px] text-slate-500">
                {user?.email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-xs font-medium text-white hover:bg-slate-800"
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </header>

        {/* Contenido de cada sección */}
        <section className="flex-1 p-10">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardLink({ to, children, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}