import { NavLink, Outlet } from "react-router-dom";

interface Props {
  onLogout: () => void;
}

export default function AdminLayout({ onLogout }: Props) {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-stone-800 text-white"
        : "text-stone-600 hover:bg-stone-100"
    }`;

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-stone-200 flex flex-col">
        <div className="px-6 py-6 border-b border-stone-100">
          <h1 className="font-serif text-xl text-stone-800">Alma Deco</h1>
          <p className="text-xs text-stone-400 mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/admin/dashboard" className={navClass}>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/products" className={navClass}>
            <span>Productos</span>
          </NavLink>
        </nav>

        <div className="p-3 border-t border-stone-100">
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
