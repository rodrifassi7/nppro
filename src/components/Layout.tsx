import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, PlusCircle, List, LogOut, UtensilsCrossed } from 'lucide-react';
import clsx from 'clsx';

export const Layout = () => {
    const { signOut, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { label: 'Panel', path: '/', icon: LayoutDashboard },
        { label: 'Nuevo pedido', path: '/new-order', icon: PlusCircle },
        { label: 'Pedidos', path: '/orders', icon: List },
        ...(isAdmin ? [{ label: 'Comidas', path: '/meals', icon: UtensilsCrossed }] : []),
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
            {/* Sidebar / Navbar */}
            <aside className="bg-white shadow-md md:w-64 flex flex-col z-10">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">NP PRO</h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Admin Lite</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
                                    isActive
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t bg-slate-50">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-red-600 w-full transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
