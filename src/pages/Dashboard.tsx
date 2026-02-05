import { useState, useEffect } from 'react';
import { startOfToday, startOfWeek, startOfMonth } from 'date-fns';
import { DollarSign, ShoppingBag, Utensils, Users, PieChart, Activity } from 'lucide-react';
import { useOrders } from '../context/OrdersContext';
import { useCustomers } from '../context/CustomersContext';
import { useFollowups } from '../context/FollowupsContext';

export const Dashboard = () => {
    const { orders: allOrders, loading: ordersLoading } = useOrders();
    const { customers, loading: customersLoading } = useCustomers();
    const { followups } = useFollowups();

    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
    const [stats, setStats] = useState({
        revenue: 0,
        count: 0,
        avgTicket: 0,
        byType: {} as Record<string, number>,
        topMeals: [] as { name: string; qty: number }[],
        activeClients: 0,
        retentionRate: 0,
        packRatio: 0
    });

    const pendingFollowups = followups.filter(f => f.status === 'pending').length;

    useEffect(() => {
        if (!ordersLoading && !customersLoading) calculateStats();
    }, [period, allOrders, customers, ordersLoading, customersLoading]);

    const calculateStats = () => {
        // Determine start date
        const now = new Date();
        let startDate = startOfToday();
        if (period === 'week') startDate = startOfWeek(now, { weekStartsOn: 1 });
        if (period === 'month') startDate = startOfMonth(now);

        const orders = allOrders.filter(o => new Date(o.created_at) >= startDate);

        // 1. Basic Stats
        const count = orders.length;
        const revenue = orders.reduce((sum, o) => sum + (o.monto_total || 0), 0);
        const avgTicket = count > 0 ? revenue / count : 0;

        // 2. By Type & Pack Ratio
        let packCount = 0;
        const byType = orders.reduce((acc, o) => {
            acc[o.pack] = (acc[o.pack] || 0) + 1;
            if (o.pack.startsWith('pack')) packCount++;
            return acc;
        }, {} as Record<string, number>);

        const packRatio = count > 0 ? Math.round((packCount / count) * 100) : 0;

        // 3. CRM Stats
        const activeClients = customers.filter(c => c.status === 'active').length;
        // Simple Retention: Clients with > 1 order / Total Clients with > 0 orders
        const repeatClients = customers.filter(c => c.orders_count > 1).length;
        const clientsWithOrders = customers.filter(c => c.orders_count > 0).length;
        const retentionRate = clientsWithOrders > 0 ? Math.round((repeatClients / clientsWithOrders) * 100) : 0;

        // 4. Top Meals
        const mealCounts: Record<string, number> = {};
        orders.forEach(o => {
            o.items?.forEach(item => {
                if (item.meal) {
                    mealCounts[item.meal.name] = (mealCounts[item.meal.name] || 0) + item.qty;
                }
            });
        });

        const topMeals = Object.entries(mealCounts)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        setStats({ revenue, count, avgTicket, byType, topMeals, activeClients, retentionRate, packRatio });
    };

    const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-3 rounded-full ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Panel</h1>

                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
                    {(['today', 'week', 'month'] as const).map(p => {
                        const label = { today: 'Hoy', week: 'Semana', month: 'Mes' }[p];
                        return (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${period === p ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {ordersLoading ? (
                <div className="p-12 text-center text-slate-400 animate-pulse">Cargando estadísticas...</div>
            ) : (
                <>
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard
                            label="Ventas"
                            value={`$ ${stats.revenue.toLocaleString('es-AR')}`}
                            icon={DollarSign}
                            color="bg-green-600"
                        />
                        <StatCard
                            label="Pedidos"
                            value={stats.count}
                            icon={ShoppingBag}
                            color="bg-blue-600"
                            subtext={`${stats.packRatio}% Packs`}
                        />
                        <StatCard
                            label="Clientes Activos"
                            value={stats.activeClients}
                            icon={Users}
                            color="bg-indigo-600"
                            subtext={`${stats.retentionRate}% Recompra`}
                        />
                        <StatCard
                            label="Seguimientos"
                            value={pendingFollowups}
                            icon={Activity}
                            color="bg-orange-500"
                            subtext="Pendientes"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pack Type Distribution */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <PieChart size={18} /> Mix de Pedidos
                            </h3>
                            <div className="space-y-4">
                                {Object.keys(stats.byType).length === 0 && <p className="text-slate-400 text-sm">Sin datos</p>}
                                {Object.entries(stats.byType).map(([type, count]) => {
                                    const typeLabel = {
                                        single: 'Suelto',
                                        pack5: 'Pack 5',
                                        pack10: 'Pack 10',
                                        other: 'Otro'
                                    }[type] || type;

                                    const percentage = Math.round((count / stats.count) * 100);

                                    return (
                                        <div key={type}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="capitalize text-slate-600 font-medium">{typeLabel}</span>
                                                <span className="text-slate-900 font-bold">{count} <span className="text-slate-400 text-xs font-normal">({percentage}%)</span></span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${type.includes('pack') ? 'bg-indigo-500' : 'bg-slate-400'}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Top Meals */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Utensils size={18} /> Top Comidas
                            </h3>
                            <div className="space-y-3">
                                {stats.topMeals.length === 0 && <p className="text-slate-400 text-sm">Sin datos de comidas</p>}
                                {stats.topMeals.map((meal, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium text-slate-700">{meal.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{meal.qty} <span className="text-xs text-slate-400 font-normal">un.</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
